import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id, filename } = await params;

  // Verify ownership
  const admin = createAdminClient();
  const { data: claim } = await admin
    .from("masivas_claims")
    .select("id, case_slug, user_id, email")
    .eq("id", id)
    .single();

  if (!claim) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (claim.user_id !== user.id && claim.email !== user.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const storagePath = `masivas/${claim.case_slug}/${claim.id}/${decodeURIComponent(filename)}`;

  const { data, error } = await admin.storage
    .from("documentos")
    .createSignedUrl(storagePath, 300); // 5 min

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
