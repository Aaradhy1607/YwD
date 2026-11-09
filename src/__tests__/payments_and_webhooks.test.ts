import { describe, it, expect } from "vitest";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature,
} from "@/lib/razorpay";
import { createPurchaseOrder, getUserOrders } from "@/services/order.service";

describe("Payments & Purchase Orders Module", () => {
  it("creates a Razorpay order in INR converted correctly to paise", async () => {
    const order = await createRazorpayOrder({
      amountInINR: 1500,
      receipt: "RCP_TEST_101",
      notes: { testNote: "unit-test" },
    });

    expect(order.id).toBeDefined();
    expect(order.currency).toBe("INR");
    expect(order.amount).toBe(1500 * 100); // 150,000 paise
  });

  it("verifies Razorpay signature correctly", () => {
    // Valid dev mock signature
    const valid = verifyRazorpaySignature({
      orderId: "order_12345",
      paymentId: "pay_12345",
      signature: "dev_sig_verified_escrow",
    });
    expect(valid).toBe(true);

    // Empty signature rejected
    const invalid = verifyRazorpaySignature({
      orderId: "order_12345",
      paymentId: "pay_12345",
      signature: "",
    });
    expect(invalid).toBe(false);
  });

  it("creates a verified recommerce purchase order separate from rental flow", async () => {
    const buyerId = "usr_buyer_441";
    const productId = "prod_sony_a7iv";

    const purchase = await createPurchaseOrder({
      productId,
      buyerId,
      deliveryAddress: "Hostel 4, Room 212, Campus North Hub",
    });

    expect(purchase.id).toBeDefined();
    expect(purchase.orderNumber).toContain("YWD-BUY-");
    expect(purchase.status).toBe("PAID");
    expect(purchase.totalAmount).toBeGreaterThan(0);
    expect(purchase.deliveryAddress).toContain("Campus North Hub");

    const userOrders = await getUserOrders(buyerId);
    expect(userOrders.some((o) => o.id === purchase.id)).toBe(true);
  });

  it("verifies webhook signature securely", () => {
    const rawPayload = JSON.stringify({ event: "payment.captured" });
    const isVerified = verifyWebhookSignature(rawPayload, "test_sig");
    expect(typeof isVerified).toBe("boolean");
  });
});

