/**
 * Email Notification Utility
 *
 * This module handles email notifications for recipients.
 * Currently uses console logging as a placeholder.
 *
 * PRODUCTION TODO: Integrate with a free email service like:
 * - Resend (https://resend.com) - 100 emails/day free
 * - SendGrid - 100 emails/day free
 * - Mailgun - 5,000 emails/month free
 */

/**
 * Send email notification to recipient
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.message - Email body (plain text)
 * @param {Object} params.data - Additional data for email template
 */
export async function sendEmailNotification({ to, subject, message, data }) {
  try {
    // ============================================
    // PLACEHOLDER: Console logging for development
    // ============================================
    console.log("📧 Email Notification (Placeholder)");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Message:", message);
    console.log("Data:", data);

    // ============================================
    // PRODUCTION: Uncomment and configure when ready
    // ============================================
    /*
    // Example with Resend
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'ShareAplate <notifications@shareaplateai.com>',
      to: to,
      subject: subject,
      html: generateEmailTemplate(message, data)
    });
    */

    return { success: true };
  } catch (error) {
    console.error("Failed to send email notification:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Notify recipient about AI recommendation
 * @param {Object} recipient - Recipient profile
 * @param {Object} listing - Food listing
 * @param {number} matchScore - AI match score (0-1)
 * @param {string} reasoning - AI reasoning
 */
export async function notifyRecipientOfMatch({
  recipient,
  listing,
  matchScore,
  reasoning,
}) {
  const subject = `🍽️ New Food Available: ${listing.title}`;
  const message = `
Hello ${recipient.name},

Good news! Our AI has matched you with a new food donation that's perfect for you.

Food Item: ${listing.title}
Quantity: ${listing.quantity}
Location: ${listing.location}
Expires: ${new Date(listing.expiry_date).toLocaleDateString()}

Match Score: ${Math.round(matchScore * 100)}%
Why this is a good match: ${reasoning}

Log in to ShareAplate to claim this donation before it expires!

Best regards,
ShareAplate AI Team
  `.trim();

  return await sendEmailNotification({
    to: recipient.email || "recipient@example.com", // Fallback for testing
    subject,
    message,
    data: {
      recipientName: recipient.name,
      listingTitle: listing.title,
      matchScore: Math.round(matchScore * 100),
      reasoning,
      listingUrl: `${process.env.APP_URL || "http://localhost:5173"}/dashboard`,
    },
  });
}

/**
 * Generate HTML email template
 * @param {string} message - Plain text message
 * @param {Object} data - Template data
 * @returns {string} HTML email
 */
function generateEmailTemplate(message, data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ ShareAplate AI</h1>
    </div>
    <div class="content">
      <p>${message.replace(/\n/g, "<br>")}</p>
      ${
        data.listingUrl
          ? `<a href="${data.listingUrl}" class="button">View Donation</a>`
          : ""
      }
    </div>
    <div class="footer">
      <p>This is an automated message from ShareAplate AI</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
