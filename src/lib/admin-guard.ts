import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Verifies the current user is an admin or supervisor.
 * Returns the user id if authorized, or a NextResponse error.
 */
export async function requireAdmin(): Promise<
  { userId: string } | { error: NextResponse }
> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "supervisor"].includes(profile.role)) {
    return { error: NextResponse.json({ error: "Acceso denegado" }, { status: 403 }) };
  }

  return { userId: user.id };
}
