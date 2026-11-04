/**
 * YwD Dynamic Pricing & Transparent Escrow Breakdown Engine
 * Calculates duration-based rental rates, deposits, fees, and taxes.
 */

export type DurationTier = "hourly" | "daily" | "weekly" | "monthly" | "semester";

export interface RateTable {
  hourly?: number | null;
  daily: number;
  weekly: number;
  monthly?: number | null;
  semester?: number | null;
  deposit: number;
}

export interface PriceBreakdown {
  durationTier: DurationTier;
  durationUnits: number;
  baseRatePerUnit: number;
  grossRent: number;
  securityDeposit: number;
  deliveryFee: number;
  platformFee: number;
  gstAmount: number;
  totalPayable: number;
  escrowRefundableDeposit: number;
  netEffectiveCost: number; // totalPayable - escrowRefundableDeposit
}

export function calculateRentalPrice(params: {
  rates: RateTable;
  durationTier: DurationTier;
  durationUnits: number;
  deliveryMethod?: "PICKUP" | "DELIVERY";
  customDeliveryFee?: number;
}): PriceBreakdown {
  const { rates, durationTier, deliveryMethod = "PICKUP" } = params;
  const durationUnits = Math.max(1, Math.floor(params.durationUnits || 1));

  let unitRate = rates.daily;

  switch (durationTier) {
    case "hourly":
      unitRate = rates.hourly ?? Math.round(rates.daily / 6);
      break;
    case "daily":
      unitRate = rates.daily;
      break;
    case "weekly":
      unitRate = rates.weekly;
      break;
    case "monthly":
      unitRate = rates.monthly ?? Math.round(rates.weekly * 3.4);
      break;
    case "semester":
      // ~3 months semester package discount
      unitRate = rates.semester ?? Math.round(rates.weekly * 8.5);
      break;
  }

  const grossRent = unitRate * durationUnits;
  const securityDeposit = rates.deposit;
  const deliveryFee = deliveryMethod === "DELIVERY" ? (params.customDeliveryFee ?? 99) : 0;
  
  // Platform escrow & verification fee: 3.5% on gross rent
  const platformFee = Math.round(grossRent * 0.035);
  
  // 18% GST applicable only on rental charge + platform service fee
  const gstAmount = Math.round((grossRent + platformFee) * 0.18);
  
  // Total upfront payable by customer
  const totalPayable = grossRent + securityDeposit + deliveryFee + platformFee + gstAmount;
  
  // 100% of security deposit is held in escrow and refunded automatically upon clean return
  const escrowRefundableDeposit = securityDeposit;
  const netEffectiveCost = totalPayable - escrowRefundableDeposit;

  return {
    durationTier,
    durationUnits,
    baseRatePerUnit: unitRate,
    grossRent,
    securityDeposit,
    deliveryFee,
    platformFee,
    gstAmount,
    totalPayable,
    escrowRefundableDeposit,
    netEffectiveCost,
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
