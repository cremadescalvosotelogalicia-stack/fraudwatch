import { NextResponse } from "next/server";

export async function GET() {
  const envCheck = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET (" + process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + "...)" : "MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET (length: " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ")" : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET (length: " + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ")" : "MISSING",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "MISSING",
  };

  // Try to create admin client
  let adminTest = "not tested";
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data, error } = await supabase.from("profiles").select("id").limit(1);
    adminTest = error ? `ERROR: ${error.message}` : `OK (found ${data?.length} profiles)`;
  } catch (e: unknown) {
    adminTest = `EXCEPTION: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json({ envCheck, adminTest, timestamp: new Date().toISOString() });
}
