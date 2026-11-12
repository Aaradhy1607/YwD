"use client";

import React, { useState } from "react";
import {
  Calculator,
  Calendar,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { formatINR } from "@/lib/pricing";

interface ProjectScenario {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  hardware: string;
  specs: string;
  defaultDays: number;
  dailyRate: number;
  deposit: number;
  retailPrice: number;
  recommendedHub: string;
  outcome: string;
}

const SCENARIOS: ProjectScenario[] = [
  {
    id: "hackathon",
    tag: "SCENARIO // 01",
    title: "48-Hour Hackathon & AI Prototype",
    subtitle: "High-throughput local LLM fine-tuning & continuous compilation",
    hardware: "Apple MacBook Pro 14\" M3 Max",
    specs: "36GB Unified RAM • 14-Core CPU • 30-Core GPU",
    defaultDays: 3,
    dailyRate: 699,
    deposit: 8000,
    retailPrice: 199900,
    recommendedHub: "Engineering Quad Locker Bay A",
    outcome: "Deliver live local AI demo without paying ₹2,00,000 upfront.",
  },
  {
    id: "filmfest",
    tag: "SCENARIO // 02",
    title: "Campus Film Festival & Portfolio Shoot",
    subtitle: "Cinematic 4K 60p 10-Bit production with dual media redundancy",
    hardware: "Sony Alpha 7 IV + 24-70mm f/2.8 GM Rig",
    specs: "33MP Full-Frame Exmor R • Dual V90 High-Speed SD Cards",
    defaultDays: 4,
    dailyRate: 899,
    deposit: 9500,
    retailPrice: 249000,
    recommendedHub: "Media & Studio Exchange Bay",
    outcome: "Film festival-grade optics for the exact duration of the weekend shoot.",
  },
  {
    id: "finals",
    tag: "SCENARIO // 03",
    title: "Midterm & Final Semester Calculus Exams",
    subtitle: "Computer Algebra System (CAS) permitted for engineering exams",
    hardware: "Texas Instruments Nspire CX II CAS",
    specs: "CAS Symbolic Solver • Color Backlit Display • Calibrated Battery",
    defaultDays: 7,
    dailyRate: 149,
    deposit: 1500,
    retailPrice: 18500,
    recommendedHub: "Library Pavilion Counter 4",
    outcome: "Pass your semester exams with approved equipment, zero dead capital.",
  },
  {
    id: "audio",
    tag: "SCENARIO // 04",
    title: "EP Production & Sound Synthesis",
    subtitle: "Master-grade field recording and 4-track tape emulation",
    hardware: "Teenage Engineering OP-1 Field",
    specs: "Stereo 24-bit 96kHz • Aluminum Chassis • FM Radio Transmitter",
    defaultDays: 5,
    dailyRate: 850,
    deposit: 11000,
    retailPrice: 165000,
    recommendedHub: "Sound Conservatory Bay 10",
    outcome: "Track your album in the dorm without taking on equipment debt.",
  },
];

interface ScenarioCostCalculatorProps {
  cosmicMode?: boolean;
  onOpenProductDetail: (productId: string, mode?: "rent" | "buy", duration?: string) => void;
}

export function ScenarioCostCalculator({
  cosmicMode = true,
  onOpenProductDetail,
}: ScenarioCostCalculatorProps) {
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(0);
  const [days, setDays] = useState(SCENARIOS[0].defaultDays);

  const scenario = SCENARIOS[selectedScenarioIdx];

  const handleSelectScenario = (idx: number) => {
    setSelectedScenarioIdx(idx);
    setDays(SCENARIOS[idx].defaultDays);
  };

  const totalRentalCost = scenario.dailyRate * days;
  const upfrontCapitalPreserved = scenario.retailPrice - totalRentalCost;
  const percentageSaved = ((upfrontCapitalPreserved / scenario.retailPrice) * 100).toFixed(1);

  return (
    <section
      id="scenario-calculator"
      className={`py-20 sm:py-28 border-b transition-colors duration-1000 relative overflow-hidden ${
        cosmicMode
          ? "bg-[#060A08] text-[#F3F4F6] border-white/10"
          : "bg-[#FAF7F2] text-[#18352D] border-[#E5DEC9]"
      }`}
    >
      {/* Background blueprint grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-current/10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[10px] font-mono tracking-[0.2em] uppercase backdrop-blur-md bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
              <Calculator className="w-3.5 h-3.5" />
              <span>THE HOW FACTOR // 01 • ECONOMIC FEASIBILITY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1]">
              How much capital do you actually keep?
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
              Don’t purchase ₹2,00,000 gear for a 48-hour project or one-semester class. Pick your scenario to see exact mathematical savings down to the rupee.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl shrink-0 self-start md:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% DEPOSIT REFUNDABLE VIA UPI</span>
          </div>
        </div>

        {/* 4 Scenario Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCENARIOS.map((sc, idx) => {
            const isSelected = selectedScenarioIdx === idx;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleSelectScenario(idx)}
                className={`p-4 sm:p-5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-950/50"
                    : "bg-white/[0.03] border-white/10 hover:border-white/20 text-neutral-400"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-mono font-bold ${isSelected ? "text-emerald-400" : "text-neutral-500"}`}>
                    {sc.tag}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                </div>
                <div>
                  <h4 className={`text-sm font-semibold mb-1 ${isSelected ? "text-white" : "text-neutral-300"}`}>
                    {sc.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 line-clamp-2">
                    {sc.hardware}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Calculation Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT: Scenario Breakdown & Duration Scrubber (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">
                    Target Hardware Package
                  </span>
                  <h3 className="text-xl sm:text-2xl font-semibold text-white mt-0.5">
                    {scenario.hardware}
                  </h3>
                  <span className="text-xs text-neutral-400">{scenario.specs}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Daily Rate</span>
                  <span className="text-lg font-mono font-bold text-emerald-400">
                    {formatINR(scenario.dailyRate)}
                    <span className="text-xs text-neutral-400 font-normal"> / day</span>
                  </span>
                </div>
              </div>

              {/* Duration Slider */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="duration-slider" className="text-xs font-mono uppercase text-neutral-300 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Selected Loan Duration</span>
                  </label>
                  <span className="text-sm font-mono font-bold text-white bg-white/10 px-3 py-1 rounded-lg">
                    {days} {days === 1 ? "Day" : "Days"}
                  </span>
                </div>

                <input
                  id="duration-slider"
                  type="range"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-white/10 h-2 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                  <span>1 Day (Sprint)</span>
                  <span>7 Days (Week)</span>
                  <span>14 Days (Module)</span>
                  <span>30 Days (Month)</span>
                </div>
              </div>

              {/* Real World Impact Note */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-300 block">Deliverable Assurance</span>
                  <p className="text-neutral-300 text-[11px] mt-0.5 leading-relaxed">
                    {scenario.outcome}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Pickup Hub Info */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400 font-mono">
              <span>DESIGNATED HANDOVER: {scenario.recommendedHub}</span>
              <span className="text-emerald-400">SANITY CHECKED & CALIBRATED</span>
            </div>
          </div>

          {/* RIGHT: Financial Contrast Card (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0B1E15] to-[#06120D] p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-2xl relative">
            <div className="space-y-5">
              <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-400 font-semibold block">
                Upfront Capital Comparison
              </span>

              {/* Retail Buying Cost */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Outright Purchase (Retail):</span>
                  <span className="line-through text-red-400/80">{formatINR(scenario.retailPrice)}</span>
                </div>
                <div className="text-[11px] text-neutral-500">
                  100% upfront capital locked away in hardware that depreciates 30% in year one.
                </div>
              </div>

              {/* YwD Rental Cost Breakdown */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex justify-between text-sm text-neutral-200">
                  <span>{days}-Day Rental Total:</span>
                  <span className="font-mono font-bold text-white">{formatINR(totalRentalCost)}</span>
                </div>

                <div className="flex justify-between text-xs text-neutral-400 pt-2 border-t border-white/10">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Protected Deposit (Refundable):</span>
                  </span>
                  <span className="font-mono text-emerald-400">{formatINR(scenario.deposit)}</span>
                </div>
              </div>

              {/* Big Savings Highlight */}
              <div className="text-center p-4 rounded-2xl bg-emerald-400/10 border border-emerald-400/30">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-1">
                  Immediate Upfront Cash Preserved
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
                  {formatINR(upfrontCapitalPreserved)}
                </div>
                <span className="text-xs text-emerald-300 font-mono mt-1 block">
                  {percentageSaved}% lower cash barrier
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenProductDetail("prod_macbook_m3", "rent", "weekly")}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <span>Reserve For This Scenario</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

