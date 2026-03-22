const nodemailer = require("nodemailer");

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeBody(rawBody) {
  if (!rawBody) return {};
  if (typeof rawBody === "string") {
    try {
      return JSON.parse(rawBody);
    } catch (error) {
      return {};
    }
  }
  return rawBody;
}

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method Not Allowed"
    });
  }

  const SMTP_USER = (process.env.SMTP_USER || "aayvimotechnologies@gmail.com").trim();
  const SMTP_PASS = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
  const CONTACT_TO = (process.env.CONTACT_TO || SMTP_USER).trim();

  if (!SMTP_USER || !SMTP_PASS) {
    return res.status(500).json({
      success: false,
      message: "SMTP configuration is missing. Add SMTP_USER and SMTP_PASS."
    });
  }

  const body = normalizeBody(req.body);
  const name = (body.name || "").trim();
  const company = (body.company || "").trim();
  const email = (body.email || "").trim();
  const phone = (body.phone || "").trim();
  const service = (body.service || "").trim();
  const message = (body.message || "").trim();

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: "Name and email are required."
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "A valid email address is required."
    });
  }

  const subjectName = name.replace(/[\r\n]/g, " ");
  const htmlBody = `
    <h3>New Contact Form Submission</h3>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Company:</strong> ${escapeHtml(company || "N/A")}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone || "N/A")}</p>
    <p><strong>Service Needed:</strong> ${escapeHtml(service || "N/A")}</p>
    <p><strong>Message:</strong><br>${escapeHtml(message || "N/A").replace(/\n/g, "<br>")}</p>
  `;

  const textBody = [
    "New Contact Form Submission",
    `Name: ${name}`,
    `Company: ${company || "N/A"}`,
    `Email: ${email}`,
    `Phone: ${phone || "N/A"}`,
    `Service Needed: ${service || "N/A"}`,
    `Message: ${message || "N/A"}`
  ].join("\n");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: SMTP_USER,
      to: CONTACT_TO,
      cc: email,
      replyTo: email,
      subject: `New Contact Form Submission from ${subjectName}`,
      text: textBody,
      html: htmlBody
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Vercel API email error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send email right now."
    });
  }
};
