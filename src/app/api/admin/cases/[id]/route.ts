import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

// GET: Case detail with all related data
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const supabase = createAdminClient();

  const [caseRes, claimsRes] = await Promise.all([
    supabase
      .from("cases")
      .select("*, profiles(alias)")
      .eq("id", id)
      .single(),
    supabase
      .from("claims")
      .select("*, profiles(alias)")
      .eq("case_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (caseRes.error) {
    return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    case: caseRes.data,
    claims: claimsRes.data || [],
  });
}

// PATCH: Update case (status, is_public, title, description, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json();

  const allowedFields = [
    "title",
    "accused_company",
    "description",
    "category",
    "status",
    "is_public",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Sin campos para actualizar" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("cases")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE: Delete case
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase.from("cases").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
