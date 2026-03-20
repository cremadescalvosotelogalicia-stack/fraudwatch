import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { storage_path } = await request.json();

    if (!storage_path) {
      return NextResponse.json({ error: "storage_path requerido" }, { status: 400 });
    }

    // Verify the evidence belongs to the user
    const { data: evidence } = await supabase
      .from("evidences")
      .select("user_id")
      .eq("storage_path", storage_path)
      .single();

    if (!evidence || evidence.user_id !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { data, error } = await supabase.storage
      .from("evidences")
      .createSignedUrl(storage_path, 300); // 5 min

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
