"use client";

import React from "react";
import {
  Search,
  Calendar,
  ShieldCheck,
  Truck,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export function JourneySection() {
  const steps = [
    {
      step: "01",
      title: "Discover & Filter",
      desc: "Browse verified gear across categories, condition grades, and flexible duration options.",
      icon: Search,
    },
    {
      step: "02",
      title: "Select Exact Tier",
      desc: "Choose Hourly, Daily, Weekly, Monthly, or Semester rates—or purchase pre-owned outright.",
      icon: Calendar,
    },
    {
      step: "03",
      title: "Transparent Escrow",
      desc: "View upfront rent and 100% refundable security deposit held in automated escrow.",
      icon: ShieldCheck,
    },
    {
      step: "04",
      title: "Handover Verification",
      desc: "Collect at a designated verified locker point using a 6-digit OTP and 4-point condition photo log.",
      icon: Truck,
    },
    {
      step: "05",
      title: "Clean Return & Refund",
      desc: "Drop off the item, verify condition records, and receive your escrow deposit credited back via UPI.",
      icon: RefreshCw,
    },
  ];

  return (
    <section className="py-16 bg-[#FFFFFF] border-y border-[#E5DEC9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C46A42]">
            End-To-End Rental Journey
          </span>
          <h2 className="font-semibold text-2xl sm:text-3xl lg:text-4xl text-[#18352D]">
            Engineered for Transparency & Total Peace of Mind
          </h2>
          <p className="text-xs sm:text-sm text-[#63736A]">
            From discovering verified hardware to instant UPI deposit settlement upon return.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((item) => {
            const StepIcon = item.icon;
            return (
              <div
                key={item.step}
                className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DEC9] relative flex flex-col justify-between hover:border-[#789681] transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] border border-[#E5DEC9] flex items-center justify-center text-[#18352D] shadow-xs group-hover:bg-[#18352D] group-hover:text-white transition-colors">
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-semibold text-[#18352D] bg-[#F5F0E8] px-2.5 py-1 rounded-md border border-[#E5DEC9]">
                      STEP {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-[#18352D]">{item.title}</h3>
                  <p className="text-xs text-[#63736A] mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
