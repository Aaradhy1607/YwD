"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, MapPin, Sparkles, CheckCircle2 } from "lucide-react";
import { formatINR } from "@/lib/pricing";

interface SpecimenCard {
  id: string;
  productId: string;
  specimenNo: string;
  indexTag: string;
  title: string;
  discipline: string;
  image: string;
  rate: number;
  unit: string;
  deposit: number;
  hub: string;
  specs: string;
  telemetry: string;
}

const SPECIMENS: SpecimenCard[] = [
  {
    id: "spec_cinema",
    productId: "prod_sony_a7iv",
    specimenNo: "SPEC // 01",
    indexTag: "01 / 04",
    title: "Sony Alpha A7 IV Cinema Rig",
    discipline: "Optics & Camera Systems",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    rate: 1299,
    unit: "day",
    deposit: 9500,
    hub: "Central Locker Bay C",
    specs: "33MP Full-Frame • 4K60p 10-Bit All-Intra",
    telemetry: "SENSOR // CALIBRATED • DUAL V90 SLOTS",
  },
  {
    id: "spec_compute",
    productId: "prod_macbook_m3",
    specimenNo: "SPEC // 02",
    indexTag: "02 / 04",
    title: "Apple MacBook Pro M3 Max",
    discipline: "High-Performance Workstations",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    rate: 699,
    unit: "day",
    deposit: 8000,
    hub: "Engineering Quad Locker Bay A",
    specs: "14-Core CPU • 36GB Unified RAM • XDR Display",
    telemetry: "ARCH // APPLE SILICON • BATTERY 98%",
  },
  {
    id: "spec_audio",
    productId: "prod_teenage_op1",
    specimenNo: "SPEC // 03",
    indexTag: "03 / 04",
    title: "Teenage Engineering OP-1 Field",
    discipline: "Acoustics & Sound Synthesis",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
    rate: 850,
    unit: "day",
    deposit: 11000,
    hub: "Sound Conservatory Bay 10",
    specs: "Stereo 24-bit 96kHz • 4-Track Tape Emulation",
    telemetry: "AUDIO // MASTER GRADE • ALUMINUM BODY",
  },
  {
    id: "spec_stem",
    productId: "prod_ti_nspire_cx2",
    specimenNo: "SPEC // 04",
    indexTag: "04 / 04",
    title: "Texas Instruments Nspire CX II CAS",
    discipline: "STEM Academic Computation",
    image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
    rate: 149,
    unit: "day",
    deposit: 1500,
    hub: "Library Pavilion Counter 4",
    specs: "Computer Algebra System • Color Backlit Display",
    telemetry: "STATUS // EXAM PERMITTED • FRESH BATTERY",
  },
];

interface SpecimenDeckProps {
  onOpenProductDetail: (productId: string, mode?: "rent" | "buy", duration?: string) => void;
  onExplore: () => void;
  cosmicMode?: boolean;
}

