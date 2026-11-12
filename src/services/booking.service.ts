import { store } from "./store";
import { prisma } from "@/lib/prisma";
import { calculateRentalPrice, DurationTier } from "@/lib/pricing";
import { generateSecureOTP } from "@/lib/security";

export interface CreateBookingInput {
  productId: string;
  renterId: string;
  startDate: string;
  endDate: string;
  durationTier: DurationTier;
  durationUnits: number;
  deliveryMethod?: "PICKUP" | "DELIVERY";
  deliveryAddress?: string | null;
}

/**
 * Checks whether an item is available for the given start & end dates.
 * Detects overlapping active/confirmed reservations.
 */
export async function checkDateAvailability(
  productId: string,
  startDateStr: string,
  endDateStr: string,
  excludeBookingId?: string
): Promise<{ isAvailable: boolean; conflictReason?: string }> {
  const reqStart = new Date(startDateStr).getTime();
  const reqEnd = new Date(endDateStr).getTime();

  if (isNaN(reqStart) || isNaN(reqEnd) || reqEnd <= reqStart) {
    return { isAvailable: false, conflictReason: "Invalid start or end date sequence." };
  }

  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const overlapping = await prisma.rentalBooking.findFirst({
        where: {
          productId,
          status: { in: ["CONFIRMED", "ACTIVE", "PENDING"] },
          ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
          startDate: { lt: new Date(endDateStr) },
          endDate: { gt: new Date(startDateStr) },
        },
      });
      if (overlapping) {
        return {
          isAvailable: false,
          conflictReason: `Item is already reserved between ${overlapping.startDate.toLocaleDateString()} and ${overlapping.endDate.toLocaleDateString()}.`,
        };
      }
      return { isAvailable: true };
    } catch (e) {
      console.warn("[Booking Service] Postgres query failed, evaluating store fallback:", e);
    }
  }

  const bookings = store.getDB().rentalBookings.filter(
    (b) =>
      b.productId === productId &&
      ["CONFIRMED", "ACTIVE", "PENDING"].includes(b.status) &&
      (!excludeBookingId || b.id !== excludeBookingId)
  );

  for (const b of bookings) {
    const existingStart = new Date(b.startDate).getTime();
    const existingEnd = new Date(b.endDate).getTime();

    // Overlap condition: startA < endB and endA > startB
    if (reqStart < existingEnd && reqEnd > existingStart) {
      return {
        isAvailable: false,
        conflictReason: `Item is already reserved between ${new Date(existingStart).toLocaleDateString()} and ${new Date(existingEnd).toLocaleDateString()}.`,
      };
    }
  }

  return { isAvailable: true };
}

