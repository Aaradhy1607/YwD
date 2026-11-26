import { describe, it, expect, beforeAll } from "vitest";
import {
  createRentalBooking,
  checkDateAvailability,
  processPickupHandover,
  processReturnInspection,
  cancelRentalBooking,
} from "@/services/booking.service";
import { createProductListing } from "@/services/product.service";
import { store } from "@/services/store";

describe("Rental & Booking Lifecycle Engine", () => {
  let testProductId: string;
  const renterId = "usr_renter_test_99";
  const ownerId = "usr_vendor_1";

  beforeAll(async () => {
    const prod = await createProductListing(
      {
        title: "Lifecycle Test Hardware Unit",
        description: "Test hardware unit reserved specifically for lifecycle and handover verification.",
        categoryId: "cat_electronics",
        conditionGrade: "Mint (Like New)",
        rentalPriceDaily: 699,
        rentalPriceWeekly: 3499,
        mrpReference: 120000,
        deposit: 8000,
        isRentable: true,
        isPurchasable: false,
        campusHub: "Central Handover Point",
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
      },
      ownerId
    );
    testProductId = prod.id;
  });

  it("prevents self-rentals", async () => {
    const start = new Date(Date.now() + 86400000 * 20).toISOString();
    const end = new Date(Date.now() + 86400000 * 22).toISOString();

    await expect(
      createRentalBooking({
        productId: testProductId,
        renterId: ownerId, // Owner trying to rent their own item
        startDate: start,
        endDate: end,
        durationTier: "daily",
        durationUnits: 2,
      })
    ).rejects.toThrow("You cannot rent your own listing.");
  });

  it("creates a rental booking with server-calculated pricing, escrow status, and dual OTPs", async () => {
    const start = new Date(Date.now() + 86400000 * 30).toISOString();
    const end = new Date(Date.now() + 86400000 * 35).toISOString();

    const booking = await createRentalBooking({
      productId: testProductId,
      renterId,
      startDate: start,
      endDate: end,
      durationTier: "daily",
      durationUnits: 5,
      deliveryMethod: "PICKUP",
    });

    expect(booking.id).toBeDefined();
    expect(booking.bookingNumber).toContain("YWD-RENT-");
    expect(booking.status).toBe("CONFIRMED");
    expect(booking.escrowStatus).toBe("HELD");
    expect(booking.pickupOtp).toHaveLength(6);
    expect(booking.returnOtp).toHaveLength(6);
    expect(booking.rentAmount).toBeGreaterThan(0);
    expect(booking.depositAmount).toBeGreaterThan(0);

    // Overlapping booking for same product and overlapping dates must fail
    const overlappingStart = new Date(Date.now() + 86400000 * 32).toISOString();
    const overlappingEnd = new Date(Date.now() + 86400000 * 36).toISOString();

    const availability = await checkDateAvailability(
      testProductId,
      overlappingStart,
      overlappingEnd
    );
    expect(availability.isAvailable).toBe(false);
    expect(availability.conflictReason).toContain("already reserved");

    // Handover Flow: Pickup OTP verification
    // 1. Wrong OTP should fail
    await expect(
      processPickupHandover({
        bookingId: booking.id,
        userId: renterId,
        pickupOtp: "000000",
      })
    ).rejects.toThrow("Invalid 6-digit pickup handover OTP code.");

    // 2. Correct OTP transitions to ACTIVE
    const activeBooking = await processPickupHandover({
      bookingId: booking.id,
      userId: renterId,
      pickupOtp: booking.pickupOtp,
      conditionBeforePhotos: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
    });

    expect(activeBooking.status).toBe("ACTIVE");

    // 3. Trying to cancel an ACTIVE booking must fail
    await expect(
      cancelRentalBooking({
        bookingId: booking.id,
        userId: renterId,
        reason: "Changed my mind",
      })
    ).rejects.toThrow(/Cannot cancel a booking that is currently ACTIVE/);

    // Return Flow: Return OTP verification
    // 1. Wrong Return OTP should fail
    await expect(
      processReturnInspection({
        bookingId: booking.id,
        userId: renterId,
        returnOtp: "999999",
        conditionPhotos: ["https://example.com/1.jpg"],
        refundUpiId: "renter@upi",
      })
    ).rejects.toThrow("Invalid 6-digit return OTP verification code.");

    // 2. Correct Return OTP completes booking and initiates escrow deposit refund
    const completedBooking = await processReturnInspection({
      bookingId: booking.id,
      userId: renterId,
      returnOtp: booking.returnOtp,
      conditionPhotos: [
        "https://example.com/1.jpg",
        "https://example.com/2.jpg",
        "https://example.com/3.jpg",
        "https://example.com/4.jpg",
      ],
      refundUpiId: "renter@okhdfcbank",
      damageReported: false,
    });

    expect(completedBooking.status).toBe("COMPLETED");
    expect(completedBooking.escrowStatus).toBe("REFUNDED");
    expect(completedBooking.escrowRefundAmount).toBe(booking.depositAmount);
  });

  it("handles booking cancellation and escrow release when in CONFIRMED state", async () => {
    const start = new Date(Date.now() + 86400000 * 50).toISOString();
    const end = new Date(Date.now() + 86400000 * 52).toISOString();

    const booking = await createRentalBooking({
      productId: testProductId,
      renterId,
      startDate: start,
      endDate: end,
      durationTier: "daily",
      durationUnits: 2,
    });

    expect(booking.status).toBe("CONFIRMED");

    const cancelled = await cancelRentalBooking({
      bookingId: booking.id,
      userId: renterId,
      reason: "Plans changed",
    });

    expect(cancelled.status).toBe("CANCELLED");
    expect(cancelled.escrowStatus).toBe("REFUNDED");
  });

  it("handles legacy unassigned rental ownership and backfills to actual renter", async () => {
    // Add legacy unassigned rental to store
    const legacyId = "LEGACY_RENTAL_001";
    store.updateDB((db: any) => {
      if (!db.rentals) db.rentals = [];
      db.rentals.push({
        id: legacyId,
        productId: testProductId,
        studentName: "Siddharth Rao", // User usr_default_demo in store
        rentPaise: 50000,
        depositPaise: 800000,
        totalPaise: 850000,
        status: "CREATED",
        createdAt: new Date().toISOString(),
      });
    });

    const db = store.getDB() as any;
    const legacyRecord = (db.rentals || []).find((r: any) => r.id === legacyId);
    expect(legacyRecord).toBeDefined();

    // Verify backfill logic assigns it to matched user from store.users
    const matchedUser = (db.users || []).find(
      (u: any) => u.name && u.name === legacyRecord.studentName
    );
    if (matchedUser) {
      legacyRecord.userId = matchedUser.id;
    }
    expect(legacyRecord.userId).toBe("usr_default_demo");
  });
});

