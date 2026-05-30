import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const createTransporter = () => {
  if (!env.email.smtpHost || !env.email.smtpUser || !env.email.smtpPass) return null;

  return nodemailer.createTransport({
    host: env.email.smtpHost,
    port: env.email.smtpPort,
    secure: env.email.smtpPort === 465,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    auth: {
      user: env.email.smtpUser,
      pass: env.email.smtpPass,
    },
  });
};

export const isEmailConfigured = () => Boolean(env.email.smtpHost && env.email.smtpUser && env.email.smtpPass);

export const sendEmailWithResult = async ({ to, subject, text }) => {
  const transporter = createTransporter();
  if (!to) return { sent: false, error: "Recipient email is missing" };
  if (!transporter) {
    const error = "SMTP is not configured";
    console.warn(`[email disabled] ${error}. Would have sent "${subject}" to ${to}.`);
    if (env.nodeEnv !== "production") console.info(text);
    return { sent: false, error };
  }

  try {
    await transporter.sendMail({
      from: env.email.from,
      to,
      subject,
      text,
    });
    return { sent: true, error: null };
  } catch (error) {
    const detail = error.response || error.message || "Unknown SMTP error";
    console.warn(`[email failed] ${subject} -> ${to}: ${detail}`);
    return { sent: false, error: detail };
  }
};

export const sendEmail = async ({ to, subject, text }) => {
  const result = await sendEmailWithResult({ to, subject, text });
  return result.sent;
};
