"use client";

import React, { useState } from "react";
import {
  Layers,
  Cpu,
  Eye,
  Wind,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Info,
} from "lucide-react";
import { formatINR } from "@/lib/pricing";
import { Hardware3DCanvas } from "./Hardware3DCanvas";

interface HardwareComponent {
  id: string;
  index: string;
  name: string;
  category: string;
  headline: string;
  description: string;
  specs: { label: string; value: string }[];
  verificationCheck: string;
}

const COMPONENTS: HardwareComponent[] = [
  {
    id: "display",
    index: "01",
    name: "Liquid Retina XDR Display",
    category: "Optics & Color Calibration",
    headline: "1,600 nits peak brightness, 1,000,000:1 contrast ratio",
    description:
      "Factory-calibrated DCI-P3 wide color gamut mini-LED backlight array. Tested for zero dead pixels, uniform luminance across corners, and 120Hz ProMotion adaptive refresh rate for frame-accurate timeline editing.",
    specs: [
      { label: "Panel Technology", value: "Liquid Retina XDR mini-LED" },
      { label: "Peak Luminance", value: "1,600 nits (HDR)" },
      { label: "Color Gamut", value: "100% DCI-P3 Factory Calibrated" },
      { label: "Condition Log", value: "Grade A+ • Scratch-Free Glass" },
    ],
    verificationCheck: "Photographic inspection verifies zero hairline abrasions on anti-reflective coating.",
  },
  {
    id: "soc",
    index: "02",
    name: "Apple M3 Max Silicon",
    category: "Compute & Unified Architecture",
    headline: "14-Core CPU, 30-Core GPU, 36GB unified RAM",
    description:
      "Fabricated on 3-nanometer architecture with dedicated hardware-accelerated ray tracing and media engines. 300GB/s unified memory bandwidth enables training local LLMs and scrubbing 8K ProRes timelines without cache bottlenecks.",
    specs: [
      { label: "Fabrication", value: "TSMC 3nm Process" },
      { label: "Memory Bandwidth", value: "300 GB/s Unified" },
      { label: "Neural Engine", value: "16-Core Matrix Co-Processor" },
      { label: "Thermal State", value: "Nominal Factory Clocks" },
    ],
    verificationCheck: "Diagnostics stress test verifies zero core throttling or silicon instability.",
  },
  {
    id: "thermal",
    index: "03",
    name: "Dual Impeller Thermal System",
    category: "Acoustics & Heat Dissipation",
    headline: "Twin high-efficiency blowers with anodized heat pipes",
    description:
      "Maintains peak sustained compute output for hours during long render queues and simulator test runs. Acoustic profile operates at under 22 dBA for normal campus library and studio desk environments.",
    specs: [
      { label: "Impeller Count", value: "Twin High-Aspect Blower Fans" },
      { label: "Acoustic Noise", value: "< 22 dBA Baseline" },
      { label: "Thermal Margin", value: "Zero Sustained Throttling" },
      { label: "Inspection", value: "Ultrasonic Cleaned Fin Stacks" },
    ],
    verificationCheck: "Air intake vents and fin arrays inspected and de-dusted before each loan cycle.",
  },
  {
    id: "storage",
    index: "04",
    name: "High-Throughput NVMe Storage",
    category: "I/O & Persistence",
    headline: "7,400 MB/s sequential read speeds with encrypted partitioning",
    description:
      "Enterprise-grade solid state storage. System partitions are cryptographically wiped and restored to clean macOS Tahoe factory images between every rental, guaranteeing zero residual student data.",
    specs: [
      { label: "Sequential Read", value: "7,400 MB/s" },
      { label: "Sequential Write", value: "6,800 MB/s" },
      { label: "Sanitization", value: "NIST 800-88 Cryptographic Wipe" },
      { label: "SMART Health", value: "100% Remaining Longevity" },
    ],
    verificationCheck: "Drive sanitized with NIST 800-88 cryptographic erase prior to handover.",
  },
  {
    id: "escrow",
    index: "05",
    name: "Cryptographic Escrow Protocol",
    category: "Safety & Custody Pipeline",
    headline: "Dual-OTP verification with automated UPI return settlement",
    description:
      "Your refundable security deposit is held in an isolated digital vault. Funds never reach the lender until physical dropoff and return inspection photos confirm equipment integrity.",
    specs: [
      { label: "Pickup Protocol", value: "6-Digit Handshake OTP" },
      { label: "Inspection Log", value: "4-Angle Timestamped Photos" },
      { label: "Deposit Custody", value: "100% Isolated Escrow Vault" },
      { label: "Refund Speed", value: "< 60 Seconds to UPI" },
    ],
    verificationCheck: "Dual-OTP cryptographic verification eliminates false return disputes entirely.",
  },
];

