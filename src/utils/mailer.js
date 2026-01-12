import nodemailer from 'nodemailer';
import { logger } from './logger.js';
import { loadHtmlTemplate, renderTemplate } from './templateLoader.js';


function buildTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SERVICE } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP env vars are required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: true,
    service: SMTP_SERVICE || 'gmail',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendRecoveryMail({ to, code, link }) {
  if (process.env.MAIL_DEBUG === 'true') {
    logger.info({ to, code }, '[MAIL_DEBUG] Recovery email payload');
    return;
  }

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

  await transporter.sendMail({
    from,
    to,
    subject: 'Recuperación de cuenta Jelt',
    html: html,
  });
}
