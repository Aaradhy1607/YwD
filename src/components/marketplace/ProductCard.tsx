"use client";

import React, { useEffect, useState } from "react";
import { Heart, MapPin, ArrowRight, Package } from "lucide-react";
import { formatINR } from "@/lib/pricing";
import { extractImageUrls } from "@/lib/image-utils";

interface ProductCardProps {
  product: any;
  durationTier?: string;
  featured?: boolean;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onOpenDetail: (productId: string, mode?: "rent" | "buy", duration?: string) => void;
}

export function ProductCard({
  product,
  durationTier = "daily",
  featured = false,
  isWishlisted,
  onToggleWishlist,
  onOpenDetail,
}: ProductCardProps) {
  const [selectedTier, setSelectedTier] = useState(durationTier);
  const [primaryImgError, setPrimaryImgError] = useState(false);
  const [secondaryImgError, setSecondaryImgError] = useState(false);

  useEffect(() => {
    setSelectedTier(durationTier);
  }, [durationTier]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  const images = extractImageUrls(product);

  const conditionPhotos = Array.isArray(product.conditionPhotos)
    ? product.conditionPhotos.map((img: any) => (typeof img === "string" ? img : img?.url))
    : [];

  const primaryImage = images[0] || null;

  const secondaryImage =
    images[1] ||
    conditionPhotos.find((url: string) => url && url !== primaryImage) ||
    null;

  useEffect(() => {
    setPrimaryImgError(false);
    setSecondaryImgError(false);
  }, [primaryImage, secondaryImage]);

  const getDisplayRate = (tier: string) => {
    switch (tier) {
      case "hourly":
        return {
          rate: product.rentalPriceHourly || Math.round((product.rentalPriceDaily || 0) / 6),
          unit: "hr",
        };
      case "weekly":
        return {
          rate: product.rentalPriceWeekly,
          unit: "wk",
        };
      case "monthly":
        return {
          rate: product.rentalPriceMonthly || Math.round((product.rentalPriceWeekly || 0) * 3.4),
          unit: "mo",
        };
      case "semester":
        return {
          rate: product.rentalPriceSemester || Math.round((product.rentalPriceWeekly || 0) * 8.5),
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
  const statusLabel = product.conditionGrade
    ? product.conditionGrade
    : product.isAvailable === false
    ? "Unavailable"
    : "Available";

  return (
    <article
      onClick={() => onOpenDetail(product.id, "rent", selectedTier)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail(product.id, "rent", selectedTier);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View ${product.title}`}
      className={`bg-[#FAF7F2] rounded-2xl border border-[#E5DEC9] overflow-hidden hover:-translate-y-0.5 hover:border-[#18352D]/40 transition-all duration-200 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#18352D]/30 ${
        featured
          ? "sm:col-span-2 grid grid-cols-1 sm:grid-cols-12"
          : "flex flex-col justify-between"
      }`}
    >
      {/* Image Area */}
      <div
        className={`relative bg-[#EAE2D5] overflow-hidden ${
          featured ? "sm:col-span-6 aspect-[4/3] sm:aspect-auto sm:min-h-[260px]" : "aspect-[4/3]"
        }`}
      >
        {primaryImage && !primaryImgError ? (
          <img
            src={primaryImage}
            alt={product.title}
            loading="lazy"
            decoding="async"
            onError={() => setPrimaryImgError(true)}
            className={`w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-[1.03] ${
              secondaryImage && !secondaryImgError ? "group-hover:opacity-0" : ""
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#63736A] gap-1.5 p-4 text-center">
            <Package className="w-7 h-7 text-[#9BB5A3]" />
            <span className="text-[11px] font-medium">
              {primaryImgError ? "Image unavailable" : "No photo provided"}
            </span>
          </div>
        )}

        {secondaryImage && !secondaryImgError && (
          <img
            src={secondaryImage}
            alt={`${product.title} alternate angle`}
            loading="lazy"
            decoding="async"
            onError={() => setSecondaryImgError(true)}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"
          />
        )}

        {/* Single Subtle Top-Left Status Pill */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#FAF7F2]/95 text-[#18352D] border border-[#E5DEC9] text-[11px] font-medium z-10">
          {statusLabel}
        </span>

        {/* Wishlist Heart Top-Right */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FAF7F2]/95 hover:bg-white border border-[#E5DEC9] flex items-center justify-center text-[#18352D] transition-transform active:scale-90 z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted
                ? "fill-[#C46A42] text-[#C46A42]"
                : "text-[#63736A] hover:text-[#C46A42]"
            }`}
          />
        </button>
      </div>

      {/* Content + Pricing Wrapper */}
      <div className={featured ? "sm:col-span-6 flex flex-col justify-between" : "flex flex-col flex-1 justify-between"}>
        <div className="p-5 space-y-2.5">
          {featured && (
            <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-[#C46A42]">
              Featured pick
            </span>
          )}
          {product.campusHub && (
            <div className="flex items-center gap-1.5 text-xs text-[#63736A]">
              <MapPin className="w-3.5 h-3.5 text-[#789681] shrink-0" />
              <span className="truncate">{product.campusHub}</span>
            </div>
          )}

          <h3
            className={`font-semibold text-[#18352D] group-hover:text-[#C46A42] transition-colors leading-snug ${
              featured ? "text-lg sm:text-xl line-clamp-2" : "text-base line-clamp-1"
            }`}
          >
            {product.title}
          </h3>

          <p className={`text-xs text-[#63736A] leading-relaxed ${featured ? "line-clamp-3" : "line-clamp-2"}`}>
            {product.description}
          </p>
        </div>

        {/* Pricing Hierarchy & Quick Action */}
        <div className="px-5 pb-5 pt-3 border-t border-[#E5DEC9] space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-semibold text-lg text-[#18352D] font-mono tabular-nums">
                  {formatINR(rate)}
                </span>
                <span className="text-xs text-[#63736A]">/{unit}</span>
              </div>
            </div>

            <div className="text-right text-[11px] leading-tight space-y-0.5">
              <span className="block text-[#63736A] font-mono tabular-nums">
                Deposit {formatINR(product.deposit)}
              </span>
              {product.isPurchasable && Boolean(product.buyPrice) && (
                <span className="block text-[#18352D] font-medium font-mono tabular-nums">
                  Buy {formatINR(product.buyPrice)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(product.id, "rent", selectedTier);
            }}
            className={`w-full py-2.5 px-4 rounded-xl bg-[#18352D] hover:bg-[#C46A42] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
              featured
                ? ""
                : "sm:opacity-0 sm:translate-y-1 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 sm:focus:opacity-100 sm:focus:translate-y-0"
            }`}
          >
            <span>Quick view &amp; reserve</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
