import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

function generateOTP(): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email requerido." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Find user by email
    const { data: userList } = await supabase.auth.admin.listUsers();
    const user = userList?.users?.find((u) => u.email === email);

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json({ success: true });
    }

    // If already confirmed, no need to resend
    if (user.email_confirmed_at) {
      return NextResponse.json({ error: "Este email ya ha sido verificado." }, { status: 400 });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        otp_code: otp,
        otp_expires_at: otpExpiry,
      },
    });

    // Send via SMTP
    await sendEmail({
      to: email,
      subject: "Tu nuevo código de verificación - Crowd Litigations",
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1a1a1a;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="font-size:24px;color:#1a1a1a;margin:0;">Crowd Litigations</h1>
    <p style="color:#888;font-size:14px;margin:4px 0 0;">Cremades &amp; Calvo-Sotelo</p>
  </div>

  <h2 style="font-size:20px;color:#1a1a1a;text-align:center;">Tu nuevo c&oacute;digo de verificaci&oacute;n</h2>

  <p style="text-align:center;color:#555;">Introduce el siguiente c&oacute;digo en la plataforma para completar tu registro:</p>

  <div style="text-align:center;margin:32px 0;">
    <div style="display:inline-block;background:#f4f0ff;border:2px solid #6d28d9;border-radius:12px;padding:20px 40px;letter-spacing:12px;font-size:36px;font-weight:bold;color:#6d28d9;">
      ${otp}
    </div>
  </div>

  <p style="text-align:center;color:#888;font-size:14px;">
    Este c&oacute;digo expira en <strong>10 minutos</strong>.
  </p>

  <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;">
  <p style="font-size:12px;color:#999;text-align:center;">
    &copy; ${new Date().getFullYear()} Cremades &amp; Calvo-Sotelo. Todos los derechos reservados.
  </p>
</body>
</html>`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
