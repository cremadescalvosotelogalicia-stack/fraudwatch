import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "video/mp4",
  "video/quicktime",
];

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const claimId = formData.get("claim_id") as string | null;

    if (!file || !claimId) {
      return NextResponse.json(
        { error: "Archivo y claim_id requeridos" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Archivo demasiado grande (max. 20 MB)" },
        { status: 400 }
      );
    }

    // Verify claim belongs to user
    const { data: claim } = await supabase
      .from("claims")
      .select("id")
      .eq("id", claimId)
      .eq("user_id", user.id)
      .single();

    if (!claim) {
      return NextResponse.json({ error: "Reclamacion no encontrada" }, { status: 404 });
    }

    // Upload to storage
    const ext = file.name.split(".").pop();
    const storagePath = `${user.id}/${claimId}/${crypto.randomUUID()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("evidences")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Save record
    const { error: dbError } = await supabase.from("evidences").insert({
      claim_id: claimId,
      user_id: user.id,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    });

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ storage_path: storagePath }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
