import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { caseSchema } from "@/lib/validators";
import { sanitizeObject } from "@/lib/sanitize";
import { sendEmail } from "@/lib/email";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = 12;
  const offset = (page - 1) * pageSize;

  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("cases")
    .select("*, profiles!cases_creator_id_fkey(alias), claims(count)", { count: "exact" })
    .eq("is_public", true)
    .neq("status", "rejected")
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  const q = searchParams.get("q");
  if (q) {
    query = query.or(`title.ilike.%${q}%,accused_company.ilike.%${q}%`);
  }

  const category = searchParams.get("category");
  if (category) {
    query = query.eq("category", category);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count });
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const result = caseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const sanitized = sanitizeObject(result.data);

    // 1. Create case with status "recruiting"
    const { data, error } = await supabase
      .from("cases")
      .insert({
        ...sanitized,
        creator_id: user.id,
        status: "recruiting",
      })
      .select("id, title, accused_company")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Auto-enroll the creator as the first affected person (claim)
    //    Use admin client to bypass RLS policies
    const adminSupabase = createAdminClient();
    const { error: claimError } = await adminSupabase
      .from("claims")
      .insert({
        case_id: data.id,
        user_id: user.id,
        amount_defrauded: 0.01,
        testimony: "Creador del caso",
        share_with_legal: true,
      });

    if (claimError) {
      console.error("[CASE] Error auto-enrolling creator:", claimError.message);
    }

    // 3. Send confirmation email to the creator
    const userEmail = user.email;
    if (userEmail) {
      const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1a1a1a;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="font-size:24px;color:#1a1a1a;margin:0;">Crowd Litigations</h1>
    <p style="color:#888;font-size:14px;margin:4px 0 0;">Cremades &amp; Calvo-Sotelo</p>
  </div>

  <h2 style="font-size:20px;color:#1a1a1a;">Tu caso ha sido registrado</h2>

  <p>Estimado/a usuario/a,</p>

  <p>Tu caso <strong>&ldquo;${data.title}&rdquo;</strong> contra <strong>${data.accused_company}</strong>
  ha sido registrado correctamente en la plataforma y se encuentra en fase de
  <strong>reclutamiento de afectados</strong>.</p>

  <p>T&uacute; ya cuentas como el primer afectado inscrito.</p>

  <div style="margin:24px 0;padding:20px;background:#f0f4ff;border-radius:12px;border-left:4px solid #6d28d9;">
    <p style="margin:0 0 8px;font-weight:600;color:#1a1a1a;">&iquest;Qu&eacute; ocurre ahora?</p>
    <ul style="margin:0;padding-left:20px;color:#444;font-size:14px;line-height:1.8;">
      <li>Otros afectados podr&aacute;n unirse a tu caso desde la plataforma.</li>
      <li>Nuestros abogados valorar&aacute;n el n&uacute;mero m&iacute;nimo de afectados necesario.</li>
      <li>Cuando se alcance el umbral necesario, se publicar&aacute; el caso y se iniciar&aacute; el proceso de reclamaci&oacute;n.</li>
    </ul>
  </div>

  <p>Comparte el enlace del caso con otras personas que puedan estar afectadas para acelerar el proceso.</p>

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

      // Fire and forget - don't block the response
      sendEmail({
        to: userEmail,
        subject: `Tu caso "${data.title}" ha sido registrado - Crowd Litigations`,
        html: emailHtml,
      }).catch((err) => console.error("[CASE] Error sending creation email:", err));
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
