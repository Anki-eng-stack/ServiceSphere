const nodemailer = require("nodemailer");

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecure = process.env.SMTP_SECURE === "true";
const mailFrom = process.env.MAIL_FROM || smtpUser;

const isMailConfigured = Boolean(smtpHost && smtpPort && smtpUser && smtpPass && mailFrom);

let transporter = null;
if (isMailConfigured) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
}

const sendMail = async ({ to, subject, text, html }) => {
  if (!isMailConfigured || !transporter) {
    console.warn("Mailer not configured; skipping email send");
    return { skipped: true };
  }
  if (!to) {
    return { skipped: true };
  }

  return transporter.sendMail({
    from: mailFrom,
    to,
    subject,
    text,
    html
  });
};

module.exports = {
  sendMail,
  isMailConfigured
};
