const nodemailer = require('nodemailer');

// Define the generic Email Provider interface.
// The user MUST supply real SMTP credentials in .env.
let transporter;

const initializeTransporter = async () => {
  if (!process.env.EMAIL_SERVER_HOST) {
    console.error('❌ CRITICAL: SMTP configuration is missing from .env! Emails will NOT be sent.');
    return;
  }

  // Production / Configured SMTP
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT || 465,
    secure: process.env.EMAIL_SERVER_SECURE ? process.env.EMAIL_SERVER_SECURE === 'true' : true, // default to true for port 465
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
  console.log('✅ SMTP Transporter initialized successfully.');
};

// Initialize right away
initializeTransporter().catch(console.error);

/**
 * Sends an email using the configured transporter.
 */
exports.sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    throw new Error('Email transporter not initialized. Please configure SMTP in your .env file.');
  }

  const from = process.env.EMAIL_FROM || '"SkyIntel Auth" <noreply@skyintel.com>';

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });

  return info;
};
