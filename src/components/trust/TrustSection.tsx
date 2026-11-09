"use client";

import React from "react";
import { ShieldCheck, Camera, Lock, CheckCircle2 } from "lucide-react";

export function TrustSection() {
  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mb-12">
        <p className="text-xs font-medium text-[#C46A42] mb-2">
          Trust & accountability guarantee
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold text-[#18352D] tracking-tight leading-[1.12]">
          Hardware security and identity confidentiality
        </h2>
        <p className="text-base text-[#63736A] mt-3 leading-relaxed">
          How YwD safeguards hardware condition, prevents deduction disputes, and provides reliable deposit refund reconciliation upon return verification without sharing personal contact information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Pillar 1 */}
        <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-2xl border border-[#E5DEC9] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#18352D] text-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#789681]" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-[#C46A42] block">
              Financial reserve
            </span>
            <h3 className="text-lg font-semibold text-[#18352D] tracking-tight">
              Protected Security Deposit
            </h3>
            <p className="text-xs sm:text-sm text-[#63736A] leading-relaxed">
              100% of rental security deposits are tracked separately from rental charges. Deposits are never disbursed to the lender during the active rental, preventing arbitrary withholding.
            </p>
          </div>
          <div className="pt-2 border-t border-[#E5DEC9] text-xs text-[#18352D] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#789681]" />
            <span>Deposit refund upon return inspection</span>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-2xl border border-[#E5DEC9] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#18352D] text-white flex items-center justify-center">
            <Camera className="w-5 h-5 text-[#C46A42]" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-[#C46A42] block">
              Inspection integrity
            </span>
            <h3 className="text-lg font-semibold text-[#18352D] tracking-tight">
              4-Angle Photographic Records
            </h3>
            <p className="text-xs sm:text-sm text-[#63736A] leading-relaxed">
              Every handover documents cosmetic and functional condition photos across front, display, ports, and serial numbers. Timestamps prevent disputes for pre-existing marks.
            </p>
          </div>
          <div className="pt-2 border-t border-[#E5DEC9] text-xs text-[#18352D] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#789681]" />
            <span>Server-verified dual-OTP handover</span>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-2xl border border-[#E5DEC9] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#18352D] text-white flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#789681]" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-[#C46A42] block">
              Identity protection
            </span>
            <h3 className="text-lg font-semibold text-[#18352D] tracking-tight">
              Zero Personal Contact Leakage
            </h3>
            <p className="text-xs sm:text-sm text-[#63736A] leading-relaxed">
              Coordination happens exclusively through YwD Confidential Relay using system-assigned aliases. Personal phone numbers and personal emails are never exposed.
            </p>
          </div>
          <div className="pt-2 border-t border-[#E5DEC9] text-xs text-[#18352D] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#789681]" />
            <span>Privacy-shielded relay messaging</span>
          </div>
        </div>
      </div>
    </section>
  );
}
