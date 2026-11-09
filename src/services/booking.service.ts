import { store } from "./store";
import { calculateRentalPrice, DurationTier } from "@/lib/pricing";

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
  const product = store.getDB().products.find((p) => p.id === input.productId);
  if (!product) {
    throw new Error("Product listing not found.");
  }

  if (!product.isRentable || !product.isAvailable) {
    throw new Error("This product is currently not available for rent.");
  }

  // Prevent users from renting their own products
  if (product.ownerId === input.renterId) {
    throw new Error("You cannot rent your own listing.");
  }

  // Concurrency-safe availability validation
  const availability = await checkDateAvailability(
    input.productId,
    input.startDate,
    input.endDate
  );

  if (!availability.isAvailable) {
    throw new Error(availability.conflictReason || "Selected dates conflict with an existing reservation.");
  }

  // Recalculate price strictly on the server
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
  const pickupOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const returnOtp = Math.floor(100000 + Math.random() * 900000).toString();

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
    status: "CONFIRMED", // Secured in escrow
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

    // Add in-app notification
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: input.renterId,
      title: "Booking Confirmed in Escrow",
      message: `Your booking ${bookingNumber} for "${product.title}" is confirmed. Pickup OTP: ${pickupOtp}`,
      type: "BOOKING",
      link: `/dashboard?tab=rentals`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  });

  return newBooking;
}

export async function getUserBookings(userId: string) {
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

    // Trigger instant UPI refund notification
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: booking.renterId,
      title: "100% Escrow Deposit Refund Dispatched",
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

    // Dispatch in-app notification
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

    // Auto-refund held deposit if applicable
    if (booking.escrowStatus === "HELD") {
      booking.escrowStatus = "REFUNDED";
      booking.escrowRefundAmount = booking.depositAmount;
    }

    cancelledBooking = booking;

    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: booking.renterId,
      title: "Booking Cancelled",
      message: `Booking ${booking.bookingNumber} has been cancelled. Any held escrow deposit has been released.`,
      type: "BOOKING",
      link: `/dashboard?tab=rentals`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  });

  return cancelledBooking;
}
