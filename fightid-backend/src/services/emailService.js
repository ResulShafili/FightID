import { Resend } from "resend";
import { env } from "../config/env.js";

const createClient = () => {
  if (!env.email.resendApiKey) return null;
  return new Resend(env.email.resendApiKey);
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const isEmailConfigured = () => Boolean(env.email.resendApiKey && env.email.from);

export const sendEmailWithResult = async ({ to, subject, text, html }) => {
  const resend = createClient();
  if (!to) return { sent: false, error: "Recipient email is missing" };
  if (!resend) {
    const error = "Resend is not configured";
    console.warn(`[email disabled] ${error}. Would have sent "${subject}" to ${to}.`);
    if (env.nodeEnv !== "production") console.info(text);
    return { sent: false, error };
  }

  try {
    const { error } = await resend.emails.send({
      from: env.email.from,
      to,
      subject,
      html: html || `<p>${escapeHtml(text).replace(/\n/g, "<br>")}</p>`,
      text,
    });

    if (error) {
      const detail = error.message || "Unknown Resend error";
      console.warn(`[email failed] ${subject} -> ${to}: ${detail}`);
      return { sent: false, error: detail };
    }

    return { sent: true, error: null };
  } catch (error) {
    const detail = error.message || "Unknown Resend error";
    console.warn(`[email failed] ${subject} -> ${to}: ${detail}`);
    return { sent: false, error: detail };
  }
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const result = await sendEmailWithResult({ to, subject, text, html });
  return result.sent;
};
