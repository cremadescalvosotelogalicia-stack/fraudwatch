import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email y codigo son requeridos." },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(token)) {
      return NextResponse.json(
        { error: "El codigo debe ser de 6 digitos." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Find user by email
    const { data: userList } = await supabase.auth.admin.listUsers();
    const user = userList?.users?.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    const storedOtp = user.user_metadata?.otp_code;
    const otpExpiry = user.user_metadata?.otp_expires_at;

    if (!storedOtp || !otpExpiry) {
      return NextResponse.json(
        { error: "No hay código pendiente. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > new Date(otpExpiry)) {
      return NextResponse.json(
        { error: "El código ha expirado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    // Check code
    if (token !== storedOtp) {
      return NextResponse.json(
        { error: "Código incorrecto." },
        { status: 400 }
      );
    }

    // OTP is correct — confirm user's email and clear OTP
    const alias = user.user_metadata?.alias || "";
    await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      user_metadata: {
        alias,
        otp_code: null,
        otp_expires_at: null,
      },
    });

    // Send welcome email
    await sendEmail({
      to: email,
      subject: "¡Bienvenido/a a Crowd Litigations!",
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1a1a1a;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="font-size:24px;color:#1a1a1a;margin:0;">Crowd Litigations</h1>
    <p style="color:#888;font-size:14px;margin:4px 0 0;">Cremades &amp; Calvo-Sotelo</p>
  </div>

  <h2 style="font-size:20px;color:#1a1a1a;">¡Bienvenido/a, ${alias || "usuario"}!</h2>

  <p>Tu cuenta ha sido verificada correctamente. Ya puedes acceder a todas las funcionalidades de la plataforma.</p>

  <p>Desde Crowd Litigations puedes:</p>
  <ul style="color:#555;line-height:1.8;">
    <li><strong>Crear reclamaciones</strong> &mdash; Proponer nuevas acciones colectivas para que nuestro equipo letrado las valore.</li>
    <li><strong>Unirte a casos</strong> &mdash; Sumarte a reclamaciones ya existentes que est&eacute;n en fase de reclutamiento.</li>
    <li><strong>Consultar tus casos</strong> &mdash; Seguir el estado de todas las reclamaciones en las que participas.</li>
  </ul>

  <div style="text-align:center;margin:32px 0;">
    <a href="https://fraudwatch-three.vercel.app/hub"
       style="display:inline-block;background:#6d28d9;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:16px;">
      Acceder a la plataforma
    </a>
  </div>

  <p style="color:#888;font-size:14px;">
    Si tienes cualquier duda, escr&iacute;benos a
    <a href="mailto:info@crowdlitigations.com" style="color:#6d28d9;">info@crowdlitigations.com</a>.
  </p>

  <p style="margin-top:32px;">Un cordial saludo,<br>
  <strong>El equipo de Crowd Litigations</strong><br>
  <span style="color:#888;font-size:13px;">Cremades &amp; Calvo-Sotelo Abogados</span></p>

  <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;">
  <p style="font-size:12px;color:#999;text-align:center;">
    &copy; ${new Date().getFullYear()} Cremades &amp; Calvo-Sotelo. Todos los derechos reservados.
  </p>
</body>
</html>`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
