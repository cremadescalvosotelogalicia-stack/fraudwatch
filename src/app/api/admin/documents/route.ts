import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "20");
  const userId = url.searchParams.get("userId") || "";
  const mimeType = url.searchParams.get("mimeType") || "";
  const format = url.searchParams.get("format") || "json";

  const supabase = createAdminClient();

  let query = supabase
    .from("evidences")
    .select(
      "*, profiles(alias), claims(case_id, cases(title))",
      { count: "exact" }
    );

  if (userId) {
    query = query.eq("user_id", userId);
  }
  if (mimeType) {
    query = query.ilike("mime_type", `${mimeType}%`);
  }

  query = query.order("created_at", { ascending: false });

  if (format === "csv") {
    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const csv = docsToCsv(data || []);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="documentos_${new Date().toISOString().slice(0, 10)}.csv"`,
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

// POST: Generate signed download URL for a document
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { storagePath } = await request.json();
  if (!storagePath) {
    return NextResponse.json({ error: "storagePath requerido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("evidences")
    .createSignedUrl(storagePath, 300); // 5 min

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}

function docsToCsv(docs: Record<string, unknown>[]): string {
  const headers = [
    "ID",
    "Archivo",
    "Tipo MIME",
    "Tamaño (bytes)",
    "Usuario",
    "Caso",
    "Creado",
  ];
  const rows = docs.map((d) => {
    const claim = d.claims as { cases?: { title?: string } } | null;
    return [
      d.id,
      `"${String(d.file_name || "").replace(/"/g, '""')}"`,
      d.mime_type,
      d.file_size,
      (d.profiles as { alias?: string })?.alias || "",
      `"${String(claim?.cases?.title || "").replace(/"/g, '""')}"`,
      d.created_at,
    ];
  });
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
