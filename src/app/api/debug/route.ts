import { NextResponse } from "next/server";

export async function GET() {
  const steps: Record<string, string> = {};

  // Step 1: Env vars
  steps["1_env_SUPABASE_URL"] = process.env.NEXT_PUBLIC_SUPABASE_URL ? "OK" : "MISSING";
  steps["1_env_SERVICE_KEY"] = process.env.SUPABASE_SERVICE_ROLE_KEY ? "OK" : "MISSING";

  // Step 2: Zod
  try {
    const { registerSchema } = await import("@/lib/validators");
    const result = registerSchema.safeParse({
      email: "test@test.com", password: "TestPass123",
      alias: "testuser", acceptTerms: true, acceptPrivacy: true,
    });
    steps["2_zod"] = result.success ? "OK" : "FAIL: " + JSON.stringify(result.error.issues);
  } catch (e: unknown) {
    steps["2_zod"] = "ERROR: " + (e instanceof Error ? e.message : String(e));
  }

  // Step 3: sanitizeObject
  try {
    const { sanitizeObject } = await import("@/lib/sanitize");
    const cleaned = sanitizeObject({ email: "test@test.com", password: "Test123", alias: "test" });
    steps["3_sanitize"] = "OK: " + JSON.stringify(cleaned);
  } catch (e: unknown) {
    steps["3_sanitize"] = "ERROR: " + (e instanceof Error ? e.stack || e.message : String(e));
  }

  // Step 4: Supabase admin client
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);
    steps["4_supabase_query"] = error ? "ERROR: " + error.message : "OK";
  } catch (e: unknown) {
    steps["4_supabase_query"] = "ERROR: " + (e instanceof Error ? e.message : String(e));
  }

  // Step 5: Check if profiles table has proper columns
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("profiles").select("id, alias").limit(1);
    steps["5_profiles_schema"] = error ? "ERROR: " + error.message : "OK: " + JSON.stringify(data);
  } catch (e: unknown) {
    steps["5_profiles_schema"] = "ERROR: " + (e instanceof Error ? e.message : String(e));
  }

  // Step 6: Check consent_logs table
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    const { error } = await supabase.from("consent_logs").select("id").limit(1);
    steps["6_consent_logs"] = error ? "ERROR: " + error.message : "OK";
  } catch (e: unknown) {
    steps["6_consent_logs"] = "ERROR: " + (e instanceof Error ? e.message : String(e));
  }

  return NextResponse.json(steps, { status: 200 });
}
