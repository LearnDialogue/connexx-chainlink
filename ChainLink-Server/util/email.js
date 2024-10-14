const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure Nodemailer with Gmail
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  }
});

// Function to send password reset email
async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `${process.env.CLIENT_URI}set-new-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: user.email,
    subject: 'Password Reset Request',
    
    // Plain text version (for email clients that don't support HTML)
    text: `Hello ${user.firstName || 'User'},\n\nYou recently requested to reset your password. Please click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email. Your password will remain unchanged.\n\nBest regards,\nChainLink Team`,
    
    // HTML version (for email clients that support HTML)
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="text-align: center; color: #333;">Password Reset Request</h2>
        <p style="font-size: 16px; color: #333;">
          Hello ${user.firstName || 'User'},
        </p>
        <p style="font-size: 16px; color: #333;">
          You recently requested to reset your password. Please click the button below to reset your password:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 14px; color: #555;">
          If you did not request this, please ignore this email. Your password will remain unchanged.
        </p>
        <p style="font-size: 14px; color: #555;">
          Best regards,<br>
          ChainLink Team
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to: ' + user.email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email. Please try again.');
  }
}

module.exports = { sendPasswordResetEmail };
