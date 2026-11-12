"use client";

import React, { useState } from "react";
import {
  Camera,
  ShieldCheck,
  Key,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  Eye,
  Maximize2,
  AlertCircle,
} from "lucide-react";

interface InspectionAngle {
  id: string;
  name: string;
  badge: string;
  image: string;
  checkLabel: string;
  timestamp: string;
  status: string;
  details: string;
}

const INSPECTION_ANGLES: InspectionAngle[] = [
  {
    id: "display",
    name: "01 // Display & Anti-Glare Coating",
    badge: "OPTICAL INSPECTION",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    checkLabel: "Zero hairline scratches on Liquid Retina XDR",
    timestamp: "10:14:22 IST • SERVER RECORDED",
    status: "GRADE A+ VERIFIED",
    details: "High-contrast illumination verifies zero micro-scratches, dead pixels, or coating delamination.",
  },
  {
    id: "chassis",
    name: "02 // Top Lid & Anodized Edges",
    badge: "COSMETIC ENCLOSURE",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
    checkLabel: "Zero corner drops or denting on aluminum unibody",
    timestamp: "10:14:48 IST • SERVER RECORDED",
    status: "PRISTINE MINT",
    details: "All 4 chamfered corners inspected. Prevents false claims for pre-existing luggage marks.",
  },
  {
    id: "ports",
    name: "03 // Thunderbolt 4 & MagSafe 3",
    badge: "I/O PORT INTEGRITY",
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80",
    checkLabel: "Pins clean, 140W fast-charging negotiated",
    timestamp: "10:15:05 IST • SERVER RECORDED",
    status: "100% CONTACT CONTINUITY",
    details: "Connector inspection ensures no bent pins, dust obstruction, or cable tension damage.",
  },
  {
    id: "serial",
    name: "04 // Serial Number & Hardware UID",
    badge: "CRYPTOGRAPHIC MATCH",
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80",
    checkLabel: "Hardware UID matching platform ledger: C02G901QMD6T",
    timestamp: "10:15:30 IST • SERVER RECORDED",
    status: "HASH CONFIRMED",
    details: "Ensures the exact verified machine registered in the escrow contract is delivered.",
  },
];

interface HandoverInspectionSimulatorProps {
  cosmicMode?: boolean;
}

