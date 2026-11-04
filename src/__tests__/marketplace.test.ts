import { describe, it, expect } from "vitest";
import { calculateRentalPrice, formatINR } from "@/lib/pricing";
import {
  generateAnonymousAlias,
  sanitizeToAnonymousProfile,
  sanitizeProductForPublic,
} from "@/lib/privacy";
import { checkDateAvailability } from "@/services/booking.service";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { createProductSchema } from "@/lib/validations";

describe("1. Dynamic Duration Pricing Engine", () => {
  const sampleRates = {
    hourly: 150,
    daily: 699,
    weekly: 3499,
    monthly: 11999,
    semester: 29999,
    deposit: 8000,
  };

  it("calculates daily rental pricing accurately with transparent breakdown", () => {
    const result = calculateRentalPrice({
      rates: sampleRates,
      durationTier: "daily",
      durationUnits: 2,
      deliveryMethod: "PICKUP",
    });

    expect(result.grossRent).toBe(699 * 2);
    expect(result.securityDeposit).toBe(8000);
    expect(result.deliveryFee).toBe(0);
    expect(result.escrowRefundableDeposit).toBe(8000);
    expect(result.totalPayable).toBeGreaterThan(result.grossRent + result.securityDeposit);
    expect(result.netEffectiveCost).toBe(result.totalPayable - result.escrowRefundableDeposit);
  });

  it("calculates weekly rental pricing and formats currency in INR", () => {
    const result = calculateRentalPrice({
      rates: sampleRates,
      durationTier: "weekly",
      durationUnits: 1,
      deliveryMethod: "DELIVERY",
      customDeliveryFee: 99,
    });

    expect(result.grossRent).toBe(3499);
    expect(result.deliveryFee).toBe(99);
    expect(formatINR(result.totalPayable)).toContain("₹");
  });
});

describe("2. Strict Anonymous Identity & Privacy Protection", () => {
  it("generates a valid, neutral anonymous alias", () => {
    const alias = generateAnonymousAlias();
    expect(alias).toMatch(/^[A-Za-z]+-[0-9]{4}$/);
    expect(alias).not.toContain("@");
  });

  it("completely strips real name, email, phone number from public profile", () => {
    const rawUser = {
      id: "usr_secret_123",
      name: "Siddharth Rao",
      email: "siddharth.rao@example.com",
      phone: "+91-9876543210",
      image: "https://lh3.googleusercontent.com/avatar/private.jpg",
      anonymousProfile: {
        alias: "EcoScholar-8421",
        avatarColor: "#7052DF",
        trustScore: 99.4,
        completedRentals: 31,
        campusHub: "Tech Tower Hub",
      },
    };

    const sanitized = sanitizeToAnonymousProfile(rawUser);

    expect(sanitized.alias).toBe("EcoScholar-8421");
    expect((sanitized as any).name).toBeUndefined();
    expect((sanitized as any).email).toBeUndefined();
    expect((sanitized as any).phone).toBeUndefined();
    expect((sanitized as any).image).toBeUndefined();
  });

  it("sanitizes product listings so counterparties never see owner PII", () => {
    const rawProduct = {
      id: "prod_1",
      title: "Sony Alpha 7 IV",
      owner: {
        id: "usr_secret_999",
        name: "Confidential Student",
        email: "confidential@campus.edu",
        phone: "+91-9999999999",
        anonymousProfile: {
          alias: "LensCraft-3302",
          avatarColor: "#4169E1",
          trustScore: 98.8,
          completedRentals: 47,
        },
      },
    };

    const sanitized = sanitizeProductForPublic(rawProduct);

    expect(sanitized.owner.alias).toBe("LensCraft-3302");
    expect((sanitized.owner as any).email).toBeUndefined();
    expect((sanitized.owner as any).phone).toBeUndefined();
  });
});

describe("3. Concurrency & Date Availability Engine", () => {
  it("detects valid chronological dates", async () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const nextWeek = new Date(Date.now() + 86400000 * 7).toISOString();

    const result = await checkDateAvailability("prod_macbook_m3", tomorrow, nextWeek);
    expect(result.isAvailable).toBe(true);
  });

  it("rejects backwards or inverted date ranges", async () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const future = new Date(Date.now() + 86400000).toISOString();

    const result = await checkDateAvailability("prod_macbook_m3", future, past);
    expect(result.isAvailable).toBe(false);
    expect(result.conflictReason).toContain("Invalid start or end date");
  });
});

describe("4. Razorpay Cryptographic Verification & Zod Validations", () => {
  it("rejects invalid or missing payment signatures", () => {
    const isValid = verifyRazorpaySignature({
      orderId: "",
      paymentId: "",
      signature: "",
    });
    expect(isValid).toBe(false);
  });

  it("validates product listing schema against minimum duration and deposit requirements", () => {
    const invalidPayload = {
      title: "Tiny", // Too short
      description: "Short",
      categoryId: "cat_1",
      conditionGrade: "Mint (Like New)",
      rentalPriceDaily: 5, // Below minimum 10
      rentalPriceWeekly: 20,
      mrpReference: 1000,
      deposit: -10, // Invalid negative
      images: [], // Missing
      campusHub: "North Hub",
    };

    const parsed = createProductSchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });
});
