"use client";

/**
 * PilotBanner — sticky amber banner indicating manual UPI pilot mode.
 * Must appear on every page (placed in layout.tsx).
 */
export function PilotBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-400 text-black text-center py-2 px-4 text-sm font-medium shadow-sm">
      ⚠️ Pilot mode: payments are verified manually. Do not share payment screenshots as proof.
    </div>
  );
}
