"use client";

import React, { useState } from "react";
import { X, Camera, ShieldCheck, CheckCircle2, RotateCcw } from "lucide-react";

interface ReturnInspectionModalProps {
  bookingId: string;
  onClose: () => void;
  onSuccess: (updatedBooking: any) => void;
}

export function ReturnInspectionModal({
  bookingId,
  onClose,
  onSuccess,
}: ReturnInspectionModalProps) {
  const [returnOtp, setReturnOtp] = useState("");
  const [refundUpiId, setRefundUpiId] = useState("student@oksbi");
  const [damageReported, setDamageReported] = useState(false);
  const [damageNotes, setDamageNotes] = useState("");

  const [conditionPhotos, setConditionPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (returnOtp.length !== 6) {
        throw new Error("Please enter the 6-digit return OTP provided by the lender/handover point.");
      }

      if (!refundUpiId.includes("@")) {
        throw new Error("Please provide a valid UPI ID (e.g. mobile@upi, name@okaxis) for deposit refund.");
      }

      const res = await fetch("/api/bookings/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          returnOtp,
          conditionPhotos,
          refundUpiId,
          damageReported,
          damageNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process return.");
      }

      onSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process return inspection.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#202522]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] w-full max-w-lg rounded-3xl shadow-2xl border border-[#E5DEC9] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#18352D] text-[#F5F0E8] px-6 py-4 flex items-center justify-between border-b border-[#2C483F]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C46A42] flex items-center justify-center text-white">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">
                Return Inspection & Escrow Refund
              </span>
              <span className="text-[10px] text-[#9BB5A3]">
                Automated UPI deposit release protocol
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F0E8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5 bg-[#FFFFFF]">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* 1. Return OTP Verification */}
          <div>
            <label className="text-xs font-semibold text-[#18352D] block mb-1.5">
              6-Digit Handover Return OTP *
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={returnOtp}
              onChange={(e) => setReturnOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 918234"
              className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] text-center font-mono font-bold text-xl text-[#18352D] tracking-widest focus:outline-none focus:border-[#18352D]"
            />
            <span className="text-[11px] text-[#63736A] block mt-1">
              Verify and confirm this OTP with the lender at dropoff.
            </span>
          </div>

          {/* 2. Automated Refund Destination */}
          <div>
            <label className="text-xs font-semibold text-[#18352D] block mb-1.5">
              UPI ID for Instant Security Deposit Refund *
            </label>
            <input
              type="text"
              required
              value={refundUpiId}
              onChange={(e) => setRefundUpiId(e.target.value)}
              placeholder="name@okaxis, number@paytm..."
              className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] text-xs sm:text-sm font-mono text-[#18352D] focus:outline-none focus:border-[#18352D]"
            />
            <span className="text-[11px] text-[#789681] block mt-1 font-medium">
              100% of held deposit is credited directly back to this account.
            </span>
          </div>

          {/* 3. Condition Photos Verification Strip */}
          <div>
            <label className="text-xs font-semibold text-[#18352D] block mb-2">
              4-Point Return Condition Verification
            </label>
            <div className="grid grid-cols-4 gap-2">
              {conditionPhotos.map((url, i) => (
                <div key={i} className="h-18 rounded-xl overflow-hidden border border-[#E5DEC9] relative">
                  <img src={url} alt={`Dropoff view ${i + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 px-1 rounded bg-[#202522]/80 text-[8px] text-white font-mono">
                    #{i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Damage checkbox */}
          <div className="pt-2 border-t border-[#E5DEC9]">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={damageReported}
                onChange={(e) => setDamageReported(e.target.checked)}
                className="w-4 h-4 text-[#C46A42] rounded border-[#E5DEC9] focus:ring-[#C46A42]"
              />
              <span className="text-xs font-semibold text-[#18352D]">
                Report cosmetic scratch or hardware issue (if applicable)
              </span>
            </label>

            {damageReported && (
              <textarea
                rows={2}
                value={damageNotes}
                onChange={(e) => setDamageNotes(e.target.value)}
                placeholder="Describe condition discrepancy..."
                className="w-full mt-2 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E5DEC9] text-xs text-[#18352D] focus:outline-none focus:border-[#18352D]"
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#E5DEC9] text-xs font-semibold text-[#63736A] hover:bg-[#FAF7F2] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-full bg-[#C46A42] hover:bg-[#A8532F] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              {submitting ? (
                <span>Validating & Dispatching...</span>
              ) : (
                <span>Confirm Return & Release Escrow</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
