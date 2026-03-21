import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "20");
  const q = url.searchParams.get("q") || "";
  const role = url.searchParams.get("role") || "";
  const format = url.searchParams.get("format") || "json";

  const supabase = createAdminClient();

  let query = supabase
    .from("profiles")
    .select("*, claims(count)", { count: "exact" });

  if (q) {
    query = query.ilike("alias", `%${q}%`);
  }
  if (role) {
    query = query.eq("role", role);
  }

  query = query.order("created_at", { ascending: false });

  if (format === "csv") {
    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get emails from auth.users using admin API
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const emailMap = new Map<string, string>();
    authUsers?.users?.forEach((u) => {
      if (u.email) emailMap.set(u.id, u.email);
    });

    const csv = usersToCsv(data || [], emailMap);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="usuarios_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get emails from auth.users
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const emailMap = new Map<string, string>();
  authUsers?.users?.forEach((u) => {
    if (u.email) emailMap.set(u.id, u.email);
  });

  const enriched = (data || []).map((profile) => ({
    ...profile,
    email: emailMap.get(profile.id) || null,
  }));

  return NextResponse.json({ data: enriched, total: count });
}

// PATCH: Update user role
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { userId, role } = body;

  if (!userId || !["client", "admin", "supervisor"].includes(role)) {
    return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

function usersToCsv(
  users: Record<string, unknown>[],
  emailMap: Map<string, string>
): string {
  const headers = ["ID", "Alias", "Email", "Rol", "Verificado", "Reclamaciones", "Creado"];
  const rows = users.map((u) => [
    u.id,
    `"${String(u.alias || "").replace(/"/g, '""')}"`,
    emailMap.get(u.id as string) || "",
    u.role,
    (u.is_verified as boolean) ? "Si" : "No",
    Array.isArray(u.claims) && u.claims[0]
      ? (u.claims[0] as { count: number }).count
      : 0,
    u.created_at,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