export async function createRentalBooking(input: CreateBookingInput) {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      return await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: input.productId },
          include: {
            images: true,
            owner: { include: { anonymousProfile: true } },
          },
        });

        if (!product) throw new Error("Product listing not found.");
        if (!product.isRentable || !product.isAvailable) {
          throw new Error("This product is currently not available for rent.");
        }
        if (product.ownerId === input.renterId) {
          throw new Error("You cannot rent your own listing.");
        }

        // Concurrency-safe overlap check inside transaction
        const overlapping = await tx.rentalBooking.findFirst({
          where: {
            productId: input.productId,
            status: { in: ["CONFIRMED", "ACTIVE", "PENDING"] },
            startDate: { lt: new Date(input.endDate) },
            endDate: { gt: new Date(input.startDate) },
          },
        });

        if (overlapping) {
          throw new Error(`Collision: Item already reserved between ${overlapping.startDate.toLocaleDateString()} and ${overlapping.endDate.toLocaleDateString()}.`);
        }

        const pricing = calculateRentalPrice({
          rates: {
            hourly: product.rentalPriceHourly,
            daily: product.rentalPriceDaily,
            weekly: product.rentalPriceWeekly,
            monthly: product.rentalPriceMonthly,
            semester: product.rentalPriceSemester,
            deposit: product.deposit,
          },
          durationTier: input.durationTier,
          durationUnits: input.durationUnits,
          deliveryMethod: input.deliveryMethod || "PICKUP",
        });

        const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const bookingNumber = `YWD-RENT-${Math.floor(100000 + Math.random() * 900000)}`;
        const pickupOtp = generateSecureOTP();
        const returnOtp = generateSecureOTP();

        const booking = await tx.rentalBooking.create({
          data: {
            id: bookingId,
            bookingNumber,
            productId: product.id,
            renterId: input.renterId,
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
            durationTier: input.durationTier,
            durationUnits: input.durationUnits,
            rentAmount: pricing.grossRent,
            depositAmount: pricing.securityDeposit,
            deliveryFee: pricing.deliveryFee,
            totalAmount: pricing.totalPayable,
            status: "CONFIRMED",
            deliveryMethod: input.deliveryMethod || "PICKUP",
            deliveryAddress: input.deliveryAddress || null,
            pickupOtp,
            returnOtp,
            conditionBeforePhotos: product.images?.map((img) => img.url) || [],
            conditionAfterPhotos: [],
            escrowStatus: "HELD",
          },
          include: {
            product: { include: { images: true } },
          },
        });

        await tx.notification.create({
          data: {
            userId: input.renterId,
            title: "Booking Confirmed - Deposit Protected",
            message: `Booking ${bookingNumber} for "${product.title}" confirmed. Pickup OTP: ${pickupOtp}. Security deposit is securely recorded.`,
            type: "BOOKING",
            link: "/dashboard?tab=rentals",
          },
        });

        return {
          ...booking,
          productTitle: product.title,
          productImage: product.images?.[0]?.url || "",
          ownerAlias: product.owner.anonymousProfile?.alias || "VerifiedPeer",
          platformFee: pricing.platformFee,
          gstAmount: pricing.gstAmount,
        };
      });
    } catch (e: any) {
      if (e.message?.includes("Collision") || e.message?.includes("cannot rent your own")) {
        throw e;
      }
      console.warn("[Booking Service] Postgres transaction failed, falling back to store:", e);
    }
  }

  store.assertProductionDatabase();
  const product = store.getDB().products.find((p) => p.id === input.productId);
  if (!product) {
    throw new Error("Product listing not found.");
  }

  if (!product.isRentable || !product.isAvailable) {
    throw new Error("This product is currently not available for rent.");
  }

  if (product.ownerId === input.renterId) {
    throw new Error("You cannot rent your own listing.");
  }

  const availability = await checkDateAvailability(
    input.productId,
    input.startDate,
    input.endDate
  );

  if (!availability.isAvailable) {
    throw new Error(availability.conflictReason || "Selected dates conflict with an existing reservation.");
  }

  const pricing = calculateRentalPrice({
    rates: {
      hourly: product.rentalPriceHourly,
      daily: product.rentalPriceDaily,
      weekly: product.rentalPriceWeekly,
      monthly: product.rentalPriceMonthly,
      semester: product.rentalPriceSemester,
      deposit: product.deposit,
    },
    durationTier: input.durationTier,
    durationUnits: input.durationUnits,
    deliveryMethod: input.deliveryMethod || "PICKUP",
  });

  const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const bookingNumber = `YWD-RENT-${Math.floor(100000 + Math.random() * 900000)}`;
  const pickupOtp = generateSecureOTP();
  const returnOtp = generateSecureOTP();

  const newBooking = {
    id: bookingId,
    bookingNumber,
    productId: product.id,
    productTitle: product.title,
    productImage: product.images?.[0]?.url || "",
    renterId: input.renterId,
    ownerId: product.ownerId,
    ownerAlias: product.owner.alias,
    startDate: input.startDate,
    endDate: input.endDate,
    durationTier: input.durationTier,
    durationUnits: input.durationUnits,
    rentAmount: pricing.grossRent,
    depositAmount: pricing.securityDeposit,
    deliveryFee: pricing.deliveryFee,
    platformFee: pricing.platformFee,
    gstAmount: pricing.gstAmount,
    totalAmount: pricing.totalPayable,
    status: "CONFIRMED",
    deliveryMethod: input.deliveryMethod || "PICKUP",
    deliveryAddress: input.deliveryAddress || null,
    campusHub: product.campusHub,
    pickupOtp,
    returnOtp,
    conditionBeforePhotos: product.conditionPhotos || [],
    conditionAfterPhotos: [],
    damageReported: false,
    escrowStatus: "HELD",
    escrowRefundAmount: null,
    refundUpiId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.updateDB((db) => {
    db.rentalBookings.unshift(newBooking);

    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: input.renterId,
      title: "Booking Confirmed - Deposit Protected",
      message: `Your booking ${bookingNumber} for "${product.title}" is confirmed. Pickup OTP: ${pickupOtp}. Security deposit is securely recorded.`,
      type: "BOOKING",
      link: `/dashboard?tab=rentals`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  });

  return newBooking;
}

