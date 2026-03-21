import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators";
import { sanitizeObject } from "@/lib/sanitize";

export async function GET() {
  const envCheck = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING",
  };

  return NextResponse.json({ envCheck });
}

export async function POST(request: Request) {
  const steps: Record<string, unknown> = {};

  try {
    // Step 1: Parse body
    const body = await request.json();
    steps.bodyParsed = "OK";
    steps.bodyKeys = Object.keys(body);

    // Step 2: Zod validation
    const result = registerSchema.safeParse(body);
    steps.zodValid = result.success;
    if (!result.success) {
      steps.zodErrors = result.error.issues;
      return NextResponse.json(steps);
    }

    // Step 3: Sanitize
    const sanitized = sanitizeObject(result.data);
    steps.sanitized = "OK";
    steps.sanitizedKeys = Object.keys(sanitized);

    // Step 4: Supabase connection
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    steps.supabaseClient = "OK";

    // Step 5: Try creating user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: sanitized.email,
      password: sanitized.password,
      email_confirm: false,
      user_metadata: { alias: sanitized.alias },
    });

    if (authError) {
      steps.authError = authError.message;
    } else {
      steps.authSuccess = true;
      steps.userId = authData.user?.id;
      // Clean up: delete the test user
      if (authData.user) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        steps.cleanedUp = true;
      }
    }

    return NextResponse.json(steps);
  } catch (e: unknown) {
    steps.exception = e instanceof Error ? e.message : String(e);
    steps.stack = e instanceof Error ? e.stack?.split("\n").slice(0, 5) : undefined;
    return NextResponse.json(steps, { status: 500 });
  }
}
