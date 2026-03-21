import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBulkEmail } from "@/lib/email";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Verify admin
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const { reason } = await request.json().catch(() => ({ reason: "" }));

  const supabase = createAdminClient();

  // 2. Verify case exists and is not already rejected
  const { data: caseData, error: caseError } = await supabase
    .from("cases")
    .select("id, title, accused_company, status")
    .eq("id", id)
    .single();

  if (caseError || !caseData) {
    return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });
  }

  if (caseData.status === "rejected") {
    return NextResponse.json({ error: "El caso ya esta rechazado" }, { status: 400 });
  }

  // 3. Get all claims with user IDs for this case
  const { data: claims } = await supabase
    .from("claims")
    .select("user_id")
    .eq("case_id", id);

  const userIds = [...new Set((claims || []).map((c) => c.user_id))];

  // 4. Get user emails from auth (admin API)
  const emails: string[] = [];
  for (const uid of userIds) {
    const { data } = await supabase.auth.admin.getUserById(uid);
    if (data?.user?.email) {
      emails.push(data.user.email);
    }
  }

  // 5. Update case: rejected + not public
  const { error: updateError } = await supabase
    .from("cases")
    .update({ status: "rejected", is_public: false })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: "Error al actualizar el caso: " + updateError.message },
      { status: 500 }
    );
  }

  // 6. Send rejection emails via SMTP (domain mail server)
  const reasonBlock = reason
    ? `<p style="margin:16px 0;padding:16px;background:#f8f8f8;border-radius:8px;color:#333;font-style:italic;">&ldquo;${reason}&rdquo;</p>`
    : "";

  const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1a1a1a;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="font-size:24px;color:#1a1a1a;margin:0;">Crowd Litigations</h1>
    <p style="color:#888;font-size:14px;margin:4px 0 0;">Cremades &amp; Calvo-Sotelo</p>
  </div>

  <h2 style="font-size:20px;color:#1a1a1a;">Informaci&oacute;n sobre tu caso</h2>

  <p>Estimado/a usuario/a,</p>

  <p>Tras la valoraci&oacute;n por parte de nuestro equipo letrado, lamentamos informarte de que el caso
  <strong>&ldquo;${caseData.title}&rdquo;</strong> contra <strong>${caseData.accused_company}</strong>
  no re&uacute;ne los requisitos necesarios para iniciar el proceso de reclamaci&oacute;n colectiva
  a trav&eacute;s de nuestra plataforma.</p>

  ${reasonBlock}

  <p>Queremos agradecerte sinceramente tu confianza al utilizar Crowd Litigations y tu participaci&oacute;n
  en este caso. Sabemos que dar el paso de unirse a una reclamaci&oacute;n colectiva requiere compromiso,
  y valoramos enormemente tu implicaci&oacute;n.</p>

  <p>Tu cuenta en la plataforma sigue activa y puedes continuar participando en otros casos disponibles.
  Si en el futuro surge un nuevo caso que pueda ser de tu inter&eacute;s, te lo haremos saber.</p>

  <p>Si tienes cualquier duda, no dudes en escribirnos a
  <a href="mailto:info@crowdlitigations.com" style="color:#6d28d9;">info@crowdlitigations.com</a>.</p>

  <p style="margin-top:32px;">Un cordial saludo,<br>
  <strong>El equipo de Crowd Litigations</strong><br>
  <span style="color:#888;font-size:13px;">Cremades &amp; Calvo-Sotelo Abogados</span></p>

  <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;">
  <p style="font-size:12px;color:#999;text-align:center;">
    Este email ha sido enviado autom&aacute;ticamente desde Crowd Litigations.<br>
    &copy; ${new Date().getFullYear()} Cremades &amp; Calvo-Sotelo. Todos los derechos reservados.
  </p>
</body>
</html>`;

  let emailsSent = 0;

  if (emails.length > 0) {
    emailsSent = await sendBulkEmail(
      emails,
      `Actualización sobre el caso "${caseData.title}"`,
      emailHtml
    );
  }

  return NextResponse.json({
    success: true,
    emailsSent,
    totalAffected: emails.length,
    message:
      emailsSent > 0
        ? `Caso rechazado. Se ha notificado a ${emailsSent} afectado(s).`
        : emails.length > 0
        ? `Caso rechazado. No se pudieron enviar los emails (revisa la configuración SMTP). Afectados: ${emails.length}.`
        : "Caso rechazado. No había afectados inscritos.",
  });
}
