import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/validators";
import { sanitizeObject } from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, alias } = sanitizeObject(result.data);
    const supabase = createAdminClient();

    // Check if alias is taken
    const { data: existingAlias } = await supabase
      .from("profiles")
      .select("id")
      .eq("alias", alias)
      .single();

    if (existingAlias) {
      return NextResponse.json(
        { error: "Este alias ya esta en uso" },
        { status: 409 }
      );
    }

    // Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { alias },
    });

    if (authError) {
      if (authError.message.includes("already")) {
        return NextResponse.json(
          { error: "Este email ya esta registrado" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Error al crear la cuenta" },
        { status: 500 }
      );
    }

    // Update profile with alias (trigger creates the profile row)
    if (authData.user) {
      await supabase
        .from("profiles")
        .update({ alias })
        .eq("id", authData.user.id);

      // Log consent
      const ip = request.headers.get("x-forwarded-for") || "unknown";
      const ua = request.headers.get("user-agent") || "unknown";

      await supabase.from("consent_logs").insert([
        {
          user_id: authData.user.id,
          consent_type: "terms_of_service",
          document_version: "1.0",
          accepted: true,
          ip_address: ip,
          user_agent: ua,
        },
        {
          user_id: authData.user.id,
          consent_type: "privacy_policy",
          document_version: "1.0",
          accepted: true,
          ip_address: ip,
          user_agent: ua,
        },
      ]);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
