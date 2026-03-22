import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

// GET: Generate signed download URL for a document and redirect
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id, filename } = await params;
  const decodedFilename = decodeURIComponent(filename);

  const supabase = createAdminClient();

  // Get claim to find case_slug
  const { data: claim, error: claimError } = await supabase
    .from("masivas_claims")
    .select("case_slug")
    .eq("id", id)
    .single();

  if (claimError || !claim) {
    return NextResponse.json({ error: "Reclamaci\u00f3n no encontrada" }, { status: 404 });
  }

  const storagePath = `masivas/${claim.case_slug}/${id}/${decodedFilename}`;

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from("documentos")
    .createSignedUrl(storagePath, 300); // 5 minutes

  if (signedUrlError || !signedUrlData?.signedUrl) {
    return NextResponse.json(
      { error: "No se pudo generar la URL de descarga" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(signedUrlData.signedUrl);
}
