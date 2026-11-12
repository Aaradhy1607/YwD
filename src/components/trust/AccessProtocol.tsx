"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Key,
  RotateCcw,
  CheckCircle2,
  Lock,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { AccessJourney3DCanvas } from "./AccessJourney3DCanvas";

export function AccessProtocol() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "escrow",
      stepNumber: "01",
      title: "Protected Deposit System",
      subtitle: "Capital protection",
      description:
        "When you reserve gear, your refundable security deposit is tracked and held separately from rental fees. Funds are not disbursed to the item owner upfront, protecting your capital throughout the loan period.",
      stats: [
        { label: "Deposit security", value: "100% held" },
        { label: "Early release risk", value: "Zero" },
        { label: "Settlement rail", value: "Gateway reconciliation" },
      ],
      icon: ShieldCheck,
      badge: "Financial protocol",
    },
    {
      id: "hub",
      stepNumber: "02",
      title: "Designated Handover Points",
      subtitle: "Verified pickup points",
      description:
        "Handovers take place at designated public exchange points, verified pickup desks, or via direct doorstep delivery. Counterparties coordinate securely without revealing home addresses or personal phone numbers.",
      stats: [
        { label: "Handover points", value: "Designated points" },
        { label: "Identity privacy", value: "Anonymous alias" },
        { label: "Verification", value: "OTP-verified pickup" },
      ],
      icon: MapPin,
      badge: "Physical protocol",
    },
    {
      id: "otp",
      stepNumber: "03",
      title: "Dual-OTP & 4-Angle Inspection",
      subtitle: "Dispute-free verification",
      description:
        "During pickup, both parties inspect the equipment and record 4-angle condition photographs (front, display, ports, serial). Handover completes only when the 6-digit server-verified pickup OTP is entered into the system.",
      stats: [
        { label: "Pickup verification", value: "6-digit OTP" },
        { label: "Inspection log", value: "4 photo angles" },
        { label: "Dispute protection", value: "Timestamped" },
      ],
      icon: Key,
      badge: "Verification protocol",
    },
    {
      id: "refund",
      stepNumber: "04",
      title: "Deposit Return Verification",
      subtitle: "Inspection & refund pipeline",
      description:
        "When your rental concludes, return the gear to the designated handover point. Once the return inspection photos verify equipment condition, 100% of your security deposit is released for refund processing to your registered account.",
      stats: [
        { label: "Refund status", value: "Prompt processing" },
        { label: "Settlement rail", value: "Direct payment rail" },
        { label: "Processing fee", value: "₹0.00" },
      ],
      icon: RotateCcw,
      badge: "Settlement protocol",
    },
  ];

  const current = steps[activeStep];
  const Icon = current.icon;

  return (
    <section className="py-16 sm:py-20 bg-[#202522] text-[#F5F0E8] border-t border-[#2C3831]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-medium text-[#C46A42] mb-2">
            The YwD access protocol
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-[1.12]">
            Security, privacy, and dispute-free returns
          </h2>
          <p className="text-base text-[#D6E0D9] mt-3 leading-relaxed">
            Every transaction is safeguarded by server-side dual-OTP verification, protected deposit tracking, and condition inspection records.
          </p>
        </div>

        {/* 4-Step Navigation Rail */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {steps.map((s, idx) => {
            const StepIcon = s.icon;
            const isSelected = activeStep === idx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`p-4 sm:p-5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#18352D] border-[#789681] text-white shadow-lg shadow-black/20"
                    : "bg-[#252C28] border-white/5 text-[#9BB5A3] hover:border-white/20 hover:text-white"
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
                  <span className="text-[11px] block opacity-70 mb-0.5">
                    {s.subtitle}
                  </span>
                  <h4 className="font-semibold text-xs sm:text-sm text-white line-clamp-1">
                    {s.title}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Showcase Card */}
        <div className="bg-[#18352D] rounded-3xl border border-[#2C483F] p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Step Left: Narrative */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#789681]/20 text-[#9BB5A3] border border-[#789681]/30 uppercase">
                  {current.badge}
                </span>
                <span className="text-xs font-mono text-[#C46A42]">
                  Step {current.stepNumber} of 04
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                  {current.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#D6E0D9] leading-relaxed">
                  {current.description}
                </p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {current.stats.map((st, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5"
                  >
                    <span className="text-[10px] text-[#9BB5A3] block uppercase tracking-wider">
                      {st.label}
                    </span>
                    <span className="font-semibold text-xs sm:text-sm text-white">
                      {st.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Right: Interactive 3D Journey & Protocol Frame */}
            <div className="lg:col-span-5 space-y-4">
              <AccessJourney3DCanvas activeStep={activeStep} />

              <div className="bg-[#202522] rounded-2xl border border-white/10 p-5 space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10 text-xs text-[#9BB5A3]">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#C46A42]" />
                    <span className="font-mono text-white font-semibold">
                      PROTOCOL TELEMETRY // 0{activeStep + 1}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#789681] font-mono">
                    LIVE VERIFIED
                  </span>
                </div>

              {/* Step Graphic Visuals */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3 font-mono text-xs text-[#9BB5A3]">
                {activeStep === 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-white">
                      <span>Deposit Status:</span>
                      <span className="text-[#789681]">PROTECTED IN LEDGER</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lender Upfront Access:</span>
                      <span className="text-[#C46A42]">BLOCKED</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Refund Trigger:</span>
                      <span className="text-white">Condition Inspection Verification</span>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-white">
                      <span>Designated Station:</span>
                      <span className="text-[#789681]">CENTRAL DESK</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Home Visit Needed:</span>
                      <span className="text-[#C46A42]">NEVER</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Identity Shield:</span>
                      <span className="text-white">Active (Alias Only)</span>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-white">
                      <span>Pickup OTP:</span>
                      <span className="text-[#789681]">6 DIGITS • SERVER VERIFIED</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Condition Angles:</span>
                      <span className="text-white">Front, Display, Ports, Serial</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Handover State:</span>
                      <span className="text-[#C46A42]">LOCKED UNTIL OTP MATCH</span>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-white">
                      <span>Return Status:</span>
                      <span className="text-[#789681]">VERIFIED</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deposit Refund:</span>
                      <span className="text-white">100% DISPATCHED</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Arbitrary Deductions:</span>
                      <span className="text-[#C46A42]">PREVENTED</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Stepper */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#9BB5A3] hover:text-white disabled:opacity-30 transition-colors"
                >
                  Previous
                </button>
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all ${
                        activeStep === i ? "bg-[#C46A42] w-4" : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  disabled={activeStep === steps.length - 1}
                  onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#C46A42] hover:text-white disabled:opacity-30 transition-colors"
                >
                  Next Step
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
}