// 3D Perspective Card Component with interactive light glare
function InteractiveSpecimenCard({
  spec,
  cosmicMode,
  onClick,
}: {
  spec: SpecimenCard;
  cosmicMode: boolean;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotX = ((y / rect.height - 0.5) * -16);
    const rotY = ((x / rect.width - 0.5) * 16);

    setRotate({ x: rotX, y: rotY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.18,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
      }}
      className="cursor-pointer group select-none"
    >
      <div
        style={{
          transform: `rotateX(${rotate.x.toFixed(1)}deg) rotateY(${rotate.y.toFixed(1)}deg)`,
          transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease",
        }}
        className={`relative rounded-3xl p-4 sm:p-5 border flex flex-col justify-between overflow-hidden will-change-transform transition-all duration-300 ${
          cosmicMode
            ? "bg-[#0A120E]/90 border-white/10 hover:border-emerald-500/50 shadow-2xl hover:shadow-[0_0_35px_rgba(16,185,129,0.18)] text-white"
            : "bg-[#FFFFFF] border-[#E5DEC9] hover:border-[#18352D] shadow-sm hover:shadow-xl text-[#18352D]"
        }`}
      >
        {/* Dynamic Light Sheen Glare */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
          }}
        />

        {/* Top Telemetry Header */}
        <div className="flex items-center justify-between pb-3 border-b border-current/10 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                cosmicMode ? "bg-emerald-400 animate-pulse" : "bg-[#C46A42]"
              }`}
            />
            <span className="font-semibold tracking-wider">{spec.specimenNo}</span>
          </div>
          <span className="opacity-50 text-[10px] tracking-widest">{spec.indexTag}</span>
        </div>

        {/* Photographic Specimen Window */}
        <div className="relative aspect-[16/11] rounded-2xl overflow-hidden my-3 border border-current/10">
          <img
            src={spec.image}
            alt={spec.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Registration Crosshairs */}
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute top-2 left-2 text-[10px] font-mono text-emerald-400/80">+</span>
            <span className="absolute top-2 right-2 text-[10px] font-mono text-emerald-400/80">+</span>
            <span className="absolute bottom-2 left-2 text-[10px] font-mono text-emerald-400/80">+</span>
            <span className="absolute bottom-2 right-2 text-[10px] font-mono text-emerald-400/80">+</span>
          </div>

          <div className="absolute bottom-2 left-2 right-2 text-white">
            <span className="text-[9px] font-mono tracking-widest text-emerald-400 uppercase block">
              {spec.telemetry}
            </span>
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono uppercase tracking-wider opacity-60 block">
            {spec.discipline}
          </span>
          <h3
            className={`font-semibold text-base sm:text-lg tracking-tight line-clamp-1 transition-colors ${
              cosmicMode ? "group-hover:text-emerald-400" : "group-hover:text-[#C46A42]"
            }`}
          >
            {spec.title}
          </h3>
          <p className="text-xs opacity-70 line-clamp-1 font-mono">{spec.specs}</p>
        </div>

        {/* Bottom Rate & Inspection Action */}
        <div className="pt-4 mt-3 border-t border-current/10 flex items-center justify-between text-xs">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-base font-bold tabular-nums">
                {formatINR(spec.rate)}
              </span>
              <span className="text-[11px] opacity-60">/{spec.unit}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
              Escrow Deposit: {formatINR(spec.deposit)}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              cosmicMode
                ? "bg-white/5 border-white/10 group-hover:bg-emerald-400 group-hover:text-black group-hover:border-emerald-400"
                : "bg-[#18352D]/5 border-[#18352D]/15 group-hover:bg-[#C46A42] group-hover:text-white group-hover:border-[#C46A42]"
            }`}
          >
            <span>Inspect</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SpecimenDeck({
  onOpenProductDetail,
  onExplore,
  cosmicMode = true,
}: SpecimenDeckProps) {
  return (
    <section
      className={`py-20 sm:py-28 border-b transition-colors duration-1000 relative overflow-hidden ${
        cosmicMode
          ? "bg-[#060A08] text-[#F3F4F6] border-white/10"
          : "bg-[#FAF7F2] text-[#18352D] border-[#E5DEC9]"
      }`}
    >
      {/* Background Ambience */}
      {cosmicMode && (
        <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:36px_36px] opacity-10 pointer-events-none" />
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12 relative z-10">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-current/10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono tracking-[0.2em] uppercase backdrop-blur-md transition-colors bg-white/5 border-current/15">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>FIELD-TESTED HARDWARE // 4 DISCIPLINES</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.05]">
              Four disciplines.{" "}
              <span className="font-serif italic font-light text-emerald-400">Field ready.</span>
            </h2>

            <p className="text-sm sm:text-base opacity-75 max-w-xl leading-relaxed">
              Archival equipment tiers maintained and calibrated for immediate campus loan. Pinned
              hardware specifications backed by automated escrow protection.
            </p>
          </div>

          <button
            type="button"
            onClick={onExplore}
            className={`text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all self-start md:self-auto px-5 py-2.5 rounded-full border ${
              cosmicMode
                ? "bg-white/5 border-white/15 hover:border-emerald-400 text-white hover:text-emerald-400"
                : "bg-white border-[#E5DEC9] hover:border-[#18352D] text-[#18352D]"
            }`}
          >
            <span>Explore all specimens</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

        {/* 3D Interactive Card Rail */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {SPECIMENS.map((spec) => (
            <InteractiveSpecimenCard
              key={spec.id}
              spec={spec}
              cosmicMode={cosmicMode}
              onClick={() => onOpenProductDetail(spec.productId, "rent", "daily")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
