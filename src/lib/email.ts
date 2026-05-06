import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.NOTIFICATION_EMAIL || "noreply@wayfront.local";

export async function sendInvoiceNotification(
  clientEmail: string,
  invoiceNumber: string,
  amount: number,
  dueDate: string,
  paymentLink: string,
  tenantName: string
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: clientEmail,
      subject: `Invoice ${invoiceNumber} from ${tenantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Invoice ${invoiceNumber}</h2>
          <p>Hi,</p>
          <p>${tenantName} has sent you an invoice for payment.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
            <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
          </div>
          <a href="${paymentLink}" style="display: inline-block; background: #06b6d4; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0;">
            Pay Invoice
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 40px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send invoice notification:", error);
  }
}

export async function sendFormSubmissionConfirmation(
  submitterEmail: string,
  formName: string,
  tenantName: string
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: submitterEmail,
      subject: `Confirmation: ${formName} submitted`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank You!</h2>
          <p>Hi,</p>
          <p>Your submission to the "${formName}" form has been received by ${tenantName}.</p>
          <p>We will review your submission and get back to you soon.</p>
          <p style="color: #999; font-size: 12px; margin-top: 40px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send form submission confirmation:", error);
  }
}

export async function sendPaymentConfirmation(
  email: string,
  invoiceNumber: string,
  amount: number,
  tenantName: string
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Payment received for invoice ${invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Payment Confirmed</h2>
          <p>Hi,</p>
          <p>Thank you for your payment. We have received your payment for invoice ${invoiceNumber}.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Invoice:</strong> ${invoiceNumber}</p>
            <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
            <p><strong>From:</strong> ${tenantName}</p>
          </div>
          <p>Thank you for your business!</p>
          <p style="color: #999; font-size: 12px; margin-top: 40px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send payment confirmation:", error);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  tenantName: string
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Reset your ${tenantName} password`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>Hi,</p>
          <p>We received a request to reset your password. Click the link below to create a new password.</p>
          <a href="${resetLink}" style="display: inline-block; background: #06b6d4; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0;">
            Reset Password
          </a>
          <p style="color: #999; font-size: 12px;">
            This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 40px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
}

export async function sendTenantWelcomeEmail(
  email: string,
  tenantName: string,
  loginUrl: string
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Welcome to ${tenantName} on Wayfront`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to ${tenantName}</h2>
          <p>Hi,</p>
          <p>Your tenant account has been created successfully. You can now log in and start managing your business.</p>
          <a href="${loginUrl}" style="display: inline-block; background: #06b6d4; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0;">
            Log In Now
          </a>
          <p>If you have any questions, please contact our support team.</p>
          <p style="color: #999; font-size: 12px; margin-top: 40px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}
