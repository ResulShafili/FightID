import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const createTransporter = () => {
  if (!env.email.smtpHost || !env.email.smtpUser || !env.email.smtpPass) return null;

  return nodemailer.createTransport({
    host: env.email.smtpHost,
    port: env.email.smtpPort,
    secure: env.email.smtpPort === 465,
    auth: {
      user: env.email.smtpUser,
      pass: env.email.smtpPass,
    },
  });
};

export const sendEmail = async ({ to, subject, text }) => {
  const transporter = createTransporter();
  if (!to) return false;
  if (!transporter) {
    console.warn(`[email disabled] SMTP is not configured. Would have sent "${subject}" to ${to}.`);
    if (env.nodeEnv !== "production") console.info(text);
    return false;
  }

  await transporter.sendMail({
    from: env.email.from,
    to,
    subject,
    text,
  });
  return true;
};
