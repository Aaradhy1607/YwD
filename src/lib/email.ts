import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY || "";
export const isResendConfigured = Boolean(apiKey && !apiKey.includes("placeholder"));

const resend = isResendConfigured ? new Resend(apiKey) : null;
const FROM_EMAIL = process.env.EMAIL_FROM || "YwD Marketplace <notifications@ywd.in>";

/**
 * Sends a transactional email safely via Resend.
 * In development without a real API key, logs safely without throwing.
 */
export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!isResendConfigured || !resend) {
    console.log(`[Resend Dev Logger] To: ${params.to} | Subject: ${params.subject}`);
    return { success: true, isDevMock: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      console.error("[Resend Error]:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("[Resend Exception]:", err);
    return { success: false, error: err };
  }
}

export function generateBookingConfirmationEmail(bookingNumber: string, title: string, total: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5DEC9; border-radius: 16px; background-color: #FAF7F2;">
      <div style="background: #18352D; padding: 24px; border-radius: 12px; color: #F5F0E8; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; color: #FFFFFF;">YwD Booking Confirmed</h1>
        <p style="margin: 6px 0 0; color: #9BB5A3; font-size: 13px;">Own Less. Experience More.</p>
      </div>
      <div style="padding: 24px 8px; color: #18352D;">
        <p>Your booking <strong>${bookingNumber}</strong> has been secured in Escrow.</p>
        <p><strong>Item:</strong> ${title}</p>
        <p><strong>Total Paid:</strong> ${total}</p>
        <p style="color: #C46A42; font-weight: bold;">100% of your Security Deposit is held securely in escrow and will be refunded upon return.</p>
        <p style="font-size: 13px; color: #63736A;">Counterparty phone numbers and real names remain strictly private. Coordinate handover through your YwD dashboard.</p>
      </div>
    </div>
  `;
}
