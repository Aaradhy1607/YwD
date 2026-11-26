"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ShieldCheck,
  Lock,
  ArrowRight,
  MapPin,
  Compass,
  Clock,
} from "lucide-react";
import { formatINR } from "@/lib/pricing";
import { DURATION, EASING, usePrefersReducedMotion } from "@/lib/motion";

interface HeroSectionProps {
  categories: any[];
  heroProducts: any[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  transactionFilter: "all" | "rent" | "buy";
  setTransactionFilter: (f: "all" | "rent" | "buy") => void;
  preferredDuration: string;
  setPreferredDuration: (d: string) => void;
  onExplore: () => void;
  onOpenProductDetail: (
    productId: string,
    initialMode?: "rent" | "buy",
    initialDuration?: string
  ) => void;
  onOpenListProduct: () => void;
  onOpenHubModal: () => void;
  onOpenGuidedDiscovery?: () => void;
}

const FALLBACK_HERO_ITEMS = [
  {
    id: "prod_macbook_m3",
    title: "Apple MacBook Pro 14\" M3 Max",
    conditionGrade: "Mint (Grade A+)",
    campusHub: "Central Handover Point • Zone 1",
    deposit: 8000,
    rentalPriceHourly: 150,
    rentalPriceDaily: 699,
    rentalPriceWeekly: 3499,
    rentalPriceMonthly: 11999,
    rentalPriceSemester: 29999,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=85",
    ],
  },
  {
    id: "prod_sony_a7iv",
    title: "Sony Alpha 7 IV + 24-70mm GM",
    conditionGrade: "Studio Grade A",
    campusHub: "Media & Studio Exchange Bay",
    deposit: 9500,
    rentalPriceHourly: 190,
    rentalPriceDaily: 899,
    rentalPriceWeekly: 4200,
    rentalPriceMonthly: 14500,
    rentalPriceSemester: 38000,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85",
    ],
  },
  {
    id: "prod_ti_nspire_cx2",
    title: "TI-Nspire CX II CAS Calculator",
    conditionGrade: "Exam Permitted",
    campusHub: "Academic Handover Desk",
    deposit: 1500,
    rentalPriceHourly: 35,
    rentalPriceDaily: 120,
    rentalPriceWeekly: 450,
    rentalPriceMonthly: 1200,
    rentalPriceSemester: 2400,
    images: [
      "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=1200&q=85",
    ],
  },
];

