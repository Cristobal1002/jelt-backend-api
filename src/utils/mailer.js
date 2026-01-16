import nodemailer from 'nodemailer';
import { logger } from './logger.js';
import { loadHtmlTemplate, renderTemplate } from './templateLoader.js';


function buildTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SERVICE } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP env vars are required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
  }

  // Para puerto 587 (STARTTLS) debe ser secure: false
  // Para puerto 465 (SSL) debe ser secure: true
  const isSecurePort = Number(SMTP_PORT) === 465;
  
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: isSecurePort,
    service: SMTP_SERVICE || 'gmail',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendRecoveryMail({ to, code, link }) {
  if (process.env.MAIL_DEBUG === 'true') {
    logger.info({ to, code, link }, '[MAIL_DEBUG] Recovery email payload (email not sent in debug mode)');
    return;
  }

  try {
    const template = await loadHtmlTemplate('templates/emails/account-recovery.html');
    const html = renderTemplate(template, {
      appName: process.env.APP_NAME || 'Jelt App',
      code,
      link,
      supportEmail: process.env.SUPPORT_EMAIL,
      year: new Date().getFullYear(),
    });

    const transporter = buildTransporter();

    const from = process.env.MAIL_FROM || 'no-reply@jelt.com';

    const info = await transporter.sendMail({
      from,
      to,
      subject: 'Recuperación de cuenta Jelt',
      html: html,
    });

    logger.info({ to, messageId: info.messageId }, 'Recovery email sent successfully');
  } catch (error) {
    logger.error({ error, to }, 'Failed to send recovery email');
    throw error;
  }
}
