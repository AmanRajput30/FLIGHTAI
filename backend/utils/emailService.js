const { Resend } = require("resend");
const nodemailer = require("nodemailer");
const dns = require("dns");

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

let transporter = null;
let resendClient = null;

const initializeEmailProvider = () => {
  if (process.env.RESEND_API_KEY) {
    console.log("✅ Initializing Resend API for email delivery...");
    resendClient = new Resend(process.env.RESEND_API_KEY);
  } else if (process.env.EMAIL_SERVER_HOST) {
    console.log("✅ Initializing Nodemailer SMTP transporter...");
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT || 465,
      secure: process.env.EMAIL_SERVER_SECURE ? process.env.EMAIL_SERVER_SECURE === "true" : true,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  } else {
    console.error("❌ CRITICAL: No Email Provider configured! Please set RESEND_API_KEY or SMTP variables.");
  }
};

initializeEmailProvider();

exports.sendEmail = async ({ to, subject, html }) => {
  if (!resendClient && !transporter) {
    throw new Error("Email provider not initialized. Missing API keys.");
  }

  console.log(`[EmailService] Attempting to send email to: ${to}`);

  try {
    if (resendClient) {
      // Send via Resend API (bypasses SMTP firewall ports completely)
      // Note: Free Resend accounts MUST use onboarding@resend.dev as the from address,
      // and can ONLY send to the email address used to register the Resend account.
      const from = process.env.EMAIL_FROM || "SkyIntel <noreply@aervyn.in>";
      const { data, error } = await resendClient.emails.send({
        from,
        to: [to],
        subject,
        html,
      });

      if (error) {
        throw new Error(error.message);
      }
      console.log(`[EmailService] ✅ Successfully sent via RESEND to: ${to}`);
      return data;
    } else {
      // Send via classic Nodemailer SMTP
      const from = process.env.EMAIL_FROM || "\"Aervyn Auth\" <noreply@aervyn.in>";
      const info = await transporter.sendMail({ from, to, subject, html });
      console.log(`[EmailService] ✅ Successfully sent via SMTP to: ${to}`);
      return info;
    }
  } catch (err) {
    console.error(`[EmailService] ❌ CRITICAL ERROR sending email to ${to}:`, err.message);
    throw err;
  }
};
