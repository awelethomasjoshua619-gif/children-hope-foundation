import nodemailer, { type Transporter } from 'nodemailer';
import { config } from '../config/env';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!config.smtp.host || !config.smtp.user) {
    console.warn('[email] SMTP not configured — skipping email send.');
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
  }
  return transporter;
}

async function send(to: string, subject: string, html: string, text: string): Promise<void> {
  const t = getTransporter();
  if (!t) return;
  try {
    await t.sendMail({ from: config.smtp.from, to, subject, html, text });
    console.log(`[email] sent "${subject}" → ${to}`);
  } catch (err) {
    console.error('[email] failed to send:', err);
    // Never crash a request because email failed.
  }
}

const BRAND = 'Children Hope Foundation';
const ACCENT = '#16a34a';

function layout(title: string, bodyHtml: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f6f8f6;padding:24px">
    <div style="max-width:560px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
      <div style="background:${ACCENT};padding:20px 28px">
        <span style="color:#ffffff;font-size:18px;font-weight:bold">🌱 ${BRAND}</span>
      </div>
      <div style="padding:28px">
        <h2 style="margin:0 0 16px;color:#111827;font-size:20px">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="padding:18px 28px;background:#f9fafb;color:#6b7280;font-size:12px">
        ${BRAND} · Education · Healthcare · Food for children in Africa<br/>
        You received this email because you donated to or contacted ${BRAND}.
      </div>
    </div>
  </div>`;
}

export async function sendDonationReceipt(input: {
  email: string;
  name: string;
  amount: string;
  currency: string;
  reference: string;
  campaignTitle: string;
  date: Date;
}): Promise<void> {
  const html = layout(
    'Thank you for your gift! 💚',
    `
    <p>Hi ${escapeHtml(input.name)},</p>
    <p>We've received your donation. Here are the details for your records:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
      <tr><td style="padding:6px 0;color:#6b7280">Amount</td><td style="text-align:right;font-weight:bold;color:${ACCENT}">${escapeHtml(input.currency)} ${escapeHtml(input.amount)}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Campaign</td><td style="text-align:right">${escapeHtml(input.campaignTitle)}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Reference</td><td style="text-align:right">${escapeHtml(input.reference)}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Date</td><td style="text-align:right">${input.date.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</td></tr>
    </table>
    <p style="color:#374151">Your generosity funds classrooms, clinics and warm meals for children across Africa. No gift is too small.</p>
    <p style="color:#374151">With gratitude,<br/>The ${BRAND} team</p>
    `,
  );
  await send(input.email, `Donation receipt — ${input.reference}`, html, `Thank you ${input.name}! Your ${input.currency} ${input.amount} donation to "${input.campaignTitle}" (ref ${input.reference}) was received.`);
}

export async function sendAdminDonationAlert(input: {
  amount: string;
  currency: string;
  campaignTitle: string;
  donorName: string;
  donorEmail: string;
  reference: string;
}): Promise<void> {
  const html = layout(
    'New successful donation 🎉',
    `
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:6px 0;color:#6b7280">Amount</td><td style="text-align:right;font-weight:bold">${escapeHtml(input.currency)} ${escapeHtml(input.amount)}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Campaign</td><td style="text-align:right">${escapeHtml(input.campaignTitle)}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Donor</td><td style="text-align:right">${escapeHtml(input.donorName)} (${escapeHtml(input.donorEmail)})</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Reference</td><td style="text-align:right">${escapeHtml(input.reference)}</td></tr>
    </table>
    `,
  );
  await send(config.smtp.adminAlertEmail, `💰 New donation: ${input.currency} ${input.amount} — ${input.campaignTitle}`, html, `New donation ${input.currency} ${input.amount} to ${input.campaignTitle} from ${input.donorName} <${input.donorEmail}> (ref ${input.reference}).`);
}

export async function sendContactFormNotification(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const html = layout(
    'New contact form message',
    `
    <p><strong>${escapeHtml(input.name)}</strong> (${escapeHtml(input.email)}) wrote:</p>
    <p style="background:#f9fafb;padding:12px;border-radius:8px;white-space:pre-wrap">${escapeHtml(input.subject)}</p>
    <p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>
    `,
  );
  await send(config.smtp.adminAlertEmail, `📬 Contact: ${input.subject}`, html, `${input.name} <${input.email}>: ${input.subject} — ${input.message}`);
}

export async function sendContactConfirmation(input: { name: string; email: string }): Promise<void> {
  const html = layout(
    'We received your message',
    `<p>Hi ${escapeHtml(input.name)},</p>
     <p>Thank you for reaching out to ${BRAND}. Our team typically replies within 2 business days.</p>`,
  );
  await send(input.email, 'We received your message — Children Hope Foundation', html, `Hi ${input.name}, thank you for contacting ${BRAND}. We'll reply within 2 business days.`);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
