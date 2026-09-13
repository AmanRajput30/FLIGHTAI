const nodemailer = require('nodemailer');

// Define the generic Email Provider interface.
// For production, the user will supply real SMTP credentials in .env
// For development, we fall back to Ethereal.
let transporter;

const initializeTransporter = async () => {
  if (process.env.EMAIL_SERVER_HOST) {
    // Production / Configured SMTP
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT || 465,
      secure: process.env.EMAIL_SERVER_SECURE ? process.env.EMAIL_SERVER_SECURE === 'true' : true, // default to true for port 465
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  } else {
    // Development fallback: Ethereal
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ No SMTP configuration found in production. Emails will NOT be sent (Ethereal is blocked by most PaaS providers).');
      // Leave transporter undefined to skip sending
      return;
    }

    console.log('⚠️ No SMTP configuration found. Generating Ethereal test account...');
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('✅ Ethereal test account created for emails.');
  }
};

// Initialize right away
initializeTransporter().catch(console.error);

/**
 * Sends an email using the configured transporter.
 */
exports.sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    if (process.env.NODE_ENV === 'production') {
      console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
      // In production without SMTP, we just mock it instantly to avoid hanging
      return { messageId: 'mock-id' };
    }
    throw new Error('Email transporter not initialized');
  }

  const from = process.env.EMAIL_FROM || '"SkyIntel Auth" <noreply@skyintel.com>';

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });

  // If using Ethereal, print the preview URL to the console so developers can click it
  if (!process.env.EMAIL_SERVER_HOST) {
    console.log('📧 Ethereal Email Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }

  return info;
};
