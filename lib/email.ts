import nodemailer from 'nodemailer';

export async function sendEmailNotification(ticket: Record<string, unknown>) {
  const to = ticket.requestor_email as string | undefined;
  const subject = `Ticket Created: ${ticket.ticket_number}`;
  const text = `Hello ${ticket.requestor_name},\n\nYour ticket ${ticket.ticket_number} has been successfully registered.\n\nShort Description: ${ticket.short_description}\nStatus: ${ticket.status}\n`;
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.5"><h2>Ticket Created</h2><p>Hello ${ticket.requestor_name},</p><p>Your ticket <strong>${ticket.ticket_number}</strong> has been successfully registered.</p><p><strong>Short Description:</strong> ${ticket.short_description}</p><p><strong>Status:</strong> ${ticket.status}</p></div>`;

  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM;

  if (resendApiKey && resendFrom && to) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [to],
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend email failed: ${response.status} ${errorText}`);
    }

    return;
  }

  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM;

  if (!host || !user || !pass || !from || !to) {
    throw new Error('Email is not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS, and EMAIL_FROM, or configure RESEND_API_KEY and RESEND_FROM_EMAIL.');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}
