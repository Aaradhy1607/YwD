"use client";

import React from "react";
import { ArrowRight, MapPin, CheckCircle2 } from "lucide-react";
import { formatINR } from "@/lib/pricing";

interface SpecimenCard {
  id: string;
  productId: string;
  specimenNo: string;
  title: string;
  category: string;
  image: string;
  rate: number;
  unit: string;
  deposit: number;
  hub: string;
  rotation: string;
  specs: string;
}

const SPECIMENS: SpecimenCard[] = [
  {
    id: "spec_cinema",
    productId: "prod_sony_a7iv",
    specimenNo: "SPECIMEN // 001",
    title: "Sony Alpha A7 IV Cinema Rig",
    category: "Optics & Camera Systems",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    rate: 1299,
    unit: "day",
    deposit: 15000,
    hub: "Central Locker Hub A",
    rotation: "-rotate-1",
    specs: "33MP Full-Frame • 4K60p 10-Bit • Dual Card Slots",
  },
  {
    id: "spec_compute",
    productId: "prod_macbook_m3",
    specimenNo: "SPECIMEN // 002",
    title: "Apple MacBook Pro M3 Max",
    category: "High-Performance Workstations",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    rate: 699,
    unit: "day",
    deposit: 8000,
    hub: "Engineering Quad Hub",
    rotation: "rotate-1",
    specs: "14-Core CPU • 36GB Unified RAM • Liquid Retina XDR",
  },
  {
    id: "spec_audio",
    productId: "prod_sony_wh1000xm5",
    specimenNo: "SPECIMEN // 003",
    title: "Genelec 8010A Studio Monitors",
    category: "Acoustics & Monitoring",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    rate: 450,
    unit: "day",
    deposit: 4000,
    hub: "Library Pavilion Lockers",
    rotation: "-rotate-2",
    specs: "Pair Active Monitors • Aluminum Iso-Pod Base",
  },
  {
    id: "spec_stem",
    productId: "prod_ti_nspire_cx2",
    specimenNo: "SPECIMEN // 004",
    title: "Texas Instruments Nspire CX II CAS",
    category: "Scientific & Academic Tools",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
    rate: 149,
    unit: "day",
    deposit: 1500,
    hub: "Central Locker Hub A",
    rotation: "rotate-2",
    specs: "Computer Algebra System • Color Backlit Display",
  },
];

export function SpecimenDeck({
  onOpenProductDetail,
  onExplore,
}: {
  onOpenProductDetail: (productId: string, mode?: "rent" | "buy", duration?: string) => void;
  onExplore: () => void;
}) {
  return (
    <section className="py-20 sm:py-24 bg-[#FAF7F2] border-b border-[#E5DEC9] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E5DEC9]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#63736A] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#C46A42]" />
              <span>FIELD-TESTED SPECIMENS // 4 DISCIPLINES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#18352D] tracking-tight leading-[1.1]">
              Four disciplines. Field ready
            </h2>
            <p className="text-base text-[#63736A] mt-3 max-w-xl leading-relaxed">
              Archival equipment tiers maintained and calibrated for immediate campus loan. Pinned specifications backed by automated escrow protection.
            </p>
          </div>

          <button
            type="button"
            onClick={onExplore}
            className="text-xs sm:text-sm font-medium text-[#18352D] hover:text-[#C46A42] flex items-center gap-1.5 transition-colors self-start md:self-auto"
          >
            <span>Explore all specimens</span>
            <ArrowRight className="w-4 h-4 text-[#C46A42]" />
          </button>
        </div>

        {/* Tilted Specimen Card Rail (Inspired by Camber's 'Four Ways') */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 pt-4">
          {SPECIMENS.map((spec) => (
            <div
              key={spec.id}
              onClick={() => onOpenProductDetail(spec.productId, "rent", "daily")}
              className={`bg-[#FFFFFF] p-3 sm:p-3.5 rounded-xl border border-[#E5DEC9] shadow-sm hover:shadow-md hover:border-[#789681] transition-all cursor-pointer group flex flex-col justify-between ${spec.rotation}`}
            >
              <div className="space-y-3">
                {/* Photographic Canvas */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#FAF7F2] border border-[#E5DEC9]">
                  <img
                    src={spec.image}
                    alt={spec.title}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FFFFFF]/95 text-[10px] font-mono text-[#18352D] border border-[#E5DEC9]">
                    {spec.specimenNo}
                  </div>
                </div>

                {/* Metadata Body */}
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-[#789681] block">
                    {spec.category}
                  </span>
                  <h3 className="font-semibold text-sm text-[#18352D] group-hover:text-[#C46A42] transition-colors line-clamp-1">
                    {spec.title}
                  </h3>
                  <p className="text-[11px] text-[#63736A] line-clamp-1 font-mono">
                    {spec.specs}
                  </p>
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="pt-3 mt-3 border-t border-[#E5DEC9] flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="font-semibold text-sm text-[#18352D] font-mono tabular-nums">
                      {formatINR(spec.rate)}
                    </span>
                    <span className="text-[11px] text-[#63736A]">/{spec.unit}</span>
                  </div>
                  <span className="text-[10px] text-[#789681] font-mono block">
                    Deposit: {formatINR(spec.deposit)}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-medium text-[#18352D] group-hover:text-[#C46A42] transition-colors">
                  <span>Inspect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