export async function getUserBookings(userId: string) {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const bookings = await prisma.rentalBooking.findMany({
        where: {
          OR: [
            { renterId: userId },
            { product: { ownerId: userId } },
          ],
        },
        include: {
          product: {
            include: {
              images: true,
              owner: { include: { anonymousProfile: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return bookings.map((b) => ({
        ...b,
        startDate: b.startDate.toISOString(),
        endDate: b.endDate.toISOString(),
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
        productTitle: b.product.title,
        productImage: b.product.images?.[0]?.url || "",
        ownerId: b.product.ownerId,
        ownerAlias: b.product.owner.anonymousProfile?.alias || "VerifiedPeer",
      }));
    } catch (e) {
      console.warn("[Booking Service] Postgres getUserBookings failed:", e);
    }
  }

  const all = store.getDB().rentalBookings;
  return all.filter((b) => b.renterId === userId || b.ownerId === userId);
}

export async function processReturnInspection(params: {
  bookingId: string;
  userId: string;
  returnOtp: string;
  conditionPhotos: string[];
  refundUpiId: string;
  damageReported?: boolean;
}) {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      return await prisma.$transaction(async (tx) => {
        const booking = await tx.rentalBooking.findUnique({
          where: { id: params.bookingId },
          include: { product: true },
        });

        if (!booking) throw new Error("Booking not found.");
        if (booking.returnOtp !== params.returnOtp.trim()) {
          throw new Error("Invalid 6-digit return OTP verification code.");
        }

        const isDamage = Boolean(params.damageReported);
        const updated = await tx.rentalBooking.update({
          where: { id: params.bookingId },
          data: {
            conditionAfterPhotos: params.conditionPhotos,
            refundUpiId: params.refundUpiId,
            damageReported: isDamage,
            status: isDamage ? "DISPUTED" : "COMPLETED",
            escrowStatus: isDamage ? "PARTIALLY_REFUNDED" : "REFUNDED",
            escrowRefundAmount: isDamage ? null : booking.depositAmount,
          },
        });

        await tx.notification.create({
          data: {
            userId: booking.renterId,
            title: isDamage ? "Return Completed - Damage Under Review" : "Security Deposit Refund Initiated",
            message: isDamage
              ? `Inspection for ${booking.bookingNumber} noted condition remarks. Dispute review open.`
              : `Your refundable deposit of ₹${booking.depositAmount} for ${booking.bookingNumber} has been initiated to UPI ID ${params.refundUpiId}.`,
            type: "ESCROW",
            link: "/dashboard?tab=refunds",
          },
        });

        return updated;
      });
    } catch (e) {
      if (e instanceof Error && (e.message.includes("Invalid") || e.message.includes("not found"))) {
        throw e;
      }
      console.warn("[Booking Service] Postgres processReturnInspection failed:", e);
    }
  }

  let updatedBooking: any = null;

  store.updateDB((db) => {
    const booking = db.rentalBookings.find((b) => b.id === params.bookingId);
    if (!booking) {
      throw new Error("Booking not found.");
    }

    if (booking.returnOtp !== params.returnOtp) {
      throw new Error("Invalid 6-digit return OTP verification code.");
    }

    booking.conditionAfterPhotos = params.conditionPhotos;
    booking.refundUpiId = params.refundUpiId;
    booking.damageReported = Boolean(params.damageReported);

    if (params.damageReported) {
      booking.status = "DISPUTED";
      booking.escrowStatus = "PARTIALLY_REFUNDED";
    } else {
      booking.status = "COMPLETED";
      booking.escrowStatus = "REFUNDED";
      booking.escrowRefundAmount = booking.depositAmount;
    }

    booking.updatedAt = new Date().toISOString();
    updatedBooking = booking;

    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: booking.renterId,
      title: "Security Deposit Refund Initiated",
      message: `Your refundable deposit of ₹${booking.depositAmount} for ${booking.bookingNumber} has been initiated to UPI ID ${params.refundUpiId}.`,
      type: "ESCROW",
      link: `/dashboard?tab=refunds`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  });

  return updatedBooking;
}

export async function processPickupHandover(params: {
  bookingId: string;
  userId: string;
  pickupOtp: string;
  conditionBeforePhotos?: string[];
}) {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      return await prisma.$transaction(async (tx) => {
        const booking = await tx.rentalBooking.findUnique({
          where: { id: params.bookingId },
          include: { product: true },
        });

        if (!booking) throw new Error("Booking not found.");
        if (booking.renterId !== params.userId && booking.product.ownerId !== params.userId) {
          throw new Error("Unauthorized: only counterparties can verify handover.");
        }
        if (booking.status !== "CONFIRMED") {
          throw new Error(`Cannot complete handover for booking in ${booking.status} status.`);
        }
        if (booking.pickupOtp !== params.pickupOtp.trim()) {
          throw new Error("Invalid 6-digit pickup handover OTP code.");
        }

        const updated = await tx.rentalBooking.update({
          where: { id: params.bookingId },
          data: {
            status: "ACTIVE",
            ...(params.conditionBeforePhotos ? { conditionBeforePhotos: params.conditionBeforePhotos } : {}),
          },
        });

        await tx.notification.create({
          data: {
            userId: booking.renterId,
            title: "Equipment Handover Verified & Active",
            message: `Pickup verified with OTP. Your rental period for ${booking.product.title} is now active. Return OTP: ${booking.returnOtp}`,
            type: "BOOKING",
            link: "/dashboard?tab=rentals",
          },
        });

        return updated;
      });
    } catch (e) {
      if (e instanceof Error && (e.message.includes("Invalid") || e.message.includes("Unauthorized") || e.message.includes("Cannot"))) {
        throw e;
      }
      console.warn("[Booking Service] Postgres processPickupHandover failed:", e);
    }
  }

  let updatedBooking: any = null;

  store.updateDB((db) => {
    const booking = db.rentalBookings.find((b) => b.id === params.bookingId);
    if (!booking) {
      throw new Error("Booking not found.");
    }

    if (booking.renterId !== params.userId && booking.ownerId !== params.userId) {
      throw new Error("Unauthorized: only counterparties can verify handover.");
    }

    if (booking.status !== "CONFIRMED") {
      throw new Error(`Cannot complete handover for booking in ${booking.status} status.`);
    }

    if (booking.pickupOtp !== params.pickupOtp.trim()) {
      throw new Error("Invalid 6-digit pickup handover OTP code.");
    }

    booking.status = "ACTIVE";
    if (params.conditionBeforePhotos && params.conditionBeforePhotos.length > 0) {
      booking.conditionBeforePhotos = params.conditionBeforePhotos;
    }
    booking.updatedAt = new Date().toISOString();
    updatedBooking = booking;

    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: booking.renterId,
      title: "Equipment Handover Verified & Active",
      message: `Pickup verified with OTP. Your rental period for ${booking.productTitle} (${booking.bookingNumber}) is now active. Return OTP: ${booking.returnOtp}`,
      type: "BOOKING",
      link: `/dashboard?tab=rentals`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    db.notifications.unshift({
      id: `notif_${Date.now() + 1}`,
      userId: booking.ownerId,
      title: "Equipment Dispatched Successfully",
      message: `Handover for ${booking.productTitle} completed. Item is now actively with borrower.`,
      type: "BOOKING",
      link: `/dashboard?tab=listings`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  });

  return updatedBooking;
}

export async function cancelRentalBooking(params: {
  bookingId: string;
  userId: string;
  reason: string;
}) {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const booking = await prisma.rentalBooking.findUnique({
        where: { id: params.bookingId },
        include: { product: true },
      });
      if (!booking) throw new Error("Booking not found.");
      if (booking.renterId !== params.userId && booking.product.ownerId !== params.userId) {
        throw new Error("Unauthorized: you cannot cancel this booking.");
      }
      if (["ACTIVE", "COMPLETED", "CANCELLED", "DISPUTED"].includes(booking.status)) {
        throw new Error(`Cannot cancel a booking that is currently ${booking.status}.`);
      }

      const updated = await prisma.rentalBooking.update({
        where: { id: params.bookingId },
        data: {
          status: "CANCELLED",
          escrowStatus: booking.escrowStatus === "HELD" ? "REFUNDED" : booking.escrowStatus,
          escrowRefundAmount: booking.escrowStatus === "HELD" ? booking.depositAmount : booking.escrowRefundAmount,
        },
      });

      await prisma.notification.create({
        data: {
          userId: booking.renterId,
          title: "Booking Cancelled",
          message: `Booking ${booking.bookingNumber} has been cancelled. Any held deposit has been released.`,
          type: "BOOKING",
          link: "/dashboard?tab=rentals",
        },
      });

      return updated;
    } catch (e) {
      console.warn("[Booking Service] Postgres cancelRentalBooking failed:", e);
    }
  }

  let cancelledBooking: any = null;

  store.updateDB((db) => {
    const booking = db.rentalBookings.find((b) => b.id === params.bookingId);
    if (!booking) {
      throw new Error("Booking not found.");
    }

    if (booking.renterId !== params.userId && booking.ownerId !== params.userId) {
      throw new Error("Unauthorized: you cannot cancel this booking.");
    }

    if (["ACTIVE", "COMPLETED", "CANCELLED", "DISPUTED"].includes(booking.status)) {
      throw new Error(`Cannot cancel a booking that is currently ${booking.status}.`);
    }

    booking.status = "CANCELLED";
    booking.updatedAt = new Date().toISOString();

    if (booking.escrowStatus === "HELD") {
      booking.escrowStatus = "REFUNDED";
      booking.escrowRefundAmount = booking.depositAmount;
    }

    cancelledBooking = booking;

    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: booking.renterId,
      title: "Booking Cancelled",
      message: `Booking ${booking.bookingNumber} has been cancelled. Any held security deposit has been released.`,
      type: "BOOKING",
      link: `/dashboard?tab=rentals`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  });

  return cancelledBooking;
}
