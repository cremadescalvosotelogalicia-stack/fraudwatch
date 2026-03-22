import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

// GET: Single claim detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("masivas_claims")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Reclamaci\u00f3n no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

// PATCH: Update claim (status, notes, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json();

  const allowedFields = ["status", "notes"];
  const updates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Sin campos para actualizar" }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("masivas_claims")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE: Delete single claim + storage documents
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const supabase = createAdminClient();

  // Get claim to find documents
  const { data: claim } = await supabase
    .from("masivas_claims")
    .select("id, case_slug, documents")
    .eq("id", id)
    .single();

  if (claim) {
    // Delete documents from storage
    const storagePath = `masivas/${claim.case_slug}/${claim.id}`;
    if (claim.documents && Array.isArray(claim.documents) && claim.documents.length > 0) {
      const filePaths = (claim.documents as string[]).map((doc: string) => {
        const filename = doc.split("/").pop() || doc;
        return `${storagePath}/${filename}`;
      });
      await supabase.storage.from("documentos").remove(filePaths);
    }
  }

  // Delete claim from database
  const { error } = await supabase
    .from("masivas_claims")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
