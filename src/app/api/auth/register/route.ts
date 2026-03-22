import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/validators";
import { sanitizeObject } from "@/lib/sanitize";
import { sendEmail } from "@/lib/email";

function generateOTP(): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

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

    // Create user (email_confirm: false so they can't login yet)
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

    // Update profile with alias
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

    // Generate our own OTP and store it in user metadata
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    await supabase.auth.admin.updateUserById(authData.user!.id, {
      user_metadata: {
        alias,
        otp_code: otp,
        otp_expires_at: otpExpiry,
      },
    });

    // Send OTP via our own SMTP
    const emailSent = await sendEmail({
      to: email,
      subject: "Tu código de verificación - Crowd Litigations",
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1a1a1a;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="font-size:24px;color:#1a1a1a;margin:0;">Crowd Litigations</h1>
    <p style="color:#888;font-size:14px;margin:4px 0 0;">Cremades &amp; Calvo-Sotelo</p>
  </div>

  <h2 style="font-size:20px;color:#1a1a1a;text-align:center;">Verifica tu correo electr&oacute;nico</h2>

  <p style="text-align:center;color:#555;">Introduce el siguiente c&oacute;digo en la plataforma para completar tu registro:</p>

  <div style="text-align:center;margin:32px 0;">
    <div style="display:inline-block;background:#f4f0ff;border:2px solid #6d28d9;border-radius:12px;padding:20px 40px;letter-spacing:12px;font-size:36px;font-weight:bold;color:#6d28d9;">
      ${otp}
    </div>
  </div>

  <p style="text-align:center;color:#888;font-size:14px;">
    Este c&oacute;digo expira en <strong>10 minutos</strong>.
  </p>

  <p style="text-align:center;color:#888;font-size:13px;margin-top:24px;">
    Si no has solicitado este registro, puedes ignorar este email.
  </p>

  <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;">
  <p style="font-size:12px;color:#999;text-align:center;">
    &copy; ${new Date().getFullYear()} Cremades &amp; Calvo-Sotelo. Todos los derechos reservados.
  </p>
</body>
</html>`,
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: "No se pudo enviar el email de verificación. Inténtalo de nuevo." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Error interno", detail: message }, { status: 500 });
  }
}
