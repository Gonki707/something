import nodemailer from 'nodemailer';
import { env } from './env.js';

let transporter: nodemailer.Transporter | null = null;

export function getMailer(): nodemailer.Transporter | null {
  if (!env.SMTP_HOST || !env.SMTP_USER) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendMail(opts: { subject: string; text: string; html?: string; to?: string }) {
  const t = getMailer();
  if (!t) {
    console.warn('[mailer] SMTP not configured — skipping email:', opts.subject);
    return { skipped: true };
  }
  await t.sendMail({
    from: env.MAIL_FROM,
    to: opts.to || env.MAIL_TO,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
  return { skipped: false };
}
