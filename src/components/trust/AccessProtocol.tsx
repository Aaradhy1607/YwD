"use client";

import React, { useState } from "react";
import { ShieldCheck, Key, RotateCcw, MapPin } from "lucide-react";

export function AccessProtocol() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "escrow",
      stepNumber: "01",
      title: "Protected Deposit Tracking",
      subtitle: "Capital separation",
      description:
        "When you reserve equipment, your refundable security deposit is recorded separately from the rental fee. Funds are held during the active loan period rather than released to the owner upfront.",
      stats: [
        { label: "Deposit status", value: "Tracked separately" },
        { label: "Upfront owner payout", value: "Held until return" },
        { label: "Return trigger", value: "OTP + photo check" },
      ],
      icon: ShieldCheck,
      badge: "Financial protocol",
    },
    {
      id: "hub",
      stepNumber: "02",
      title: "Designated Handover Points",
      subtitle: "Campus pickup desks",
      description:
        "Handovers happen at designated campus exchange points or via agreed delivery. Both parties coordinate through anonymous aliases without exposing personal phone numbers or home addresses.",
      stats: [
        { label: "Pickup points", value: "Designated hubs" },
        { label: "Identity privacy", value: "Anonymous alias" },
        { label: "Verification", value: "6-digit OTP" },
      ],
      icon: MapPin,
      badge: "Handover protocol",
    },
    {
      id: "otp",
      stepNumber: "03",
      title: "Dual-OTP & 4-Angle Inspection",
      subtitle: "Condition logging",
      description:
        "At pickup, counterparties inspect the item and record condition photos. Handover completes only when the 6-digit server-verified pickup OTP is submitted, transitioning the booking to Active.",
      stats: [
        { label: "Pickup verification", value: "6-digit OTP" },
        { label: "Inspection log", value: "4 photo angles" },
        { label: "Handover state", value: "OTP-gated" },
      ],
      icon: Key,
      badge: "Verification protocol",
    },
    {
      id: "refund",
      stepNumber: "04",
      title: "Return Verification & UPI Refund",
      subtitle: "Closing the rental",
      description:
        "At dropoff, submit the 6-digit return OTP, upload return condition photos, and provide your UPI ID. If no damage is reported, the booking completes and the deposit refund is initiated.",
      stats: [
        { label: "Return check", value: "OTP + photos" },
        { label: "Payout destination", value: "Registered UPI ID" },
        { label: "Damage reported", value: "Opens dispute review" },
      ],
      icon: RotateCcw,
      badge: "Settlement protocol",
    },
  ];

  const current = steps[activeStep];
  const Icon = current.icon;

  return (
    <section className="py-12 sm:py-16 bg-[#FAF7F2] text-[#18352D] border-y border-[#E5DEC9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <p className="text-xs font-medium text-[#C46A42] mb-2">
            The YwD access protocol
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#18352D] tracking-tight leading-[1.12]">
            Security, privacy, and structured returns
          </h2>
          <p className="text-sm sm:text-base text-[#63736A] mt-3 leading-relaxed">
            Every rental follows a four-stage verification flow with server-checked OTPs, condition photography, and separate deposit tracking.
          </p>
        </div>

        {/* 4-Step Navigation Rail */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6"
          role="tablist"
          aria-label="Access protocol steps"
        >
          {steps.map((s, idx) => {
            const StepIcon = s.icon;
            const isSelected = activeStep === idx;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveStep(idx)}
                className={`p-4 sm:p-5 rounded-2xl text-left border transition-colors flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#18352D] border-[#18352D] text-white"
                    : "bg-[#FFFFFF] border-[#E5DEC9] text-[#18352D] hover:border-[#18352D]/40"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isSelected ? "text-[#C46A42]" : "text-[#63736A]"
                    }`}
                  >
                    {s.stepNumber}
                  </span>
                  <StepIcon
                    className={`w-4 h-4 ${
                      isSelected ? "text-[#789681]" : "text-[#63736A]"
                    }`}
                  />
                </div>
                <div>
                  <span
                    className={`text-[11px] block mb-0.5 ${
                      isSelected ? "text-[#D6E0D9]" : "text-[#63736A]"
                    }`}
                  >
                    {s.subtitle}
                  </span>
                  <h3
                    className={`font-semibold text-xs sm:text-sm line-clamp-1 ${
                      isSelected ? "text-white" : "text-[#18352D]"
                    }`}
                  >
                    {s.title}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Detail Card (Deep Forest Dark Contrast Block) */}
        <div className="bg-[#18352D] text-[#F5F0E8] rounded-2xl border border-[#2C483F] p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-[#D6E0D9] border border-white/15">
                  {current.badge}
                </span>
                <span className="text-xs font-mono text-[#C46A42]">
                  Step {current.stepNumber} of 04
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-editorial text-2xl sm:text-3xl text-white tracking-tight">
                  {current.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#D6E0D9] leading-relaxed">
                  {current.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {current.stats.map((st, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5"
                  >
                    <span className="text-[11px] text-[#9BB5A3] block">
                      {st.label}
                    </span>
                    <span className="font-semibold text-xs sm:text-sm text-white">
                      {st.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#10231E] rounded-2xl border border-[#2C483F] p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#18352D] border border-white/15 text-white flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#C46A42]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-[#9BB5A3] block">
                      Stage 0{activeStep + 1}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {current.subtitle}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                {current.stats.map((st, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-[#9BB5A3]">{st.label}</span>
                    <span className="font-mono font-semibold text-white">
                      {st.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <button
                  type="button"
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#D6E0D9] hover:bg-white/10 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        activeStep === i ? "bg-[#C46A42] w-5" : "bg-white/20 w-1.5"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  disabled={activeStep === steps.length - 1}
                  onClick={() =>
                    setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#C46A42] hover:bg-white/10 disabled:opacity-40 transition-colors"
                >
                  Next step
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
