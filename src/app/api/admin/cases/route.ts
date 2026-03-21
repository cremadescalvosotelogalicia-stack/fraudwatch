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
  const status = url.searchParams.get("status") || "";
  const category = url.searchParams.get("category") || "";
  const format = url.searchParams.get("format") || "json";

  const supabase = createAdminClient();

  let query = supabase
    .from("cases")
    .select("*, profiles(alias), claims(count)", { count: "exact" });

  if (q) {
    query = query.or(`title.ilike.%${q}%,accused_company.ilike.%${q}%`);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (category) {
    query = query.eq("category", category);
  }

  query = query.order("created_at", { ascending: false });

  if (format === "csv") {
    // For CSV, fetch all without pagination
    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const csv = casesToCsv(data || []);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="casos_${new Date().toISOString().slice(0, 10)}.csv"`,
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

  return NextResponse.json({ data, total: count });
}

function casesToCsv(cases: Record<string, unknown>[]): string {
  const headers = [
    "ID",
    "Titulo",
    "Empresa acusada",
    "Categoria",
    "Estado",
    "Publico",
    "Creador",
    "Reclamaciones",
    "Creado",
  ];
  const rows = cases.map((c) => [
    c.id,
    `"${String(c.title || "").replace(/"/g, '""')}"`,
    `"${String(c.accused_company || "").replace(/"/g, '""')}"`,
    c.category,
    c.status,
    c.is_public ? "Si" : "No",
    (c.profiles as { alias?: string })?.alias || "",
    Array.isArray(c.claims) && c.claims[0]
      ? (c.claims[0] as { count: number }).count
      : 0,
    c.created_at,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
