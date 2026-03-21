import nodemailer from "nodemailer";

/**
 * Creates a reusable SMTP transporter using the domain's mail server.
 *
 * Required environment variables:
 *   SMTP_HOST     – e.g. mail.crowdlitigations.com, smtp.gmail.com, smtp.office365.com
 *   SMTP_PORT     – e.g. 465 (SSL) or 587 (STARTTLS)
 *   SMTP_USER     – e.g. noreply@crowdlitigations.com
 *   SMTP_PASS     – the password or app-specific password
 *   SMTP_FROM     – (optional) e.g. "Crowd Litigations <noreply@crowdlitigations.com>"
 *                   defaults to SMTP_USER if not set
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: { user, pass },
  });
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using the configured SMTP server.
 * Returns true if sent successfully, false otherwise.
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn(
      "[EMAIL] SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in environment variables."
    );
    return false;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    await transporter.sendMail({ from, to, subject, html });
    return true;
  } catch (error) {
    console.error(`[EMAIL] Failed to send to ${to}:`, error);
    return false;
  }
}

/**
 * Sends the same email to multiple recipients (one by one for privacy).
 * Returns the number of successfully sent emails.
 */
export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  html: string
): Promise<number> {
  let sent = 0;
  for (const to of recipients) {
    const ok = await sendEmail({ to, subject, html });
    if (ok) sent++;
  }
  return sent;
}
