"use client";

import React, { useState } from "react";
import { X, Copy, CheckCircle2, Smartphone, Monitor, AlertCircle } from "lucide-react";
import { paiseToRupees } from "@/lib/payments/upi";

interface UpiRentalData {
  id: string;
  upiId?: string;
  productTitle?: string;
  studentName?: string;
  rentPaise: number;
  depositPaise: number;
  totalPaise: number;
  upiLink: string;
  qrUrl: string;
}

interface UpiCheckoutModalProps {
  rental: UpiRentalData;
  onPaid: () => void;
  onClose: () => void;
}

export function UpiCheckoutModal({ rental, onPaid, onClose }: UpiCheckoutModalProps) {
  const [marking, setMarking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upiId = rental.upiId || process.env.NEXT_PUBLIC_UPI_ID || "";

  const handleCopyUpiId = async () => {
    if (!upiId) return;
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleMarkPaid = async () => {
    setMarking(true);
    setError(null);
    try {
      const res = await fetch(`/api/rentals/${rental.id}/paid`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to mark as paid");
      onPaid();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setMarking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-[#E5DEC9] overflow-hidden">
        {/* Header */}
        <div className="bg-[#18352D] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg">Complete Payment</h2>
            <p className="text-xs text-[#789681] font-mono mt-0.5">Order #{rental.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Product */}
          {rental.productTitle && (
            <p className="text-sm font-medium text-[#18352D]">{rental.productTitle}</p>
          )}

          {/* Amount Breakdown */}
          <div className="bg-[#FAF7F2] rounded-xl border border-[#E5DEC9] overflow-hidden text-sm">
            <div className="flex justify-between px-4 py-2.5 border-b border-[#E5DEC9]">
              <span className="text-[#63736A]">Rent & Quoted Fees</span>
              <span className="font-mono text-[#18352D]">{paiseToRupees(rental.rentPaise)}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5 border-b border-[#E5DEC9]">
              <span className="text-[#63736A]">Refundable Deposit</span>
              <span className="font-mono text-[#18352D]">{paiseToRupees(rental.depositPaise)}</span>
            </div>
            <div className="flex justify-between px-4 py-3 bg-[#18352D]/5 font-semibold">
              <span className="text-[#18352D]">Total</span>
              <span className="font-mono text-[#18352D] text-base">
                {paiseToRupees(rental.totalPaise)}
              </span>
            </div>
          </div>

          {/* Mobile: UPI deep link button */}
          <div className="sm:hidden">
            <a
              href={rental.upiLink}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#18352D] text-white font-medium text-sm hover:bg-[#234C40] transition"
            >
              <Smartphone className="w-4 h-4" />
              Pay {paiseToRupees(rental.totalPaise)} via UPI App
            </a>
          </div>

          {/* Desktop: QR code */}
          <div className="hidden sm:flex flex-col items-center gap-3">
            <Monitor className="w-4 h-4 text-[#789681]" />
            <img
              src={rental.qrUrl}
              alt="UPI QR Code"
              className="w-[180px] h-[180px] rounded-xl border border-[#E5DEC9] shadow-sm"
            />
            <p className="text-xs text-[#789681] text-center">
              Scan with any UPI app (PhonePe, GPay, Paytm…)
            </p>
          </div>

          {/* UPI ID copy row */}
          {upiId && (
            <div className="flex items-center justify-between bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl px-4 py-2.5">
              <div>
                <p className="text-[10px] text-[#789681] font-mono uppercase tracking-wider">
                  Pay to UPI ID
                </p>
                <p className="text-sm font-mono text-[#18352D] font-semibold">{upiId}</p>
              </div>
              <button
                onClick={handleCopyUpiId}
                className="p-2 rounded-lg hover:bg-[#E5DEC9] transition text-[#789681]"
                title="Copy UPI ID"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleMarkPaid}
            disabled={marking}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            {marking ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              "I have paid"
            )}
          </button>

          {/* Disclaimer */}
          <p className="text-[11px] text-[#789681] text-center leading-relaxed">
            Your rental activates after manual payment verification by our team. You will be
            notified once confirmed.
          </p>
        </div>
      </div>
    </div>
  );
}
