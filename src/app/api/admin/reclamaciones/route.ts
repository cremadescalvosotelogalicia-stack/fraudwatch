import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search") || "";
  const caseSlug = url.searchParams.get("case_slug") || "";
  const status = url.searchParams.get("status") || "";
  const format = url.searchParams.get("format") || "json";

  const supabase = createAdminClient();

  // Get distinct case_slugs for filter dropdown
  const { data: slugRows } = await supabase
    .from("masivas_claims")
    .select("case_slug")
    .order("case_slug");

  const caseSlugs = [
    ...new Set((slugRows || []).map((r: { case_slug: string }) => r.case_slug)),
  ];

  let query = supabase
    .from("masivas_claims")
    .select("*", { count: "exact" });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  if (caseSlug) {
    query = query.eq("case_slug", caseSlug);
  }
  if (status) {
    query = query.eq("status", status);
  }

  query = query.order("created_at", { ascending: false });

  if (format === "csv") {
    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const csv = claimsToCsv(data || []);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="reclamaciones_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, total: count, case_slugs: caseSlugs });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const ids: string[] = body.ids;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Se requieren IDs" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Get claims to find their documents for storage cleanup
  const { data: claims } = await supabase
    .from("masivas_claims")
    .select("id, case_slug, documents")
    .in("id", ids);

  // Delete documents from storage
  if (claims) {
    for (const claim of claims) {
      const storagePath = `masivas/${claim.case_slug}/${claim.id}`;
      await supabase.storage.from("documentos").remove(
        (claim.documents || []).map((doc: string) => {
          const filename = doc.split("/").pop() || doc;
          return `${storagePath}/${filename}`;
        })
      );
    }
  }

  // Delete claims from database
  const { error } = await supabase
    .from("masivas_claims")
    .delete()
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: ids.length });
}

function claimsToCsv(claims: Record<string, unknown>[]): string {
  const headers = [
    "ID",
    "Nombre completo",
    "Email",
    "Telefono",
    "Caso",
    "CCAA",
    "Ejercicios",
    "Estado",
    "Documentos",
    "Creado",
  ];
  const rows = claims.map((c) => [
    c.id,
    `"${String(c.full_name || "").replace(/"/g, '""')}"`,
    `"${String(c.email || "").replace(/"/g, '""')}"`,
    c.phone || "",
    c.case_slug,
    c.ccaa || "",
    Array.isArray(c.ejercicios) ? `"${(c.ejercicios as string[]).join(", ")}"` : "",
    c.status,
    Array.isArray(c.documents) ? (c.documents as string[]).length : 0,
    c.created_at,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
