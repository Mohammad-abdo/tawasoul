import nodemailer from 'nodemailer';
import { logger } from './logger.js';

let transporter = null;

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'noreply@example.com';

  if (!host || !user || !pass) {
    logger.warn('SMTP not configured. Email sending will be disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
};

export const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const mailTransporter = getTransporter();

  if (!mailTransporter) {
    logger.warn(`[EMAIL PLACEHOLDER] Would send email to: ${to}`);
    logger.warn(`[EMAIL PLACEHOLDER] Subject: ${subject}`);
    return { messageId: null, placeholder: true };
  }

  const from = process.env.SMTP_FROM || 'noreply@example.com';

  try {
    const info = await mailTransporter.sendMail({
      from,
      to,
      subject,
      html,
      text
    });

    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return { messageId: info.messageId, placeholder: false };
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
};

export const sendVerificationEmail = async ({ to, token }) => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const verifyLink = `${appUrl}/api/auth/verify-email?token=${token}`;

  const html = `
    <h2>Verify your email address</h2>
    <p>Click the link below to verify your email address:</p>
    <a href="${verifyLink}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a>
    <p>Or copy this link to your browser: ${verifyLink}</p>
    <p>This link will expire in 24 hours.</p>
  `;

  const text = `Verify your email address. Click the link below:\n${verifyLink}\n\nThis link will expire in 24 hours.`;

  return sendEmail({
    to,
    subject: 'Verify your email address',
    html,
    text
  });
};
