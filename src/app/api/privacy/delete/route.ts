import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const admin = createAdminClient();

    // Delete evidences from storage
    const { data: evidences } = await admin
      .from("evidences")
      .select("storage_path")
      .eq("user_id", user.id);

    if (evidences && evidences.length > 0) {
      const paths = evidences.map((e) => e.storage_path);
      await admin.storage.from("evidences").remove(paths);
    }

    // Delete database records (cascade should handle most)
    await admin.from("consent_logs").delete().eq("user_id", user.id);
    await admin.from("evidences").delete().eq("user_id", user.id);
    await admin.from("claims").delete().eq("user_id", user.id);
    await admin.from("cases").delete().eq("creator_id", user.id);
    await admin.from("profiles").delete().eq("id", user.id);

    // Delete auth user
    const { error } = await admin.auth.admin.deleteUser(user.id);

    if (error) {
      return NextResponse.json({ error: "Error al eliminar la cuenta" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
