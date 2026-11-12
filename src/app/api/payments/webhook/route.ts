import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { store } from "@/services/store";
import { logAuditEvent } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const payload = event.payload;

    await logAuditEvent({
      userId: null,
      action: `WEBHOOK_${eventType?.toUpperCase() || "EVENT"}`,
      resource: "payments",
      metadata: { eventId: event.id || "dev_event" },
    });

    // 1. Persist directly to Neon PostgreSQL when connected
    const isPg = await store.checkPostgres();
    if (isPg) {
      try {
        await prisma.$transaction(async (tx) => {
          if (eventType === "payment.captured" || eventType === "order.paid") {
            const paymentEntity = payload?.payment?.entity;
            const orderId = paymentEntity?.order_id;
            const paymentId = paymentEntity?.id;
            const notes = paymentEntity?.notes || {};
            const bookingId = notes.bookingId;
            const purchaseOrderId = notes.orderId;

            if (orderId && paymentId) {
              await tx.payment.upsert({
                where: { razorpayOrderId: orderId },
                update: {
                  razorpayPaymentId: paymentId,
                  razorpaySignature: signature || "webhook_verified",
                  status: "SUCCESS",
                  amount: (paymentEntity?.amount || 0) / 100,
                },
                create: {
                  bookingId: bookingId || null,
                  orderId: purchaseOrderId || null,
                  razorpayOrderId: orderId,
                  razorpayPaymentId: paymentId,
                  razorpaySignature: signature || "webhook_verified",
                  amount: (paymentEntity?.amount || 0) / 100,
                  currency: paymentEntity?.currency || "INR",
                  status: "SUCCESS",
                },
              });

              if (bookingId) {
                await tx.rentalBooking.updateMany({
                  where: { id: bookingId },
                  data: { status: "CONFIRMED" },
                });
              }

              if (purchaseOrderId) {
                await tx.purchaseOrder.updateMany({
                  where: { id: purchaseOrderId },
                  data: { status: "PAID" },
                });
              }
            }
          } else if (eventType === "refund.processed") {
            const refundEntity = payload?.refund?.entity;
            const paymentId = refundEntity?.payment_id;
            const refundAmount = (refundEntity?.amount || 0) / 100;
            const refundId = refundEntity?.id;

            if (paymentId) {
              await tx.payment.updateMany({
                where: { razorpayPaymentId: paymentId },
                data: {
                  status: "REFUNDED",
                  refundId: refundId || null,
                  refundAmount: refundAmount,
                },
              });

              const paymentRecord = await tx.payment.findFirst({
                where: { razorpayPaymentId: paymentId },
              });

              if (paymentRecord?.bookingId) {
                await tx.rentalBooking.updateMany({
                  where: { id: paymentRecord.bookingId },
                  data: {
                    escrowStatus: "REFUNDED",
                    escrowRefundAmount: refundAmount,
                  },
                });
              }
            }
          }
        });
      } catch (pgError) {
        console.warn("[Webhook] Postgres transaction update failed, fallback retained:", pgError);
      }
    }

    // 2. Persist to in-memory store for fallback synchronization
    store.updateDB((db) => {
      // 1. Payment Captured
      if (eventType === "payment.captured" || eventType === "order.paid") {
        const paymentEntity = payload?.payment?.entity;
        const orderId = paymentEntity?.order_id;
        const paymentId = paymentEntity?.id;
        const notes = paymentEntity?.notes || {};

        const bookingId = notes.bookingId;
        const purchaseOrderId = notes.orderId;

        // Idempotency check: don't duplicate
        const existingPayment = db.payments.find(
          (p) => p.razorpayPaymentId === paymentId || p.razorpayOrderId === orderId
        );

        if (!existingPayment && paymentId) {
          db.payments.push({
            id: `pay_${Date.now()}`,
            bookingId: bookingId || null,
            orderId: purchaseOrderId || null,
            razorpayOrderId: orderId || "order_webhook",
            razorpayPaymentId: paymentId,
            razorpaySignature: signature || "webhook_verified",
            amount: (paymentEntity?.amount || 0) / 100,
            currency: paymentEntity?.currency || "INR",
            status: "SUCCESS",
            refundId: null,
            refundAmount: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        if (bookingId) {
          const booking = db.rentalBookings.find((b) => b.id === bookingId);
          if (booking && booking.status === "PENDING") {
            booking.status = "CONFIRMED";
            booking.updatedAt = new Date().toISOString();
          }
        }

        if (purchaseOrderId) {
          const order = db.purchaseOrders.find((o) => o.id === purchaseOrderId);
          if (order && order.status === "PENDING") {
            order.status = "PAID";
            order.updatedAt = new Date().toISOString();
          }
        }
      }

      // 2. Refund Processed
      if (eventType === "refund.processed") {
        const refundEntity = payload?.refund?.entity;
        const paymentId = refundEntity?.payment_id;
        const refundAmount = (refundEntity?.amount || 0) / 100;

        const payment = db.payments.find((p) => p.razorpayPaymentId === paymentId);
        if (payment) {
          payment.status = "REFUNDED";
          payment.refundId = refundEntity?.id;
          payment.refundAmount = refundAmount;
          payment.updatedAt = new Date().toISOString();

          if (payment.bookingId) {
            const booking = db.rentalBookings.find((b) => b.id === payment.bookingId);
            if (booking) {
              booking.escrowStatus = "REFUNDED";
              booking.escrowRefundAmount = refundAmount;
              booking.updatedAt = new Date().toISOString();
            }
          }
        }
      }
    });

    return NextResponse.json({ status: "ok", received: true });
  } catch (error: any) {
    console.error("[Webhook Exception]:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}

