const nodemailer = require("nodemailer");

const firstValue = (...values) =>
  values.find((value) => typeof value === "string" && value.trim())?.trim() || "";

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const createMailer = (env = process.env, nodemailerClient = nodemailer) => {
  const smtpHost = firstValue(env.SMTP_HOST);
  const smtpUser = firstValue(env.SMTP_USER, env.MAIL_USER, env.EMAIL_USER);
  const rawPassword = firstValue(env.SMTP_PASS, env.MAIL_PASS, env.EMAIL_PASS);
  const configuredService = firstValue(env.MAIL_SERVICE, env.SMTP_SERVICE);
  const inferredService = !smtpHost && /@gmail\.com$/i.test(smtpUser) ? "gmail" : "";
  const service = configuredService || inferredService;
  const smtpPass = service.toLowerCase() === "gmail"
    ? rawPassword.replace(/\s+/g, "")
    : rawPassword;
  const smtpPort = Number(env.SMTP_PORT || 587);
  const smtpSecure = parseBoolean(env.SMTP_SECURE, smtpPort === 465);
  const mailFrom = firstValue(
    env.MAIL_FROM,
    smtpUser ? `"ServiceSphere" <${smtpUser}>` : ""
  );

  const missing = [];
  if (!service && !smtpHost) missing.push("MAIL_SERVICE or SMTP_HOST");
  if (!smtpUser) missing.push("MAIL_USER or SMTP_USER");
  if (!smtpPass) missing.push("MAIL_PASS or SMTP_PASS");
  if (!mailFrom) missing.push("MAIL_FROM");
  if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    missing.push("a valid SMTP_PORT");
  }

  const isMailConfigured = missing.length === 0;
  let transporter = null;

  if (isMailConfigured) {
    const transportOptions = service
      ? {
          service,
          auth: { user: smtpUser, pass: smtpPass },
        }
      : {
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: { user: smtpUser, pass: smtpPass },
        };

    transporter = nodemailerClient.createTransport({
      ...transportOptions,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }

  const requireTransporter = () => {
    if (transporter) return transporter;
    const error = new Error(`Mailer is not configured. Missing ${missing.join(", ")}.`);
    error.code = "MAIL_NOT_CONFIGURED";
    throw error;
  };

  const sendMail = async ({ to, subject, text, html }) => {
    if (!to) {
      const error = new Error("Email recipient is required.");
      error.code = "MAIL_RECIPIENT_REQUIRED";
      throw error;
    }

    return requireTransporter().sendMail({
      from: mailFrom,
      to,
      subject,
      text,
      html,
    });
  };

  const verifyMailConnection = () => requireTransporter().verify();

  return {
    sendMail,
    verifyMailConnection,
    isMailConfigured,
  };
};

const mailer = createMailer();

module.exports = {
  ...mailer,
  createMailer,
};
