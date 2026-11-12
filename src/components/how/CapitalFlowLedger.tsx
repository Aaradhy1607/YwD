"use client";

import React, { useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingDown,
  Building,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { formatINR } from "@/lib/pricing";

interface CapitalFlowLedgerProps {
  cosmicMode?: boolean;
}

export function CapitalFlowLedger({ cosmicMode = true }: CapitalFlowLedgerProps) {
  const [activeTab, setActiveTab] = useState<"standard" | "safety">("standard");

  const sampleDeposit = 8000;
  const sampleRental = 2097; // 3 days @ 699

  return (
    <section
      id="capital-ledger"
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
              <DollarSign className="w-3.5 h-3.5" />
              <span>THE HOW FACTOR // 04 • CAPITAL CUSTODY PIPELINE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1]">
              How does your money move from reservation to refund?
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
              Complete financial transparency. See exactly where your rental fee and security deposit travel through our bank-grade escrow ledger.
            </p>
          </div>

          <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl text-xs font-mono self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("standard")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "standard" ? "bg-emerald-500 text-black font-semibold" : "text-neutral-400"
              }`}
            >
              STANDARD LIFECYCLE
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("safety")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "safety" ? "bg-emerald-500 text-black font-semibold" : "text-neutral-400"
              }`}
            >
              DISPUTE ESCROW LOCK
            </button>
          </div>
        </div>

        {/* 4-Stage Capital Flow Rail */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* STAGE 1: Initial Payment */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3 relative">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold">STAGE 01</span>
              <CreditCard className="w-4 h-4 text-neutral-400" />
            </div>
            <h4 className="text-base font-semibold text-white">Payment via UPI / Card</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Rental Charge:</span>
                <span className="font-mono text-white">{formatINR(sampleRental)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Security Deposit:</span>
                <span className="font-mono text-emerald-400">{formatINR(sampleDeposit)}</span>
              </div>
            </div>
            <div className="text-[11px] text-neutral-500 pt-2 border-t border-white/5">
              Funds initiate through Razorpay / Neon ledger with instant webhook handshake.
            </div>
          </div>

          {/* STAGE 2: Escrow Split */}
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-5 space-y-3 relative shadow-lg">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold">STAGE 02</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-base font-semibold text-white">Isolated Vault Split</h4>
            <div className="space-y-1 text-xs">
              <div className="p-2 rounded bg-black/40 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
                DEPOSIT FROZEN: {formatINR(sampleDeposit)}
              </div>
            </div>
            <div className="text-[11px] text-neutral-400 pt-2 border-t border-white/5">
              Deposit is locked in an isolated escrow vault. The lender has zero withdrawal rights.
            </div>
          </div>

          {/* STAGE 3: Loan Active */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3 relative">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold">STAGE 03</span>
              <ShieldCheck className="w-4 h-4 text-neutral-400" />
            </div>
            <h4 className="text-base font-semibold text-white">Active Loan Period</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Deposit Status:</span>
                <span className="font-mono text-emerald-400">100% INTACT</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Platform Deductions:</span>
                <span className="font-mono text-white">₹0.00</span>
              </div>
            </div>
            <div className="text-[11px] text-neutral-500 pt-2 border-t border-white/5">
              You execute your coursework with total peace of mind. Zero hidden maintenance fees.
            </div>
          </div>

          {/* STAGE 4: Instant Refund */}
          <div className="rounded-2xl border border-emerald-500/50 bg-emerald-500/10 p-5 space-y-3 relative shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold">STAGE 04</span>
              <RotateCcw className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-base font-semibold text-white">Instant UPI Settlement</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-neutral-300">
                <span>Refunded to UPI:</span>
                <span className="font-mono font-bold text-emerald-400">{formatINR(sampleDeposit)}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Settlement Time:</span>
                <span className="font-mono text-emerald-300">&lt; 60 Seconds</span>
              </div>
            </div>
            <div className="text-[11px] text-emerald-300/80 pt-2 border-t border-emerald-500/20">
              Return photos verified by hub desk. 100% deposit returns directly to your VPA.
            </div>
          </div>
        </div>

        {/* Detailed Protection Explanation Box */}
        {activeTab === "standard" ? (
          <div className="rounded-2xl bg-black/40 border border-white/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-white block text-sm">
                  Automatic Gateway Reconciliation
                </span>
                <p className="text-neutral-400 mt-0.5">
                  Refunds are sent via the original payment rail. No platform wallet credits or forced vouchers.
                </p>
              </div>
            </div>
            <span className="font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shrink-0">
              AVERAGE REFUND SPEED: 48 SECONDS
            </span>
          </div>
        ) : (
          <div className="rounded-2xl bg-black/40 border border-amber-500/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold text-white block text-sm">
                  Campus Admin Mediation Protocol
                </span>
                <p className="text-neutral-400 mt-0.5">
                  In the rare event of a condition disagreement, the deposit remains frozen in escrow until campus hub staff reviews the pickup vs return photos. Neither party can seize funds unilaterally.
                </p>
              </div>
            </div>
            <span className="font-mono text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 shrink-0">
              FAIR ADJUDICATION GUARANTEE
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

