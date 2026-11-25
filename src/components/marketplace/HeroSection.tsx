"use client";

import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import {
  Search,
  Clock,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Compass,
  Maximize2,
} from "lucide-react";
import { formatINR } from "@/lib/pricing";

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
  onOpenProductDetail: (productId: string, initialMode?: "rent" | "buy", initialDuration?: string) => void;
  onOpenListProduct: () => void;
  onOpenHubModal: () => void;
  onOpenGuidedDiscovery?: () => void;
}

export function HeroSection({
  categories,
  heroProducts,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  transactionFilter,
  setTransactionFilter,
  preferredDuration,
  setPreferredDuration,
  onExplore,
  onOpenProductDetail,
  onOpenListProduct,
  onOpenHubModal,
  onOpenGuidedDiscovery,
}: HeroSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Active showcase item & duration tier
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeDuration, setActiveDuration] = useState<string>("weekly");

  // Multi-tier duration labels
  const durationTiers = [
    { id: "hourly", label: "Hourly" },
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "semester", label: "Semester" },
  ];

  // Curated hero showcase specimens with layered photography & technical coordinates
  const showcaseSpecimens = [
    {
      id: "prod_macbook_m3",
      specimenTag: "SPECIMEN // 001",
      discipline: "HIGH-PERFORMANCE COMPUTE",
      title: "Apple MacBook Pro M3 Max Workstation",
      primaryImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=85",
      secondaryImage: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
      condition: "Mint (Grade A+)",
      hub: "Central Handover Point • Zone 1",
      deposit: 8000,
      rates: { hourly: 150, daily: 699, weekly: 3499, monthly: 11999, semester: 29999 },
      telemetry: [
        { label: "01 // DISPLAY", value: "Liquid Retina XDR • 1,600 Nits HDR" },
        { label: "02 // ARCHITECTURE", value: "Apple M3 Max • 14-Core CPU / 30-Core GPU" },
        { label: "03 // SECURITY DEPOSIT", value: "100% Refundable Security Deposit upon Return" },
        { label: "04 // HANDOVER POINT", value: "Central Designated Handover Point" },
      ],
    },
    {
      id: "prod_sony_a7iv",
      specimenTag: "SPECIMEN // 002",
      discipline: "CINEMA OPTICS & PRODUCTION",
      title: "Sony Alpha 7 IV + FE 24-70mm f/2.8 GM",
      primaryImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=85",
      secondaryImage: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
      condition: "Studio Grade A",
      hub: "Media & Studio Exchange Bay",
      deposit: 9500,
      rates: { hourly: 190, daily: 899, weekly: 4200, monthly: 14500, semester: 38000 },
      telemetry: [
        { label: "01 // SENSOR", value: "33MP Full-Frame Exmor R • BIONZ XR Engine" },
        { label: "02 // RECORDING", value: "4K 60p 10-Bit 4:2:2 All-Intra Cinematic" },
        { label: "03 // OPTICS", value: "G-Master 24-70mm f/2.8 Constant Aperture" },
        { label: "04 // VERIFICATION", value: "Sensor Calibrated • 4-Angle Photo Inspection" },
      ],
    },
    {
      id: "prod_ti_nspire_cx2",
      specimenTag: "SPECIMEN // 003",
      discipline: "ACADEMIC & STEM COMPUTATION",
      title: "Texas Instruments Nspire CX II CAS",
      primaryImage: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=1400&q=85",
      secondaryImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
      condition: "Exam Permitted",
      hub: "Academic Handover Desk",
      deposit: 1500,
      rates: { hourly: 35, daily: 120, weekly: 450, monthly: 1200, semester: 2400 },
      telemetry: [
        { label: "01 // ENGINE", value: "Computer Algebra System (CAS) Engine" },
        { label: "02 // CERTIFIED", value: "Permitted on AP/SAT/Engineering Finals" },
        { label: "03 // HARDWARE", value: "3.2\" 320x240 High-Res Color Backlit Panel" },
        { label: "04 // GUARANTEE", value: "Fresh Battery Pack • Handover Point Collection" },
      ],
    },
  ];

  const currentSpecimen = showcaseSpecimens[activeIdx] || showcaseSpecimens[0];

  // Calculate live rate for current active specimen and duration
  const currentRate =
    currentSpecimen.rates[activeDuration as keyof typeof currentSpecimen.rates] ||
    currentSpecimen.rates.daily;

  // Real scroll-linked kinematics with Framer Motion (Corkwell Camera Zoom)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Scroll transforms for cinematic depth
  const headlineY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [0, -110]
  );
  const headlineOpacity = useTransform(
    scrollYProgress,
    [0, 0.6],
    shouldReduceMotion ? [1, 1] : [1, 0.1]
  );

  const productScale = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [1, 1] : [1, 1.09]
  );
  const productY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [0, 80]
  );

  const secondaryImageX = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [0, 60]
  );
  const secondaryImageRotate = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [-3, 6]
  );

  const telemetryY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [0, -50]
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-[110vh] bg-[#0E1F1A] text-[#F5F0E8] overflow-hidden pt-8 sm:pt-12 pb-32 sm:pb-40 border-b border-[#2C3831]"
    >
      {/* Corkwell Deep Obsidian to Forest Void Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#142921] via-[#0E1F1A] to-[#081210] pointer-events-none" />

      {/* Blueprint Coordinate Millimeter Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#274D42_1px,transparent_1px)] [background-size:28px_28px] opacity-35 pointer-events-none" />

      {/* Architectural Crosshair Guidelines */}
      <div className="absolute inset-x-8 top-0 h-px bg-white/10 pointer-events-none" />
      <div className="absolute left-8 inset-y-0 w-px bg-white/5 pointer-events-none hidden lg:block" />
      <div className="absolute right-8 inset-y-0 w-px bg-white/5 pointer-events-none hidden lg:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 sm:space-y-14">
        {/* Top Protocol Status Telemetry Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10 text-xs font-mono"
        >
          <div className="flex items-center gap-3 text-[#D6E0D9]">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-[#FAF7F2] border border-white/20 shrink-0 shadow-xs">
              <img src="/images/ywd-logo.png" alt="YwD Insignia" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-white">YwD CAMPUS INFRASTRUCTURE</span>
            <span className="text-white/30">{"//"}</span>
            <span>VERIFIED HARDWARE VAULT</span>
            <span className="text-white/30">•</span>
            <button
              type="button"
              onClick={onOpenHubModal}
              className="text-[#D6E0D9] hover:text-[#C46A42] underline underline-offset-4 transition-colors"
            >
              Handover hubs
            </button>
          </div>

          <div className="hidden md:flex items-center gap-6 text-[#D6E0D9]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#789681]" />
              <span>100% Escrow deposit safety</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#789681]" />
              <span>Zero peer phone exposure</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#789681]" />
              <span>Hourly to semester terms</span>
            </span>
          </div>
        </motion.div>

        {/* HERO TITLE & BRAND ESSENCE: CORKWELL MONUMENTAL SCALE */}
        <motion.div
          style={{ y: headlineY, opacity: headlineOpacity }}
          className="space-y-6 max-w-5xl"
        >
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-[#D6E0D9]"
          >
            <span className="w-2 h-2 rounded-full bg-[#C46A42]" />
            <span>COLLEGE EQUIPMENT ACCESS & VERIFIED RECOMMERCE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold tracking-tighter text-[#F5F0E8] leading-[0.92] select-none"
          >
            Own less.
            <br />
            <span className="font-light italic text-[#D6E0D9]">Experience</span>{" "}
            <span className="text-[#C46A42]">more.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-base sm:text-lg lg:text-xl text-[#D6E0D9] max-w-2xl leading-relaxed font-normal"
          >
            Borrow flagship workstations, cinema optics, and certified engineering instruments across campus. Guaranteed deposit security through automated escrow refunds.
          </motion.p>

          {/* Primary Action Suite */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <button
              type="button"
              onClick={onExplore}
              className="px-7 py-3.5 rounded-2xl bg-[#C46A42] hover:bg-[#A8532F] text-white font-semibold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-lg shadow-[#C46A42]/20 hover:gap-3"
            >
              <span>Explore marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenListProduct}
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-[#F5F0E8] border border-white/20 font-medium text-sm transition-all"
            >
              <span>List an item</span>
            </button>

            {onOpenGuidedDiscovery && (
              <button
                type="button"
                onClick={onOpenGuidedDiscovery}
                className="px-5 py-3.5 rounded-2xl bg-[#18352D] hover:bg-[#204439] text-[#D6E0D9] hover:text-white border border-[#789681]/40 font-medium text-xs sm:text-sm flex items-center gap-2 transition-all"
              >
                <Compass className="w-4 h-4 text-[#C46A42]" />
                <span>Launch guided discovery</span>
              </button>
            )}
          </motion.div>
        </motion.div>

        {/* ========================================================
            CORKWELL × CAMBER PRODUCT-LED HERO STAGE
            Asymmetric, Layered Photographic Composition with Telemetry HUD
           ======================================================== */}
        <div className="relative pt-4 sm:pt-6">
          {/* Hardware Specimen Switcher Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-[#D6E0D9]">
              <span className="text-[#C46A42] font-semibold">{currentSpecimen.specimenTag}</span>
              <span className="text-white/30">•</span>
              <span>{currentSpecimen.discipline}</span>
            </div>

            {/* Specimen Switcher Buttons */}
            <div className="flex items-center gap-2">
              {showcaseSpecimens.map((specimen, idx) => (
                <button
                  key={specimen.id}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    activeIdx === idx
                      ? "bg-[#C46A42] text-white font-semibold shadow-sm"
                      : "bg-white/5 hover:bg-white/10 text-[#D6E0D9] border border-white/10"
                  }`}
                >
                  0{idx + 1} {specimen.id.includes("macbook") ? "M3 Max" : specimen.id.includes("sony") ? "A7 IV" : "TI-CAS"}
                </button>
              ))}
            </div>
          </div>

          {/* Monumental Asymmetric Stage Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* LEFT / CENTER: Master Layered Product Staging (7 cols) */}
            <div className="lg:col-span-7 relative">
              {/* Secondary Deconstruction Angle (Layered Behind with Offset & Parallax) */}
              <motion.div
                style={{
                  x: secondaryImageX,
                  rotate: secondaryImageRotate,
                }}
                className="absolute -top-6 -right-4 sm:-right-8 w-2/3 h-52 sm:h-72 rounded-2xl overflow-hidden border border-[#2C3831] opacity-45 pointer-events-none hidden sm:block shadow-2xl"
              >
                <img
                  src={currentSpecimen.secondaryImage}
                  alt={`${currentSpecimen.title} Chassis Angle`}
                  className="w-full h-full object-cover grayscale contrast-125"
                />
                <div className="absolute inset-0 bg-[#0E1F1A]/40" />
              </motion.div>

              {/* Master Photographic Hero Pedestal */}
              <motion.div
                style={{
                  scale: productScale,
                  y: productY,
                }}
                onClick={() => onOpenProductDetail(currentSpecimen.id, "rent", activeDuration)}
                className="relative aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden bg-[#0A1713] border border-[#2C3831] shadow-2xl group cursor-pointer"
              >
                <img
                  src={currentSpecimen.primaryImage}
                  alt={currentSpecimen.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Ambient Deep Shadow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#081210] via-[#081210]/30 to-transparent" />

                {/* Corner Status Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-lg bg-[#18352D]/90 backdrop-blur-md text-xs font-semibold text-white border border-[#2C3831] flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#789681]" />
                    <span>{currentSpecimen.condition}</span>
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-[#18352D]/90 backdrop-blur-md text-xs font-mono text-[#D6E0D9] border border-[#2C3831] shadow-sm">
                    Deposit: {formatINR(currentSpecimen.deposit)} (100% Refundable)
                  </span>
                </div>

                {/* Bottom Title Bar with Inspect Trigger */}
                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 flex items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#D6E0D9] font-mono mb-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C46A42]" />
                      <span>{currentSpecimen.hub}</span>
                    </div>
                    <h3 className="text-xl sm:text-3xl font-semibold text-white tracking-tight line-clamp-1">
                      {currentSpecimen.title}
                    </h3>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-[#C46A42] flex items-center justify-center text-white transition-colors shrink-0">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>

              {/* Corkwell Architectural Coordinate Callouts (Under Hero Canvas) */}
              <motion.div
                style={{ y: telemetryY }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 text-xs font-mono text-[#D6E0D9]"
              >
                {currentSpecimen.telemetry.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5"
                  >
                    <span className="text-[10px] text-[#C46A42] block font-semibold">{t.label}</span>
                    <span className="text-[11px] text-white font-medium block truncate">{t.value}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT: Live Duration Calculator & Access Terminal (5 cols) */}
            <div className="lg:col-span-5 bg-[#142921] rounded-3xl p-6 sm:p-8 border border-[#2C3831] shadow-2xl space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#C46A42] font-semibold">
                    RATE TERMINAL // COLLISION-FREE LOAN
                  </span>
                  <span className="text-[11px] font-mono text-[#789681] bg-[#789681]/15 px-2 py-0.5 rounded border border-[#789681]/30">
                    Instant Availability
                  </span>
                </div>
                <h4 className="text-xl font-semibold text-white mt-1">
                  Duration tier calculator
                </h4>
                <p className="text-xs text-[#D6E0D9] mt-1 leading-relaxed">
                  Transparent upfront rates without hidden penalty fees. Return equipment at any campus locker to trigger 100% UPI escrow refund.
                </p>
              </div>

              {/* Duration Buttons Grid */}
              <div className="grid grid-cols-5 gap-1 bg-[#0A1713] p-1.5 rounded-2xl border border-[#2C3831]">
                {durationTiers.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setActiveDuration(tier.id)}
                    className={`py-2 text-center rounded-xl text-xs font-medium transition-all ${
                      activeDuration === tier.id
                        ? "bg-[#C46A42] text-white font-semibold shadow-sm"
                        : "text-[#D6E0D9] hover:text-white"
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Calculation Box */}
              <div className="p-5 rounded-2xl bg-[#0A1713] border border-[#2C3831] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#D6E0D9] block font-mono">
                    CALCULATED {activeDuration.toUpperCase()} TIER
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-semibold text-3xl sm:text-4xl text-white font-mono tabular-nums">
                      {formatINR(currentRate)}
                    </span>
                    <span className="text-xs text-[#D6E0D9]">/{activeDuration}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-[#D6E0D9] block font-mono">ESCROW DEPOSIT</span>
                  <span className="text-sm font-mono font-semibold text-[#789681] mt-1 block">
                    {formatINR(currentSpecimen.deposit)}
                  </span>
                  <span className="text-[10px] text-[#D6E0D9]/70 font-mono block">100% Refundable</span>
                </div>
              </div>

              {/* Action Suite */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenProductDetail(currentSpecimen.id, "rent", activeDuration)}
                  className="w-full py-3.5 rounded-2xl bg-[#C46A42] hover:bg-[#A8532F] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md shadow-[#C46A42]/20"
                >
                  <span>Reserve with automated escrow</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onExplore}
                    className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#D6E0D9] hover:text-white border border-white/10 font-medium text-xs transition-colors text-center"
                  >
                    Browse full inventory
                  </button>

                  <button
                    type="button"
                    onClick={onOpenListProduct}
                    className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#D6E0D9] hover:text-white border border-white/10 font-medium text-xs transition-colors text-center"
                  >
                    List your equipment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiet Omni-Search Instrument: Integrated seamlessly in dark cinema theme */}
        <div className="bg-[#0A1713]/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-[#2C3831] shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#D6E0D9] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search MacBook Pro, Sony A7 IV, Lab instruments, Graphic tablets..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#142921] border border-[#2C3831] text-xs sm:text-sm text-[#F5F0E8] placeholder-[#789681] focus:outline-none focus:border-[#C46A42] transition-colors"
              />
            </div>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by Category"
              className="px-4 py-3 rounded-2xl bg-[#142921] border border-[#2C3831] text-xs font-medium text-[#F5F0E8] focus:outline-none focus:border-[#C46A42] cursor-pointer"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Transaction Mode Toggle */}
            <div className="flex items-center bg-[#142921] p-1 rounded-2xl border border-[#2C3831]">
              {[
                { id: "all", label: "All" },
                { id: "rent", label: "Rent" },
                { id: "buy", label: "Buy" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setTransactionFilter(m.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                    transactionFilter === m.id
                      ? "bg-[#C46A42] text-white font-semibold"
                      : "text-[#D6E0D9] hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Search Action */}
            <button
              type="button"
              onClick={onExplore}
              className="px-6 py-3 rounded-2xl bg-[#C46A42] hover:bg-[#A8532F] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cinematic Transition Blade into Next Section (SpecimenDeck #FAF7F2 parchment) */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#FAF7F2] pointer-events-none" />
    </section>
  );
}
