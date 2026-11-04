"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { formatINR } from "@/lib/pricing";

interface CuratedSpotlightProps {
  onOpenProductDetail: (productId: string, mode?: "rent" | "buy", duration?: string) => void;
  onExplore: () => void;
}

export function CuratedSpotlight({ onOpenProductDetail, onExplore }: CuratedSpotlightProps) {
  const [selectedDuration, setSelectedDuration] = useState<"daily" | "weekly" | "semester">("weekly");

  const purchaseCost = 199900;
  const rates = {
    daily: 699,
    weekly: 3899,
    semester: 24990,
  };
  const activeRate = rates[selectedDuration];
  const savings = purchaseCost - activeRate;

  return (
    <section className="py-16 sm:py-20 bg-[#FAF7F2] border-y border-[#E5DEC9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-medium text-[#C46A42] mb-2">
            Economics of access
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#18352D] tracking-tight leading-[1.12]">
            Why purchase equipment you only need for a project or semester?
          </h2>
          <p className="text-base text-[#63736A] mt-3 leading-relaxed">
            College engineering, media production, and academic coursework require high-performance tools. YwD replaces heavy upfront capital expenditure with flexible, escrow-backed rental terms.
          </p>
        </div>

        {/* Asymmetric Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* LEFT: Flagship Editorial Feature (7 cols) */}
          <div className="lg:col-span-7 bg-[#18352D] text-[#F5F0E8] rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-[#2C483F]">
            <div className="space-y-5">
              {/* Badges - Sentence case */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#C46A42] text-white">
                  Featured workstation
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#10231E] text-[#D6E0D9] border border-[#2C483F]">
                  Engineering & studio class
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#10231E] text-[#9BB5A3]">
                  Central Locker Hub A
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-2xl font-semibold text-white tracking-tight">
                  Apple MacBook Pro M3 Max Workstation
                </h3>
                <p className="text-sm text-[#D6E0D9] mt-2.5 leading-relaxed">
                  Configured for machine learning compiles, 4K multi-cam timelines, and CAD modeling. Includes calibrated Liquid Retina XDR display, MagSafe charger, and protective sleeve.
                </p>
              </div>

              {/* Spec Pills */}
              <div className="grid grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="bg-[#10231E] p-3 rounded-lg border border-[#2C483F]">
                  <span className="text-[11px] text-[#9BB5A3] block">Processor</span>
                  <span className="font-semibold text-white mt-0.5 block">M3 Max 14-Core</span>
                </div>
                <div className="bg-[#10231E] p-3 rounded-lg border border-[#2C483F]">
                  <span className="text-[11px] text-[#9BB5A3] block">Unified memory</span>
                  <span className="font-semibold text-white mt-0.5 block">36GB RAM</span>
                </div>
                <div className="bg-[#10231E] p-3 rounded-lg border border-[#2C483F]">
                  <span className="text-[11px] text-[#9BB5A3] block">Condition</span>
                  <span className="font-semibold text-[#789681] mt-0.5 block">Mint Grade A+</span>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-6 mt-6 border-t border-[#2C483F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#9BB5A3] block">Rental rate</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-semibold text-white font-mono tabular-nums">
                    ₹699
                  </span>
                  <span className="text-xs text-[#9BB5A3]">/day</span>
                  <span className="text-xs text-[#789681] font-mono ml-2">
                    Deposit: ₹8,000 (Refundable)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenProductDetail("prod_macbook_m3", "rent", "weekly")}
                className="px-4 py-2.5 rounded-xl bg-[#C46A42] hover:bg-[#A8532F] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shrink-0"
              >
                <span>Reserve workstation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* RIGHT: Live Cost Efficiency Calculator (5 cols) */}
          <div className="lg:col-span-5 bg-[#FFFFFF] rounded-2xl p-6 sm:p-7 border border-[#E5DEC9] flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#C46A42]">
                  Cost efficiency matrix
                </span>
                <span className="text-xs text-[#789681] font-medium flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Save up to 88%</span>
                </span>
              </div>

              <div>
                <h4 className="text-xl font-semibold text-[#18352D] tracking-tight">
                  Calculate savings
                </h4>
                <p className="text-xs text-[#63736A] mt-1 leading-relaxed">
                  Compare outright retail purchase against flexible project rental access with automated escrow protection.
                </p>
              </div>

              {/* Duration Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#E5DEC9]">
                {[
                  { id: "daily", label: "Single day", sub: "1 day" },
                  { id: "weekly", label: "Project week", sub: "7 days" },
                  { id: "semester", label: "Semester", sub: "4 months" },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedDuration(tier.id as any)}
                    className={`py-2 px-1.5 rounded-lg text-center transition-colors ${
                      selectedDuration === tier.id
                        ? "bg-[#18352D] text-white"
                        : "text-[#63736A] hover:text-[#18352D]"
                    }`}
                  >
                    <span className="text-xs font-medium block">{tier.label}</span>
                    <span className="text-[10px] opacity-75 font-mono block mt-0.5">{tier.sub}</span>
                  </button>
                ))}
              </div>

              {/* Comparison Visualizer */}
              <div className="space-y-2.5 pt-1">
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#63736A] block">Retail purchase cost</span>
                    <span className="text-base font-semibold text-[#18352D] font-mono tabular-nums line-through decoration-[#A64F45]">
                      {formatINR(purchaseCost)}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#A64F45]/10 text-[#A64F45]">
                    Full capital outlay
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#18352D]/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#18352D] font-medium block">
                      YwD {selectedDuration === "daily" ? "Daily" : selectedDuration === "weekly" ? "Weekly" : "Semester"} access
                    </span>
                    <span className="text-xl font-semibold text-[#18352D] font-mono tabular-nums">
                      {formatINR(activeRate)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#789681] font-medium block">Capital retained</span>
                    <span className="text-sm font-semibold text-[#C46A42] font-mono tabular-nums">
                      {formatINR(savings)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="space-y-1.5 text-xs text-[#63736A]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#789681] shrink-0" />
                  <span>100% security deposit returned immediately upon dropoff</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#789681] shrink-0" />
                  <span>No long-term lease lock-in or cancellation penalties</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#789681] shrink-0" />
                  <span>Timestamped 4-angle condition photographs</span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-5 mt-5 border-t border-[#E5DEC9]">
              <button
                type="button"
                onClick={onExplore}
                className="w-full py-2.5 rounded-xl bg-[#18352D] hover:bg-[#234C40] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>Browse all available gear</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C46A42]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
