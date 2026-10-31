import nodemailer from 'nodemailer';
import { env } from '../config/env';

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
}

export const sendMail = async ({ to, subject, text }: SendMailOptions): Promise<void> => {
  if (!env.SMTP_HOST || env.SMTP_HOST.trim() === '') {
    console.log(`[MAIL MOCK] To: ${to} | Subject: ${subject} | Text: ${text}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
  });

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    text,
  });
};

