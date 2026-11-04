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

export function AccessProtocol() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "escrow",
      stepNumber: "01",
      title: "Automated escrow vault",
      subtitle: "Capital protection",
      description:
        "When you reserve gear, your rental fee and refundable security deposit are routed to an isolated digital escrow vault. Funds are never paid out to the item owner upfront, ensuring financial security during the loan period.",
      stats: [
        { label: "Deposit security", value: "100% held" },
        { label: "Early release risk", value: "Zero" },
        { label: "Settlement rail", value: "Automated UPI" },
      ],
      icon: ShieldCheck,
      badge: "Financial protocol",
    },
    {
      id: "hub",
      stepNumber: "02",
      title: "Campus handover hubs",
      subtitle: "Verified pickup bays",
      description:
        "Handovers take place at secure physical campus stations including Central Verified Lockers, Engineering Quad Hub, and Library Pavilion. You never need to invite strangers to your personal hostel room or private residence.",
      stats: [
        { label: "Handover hubs", value: "Monitored bays" },
        { label: "Identity privacy", value: "Anonymous alias" },
        { label: "Lockers", value: "Smart PIN bay" },
      ],
      icon: MapPin,
      badge: "Physical protocol",
    },
    {
      id: "otp",
      stepNumber: "03",
      title: "Dual-OTP & 4-angle inspection",
      subtitle: "Dispute-free verification",
      description:
        "During pickup, both parties inspect the equipment and record 4-angle condition photographs (front, display, ports, serial). Handover completes only when the 6-digit cryptographic pickup OTP is entered into the system.",
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
      title: "Instant UPI return settlement",
      subtitle: "Automated refund pipeline",
      description:
        "When your rental concludes, return the gear to the designated campus hub. Once the return inspection photos verify no new damage, 100% of your security deposit is credited back to your UPI account within 60 seconds.",
      stats: [
        { label: "Refund speed", value: "< 60 seconds" },
        { label: "Settlement rail", value: "Direct UPI" },
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
            Total security, privacy, and dispute-free returns
          </h2>
          <p className="text-base text-[#D6E0D9] mt-3 leading-relaxed">
            Every transaction is safeguarded by cryptographic dual-OTP verification, isolated escrow holding, and automated instant UPI refunds.
          </p>
        </div>

        {/* 4-Step Navigation Rail */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {steps.map((s, idx) => {
            const StepIcon = s.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-xl text-left transition-colors border ${
                  isActive
                    ? "bg-[#18352D] border-[#C46A42] text-white"
                    : "bg-[#181C1A] border-[#2C3831] hover:bg-[#202522] text-[#D6E0D9]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-mono text-xs font-medium ${
                      isActive ? "text-[#C46A42]" : "text-[#789681]"
                    }`}
                  >
                    Step {s.stepNumber}
                  </span>
                  <StepIcon
                    className={`w-4 h-4 ${isActive ? "text-white" : "text-[#789681]"}`}
                  />
                </div>
                <h4 className="text-sm font-semibold leading-snug text-white">
                  {s.title}
                </h4>
                <p className="text-xs text-[#9BB5A3] mt-0.5">{s.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detail */}
        <div className="bg-[#18352D] rounded-2xl p-6 sm:p-8 border border-[#2C483F] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Narrative (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#C46A42] text-white flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-[#C46A42] font-medium block">
                  {current.badge} • Step {current.stepNumber} of 04
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mt-0.5">
                  {current.title}
                </h3>
              </div>
            </div>

            <p className="text-sm text-[#D6E0D9] leading-relaxed">
              {current.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#9BB5A3]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#789681]" />
                <span className="text-white">Zero personal phone disclosure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#789681]" />
                <span className="text-white">Verified smart locker stations</span>
              </div>
            </div>
          </div>

          {/* Right Metrics Panel (5 cols) */}
          <div className="lg:col-span-5 bg-[#10231E] rounded-xl p-5 sm:p-6 border border-[#2C483F] space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#2C483F]">
              <span className="text-xs font-mono text-[#9BB5A3]">
                Protocol guarantees
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#789681]" />
            </div>

            <div className="space-y-2">
              {current.stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#18352D] border border-[#2C483F] flex items-center justify-between text-xs"
                >
                  <span className="text-[#9BB5A3]">{stat.label}</span>
                  <span className="font-mono font-medium text-white">{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
                className="text-xs font-medium text-[#C46A42] hover:text-[#D98059] inline-flex items-center gap-1.5 transition-colors"
              >
                <span>{activeStep === steps.length - 1 ? "Replay protocol" : "Next stage"}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
