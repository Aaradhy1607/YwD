"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import {
  Search,
  ShieldCheck,
  Key,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Lock,
} from "lucide-react";

interface StoryChapter {
  id: string;
  stepNumber: string;
  title: string;
  tagline: string;
  description: string;
  highlight: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  accentBg: string;
  cardPreview: {
    title: string;
    specs: string[];
    stat: string;
    statLabel: string;
  };
}

const CHAPTERS: StoryChapter[] = [
  {
    id: "chapter-discover",
    stepNumber: "01",
    title: "Transparent Duration Tiers",
    tagline: "Rent or buy with exact upfront costing",
    description:
      "Select your exact timeline from 1 hour to an entire semester. No hidden surcharges, no arbitrary penalties—just transparent tiered rates with immediate calendar availability checks.",
    highlight: "Collision-Free Calendar",
    icon: Search,
    accentColor: "#C46A42",
    accentBg: "bg-[#C46A42]/15",
    cardPreview: {
      title: "Apple MacBook Pro M3 Workstation",
      specs: ["M3 Pro 11-core CPU, 18GB RAM", "512GB Ultra-Fast SSD storage", "Liquid Retina XDR calibrated display"],
      stat: "₹699/day",
      statLabel: "Per day, per week and semester tiered rates",
    },
  },
  {
    id: "chapter-escrow",
    stepNumber: "02",
    title: "Automated Escrow Vault",
    tagline: "Your security deposit is locked and protected",
    description:
      "Your refundable security deposit is held securely in an isolated digital escrow vault. Neither party can tamper with or withhold funds arbitrarily while equipment is in use.",
    highlight: "100% Deposit Held Securely",
    icon: ShieldCheck,
    accentColor: "#789681",
    accentBg: "bg-[#789681]/15",
    cardPreview: {
      title: "Escrow Deposit Lock System",
      specs: ["Bank-grade payment vault", "Zero premature payouts", "Automated release pipeline"],
      stat: "₹8,000",
      statLabel: "100% refundable security deposit",
    },
  },
  {
    id: "chapter-handover",
    stepNumber: "03",
    title: "Dual-OTP Handover & Inspection",
    tagline: "4-point physical verification protocol",
    description:
      "Counterparties meet at a verified handover station or smart locker bay. A 6-digit pickup OTP validates the exchange only after cosmetic and functional condition checks succeed.",
    highlight: "Both Parties Verify Before Release",
    icon: Key,
    accentColor: "#C46A42",
    accentBg: "bg-[#C46A42]/15",
    cardPreview: {
      title: "Handover Inspection Protocol",
      specs: ["Power and boot validation", "Cosmetic condition photo log", "Serial number confirmation"],
      stat: "6-Digit OTP",
      statLabel: "Instant counterparty validation",
    },
  },
  {
    id: "chapter-refund",
    stepNumber: "04",
    title: "Instant UPI Refund Settlement",
    tagline: "Return verified, funds released",
    description:
      "Upon clean return check at the handover point, the return OTP triggers the automated escrow refund. 100% of your deposit is credited directly back to your original UPI account without delay.",
    highlight: "Automated Refund Pipeline",
    icon: RotateCcw,
    accentColor: "#789681",
    accentBg: "bg-[#789681]/15",
    cardPreview: {
      title: "Direct UPI Refund Settlement",
      specs: ["Zero cancellation charges", "Direct bank / UPI webhook", "Instant digital receipt"],
      stat: "100% Dispatched",
      statLabel: "Zero deduction on clean return",
    },
  },
];

export function ScrollStorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 300, damping: 35 });

  return (
    <section ref={containerRef} className="relative py-20 bg-[#202522] text-[#F5F0E8] border-y border-[#2C3831]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
          <span className="px-3.5 py-1 rounded-full text-xs font-mono tracking-wider uppercase text-[#C46A42] bg-[#C46A42]/10 border border-[#C46A42]/20 font-semibold">
            How YwD Operates
          </span>
          <h2 className="font-semibold text-3xl sm:text-4xl text-[#F5F0E8] tracking-tight mt-2">
            The Complete Rental & Recommerce Loop
          </h2>
          <p className="text-xs sm:text-sm text-[#9BB5A3] leading-relaxed">
            Every step is designed to eliminate transaction risk, protect customer deposits, and ensure seamless gear access without friction.
          </p>
        </div>

        {/* Storytelling Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Story Steps */}
          <div className="lg:col-span-7 space-y-4">
            {CHAPTERS.map((chapter, idx) => {
              const Icon = chapter.icon;
              const isSelected = activeChapterIdx === idx;

              return (
                <div
                  key={chapter.id}
                  onClick={() => setActiveChapterIdx(idx)}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#18352D] border-[#C46A42] shadow-xl ring-1 ring-[#C46A42]/40"
                      : "bg-[#18352D]/40 border-[#2C3831] hover:bg-[#18352D]/70 hover:border-[#789681]/40"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/10 ${chapter.accentBg}`}
                      style={{ color: chapter.accentColor }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-semibold text-[#C46A42]">
                          Stage {chapter.stepNumber}
                        </span>
                        <span className="text-[11px] font-medium text-[#789681] bg-[#789681]/15 px-2.5 py-0.5 rounded-full border border-[#789681]/25">
                          {chapter.highlight}
                        </span>
                      </div>

                      <h3 className="font-semibold text-base sm:text-lg text-white mt-1">
                        {chapter.title}
                      </h3>
                      <p className="text-xs text-[#9BB5A3] mt-0.5 font-medium">
                        {chapter.tagline}
                      </p>

                      <p className="text-xs text-[#9BB5A3] mt-2.5 leading-relaxed">
                        {chapter.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Dynamic Preview Card with AnimatePresence */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              {(() => {
                const current = CHAPTERS[activeChapterIdx];
                const Icon = current.icon;

                return (
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="bg-[#18352D] text-[#F5F0E8] p-6 sm:p-7 rounded-3xl border border-[#2C483F] shadow-2xl relative overflow-hidden"
                  >
                    {/* Card Content */}
                    <div className="relative z-10 space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${current.accentBg} border border-white/10`}
                            style={{ color: current.accentColor }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-mono font-medium text-[#F5F0E8]">
                            Stage {current.stepNumber} Protocol
                          </span>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#789681] bg-[#789681]/15 border border-[#789681]/25">
                          Active safeguard
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-[#9BB5A3] block uppercase tracking-wider">
                          Live verification protocol
                        </span>
                        <h4 className="font-semibold text-lg sm:text-xl text-white mt-1 tracking-tight">
                          {current.cardPreview.title}
                        </h4>
                      </div>

                      {/* Specs / Checklist */}
                      <div className="space-y-2.5 bg-[#202522] p-4 rounded-xl border border-[#2C483F]">
                        {current.cardPreview.specs.map((spec, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-[#F5F0E8]">
                            <CheckCircle2 className="w-4 h-4 text-[#789681] shrink-0" />
                            <span>{spec}</span>
                          </div>
                        ))}
                      </div>

                      {/* Stat Row */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#9BB5A3] block leading-tight">
                            {current.cardPreview.statLabel}
                          </span>
                          <span className="font-mono font-bold text-xl text-[#F5F0E8] block mt-0.5 tabular-nums">
                            {current.cardPreview.stat}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-[#9BB5A3] block">Status</span>
                          <span className="text-xs font-semibold text-white bg-[#C46A42] px-3 py-1 rounded-full inline-block mt-0.5 shadow-xs">
                            Protected
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
