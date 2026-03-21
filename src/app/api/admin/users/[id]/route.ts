import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

// GET: User detail with all related data
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const supabase = createAdminClient();

  // Profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  // Email from auth
  const { data: authUser } = await supabase.auth.admin.getUserById(id);

  // Claims with case info
  const { data: claims } = await supabase
    .from("claims")
    .select("*, cases(id, title, status, accused_company)")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  // Cases created
  const { data: casesCreated } = await supabase
    .from("cases")
    .select("id, title, status, category, created_at, claims(count)")
    .eq("creator_id", id)
    .order("created_at", { ascending: false });

  // Evidences
  const { data: evidences } = await supabase
    .from("evidences")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  // Consent logs
  const { data: consents } = await supabase
    .from("consent_logs")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    profile: {
      ...profile,
      email: authUser?.user?.email || null,
      last_sign_in: authUser?.user?.last_sign_in_at || null,
      provider: authUser?.user?.app_metadata?.provider || "email",
      created_at_auth: authUser?.user?.created_at || null,
    },
    claims: claims || [],
    casesCreated: casesCreated || [],
    evidences: evidences || [],
    consents: consents || [],
  });
}
