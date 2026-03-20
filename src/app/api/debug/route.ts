import { NextResponse } from "next/server";

export async function GET() {
  const vars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET (" + process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + "...)" : "MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET (length: " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ")" : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET (length: " + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ")" : "MISSING",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "MISSING",
  };

  // Test Supabase connection
  let supabaseTest = "NOT_TESTED";
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data, error } = await supabase.from("profiles").select("id").limit(1);
    supabaseTest = error ? "ERROR: " + error.message : "OK (connected)";
  } catch (e: unknown) {
    supabaseTest = "EXCEPTION: " + (e instanceof Error ? e.message : String(e));
  }

  // Test Zod
  let zodTest = "NOT_TESTED";
  try {
    const { registerSchema } = await import("@/lib/validators");
    const result = registerSchema.safeParse({
      email: "test@test.com",
      password: "TestPass123",
      alias: "testuser",
      acceptTerms: true,
      acceptPrivacy: true,
    });
    zodTest = result.success ? "OK" : "VALIDATION_ERROR: " + JSON.stringify(result.error.issues);
  } catch (e: unknown) {
    zodTest = "EXCEPTION: " + (e instanceof Error ? e.message : String(e));
  }

  return NextResponse.json({ vars, supabaseTest, zodTest }, { status: 200 });
}
