const crypto = require('crypto');
const assert = require('assert');

// Simulate the logic in src/lib/razorpay.ts
const keySecret = "test_rzp_secret_key_12345";
const webhookSecret = "test_rzp_webhook_secret_67890";

function verifyRazorpaySignature(params) {
  if (!params.orderId || !params.paymentId || !params.signature) {
    return false;
  }
  const body = `${params.orderId}|${params.paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body.toString())
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
  const signatureBuffer = Buffer.from(params.signature, "utf-8");

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

function verifyWebhookSignature(body, signature) {
  if (!body || !signature) {
    return false;
  }
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
  const signatureBuffer = Buffer.from(signature, "utf-8");

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

// 1. Valid payment signature
const orderId = "order_OqG73bK89zD";
const paymentId = "pay_PqR84cL90aE";
const validSig = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
assert.strictEqual(verifyRazorpaySignature({ orderId, paymentId, signature: validSig }), true, "Valid payment signature must pass");

// 2. Tampered payment signature
const tamperedSig = validSig.substring(0, validSig.length - 2) + "00";
assert.strictEqual(verifyRazorpaySignature({ orderId, paymentId, signature: tamperedSig }), false, "Tampered signature must fail");

// 3. Unequal length signature (must not throw exception!)
assert.strictEqual(verifyRazorpaySignature({ orderId, paymentId, signature: "short_sig" }), false, "Short signature must fail safely");
assert.strictEqual(verifyRazorpaySignature({ orderId, paymentId, signature: validSig + "extra" }), false, "Long signature must fail safely");

// 4. Valid webhook payload
const webhookPayload = JSON.stringify({ event: "payment.captured", id: "evt_123" });
const validWebhookSig = crypto.createHmac("sha256", webhookSecret).update(webhookPayload).digest("hex");
assert.strictEqual(verifyWebhookSignature(webhookPayload, validWebhookSig), true, "Valid webhook signature must pass");

// 5. Tampered webhook payload
const tamperedWebhookPayload = JSON.stringify({ event: "payment.captured", id: "evt_999" });
assert.strictEqual(verifyWebhookSignature(tamperedWebhookPayload, validWebhookSig), false, "Tampered webhook payload must fail");

// 6. Unequal length webhook signature (must not throw!)
assert.strictEqual(verifyWebhookSignature(webhookPayload, "invalid_len"), false, "Invalid length webhook signature must return false safely");

console.log("All Razorpay cryptographic signature tests passed successfully without buffer length exceptions!");

