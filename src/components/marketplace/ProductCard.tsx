"use client";

import React, { useState } from "react";
import { Heart, MapPin, ArrowRight, CheckCircle2, ShieldCheck, Maximize2 } from "lucide-react";
import { formatINR } from "@/lib/pricing";

interface ProductCardProps {
  product: any;
  durationTier?: string;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onOpenDetail: (productId: string, mode?: "rent" | "buy", duration?: string) => void;
}

export function ProductCard({
  product,
  durationTier = "daily",
  isWishlisted,
  onToggleWishlist,
  onOpenDetail,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedTier, setSelectedTier] = useState(durationTier);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  const images = Array.isArray(product.images)
    ? product.images.map((img: any) => (typeof img === "string" ? img : img?.url))
    : [];

  const conditionPhotos = Array.isArray(product.conditionPhotos)
    ? product.conditionPhotos.map((img: any) => (typeof img === "string" ? img : img?.url))
    : [];

  const primaryImage =
    images[0] ||
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80";

  const secondaryImage =
    conditionPhotos[1] ||
    images[1] ||
    conditionPhotos[0] ||
    primaryImage;

  const getDisplayRate = (tier: string) => {
    switch (tier) {
      case "hourly":
        return {
          rate: product.rentalPriceHourly || Math.round(product.rentalPriceDaily / 6),
          unit: "hr",
        };
      case "weekly":
        return {
          rate: product.rentalPriceWeekly,
          unit: "wk",
        };
      case "monthly":
        return {
          rate: product.rentalPriceMonthly || Math.round(product.rentalPriceWeekly * 3.4),
          unit: "mo",
        };
      case "semester":
        return {
          rate: product.rentalPriceSemester || Math.round(product.rentalPriceWeekly * 8.5),
          unit: "sem",
        };
      case "daily":
      default:
        return {
          rate: product.rentalPriceDaily,
          unit: "day",
        };
    }
  };

  const { rate, unit } = getDisplayRate(selectedTier);

  // Extract up to 3 hardware specs for Basalt-style deconstruction
  const specs = product.specs ? Object.entries(product.specs).slice(0, 3) : [];
  const specimenIndex = product.id
    ? product.id.replace("prod_", "").toUpperCase().slice(0, 6)
    : "001";

  return (
    <div
      onClick={() => onOpenDetail(product.id, "rent", selectedTier)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9] overflow-hidden flex flex-col justify-between hover:border-[#18352D] hover:shadow-xl transition-all duration-300 group cursor-pointer relative"
    >
      {/* Camber Blueprint Parchment Grid Texture behind Card */}
      <div className="absolute inset-0 bg-[radial-gradient(#E8E2D2_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

      <div className="relative z-10">
        {/* Camber Top Specimen Banner */}
        <div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#E5DEC9] flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C46A42]" />
            <span className="text-[#18352D] font-bold">
              SPEC // {specimenIndex}
            </span>
          </div>
          <span className="text-[#789681] font-semibold uppercase tracking-wider text-[10px]">
            {product.categorySlug || "Fleet"} • {product.conditionGrade || "Mint"}
          </span>
        </div>

        {/* Basalt Deconstructed Hardware Canvas */}
        <div className="relative aspect-[16/11] bg-[#11231E] overflow-hidden">
          {/* Subtle millimeter coordinate grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#2C483F_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          {/* Primary View */}
          <img
            src={primaryImage}
            alt={product.title}
            className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${
              isHovered && secondaryImage !== primaryImage
                ? "opacity-0 scale-105"
                : "opacity-100 scale-100"
            }`}
          />

          {/* Secondary Camber/Basalt Angle (Crossfades on Hover) */}
          {secondaryImage !== primaryImage && (
            <img
              src={secondaryImage}
              alt={`${product.title} Internal Angle`}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
                isHovered ? "opacity-100 scale-105" : "opacity-0 scale-95"
              }`}
            />
          )}

          {/* Corner Registration Crosshairs (Basalt Style) */}
          <div className="absolute top-2.5 left-2.5 text-white/35 font-mono text-[9px] pointer-events-none select-none">
            +
          </div>
          <div className="absolute top-2.5 right-2.5 text-white/35 font-mono text-[9px] pointer-events-none select-none">
            +
          </div>
          <div className="absolute bottom-2.5 left-2.5 text-white/35 font-mono text-[9px] pointer-events-none select-none">
            +
          </div>
          <div className="absolute bottom-2.5 right-2.5 text-white/35 font-mono text-[9px] pointer-events-none select-none">
            +
          </div>

          {/* Exploded Numbered Pins (Camber "Eleven Pieces" aesthetic on hover) */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute top-1/4 left-1/4 px-1.5 py-0.5 rounded-full bg-[#18352D]/90 border border-white/30 text-white text-[9px] font-mono shadow-sm">
              01 // OPTICS
            </div>
            <div className="absolute bottom-1/3 right-1/4 px-1.5 py-0.5 rounded-full bg-[#18352D]/90 border border-white/30 text-white text-[9px] font-mono shadow-sm">
              02 // SILICON
            </div>
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            title="Wishlist"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#18352D] shadow-sm transition-all z-20"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted
                  ? "fill-[#C46A42] text-[#C46A42]"
                  : "text-[#63736A] hover:text-[#C46A42]"
              }`}
            />
          </button>

          {/* Bottom Telemetry HUD Bar */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between text-[10px] font-mono text-white">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#789681]" />
              <span>100% ESCROW BOND</span>
            </span>

            {isHovered ? (
              <span className="text-[#C46A42] font-semibold flex items-center gap-1">
                <Maximize2 className="w-3 h-3" />
                <span>INSPECT DECONSTRUCTION</span>
              </span>
            ) : product.isPurchasable && Boolean(product.buyPrice) ? (
              <span className="text-[#FAF7F2] bg-white/15 px-2 py-0.5 rounded text-[9px]">
                Buy: {formatINR(product.buyPrice)}
              </span>
            ) : null}
          </div>
        </div>

        {/* Camber Specimen Metadata Body */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Handover Station */}
          <div className="flex items-center gap-1.5 text-xs text-[#63736A] font-mono">
            <MapPin className="w-3.5 h-3.5 text-[#C46A42] shrink-0" />
            <span className="truncate">{product.campusHub || "Central Locker Hub A"}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-base text-[#18352D] group-hover:text-[#C46A42] transition-colors line-clamp-1 leading-snug">
            {product.title}
          </h3>

          {/* Basalt Material & Hardware Specification Pills */}
          {specs.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {specs.map(([label, val]) => (
                <div
                  key={label}
                  className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E5DEC9] text-[10px] font-mono"
                >
                  <span className="text-[#63736A] block text-[9px] uppercase">{label}</span>
                  <span className="font-semibold text-[#18352D] truncate block mt-0.5">
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Concise description */}
          <p className="text-xs text-[#63736A] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Camber Interactive Duration & Escrow Pricing Terminal */}
      <div className="p-4 pt-3 border-t border-[#E5DEC9] bg-[#FAF7F2] relative z-10 space-y-3">
        {/* Duration Tier Toggles */}
        <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg bg-white border border-[#E5DEC9] text-[10px] font-mono">
          {[
            { id: "daily", label: "Day" },
            { id: "weekly", label: "Wk" },
            { id: "monthly", label: "Mo" },
            { id: "semester", label: "Sem" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTier(t.id);
              }}
              className={`py-1 rounded text-center transition-all ${
                selectedTier === t.id
                  ? "bg-[#18352D] text-white font-bold shadow-xs"
                  : "text-[#63736A] hover:text-[#18352D]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Pricing Output & Immediate Reserve Trigger */}
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-lg text-[#18352D] font-mono tabular-nums">
                {formatINR(rate)}
              </span>
              <span className="text-xs text-[#63736A]">/{unit}</span>
            </div>
            <span className="text-[10px] text-[#789681] block font-mono font-medium">
              Deposit: {formatINR(product.deposit)} (Refundable)
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(product.id, "rent", selectedTier);
            }}
            className="px-4 py-2 rounded-xl bg-[#18352D] hover:bg-[#C46A42] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>Reserve</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
