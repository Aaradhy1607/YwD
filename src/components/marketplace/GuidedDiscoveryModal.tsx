"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Camera,
  Headphones,
  Compass,
  Layers,
  Calendar,
  ShieldCheck,
  MapPin,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { formatINR } from "@/lib/pricing";

interface GuidedDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
  onOpenProductDetail: (productId: string, mode?: "rent" | "buy", duration?: string) => void;
  onApplyFiltersToMarketplace: (categorySlug: string, transactionMode: "all" | "rent" | "buy", duration: string) => void;
}

interface StepOption {
  id: string;
  label: string;
  description: string;
  categorySlug?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const DISCIPLINES: StepOption[] = [
  {
    id: "computing",
    label: "Computing & Workstations",
    description: "MacBook Pro M3 Max, ThinkPad P-Series, 4K color-calibrated displays",
    categorySlug: "electronics",
    icon: Cpu,
    tag: "High compute",
  },
  {
    id: "optics",
    label: "Optics & Cinema Systems",
    description: "Sony A7 IV, Cinema bodies, cine primes, gimbal stabilizers",
    categorySlug: "cameras",
    icon: Camera,
    tag: "Production",
  },
  {
    id: "acoustics",
    label: "Acoustics & Studio Gear",
    description: "Genelec monitors, Shure SM7B, low-latency audio interfaces",
    categorySlug: "electronics",
    icon: Headphones,
    tag: "Studio sound",
  },
  {
    id: "scientific",
    label: "Scientific & Academic Tools",
    description: "TI-Nspire CAS calculators, lab oscilloscopes, multimeter kits",
    categorySlug: "academic-books",
    icon: Compass,
    tag: "STEM certified",
  },
  {
    id: "living",
    label: "Campus Living & Mobility",
    description: "Ergonomic seating, portable laser projectors, campus commuting",
    categorySlug: "furniture-hostel",
    icon: Layers,
    tag: "Hostel essentials",
  },
];

const PURPOSES: StepOption[] = [
  {
    id: "capstone",
    label: "Semester Capstone & Research",
    description: "Long-term dedicated project requiring guaranteed uptime and deep discounts.",
    tag: "90+ days",
  },
  {
    id: "production",
    label: "Weekend Production & Event Shoot",
    description: "Intense 48-72 hour creative production requiring verified optics.",
    tag: "1-3 days",
  },
  {
    id: "hackathon",
    label: "Hackathon & Code Sprint",
    description: "Intensive 5-7 day sprint with high-performance compute and dual displays.",
    tag: "1 week",
  },
  {
    id: "studio",
    label: "Studio Recording & Podcast",
    description: "Acoustically isolated monitoring and microphone capture.",
    tag: "1-4 weeks",
  },
  {
    id: "coursework",
    label: "Daily Coursework & Exams",
    description: "Standard semester curriculum tools without full upfront purchase cost.",
    tag: "Semester",
  },
];

const MODES: StepOption[] = [
  {
    id: "rent",
    label: "Flexible Campus Rental",
    description: "Zero long-term commitment. 100% refundable escrow deposit upon return inspection.",
    tag: "Zero ownership burden",
  },
  {
    id: "buy",
    label: "Verified Pre-Owned Purchase",
    description: "Acquire second-life equipment thoroughly benchmarked by campus technician hubs.",
    tag: "Permanent recommerce",
  },
  {
    id: "all",
    label: "Compare Both Options",
    description: "Show both rental rates and outright purchase options side-by-side.",
    tag: "Transparent economics",
  },
];

const TIMELINES: StepOption[] = [
  {
    id: "daily",
    label: "Daily Sprint (1–3 Days)",
    description: "Exact day-by-day access for short shoots, presentations, and events.",
  },
  {
    id: "weekly",
    label: "Weekly Sprint (7 Days)",
    description: "Standard academic project cycle. Popular for hackathons and assignments.",
  },
  {
    id: "monthly",
    label: "Monthly Residency (30 Days)",
    description: "Extended creative project or internship period with tiered rates.",
  },
  {
    id: "semester",
    label: "Full Academic Semester (90–120 Days)",
    description: "Maximum rate discount. Keep equipment throughout your term with single deposit.",
  },
];

export function GuidedDiscoveryModal({
  isOpen,
  onClose,
  products,
  onOpenProductDetail,
  onApplyFiltersToMarketplace,
}: GuidedDiscoveryModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("computing");
  const [selectedPurpose, setSelectedPurpose] = useState<string>("capstone");
  const [selectedMode, setSelectedMode] = useState<"rent" | "buy" | "all">("rent");
  const [selectedTimeline, setSelectedTimeline] = useState<string>("weekly");

  // Step 5: Matches calculation
  const matchedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    const activeDiscipline = DISCIPLINES.find((d) => d.id === selectedDiscipline);
    const categorySlug = activeDiscipline?.categorySlug || "electronics";

    let pool = products.filter(
      (p) => p.categorySlug === categorySlug || p.categoryId === categorySlug
    );

    if (pool.length === 0) {
      pool = products.slice(0, 6);
    }

    if (selectedMode === "rent") {
      pool = pool.filter((p) => p.isRentable);
    } else if (selectedMode === "buy") {
      pool = pool.filter((p) => p.isPurchasable);
    }

    return pool.slice(0, 4);
  }, [products, selectedDiscipline, selectedMode]);

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedDiscipline("computing");
    setSelectedPurpose("capstone");
    setSelectedMode("rent");
    setSelectedTimeline("weekly");
  };

  const calculateProductRate = (p: any) => {
    if (!p) return 0;
    switch (selectedTimeline) {
      case "daily":
        return p.rentalPriceDaily;
      case "weekly":
        return p.rentalPriceWeekly;
      case "monthly":
        return p.rentalPriceMonthly || Math.round(p.rentalPriceWeekly * 3.4);
      case "semester":
        return p.rentalPriceSemester || Math.round(p.rentalPriceWeekly * 8.5);
      default:
        return p.rentalPriceDaily;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Guided Equipment Discovery"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 lg:p-6"
    >
      <div className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-3xl border border-[#E5DEC9] shadow-2xl overflow-hidden text-[#18352D] my-8 flex flex-col max-h-[92vh]">
        {/* Top Spatial Ambient Header */}
        <div className="bg-[#18352D] text-[#F5F0E8] px-6 sm:px-8 py-5 border-b border-[#2C3831] relative shrink-0">
          {/* Millimeter grid texture overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#2C3831_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#FAF7F2] border border-white/20 shrink-0 shadow-xs">
                <img src="/images/ywd-logo.png" alt="YwD Insignia" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#D6E0D9] mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#C46A42]" />
                  <span>GUIDED DISCOVERY ROOM // INTERACTIVE MATCHING</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                  Find the exact equipment for your project
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const discipline = DISCIPLINES.find((d) => d.id === selectedDiscipline);
                  onApplyFiltersToMarketplace(
                    discipline?.categorySlug || "all",
                    selectedMode,
                    selectedTimeline
                  );
                  onClose();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#D6E0D9] hover:text-white transition-colors underline underline-offset-4"
              >
                <span>Skip to full catalog</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C46A42]" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none"
                aria-label="Close discovery modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Segmented Step Progress Bar */}
          <div className="grid grid-cols-5 gap-2 mt-4 pt-3 border-t border-white/10">
            {[1, 2, 3, 4, 5].map((step) => {
              const isPast = step < currentStep;
              const isCurrent = step === currentStep;

              return (
                <div key={step} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isPast
                        ? "bg-[#789681]"
                        : isCurrent
                        ? "bg-[#C46A42]"
                        : "bg-white/15"
                    }`}
                  />
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span
                      className={
                        isCurrent
                          ? "text-[#C46A42] font-semibold"
                          : isPast
                          ? "text-[#789681]"
                          : "text-white/40"
                      }
                    >
                      0{step}
                    </span>
                    <span className="hidden sm:inline text-white/50 truncate ml-1">
                      {step === 1 && "Discipline"}
                      {step === 2 && "Purpose"}
                      {step === 3 && "Access"}
                      {step === 4 && "Timeline"}
                      {step === 5 && "Fleet"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: Discipline */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <span className="text-xs font-mono text-[#C46A42]">STEP 01 // DISCIPLINE</span>
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#18352D] mt-1">
                    What category of gear does your project require?
                  </h3>
                  <p className="text-sm text-[#63736A] mt-1">
                    Select the physical equipment domain. We calibrate recommendations based on campus lab inventory.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {DISCIPLINES.map((item) => {
                    const isSelected = selectedDiscipline === item.id;
                    const Icon = item.icon || Cpu;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedDiscipline(item.id)}
                        className={`p-4 sm:p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[#FFFFFF] border-[#18352D] shadow-sm ring-1 ring-[#18352D]"
                            : "bg-[#FFFFFF]/70 border-[#E5DEC9] hover:bg-[#FFFFFF] hover:border-[#18352D]/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? "bg-[#18352D] text-white border-[#18352D]"
                                : "bg-[#FAF7F2] text-[#18352D] border-[#E5DEC9]"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          <span className="text-[11px] font-mono text-[#63736A] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#E5DEC9]">
                            {item.tag}
                          </span>
                        </div>

                        <h4 className="font-semibold text-base text-[#18352D] mt-3">
                          {item.label}
                        </h4>
                        <p className="text-xs text-[#63736A] mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Purpose */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <span className="text-xs font-mono text-[#C46A42]">STEP 02 // PROJECT SCOPE</span>
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#18352D] mt-1">
                    What is the primary objective of your work?
                  </h3>
                  <p className="text-sm text-[#63736A] mt-1">
                    Understanding your workflow allows us to tailor tier limits, accessory bundles, and verification tolerances.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {PURPOSES.map((item) => {
                    const isSelected = selectedPurpose === item.id;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedPurpose(item.id)}
                        className={`p-4 sm:p-4.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-4 ${
                          isSelected
                            ? "bg-[#FFFFFF] border-[#18352D] shadow-sm ring-1 ring-[#18352D]"
                            : "bg-[#FFFFFF]/70 border-[#E5DEC9] hover:bg-[#FFFFFF] hover:border-[#18352D]/40"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm sm:text-base text-[#18352D]">
                              {item.label}
                            </h4>
                            <span className="text-[10px] font-mono text-[#C46A42] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E5DEC9]">
                              {item.tag}
                            </span>
                          </div>
                          <p className="text-xs text-[#63736A] leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-[#18352D] bg-[#18352D] text-white"
                              : "border-[#D5CEBE] bg-[#FAF7F2]"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Mode */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <span className="text-xs font-mono text-[#C46A42]">STEP 03 // ACCESS MODEL</span>
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#18352D] mt-1">
                    Do you prefer to rent temporarily or acquire permanently?
                  </h3>
                  <p className="text-sm text-[#63736A] mt-1">
                    Both transaction models are protected by verified campus hubs and automated escrow refunds.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                  {MODES.map((item) => {
                    const isSelected = selectedMode === item.id;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedMode(item.id as any)}
                        className={`p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#FFFFFF] border-[#18352D] shadow-sm ring-1 ring-[#18352D]"
                            : "bg-[#FFFFFF]/70 border-[#E5DEC9] hover:bg-[#FFFFFF] hover:border-[#18352D]/40"
                        }`}
                      >
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-[#789681] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E5DEC9] inline-block">
                            {item.tag}
                          </span>
                          <h4 className="font-semibold text-base text-[#18352D]">
                            {item.label}
                          </h4>
                          <p className="text-xs text-[#63736A] leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-[#E5DEC9] flex items-center justify-between text-xs text-[#18352D] font-medium">
                          <span>Select option</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-[#18352D] bg-[#18352D] text-white"
                                : "border-[#D5CEBE]"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 4: Timeline */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <span className="text-xs font-mono text-[#C46A42]">STEP 04 // TIMELINE</span>
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#18352D] mt-1">
                    How long do you need the hardware in your possession?
                  </h3>
                  <p className="text-sm text-[#63736A] mt-1">
                    Tiered pricing scales automatically. Semester durations include free battery replacements and maintenance.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {TIMELINES.map((item) => {
                    const isSelected = selectedTimeline === item.id;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedTimeline(item.id)}
                        className={`p-4.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#FFFFFF] border-[#18352D] shadow-sm ring-1 ring-[#18352D]"
                            : "bg-[#FFFFFF]/70 border-[#E5DEC9] hover:bg-[#FFFFFF] hover:border-[#18352D]/40"
                        }`}
                      >
                        <div>
                          <h4 className="font-semibold text-sm sm:text-base text-[#18352D]">
                            {item.label}
                          </h4>
                          <p className="text-xs text-[#63736A] mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#E5DEC9] flex items-center justify-between text-xs font-mono text-[#63736A]">
                          <span>CALIBRATED TIER</span>
                          <span
                            className={
                              isSelected ? "text-[#C46A42] font-semibold" : "text-[#789681]"
                            }
                          >
                            {isSelected ? "Active selection" : "Available"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 5: Fleet Matches */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#789681] mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>RECOMMENDED FLEET // {matchedProducts.length} CERTIFIED MATCHES</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-[#18352D]">
                      Hardware calibrated for your requirements
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-[#63736A] hover:text-[#18352D] flex items-center gap-1.5 transition-colors self-start sm:self-auto font-medium"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset criteria</span>
                  </button>
                </div>

                {/* Match Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matchedProducts.map((p) => {
                    const price = calculateProductRate(p);
                    const image =
                      p?.images?.[0]?.url ||
                      (Array.isArray(p?.images) && p?.images[0]) ||
                      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80";

                    return (
                      <div
                        key={p.id}
                        className="bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9] p-4.5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#18352D] transition-all"
                      >
                        <div className="space-y-3">
                          {/* Image & Tags */}
                          <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E5DEC9]">
                            <img
                              src={image}
                              alt={p.title}
                              className="w-full h-full object-cover object-center"
                            />
                            <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-white/95 text-[10px] font-medium text-[#18352D] border border-[#E5DEC9] shadow-xs">
                                {p.conditionGrade || "Mint Grade"}
                              </span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-1 text-[11px] font-mono text-[#63736A] mb-1">
                              <MapPin className="w-3 h-3 text-[#C46A42]" />
                              <span>{p.campusHub || "Central Locker Hub A"}</span>
                            </div>
                            <h4 className="font-semibold text-base text-[#18352D] line-clamp-1">
                              {p.title}
                            </h4>
                            <p className="text-xs text-[#63736A] line-clamp-2 mt-1 leading-relaxed">
                              {p.description}
                            </p>
                          </div>
                        </div>

                        {/* Pricing & CTA */}
                        <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] text-[#63736A] block font-mono">
                              CALCULATED {selectedTimeline.toUpperCase()}
                            </span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="font-semibold text-lg text-[#18352D] font-mono tabular-nums">
                                {formatINR(price)}
                              </span>
                              <span className="text-xs text-[#63736A]">/{selectedTimeline}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onOpenProductDetail(
                                p.id,
                                selectedMode === "buy" ? "buy" : "rent",
                                selectedTimeline
                              );
                              onClose();
                            }}
                            className="px-3.5 py-2 rounded-xl bg-[#18352D] hover:bg-[#C46A42] text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Final Actions Callout */}
                <div className="bg-[#FAF7F2] p-4.5 rounded-2xl border border-[#E5DEC9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 text-xs text-[#63736A]">
                    <ShieldCheck className="w-4 h-4 text-[#789681] shrink-0" />
                    <span>
                      All listed hardware includes 100% automated escrow deposit refund and dual-OTP verification.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const discipline = DISCIPLINES.find((d) => d.id === selectedDiscipline);
                      onApplyFiltersToMarketplace(
                        discipline?.categorySlug || "all",
                        selectedMode,
                        selectedTimeline
                      );
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#C46A42] hover:bg-[#A8532F] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                  >
                    <span>View in marketplace grid</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Bottom Navigation Footer */}
        <div className="bg-[#FAF7F2] px-6 sm:px-8 py-4 border-t border-[#E5DEC9] flex items-center justify-between gap-4 shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#18352D] border border-[#E5DEC9] text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#63736A] hidden sm:inline">
              Step 0{currentStep} of 05
            </span>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-[#18352D] hover:bg-[#234C40] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C46A42]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#18352D] hover:bg-[#234C40] text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                <span>Done</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
