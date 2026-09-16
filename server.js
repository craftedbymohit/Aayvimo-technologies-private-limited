const path = require("path");
const fs = require("fs");
const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const SMTP_USER = (process.env.SMTP_USER || "aayvimotechnologies@gmail.com").trim();
const SMTP_PASS = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
const CONTACT_TO = (process.env.CONTACT_TO || SMTP_USER).trim();
const isSmtpConfigured = Boolean(SMTP_USER && SMTP_PASS);
const allowedOrigins = new Set([
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
  "http://localhost:5500",
  "http://127.0.0.1:5500"
]);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

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

app.post("/api/contact", async (req, res) => {
  if (!isSmtpConfigured) {
    return res.status(500).json({
      success: false,
      message: "SMTP configuration is missing. Add SMTP_USER and SMTP_PASS in .env."
    });
  }

  const name = (req.body.name || "").trim();
  const company = (req.body.company || "").trim();
  const email = (req.body.email || "").trim();
  const phone = (req.body.phone || "").trim();
  const service = (req.body.service || "").trim();
  const budget = (req.body.budget || "").trim();
  const timeline = (req.body.timeline || "").trim();
  const message = (req.body.message || "").trim();
  const honeypot = (req.body.website || "").trim();

  // Honeypot: silently accept to avoid tipping off bots, but do not email.
  if (honeypot) {
    return res.json({ success: true });
  }

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
    <p><strong>Budget:</strong> ${escapeHtml(budget || "N/A")}</p>
    <p><strong>Timeline:</strong> ${escapeHtml(timeline || "N/A")}</p>
    <p><strong>Message:</strong><br>${escapeHtml(message || "N/A").replace(/\n/g, "<br>")}</p>
  `;

  const textBody = [
    "New Contact Form Submission",
    `Name: ${name}`,
    `Company: ${company || "N/A"}`,
    `Email: ${email}`,
    `Phone: ${phone || "N/A"}`,
    `Service Needed: ${service || "N/A"}`,
    `Budget: ${budget || "N/A"}`,
    `Timeline: ${timeline || "N/A"}`,
    `Message: ${message || "N/A"}`
  ].join("\n");

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

    return res.json({ success: true });
  } catch (error) {
    console.error("Error sending contact email:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send email right now."
    });
  }
});

// Block internal planning/docs (*.md) from ever being served publicly.
app.get(/\.md$/i, (req, res) => res.status(404).send("Not found"));

// Serve static assets. `redirect: false` stops express.static from issuing a
// 301 to add a trailing slash on directories, so our clean-URL handler below
// can serve "/services/custom-software-development" directly.
app.use(express.static(path.join(__dirname), { redirect: false }));

// Clean-URL resolver: map "/some/path" to "/some/path/index.html" or
// "/some/path.html" when those files exist. Enables SEO-friendly URLs for
// the multi-page structure (e.g. /services/custom-software-development).
app.get(/.*/, (req, res) => {
  // Strip query string and normalize; block path traversal.
  const urlPath = decodeURIComponent(req.path).replace(/\/+$/, "");
  const safePath = path
    .normalize(urlPath)
    .replace(/^(\.\.[\/\\])+/, "");

  const candidates = [
    path.join(__dirname, safePath, "index.html"),
    path.join(__dirname, safePath + ".html")
  ];

  for (const candidate of candidates) {
    // Ensure the resolved file stays within the project directory.
    if (candidate.startsWith(__dirname) && fs.existsSync(candidate)) {
      return res.sendFile(candidate);
    }
  }

  // Fallback: serve the homepage.
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  if (!isSmtpConfigured) {
    console.warn(
      "SMTP is not configured. Create a .env file with SMTP_USER, SMTP_PASS and CONTACT_TO."
    );
    return;
  }

  try {
    await transporter.verify();
    console.log("SMTP connection verified.");
  } catch (error) {
    console.error("SMTP verification failed:", error.message);
  }
});