export function HandoverInspectionSimulator({
  cosmicMode = true,
}: HandoverInspectionSimulatorProps) {
  const [activeAngleIdx, setActiveAngleIdx] = useState(0);
  const [otpEntered, setOtpEntered] = useState(true);
  const [activeStep, setActiveStep] = useState<"inspection" | "otp" | "vault">("inspection");

  const angle = INSPECTION_ANGLES[activeAngleIdx];

  return (
    <section
      id="handover-simulator"
      className={`py-20 sm:py-28 border-b transition-colors duration-1000 relative overflow-hidden ${
        cosmicMode
          ? "bg-[#060A08] text-[#F3F4F6] border-white/10"
          : "bg-[#FAF7F2] text-[#18352D] border-[#E5DEC9]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-current/10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[10px] font-mono tracking-[0.2em] uppercase backdrop-blur-md bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
              <Camera className="w-3.5 h-3.5" />
              <span>THE HOW FACTOR // 02 • DISPUTE-FREE HANDOVER</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1]">
              How are you protected from damage disputes?
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
              Never get blamed for a scratch you didn't cause. Both parties inspect hardware together and record 4 timestamped angles before the 6-digit handshake OTP unlocks the gear.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl shrink-0 self-start md:self-auto">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>TIMESTAMPED PROTOCOL AUDIT</span>
          </div>
        </div>

        {/* 3 Step Protocol Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveStep("inspection")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeStep === "inspection"
                ? "bg-emerald-950/40 border-emerald-500 text-white shadow-lg"
                : "bg-white/[0.02] border-white/10 text-neutral-400"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-emerald-400">STAGE 01</span>
              <Camera className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-sm font-semibold text-white">4-Angle Photographic Audit</h4>
            <p className="text-xs text-neutral-400 mt-0.5">Physical check before custody changes</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep("otp")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeStep === "otp"
                ? "bg-emerald-950/40 border-emerald-500 text-white shadow-lg"
                : "bg-white/[0.02] border-white/10 text-neutral-400"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-emerald-400">STAGE 02</span>
              <Key className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-sm font-semibold text-white">Dual-OTP Server Handshake</h4>
            <p className="text-xs text-neutral-400 mt-0.5">6-digit cryptographic confirmation</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep("vault")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeStep === "vault"
                ? "bg-emerald-950/40 border-emerald-500 text-white shadow-lg"
                : "bg-white/[0.02] border-white/10 text-neutral-400"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-emerald-400">STAGE 03</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-sm font-semibold text-white">Automated Deposit Vault</h4>
            <p className="text-xs text-neutral-400 mt-0.5">Funds frozen in isolated platform escrow</p>
          </button>
        </div>

        {/* STAGE 1: Interactive 4-Angle Camera Inspector */}
        {activeStep === "inspection" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Viewfinder Left (7 cols) */}
            <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-black/60 p-4 sm:p-6 space-y-4 relative overflow-hidden">
              {/* Camera HUD Overlays */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-neutral-900">
                <img
                  src={angle.image}
                  alt={angle.name}
                  className="w-full h-full object-cover transition-all duration-500"
                />

                {/* HUD Crosshairs */}
                <div className="absolute inset-4 pointer-events-none border border-white/20 flex items-center justify-center">
                  <div className="w-12 h-12 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0" />
                  <div className="w-12 h-12 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0" />
                  <div className="w-12 h-12 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0" />
                  <div className="w-12 h-12 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0" />

                  {/* Center reticle */}
                  <div className="w-4 h-4 border border-emerald-400/60 rounded-full" />
                </div>

                {/* Top HUD Status */}
                <div className="absolute top-3 inset-x-3 flex justify-between items-center text-[10px] font-mono bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE VIEW // {angle.badge}
                  </span>
                  <span className="text-neutral-400">{angle.timestamp}</span>
                </div>

                {/* Bottom HUD Inspection Result */}
                <div className="absolute bottom-3 inset-x-3 bg-black/70 backdrop-blur-md px-3 py-2 rounded-lg border border-emerald-500/30 flex justify-between items-center text-xs">
                  <span className="text-white font-medium truncate">{angle.checkLabel}</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded shrink-0">
                    {angle.status}
                  </span>
                </div>
              </div>

              {/* Angle Switcher Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {INSPECTION_ANGLES.map((a, i) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setActiveAngleIdx(i)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      activeAngleIdx === i
                        ? "bg-emerald-500/20 border-emerald-500 text-white"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <span className="text-[10px] font-mono block opacity-60">ANGLE 0{i + 1}</span>
                    <span className="font-semibold truncate block mt-0.5">{a.id.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation Right (5 cols) */}
            <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-6">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block">
                Verification Protocol Insight
              </span>

              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-white tracking-tight">
                  {angle.name}
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {angle.details}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
                <div className="flex items-center gap-2.5 text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Both renter and lender sign off on photographs in app</span>
                </div>
                <div className="flex items-center gap-2.5 text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Images hashed to ledger with tamper-proof timestamp</span>
                </div>
                <div className="flex items-center gap-2.5 text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Return inspection compares against this baseline exactly</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-mono">
                ZERO DEDUCTION DISPUTES REPORTED ACROSS 1,200+ CAMPUS HANDOVERS
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: Dual-OTP Handshake View */}
        {activeStep === "otp" && (
          <div className="rounded-3xl border border-emerald-500/30 bg-black/60 p-6 sm:p-10 space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                STAGE 02 // PHYSICAL CUSTODY HANDSHAKE
              </span>
              <h3 className="text-2xl sm:text-3xl font-semibold text-white">
                The 6-Digit Verification Handshake
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400">
                The lender cannot hold the gear hostage, and the renter cannot walk away without confirmation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Renter Phone Mockup */}
              <div className="p-6 rounded-2xl bg-neutral-900 border border-white/10 space-y-4">
                <span className="text-xs font-mono text-neutral-400 block uppercase">
                  Renter App View
                </span>
                <div className="space-y-1">
                  <span className="text-[11px] text-neutral-500">Your Handover OTP</span>
                  <div className="text-3xl font-mono font-bold tracking-widest text-emerald-400 bg-black/40 p-3 rounded-xl border border-emerald-500/30 text-center">
                    849 • 201
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Share this 6-digit OTP with the lender ONLY after inspecting the hardware in person.
                </p>
              </div>

              {/* Lender Phone Mockup */}
              <div className="p-6 rounded-2xl bg-neutral-900 border border-white/10 space-y-4">
                <span className="text-xs font-mono text-neutral-400 block uppercase">
                  Lender App View
                </span>
                <div className="space-y-1">
                  <span className="text-[11px] text-neutral-500">Verify Code from Renter</span>
                  <div className="flex gap-2 justify-center">
                    {["8", "4", "9", "2", "0", "1"].map((d, i) => (
                      <div
                        key={i}
                        className="w-9 h-11 rounded-lg bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-mono font-bold flex items-center justify-center text-lg"
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Handover Verified by Platform Server</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: Automated Deposit Vault */}
        {activeStep === "vault" && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-10 space-y-6 max-w-4xl mx-auto">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                STAGE 03 // ISOLATED ESCROW CUSTODY
              </span>
              <h3 className="text-2xl sm:text-3xl font-semibold text-white">
                Lenders Never Hold Your Security Deposit
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400">
                100% of your deposit is held in a protected bank escrow ledger. It is completely isolated from the lender to eliminate arbitrary deductions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <h4 className="font-semibold text-sm text-white">100% Isolated Vault</h4>
                <p className="text-xs text-neutral-400">
                  Lenders have zero disbursement rights during active loans.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <Camera className="w-6 h-6 text-emerald-400" />
                <h4 className="font-semibold text-sm text-white">Automated Photo Audit</h4>
                <p className="text-xs text-neutral-400">
                  Return photos must match baseline photos to trigger settlement.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <Clock className="w-6 h-6 text-emerald-400" />
                <h4 className="font-semibold text-sm text-white">&lt; 60s UPI Settlement</h4>
                <p className="text-xs text-neutral-400">
                  Upon verified return, deposit is refunded directly to your original UPI VPA.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

