import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verifyClaim(
  claimId: string,
  userId: string,
  userEmail: string | undefined
) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("masivas_claims")
    .select("id, case_slug, user_id, email, documentos")
    .eq("id", claimId)
    .single();

  if (!data) return null;
  if (data.user_id !== userId && data.email !== userEmail) return null;
  return data;
}

// GET: List documents for a claim
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const claim = await verifyClaim(id, user.id, user.email);
  if (!claim) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  // List files from storage
  const admin = createAdminClient();
  const storagePath = `masivas/${claim.case_slug}/${claim.id}`;
  const { data: files, error } = await admin.storage
    .from("documentos")
    .list(storagePath);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: (files || []).map((f) => ({
      name: f.name,
      size: f.metadata?.size ?? 0,
      mimetype: f.metadata?.mimetype ?? "",
      created_at: f.created_at,
      updated_at: f.updated_at,
    })),
    storagePath,
  });
}

// POST: Upload new document(s) to a claim
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const claim = await verifyClaim(id, user.id, user.email);
  if (!claim) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const formData = await request.formData();
  const files = formData.getAll("documentos") as File[];

  if (!files.length) {
    return NextResponse.json(
      { error: "No se han proporcionado archivos" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const uploaded: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;

    const storagePath = `masivas/${claim.case_slug}/${claim.id}/${file.name}`;
    const { error: uploadError } = await admin.storage
      .from("documentos")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      errors.push(`${file.name}: ${uploadError.message}`);
    } else {
      uploaded.push(storagePath);
    }
  }

  // Update documentos array in masivas_claims
  if (uploaded.length > 0) {
    const existing = (claim.documentos as string[]) || [];
    await admin
      .from("masivas_claims")
      .update({ documentos: [...existing, ...uploaded] })
      .eq("id", claim.id);
  }

  return NextResponse.json({
    uploaded: uploaded.length,
    errors,
  });
}

// DELETE: Remove a document from a claim
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const claim = await verifyClaim(id, user.id, user.email);
  if (!claim) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const { filename } = await request.json();
  if (!filename) {
    return NextResponse.json(
      { error: "filename es obligatorio" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const storagePath = `masivas/${claim.case_slug}/${claim.id}/${filename}`;

  const { error: deleteError } = await admin.storage
    .from("documentos")
    .remove([storagePath]);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Update documentos array
  const existing = (claim.documentos as string[]) || [];
  const updated = existing.filter((p) => p !== storagePath);
  await admin
    .from("masivas_claims")
    .update({ documentos: updated })
    .eq("id", claim.id);

  return NextResponse.json({ ok: true });
}