export function HeroSection({
  categories,
  heroProducts,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  transactionFilter,
  setTransactionFilter,
  onExplore,
  onOpenProductDetail,
  onOpenListProduct,
  onOpenHubModal,
  onOpenGuidedDiscovery,
}: HeroSectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeDuration, setActiveDuration] = useState<string>("weekly");

  const featuredItems = useMemo(() => {
    if (Array.isArray(heroProducts) && heroProducts.length > 0) {
      return heroProducts.slice(0, 3);
    }
    return FALLBACK_HERO_ITEMS;
  }, [heroProducts]);

  const currentItem = featuredItems[activeIdx] || featuredItems[0];

  const getRateForDuration = (item: any, tier: string) => {
    if (!item) return 0;
    switch (tier) {
      case "weekly":
        return item.rentalPriceWeekly || 0;
      case "semester":
        return item.rentalPriceSemester || Math.round((item.rentalPriceWeekly || 0) * 8.5);
      case "daily":
      default:
        return item.rentalPriceDaily || 0;
    }
  };

  const currentRate = getRateForDuration(currentItem, activeDuration);
  const currentImage =
    (Array.isArray(currentItem?.images) &&
      (typeof currentItem.images[0] === "string"
        ? currentItem.images[0]
        : currentItem.images[0]?.url)) ||
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=85";

  const durationTiers = [
    { id: "daily", label: "Per Day" },
    { id: "weekly", label: "Per Week" },
    { id: "semester", label: "Semester" },
  ];

  return (
    <section className="relative bg-[#0E1F1A] text-[#F5F0E8] border-b border-[#2C3831] pt-8 sm:pt-12 pb-14 sm:pb-18 overflow-hidden">
      {/* Subtle architectural millimeter dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#274D42_1px,transparent_1px)] [background-size:28px_28px] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 sm:space-y-12">
        {/* Top Editorial Club Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2.5 text-[#D6E0D9]">
            <span className="font-mono uppercase tracking-[0.18em] text-[11px] font-semibold text-white">
              Modern Campus Club
            </span>
            <span className="text-white/25">•</span>
            <button
              type="button"
              onClick={onOpenHubModal}
              className="text-[#D6E0D9] hover:text-[#C46A42] underline underline-offset-4 transition-colors font-medium"
            >
              Campus handover hubs
            </button>
          </div>

          <div className="hidden md:flex items-center gap-6 text-[#D6E0D9]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#789681]" />
              <span>Protected security deposits</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#789681]" />
              <span>Anonymous relay chat</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#789681]" />
              <span>Hourly to semester terms</span>
            </span>
          </div>
        </div>

        {/* Asymmetric Editorial Hero Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT: Expressive Editorial Typography & Primary Actions (7 cols) */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.normal, ease: EASING.easeOutCubic }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-[11px] font-medium text-[#D6E0D9]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C46A42]" />
              <span>Curated campus rental &amp; recommerce</span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#F5F0E8] leading-[1.02]">
              Good things{" "}
              <span className="italic text-[#C46A42]">don&apos;t need</span>{" "}
              to be owned.
            </h1>

            <p className="text-base sm:text-lg text-[#D6E0D9] max-w-xl leading-relaxed">
              Borrow laptops, cameras, lab kits, and campus essentials from verified peers—for a weekend project, an exam week, or an entire semester.
            </p>

            {/* Primary & Secondary Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onExplore}
                className="px-6 py-3.5 rounded-xl bg-[#C46A42] hover:bg-[#A8532F] text-white font-semibold text-sm flex items-center gap-2 transition-colors"
              >
                <span>Explore marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenListProduct}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#F5F0E8] border border-white/20 font-semibold text-sm transition-colors"
              >
                List an item
              </button>

              {onOpenGuidedDiscovery && (
                <button
                  type="button"
                  onClick={onOpenGuidedDiscovery}
                  className="px-4 py-3.5 rounded-xl text-[#D6E0D9] hover:text-white font-medium text-sm flex items-center gap-1.5 transition-colors"
                >
                  <Compass className="w-4 h-4 text-[#C46A42]" />
                  <span>Guided discovery</span>
                </button>
              )}
            </div>
          </motion.div>

          {/* RIGHT: Curated Featured Product Editorial Card (5 cols) */}
          <div className="lg:col-span-5 bg-[#142921] rounded-3xl border border-[#2C3831] overflow-hidden shadow-2xl">
            {/* Switcher Header */}
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#9BB5A3]">
                Featured on campus
              </span>
              <div className="flex items-center gap-1.5">
                {featuredItems.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    aria-label={`Preview ${item.title}`}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                      activeIdx === idx
                        ? "bg-[#C46A42] text-white font-semibold"
                        : "bg-white/5 text-[#D6E0D9] border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    0{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Product Image */}
            <div
              onClick={() =>
                onOpenProductDetail(currentItem.id, "rent", activeDuration)
              }
              className="relative aspect-[16/10] bg-[#0A1713] overflow-hidden cursor-pointer group"
            >
              <img
                src={currentImage}
                alt={currentItem.title}
                decoding="async"
                className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1713]/70 via-transparent to-transparent" />
              {currentItem.conditionGrade && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0E1F1A]/90 text-[#F5F0E8] border border-white/15 text-[11px] font-medium">
                  {currentItem.conditionGrade}
                </span>
              )}
            </div>

            {/* Card Body & Live Rate */}
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-[#9BB5A3] mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C46A42]" />
                  <span className="truncate">
                    {currentItem.campusHub || "Central Handover Point"}
                  </span>
                </div>
                <h2 className="font-semibold text-lg text-white line-clamp-1">
                  {currentItem.title}
                </h2>
              </div>

              {/* Duration Switcher */}
              <div className="grid grid-cols-4 gap-1 bg-[#0A1713] p-1 rounded-xl border border-[#2C3831]">
                {durationTiers.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setActiveDuration(tier.id)}
                    className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeDuration === tier.id
                        ? "bg-[#C46A42] text-white font-semibold"
                        : "text-[#D6E0D9] hover:text-white"
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              {/* Rate & Reserve Row */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-semibold text-2xl text-white font-mono tabular-nums">
                      {formatINR(currentRate)}
                    </span>
                    <span className="text-xs text-[#9BB5A3]">
                      /{activeDuration}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#789681] font-mono block">
                    Deposit {formatINR(currentItem.deposit)} (Refundable)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onOpenProductDetail(currentItem.id, "rent", activeDuration)
                  }
                  className="px-4 py-2.5 rounded-xl bg-[#C46A42] hover:bg-[#A8532F] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <span>Reserve</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Dark Omni-Search Instrument */}
        <div className="bg-[#0A1713] p-3 sm:p-3.5 rounded-2xl border border-[#2C3831]">
          <div className="flex flex-col md:flex-row md:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9BB5A3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onExplore();
                }}
                placeholder="Search MacBook Pro, Sony A7 IV, calculators, lab kits..."
                aria-label="Search marketplace gear"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#142921] border border-[#2C3831] text-xs sm:text-sm text-[#F5F0E8] placeholder-[#789681] focus:outline-none focus:border-[#C46A42] transition-colors"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by Category"
              className="px-3.5 py-2.5 rounded-xl bg-[#142921] border border-[#2C3831] text-xs font-medium text-[#F5F0E8] focus:outline-none focus:border-[#C46A42] cursor-pointer"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="flex items-center bg-[#142921] p-1 rounded-xl border border-[#2C3831]">
              {[
                { id: "all", label: "All" },
                { id: "rent", label: "Rent" },
                { id: "buy", label: "Buy" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setTransactionFilter(m.id as "all" | "rent" | "buy")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    transactionFilter === m.id
                      ? "bg-[#C46A42] text-white"
                      : "text-[#D6E0D9] hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onExplore}
              className="px-5 py-2.5 rounded-xl bg-[#C46A42] hover:bg-[#A8532F] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
