import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Fetch all user data
    const [profileRes, casesRes, claimsRes, evidencesRes, consentsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("cases").select("*").eq("creator_id", user.id),
      supabase.from("claims").select("*").eq("user_id", user.id),
      supabase.from("evidences").select("*").eq("user_id", user.id),
      supabase.from("consent_logs").select("*").eq("user_id", user.id),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profileRes.data,
      cases: casesRes.data || [],
      claims: claimsRes.data || [],
      evidences: evidencesRes.data || [],
      consents: consentsRes.data || [],
    };

    return NextResponse.json(exportData);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
