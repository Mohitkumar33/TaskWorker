const nodemailer = require("nodemailer");

// Gmail SMTP Transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // Port for TLS (465 for SSL)
  secure: false, // `false` for TLS, `true` for SSL
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail email
    pass: process.env.EMAIL_PASS, // Use App Password if 2FA is enabled
  },
  tls: {
    rejectUnauthorized: false, // Avoid self-signed certificate errors
  },
});

// Function to send an email
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email
      to, // Recipient email
      subject, // Email subject
      html, // Email content (HTML format)
    };

    console.log("📧 Sending Email:", mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Email sending error:", error);
    throw new Error("Could not send email");
  }
};

// Functions for specific email types
const sendRegistrationEmail = async (to, name) => {
  const subject = "Welcome to ConnectMyTask!";
  const html = `<h3>Hi ${name},</h3><p>Thank you for registering on ConnectMyTask. We're excited to have you onboard!</p>`;
  return sendEmail(to, subject, html);
};

const sendTaskCreationEmail = async (to, name, taskTitle) => {
  const subject = "Your Task Has Been Created";
  const html = `<h3>Hi ${name},</h3><p>Your task "<strong>${taskTitle}</strong>" has been successfully posted. Service providers can now place bids on it.</p>`;
  return sendEmail(to, subject, html);
};

const sendBidNotificationEmail = async (to, taskTitle, providerName) => {
  const subject = "New Bid on Your Task";
  const html = `<p>You received a new bid from <strong>${providerName}</strong> on your task "<strong>${taskTitle}</strong>".</p>`;
  return sendEmail(to, subject, html);
};

const sendBidAcceptedEmail = async (to, taskTitle) => {
  const subject = "Your Bid Has Been Accepted!";
  const html = `<p>Your bid for the task "<strong>${taskTitle}</strong>" has been accepted. Please check your dashboard for further details.</p>`;
  return sendEmail(to, subject, html);
};

const sendTaskCompletionEmail = async (to, taskTitle) => {
  const subject = "Task Marked as Completed";
  const html = `<p>The task "<strong>${taskTitle}</strong>" has been marked as completed. Thank you for your contribution!</p>`;
  return sendEmail(to, subject, html);
};

// Export functions
module.exports = {
  sendEmail,
  sendRegistrationEmail,
  sendTaskCreationEmail,
  sendBidNotificationEmail,
  sendBidAcceptedEmail,
  sendTaskCompletionEmail,
};
