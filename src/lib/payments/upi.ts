export type RentalStatus =
  | "CREATED"
  | "PENDING"
  | "ACTIVE"
  | "INSPECT"
  | "REFUNDED"
  | "REJECTED";

export type LedgerEvent = "PAID" | "DAMAGE" | "REFUNDED";

/** Convert integer paise → "₹X.XX" display string */
export function paiseToRupees(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

/** Build UPI deep-link string.
 *  Reads UPI_ID and UPI_NAME from env — throws if UPI_ID is missing.
 */
export function buildUpiLink(orderId: string, totalPaise: number): string {
  const upiId = process.env.UPI_ID;
  if (!upiId) {
    throw new Error("UPI_ID environment variable is not set.");
  }
  const upiName = process.env.UPI_NAME || "YwD Marketplace";
  const amount = (totalPaise / 100).toFixed(2);
  const tn = encodeURIComponent(`YWD-${orderId}`);
  const pn = encodeURIComponent(upiName);
  return `upi://pay?pa=${upiId}&pn=${pn}&am=${amount}&cu=INR&tn=${tn}`;
}

/** Build a QR code URL for the given UPI deep-link (desktop fallback). */
export function buildQrUrl(upiLink: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    upiLink
  )}`;
}

/** Validate and compute the refund amount in paise.
 *  Throws if damagePaise > depositPaise.
 */
export function computeRefund(depositPaise: number, damagePaise: number): number {
  if (damagePaise < 0) throw new Error("Damage amount cannot be negative.");
  if (damagePaise > depositPaise) {
    throw new Error(
      `Damage (${paiseToRupees(damagePaise)}) exceeds deposit (${paiseToRupees(depositPaise)}).`
    );
  }
  return depositPaise - damagePaise;
}

/** Round a rupee string/number to nearest paise (integer). */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
