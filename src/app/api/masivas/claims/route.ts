import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

const CASE_TITLES: Record<string, string> = {
  patrimonio: "Devolución del Impuesto sobre el Patrimonio",
  "irpf-hipoteca": "Deducción IRPF por cancelación de hipoteca",
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // ── Extract fields ──
    const caseSlug = formData.get("case_slug") as string | null;
    const nombre = formData.get("nombre") as string | null;
    const apellidos = formData.get("apellidos") as string | null;
    const email = formData.get("email") as string | null;
    const telefono = formData.get("telefono") as string | null;
    const comunidadAutonoma = formData.get("comunidad_autonoma") as string | null;
    const ejercicios = formData.getAll("ejercicios") as string[];
    const comentarios = (formData.get("comentarios") as string) || "";
    const privacyAccepted = formData.get("privacy_accepted") === "true";

    // ── Validate required fields ──
    if (!caseSlug || !nombre || !apellidos || !email || !telefono || !comunidadAutonoma) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios deben estar completados." },
        { status: 400 }
      );
    }

    if (ejercicios.length === 0) {
      return NextResponse.json(
        { error: "Debes seleccionar al menos un ejercicio." },
        { status: 400 }
      );
    }

    if (!privacyAccepted) {
      return NextResponse.json(
        { error: "Debes aceptar la política de privacidad." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // ── Insert claim ──
    const { data: claim, error: insertError } = await supabase
      .from("masivas_claims")
      .insert({
        case_slug: caseSlug,
        nombre,
        apellidos,
        email,
        telefono,
        comunidad_autonoma: comunidadAutonoma,
        ejercicios,
        comentarios,
        privacy_accepted: privacyAccepted,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !claim) {
      console.error("[MASIVAS] Insert error:", insertError);
      return NextResponse.json(
        { error: "Error al guardar la solicitud." },
        { status: 500 }
      );
    }

    const claimId = claim.id;

    // ── Upload files ──
    const fileFields = formData.getAll("documentos") as File[];
    const uploadedPaths: string[] = [];

    for (const file of fileFields) {
      if (!(file instanceof File) || file.size === 0) continue;

      const storagePath = `masivas/${caseSlug}/${claimId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error(`[MASIVAS] File upload error (${file.name}):`, uploadError);
      } else {
        uploadedPaths.push(storagePath);
      }
    }

    // ── Update claim with document paths ──
    if (uploadedPaths.length > 0) {
      await supabase
        .from("masivas_claims")
        .update({ documentos: uploadedPaths })
        .eq("id", claimId);
    }

    // ── Send confirmation email to user ──
    const caseTitle = CASE_TITLES[caseSlug] || caseSlug;

    await sendEmail({
      to: email,
      subject: `Solicitud recibida - ${caseTitle}`,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d97706, #b45309); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Crowd Litigations</h1>
          </div>
          <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111827;">Hola ${nombre},</h2>
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
              Hemos recibido tu solicitud de reclamación para la <strong>${caseTitle}</strong>.
              Nuestro equipo letrado revisará tu caso y se pondrá en contacto contigo.
            </p>
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
              Si necesitas añadir documentación adicional o tienes alguna consulta, no dudes en
              escribirnos a <a href="mailto:info@crowdlitigations.com" style="color: #d97706;">info@crowdlitigations.com</a>
              o llamarnos al <a href="tel:981925637" style="color: #d97706;">981 92 56 37</a>.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0 0;">
              Este es un correo automático. Por favor, no respondas a este mensaje.
            </p>
          </div>
        </div>
      `,
    });

    // ── Send notification email to admin ──
    await sendEmail({
      to: "info@crowdlitigations.com",
      subject: `Nueva solicitud de reclamación - ${caseTitle} - ${nombre} ${apellidos}`,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #111827; margin: 0 0 16px 0;">Nueva solicitud de reclamación masiva</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 12px; font-weight: 600; color: #374151; width: 180px;">Caso</td>
              <td style="padding: 10px 12px; color: #4b5563;">${caseTitle}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
              <td style="padding: 10px 12px; font-weight: 600; color: #374151;">ID Solicitud</td>
              <td style="padding: 10px 12px; color: #4b5563;">${claimId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 12px; font-weight: 600; color: #374151;">Nombre</td>
              <td style="padding: 10px 12px; color: #4b5563;">${nombre} ${apellidos}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
              <td style="padding: 10px 12px; font-weight: 600; color: #374151;">Email</td>
              <td style="padding: 10px 12px; color: #4b5563;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 12px; font-weight: 600; color: #374151;">Teléfono</td>
              <td style="padding: 10px 12px; color: #4b5563;"><a href="tel:${telefono}">${telefono}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
              <td style="padding: 10px 12px; font-weight: 600; color: #374151;">Comunidad Autónoma</td>
              <td style="padding: 10px 12px; color: #4b5563;">${comunidadAutonoma}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 12px; font-weight: 600; color: #374151;">Ejercicios</td>
              <td style="padding: 10px 12px; color: #4b5563;">${ejercicios.join(", ")}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
              <td style="padding: 10px 12px; font-weight: 600; color: #374151;">Comentarios</td>
              <td style="padding: 10px 12px; color: #4b5563;">${comentarios || "(sin comentarios)"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 12px; font-weight: 600; color: #374151;">Documentos</td>
              <td style="padding: 10px 12px; color: #4b5563;">${uploadedPaths.length > 0 ? uploadedPaths.map((p) => p.split("/").pop()).join(", ") : "(sin documentos)"}</td>
            </tr>
          </table>
        </div>
      `,
    });

    return NextResponse.json({ id: claimId }, { status: 201 });
  } catch (err) {
    console.error("[MASIVAS] Unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