export function TechnicalAnatomyInspector({
  onOpenProductDetail,
}: {
  onOpenProductDetail: (productId: string, mode?: "rent" | "buy", duration?: string) => void;
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeComp = COMPONENTS[selectedIdx];

  return (
    <section className="py-20 sm:py-24 bg-[#FFFFFF] border-b border-[#E5DEC9] relative">
      {/* Millimeter Graph Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#E0D9C8_1px,transparent_1px)] [background-size:20px_20px] opacity-70 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E5DEC9]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#63736A] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#18352D]" />
              <span>TECHNICAL ANATOMY // SPECIFICATION 001</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#18352D] tracking-tight leading-[1.1]">
              Deconstructed hardware integrity
            </h2>
            <p className="text-base text-[#63736A] mt-3 max-w-2xl leading-relaxed">
              Inspired by classic German blueprint specifications. Every component in the YwD fleet is calibrated, verified, and backed by a transparent condition checklist.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenProductDetail("prod_macbook_m3", "rent", "weekly")}
            className="px-5 py-2.5 rounded-xl bg-[#18352D] hover:bg-[#234C40] text-white text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors self-start md:self-auto shrink-0 shadow-xs"
          >
            <span>Reserve MacBook M3 Max</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C46A42]" />
          </button>
        </div>

        {/* Blueprint Anatomy Grid (12 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Interactive Blueprint Layer Selector (5 cols) */}
          <div className="lg:col-span-5 space-y-2">
            <span className="text-xs font-mono text-[#63736A] block mb-2">
              SELECT COMPONENT TO INSPECT [01 — 05]
            </span>

            <div className="space-y-2">
              {COMPONENTS.map((comp, idx) => {
                const isSelected = selectedIdx === idx;
                return (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => setSelectedIdx(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-[#FAF7F2] border-[#18352D] ring-1 ring-[#18352D] shadow-xs"
                        : "bg-[#FFFFFF] border-[#E5DEC9] hover:bg-[#FAF7F2] text-[#63736A]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-xs font-semibold ${
                          isSelected ? "text-[#C46A42]" : "text-[#789681]"
                        }`}
                      >
                        {comp.index}
                      </span>
                      <div>
                        <h4
                          className={`text-sm font-semibold ${
                            isSelected ? "text-[#18352D]" : "text-[#63736A]"
                          }`}
                        >
                          {comp.name}
                        </h4>
                        <span className="text-[11px] text-[#63736A] block mt-0.5">
                          {comp.category}
                        </span>
                      </div>
                    </div>

                    <ArrowRight
                      className={`w-4 h-4 transition-colors ${
                        isSelected ? "text-[#18352D]" : "text-[#E5DEC9]"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: High-Precision Schematic Card & 3D Interactive Exploded View (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live 3D Exploded Blueprint Model */}
            <Hardware3DCanvas activeComponentId={activeComp.id} />

            <div className="bg-[#FAF7F2] rounded-2xl border border-[#E5DEC9] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
              <span className="font-mono text-xs text-[#C46A42] font-semibold">
                COMPONENT SPEC // {activeComp.index}
              </span>
              <span className="text-xs font-mono text-[#63736A]">
                TOLERANCE ±0.01MM • VERIFIED FLEET
              </span>
            </div>

            <div>
              <span className="text-xs text-[#789681] font-medium block mb-1">
                {activeComp.category}
              </span>
              <h3 className="text-2xl font-semibold text-[#18352D] tracking-tight">
                {activeComp.name}
              </h3>
              <p className="text-sm font-medium text-[#18352D] mt-1">
                {activeComp.headline}
              </p>
              <p className="text-xs sm:text-sm text-[#63736A] mt-3 leading-relaxed">
                {activeComp.description}
              </p>
            </div>

            {/* Spec Matrix */}
            <div className="space-y-2 pt-2 border-t border-[#E5DEC9]">
              <span className="text-xs font-mono text-[#18352D] font-medium block">
                Technical Specifications & Diagnostics
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeComp.specs.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E5DEC9] text-xs"
                  >
                    <span className="text-[#63736A] block text-[11px]">{item.label}</span>
                    <span className="font-mono font-medium text-[#18352D] mt-0.5 block">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Guarantee */}
            <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#789681]/40 flex items-start gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-[#789681] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#18352D] block">
                  Condition Verification Guarantee
                </span>
                <p className="text-[#63736A] mt-0.5 leading-snug">
                  {activeComp.verificationCheck}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
}

