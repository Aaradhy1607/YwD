import Razorpay from "razorpay";
import crypto from "crypto";

const keyId = process.env.RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

export const isRazorpayConfigured = Boolean(
  keyId && keySecret && !keyId.includes("placeholder") && !keySecret.includes("placeholder")
);

export const razorpayInstance = isRazorpayConfigured
  ? new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
  : null;

/**
 * Creates an authorized payment order with Razorpay.
 * Amount is in INR Rupees and converted to Paise (x100) on the server.
 */
export async function createRazorpayOrder(params: {
  amountInINR: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const amountInPaise = Math.round(params.amountInINR * 100);

  if (!isRazorpayConfigured || !razorpayInstance) {
    // Return a structured development order when real keys are not yet provided
    return {
      id: `order_dev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      entity: "order",
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: "INR",
      receipt: params.receipt,
      status: "created",
      isDevMock: true,
    };
  }

  const order = await razorpayInstance.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: params.receipt,
    notes: params.notes,
  });

  return order;
}

/**
 * Validates a Razorpay payment signature using HMAC-SHA256.
 * Never trust client responses without server-side cryptographic verification.
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!params.orderId || !params.paymentId || !params.signature) {
    return false;
  }

  if (!isRazorpayConfigured) {
    // In dev mock mode, verify format
    return params.signature.startsWith("dev_sig_") || params.signature.length >= 10;
  }

  const body = `${params.orderId}|${params.paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body.toString())
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(params.signature)
  );
}

/**
 * Verifies Razorpay webhook signature.
 */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  if (!webhookSecret || webhookSecret.includes("placeholder")) {
    return true; // Dev fallback
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}
