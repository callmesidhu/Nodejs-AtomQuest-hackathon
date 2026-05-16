import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const enabled = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const transporter = enabled
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
    })
  : null;

export async function sendMail(to: string, subject: string, html: string) {
  if (!transporter) {
    console.info(`[mail:dev] ${subject} -> ${to}`);
    return;
  }
  await transporter.sendMail({ from: env.MAIL_FROM, to, subject, html });
}

export const templates = {
  submitted: (name: string) => `<p>${name} submitted goals for approval in GoalSync.</p>`,
  approved: () => "<p>Your GoalSync goals have been approved and locked.</p>",
  rejected: (comment?: string) => `<p>Your GoalSync goals were rejected.${comment ? ` Comment: ${comment}` : ""}</p>`,
  reminder: (quarter: string) => `<p>${quarter} check-in window is open. Please update achievements.</p>`
};
