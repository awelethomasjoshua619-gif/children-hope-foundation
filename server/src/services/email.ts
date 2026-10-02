import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const demoMode = process.env.NODE_ENV !== 'production' && process.env.RESEND_DEMO_MODE !== 'false';
const FROM = demoMode
  ? 'Children Hope Foundation <onboarding@resend.dev>'
  : process.env.MAIL_FROM || 'Children Hope Foundation <onboarding@resend.dev>';

async function sendEmail(params: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}) {
  const baseMessage = {
    from: FROM,
    to: [demoMode ? 'delivered@resend.dev' : params.to],
    subject: params.subject,
    ...(params.replyTo ? { replyTo: params.replyTo } : {}),
  };
  const { error } = params.html
    ? await resend.emails.send({ ...baseMessage, html: params.html })
    : await resend.emails.send({ ...baseMessage, text: params.text ?? '' });

  if (error) {
    throw new Error(`Resend could not deliver email: ${error.message}`);
  }
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]!);

export const sendDonationReceipt = async (params: {
  donorEmail: string;
  donorName: string;
  amount: number; // in the currency's smallest unit
  currency: string;
  campaignTitle: string;
  reference: string;
  date: Date;
}) => {
  const amountFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: params.currency,
  }).format(params.amount / 100);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e40af, #2563eb); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; }
    .body { padding: 40px 30px; }
    .amount-box { background: #eff6ff; border: 2px solid #bfdbfe; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
    .amount-box .amount { font-size: 36px; font-weight: bold; color: #1e40af; }
    .amount-box .label { color: #64748b; font-size: 14px; margin-top: 4px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .detail-label { color: #64748b; font-size: 14px; }
    .detail-value { font-weight: 600; font-size: 14px; color: #1e293b; }
    .footer { background: #f8fafc; padding: 24px 30px; text-align: center; font-size: 13px; color: #64748b; }
    .badge { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❤️ Children Hope Foundation</h1>
      <p>Donation Receipt — Thank You!</p>
    </div>
    <div class="body">
      <p>Dear ${escapeHtml(params.donorName || 'Generous Donor')},</p>
      <p>Thank you so much for your generous donation. Your support makes a real difference in the lives of children across Africa.</p>

      <div class="amount-box">
        <div class="amount">${amountFormatted}</div>
        <div class="label">Donated to <strong>${escapeHtml(params.campaignTitle)}</strong></div>
      </div>

      <div>
        <div class="detail-row">
          <span class="detail-label">Reference</span>
          <span class="detail-value">${escapeHtml(params.reference)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${params.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value"><span class="badge">✓ Confirmed</span></span>
        </div>
      </div>

      <p style="margin-top: 32px; color: #475569;">This receipt is for your records. Please use the foundation website contact form if you have a question.</p>
      <p>With gratitude,<br><strong>The Children Hope Foundation Team</strong></p>
    </div>
    <div class="footer">
      <p>Children Hope Foundation | Providing education, healthcare, and food to children in Africa</p>
      <p style="margin-top: 8px; font-size: 11px;">This is an automated receipt. Please keep it for your records.</p>
    </div>
  </div>
</body>
</html>
  `;

  await sendEmail({
    to: params.donorEmail,
    subject: `Donation Receipt — ${amountFormatted} to ${params.campaignTitle}`,
    html,
  });
};

export const sendAdminDonationAlert = async (params: {
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  campaignTitle: string;
  reference: string;
}) => {
  const amountFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: params.currency,
  }).format(params.amount / 100);

  await sendEmail({
    to: process.env.ADMIN_EMAIL || 'admin@childrenhope.org',
    subject: `New Donation: ${amountFormatted} — ${params.campaignTitle}`,
    html: `
      <p><strong>New donation received!</strong></p>
      <ul>
        <li>Amount: ${amountFormatted}</li>
        <li>Donor: ${escapeHtml(params.donorName || 'Anonymous')} (${escapeHtml(params.donorEmail)})</li>
        <li>Campaign: ${escapeHtml(params.campaignTitle)}</li>
        <li>Reference: ${escapeHtml(params.reference)}</li>
      </ul>
    `,
  });
};

export const sendContactEmail = async (params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  await sendEmail({
    to: process.env.ADMIN_EMAIL || 'admin@childrenhope.org',
    replyTo: params.email,
    subject: `Contact Form: ${params.subject}`,
    html: `
      <p><strong>New contact form submission</strong></p>
      <p><strong>Name:</strong> ${escapeHtml(params.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(params.email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(params.subject)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(params.message).replace(/\n/g, '<br>')}</p>
    `,
  });
};

export const sendContactFormNotification = sendContactEmail;

export const sendContactConfirmation = async (params: { name: string; email: string }) => {
  await sendEmail({
    to: params.email,
    subject: 'We received your message — Children Hope Foundation',
    text: `Hello ${params.name},\n\nThank you for contacting Children Hope Foundation. We have received your message and will reply as soon as we can.\n\nThe Children Hope Foundation Team`,
  });
};
