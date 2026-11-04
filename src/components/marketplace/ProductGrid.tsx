"use client";

import React from "react";
import { Package, ArrowUpDown, RefreshCcw } from "lucide-react";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: any[];
  preferredDuration: string;
  setPreferredDuration?: (d: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onOpenProductDetail: (id: string, mode?: "rent" | "buy", duration?: string) => void;
  onResetFilters: () => void;
  activeCategoryName?: string;
}

export function ProductGrid({
  products,
  preferredDuration = "daily",
  setPreferredDuration,
  sortBy,
  setSortBy,
  wishlistIds,
  onToggleWishlist,
  onOpenProductDetail,
  onResetFilters,
  activeCategoryName = "Featured inventory",
}: ProductGridProps) {
  const durationOptions = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "semester", label: "Semester" },
  ];

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with Title & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#E5DEC9]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h2 className="font-semibold text-3xl sm:text-4xl text-[#18352D] tracking-tight">
              {activeCategoryName}
            </h2>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-[#18352D]/10 text-[#18352D] border border-[#18352D]/15">
              {products.length} {products.length === 1 ? "item" : "items"}
            </span>
          </div>
          <p className="text-sm text-[#63736A] max-w-2xl leading-relaxed">
            Every item is verified with 4-angle condition documentation, insured through automated escrow deposits, and ready for pickup at campus smart hubs.
          </p>
        </div>

        {/* Controls: Duration Tiers & Sort */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Rate Duration Switcher */}
          {setPreferredDuration && (
            <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#E5DEC9]">
              {durationOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPreferredDuration(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    preferredDuration === opt.id
                      ? "bg-[#18352D] text-white"
                      : "text-[#63736A] hover:text-[#18352D]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-[#FFFFFF] px-3 py-1.5 rounded-xl border border-[#E5DEC9] text-xs font-medium shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#C46A42]" />
            <span className="text-[#63736A]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort marketplace products"
              className="bg-transparent font-medium text-[#18352D] focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured first</option>
              <option value="price_low">Rate: Low to high</option>
              <option value="price_high">Rate: High to low</option>
              <option value="deposit_low">Lowest deposit</option>
              <option value="newest">Recently listed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid or Empty State */}
      {products.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9] p-12 text-center max-w-md mx-auto my-12 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] text-[#18352D] flex items-center justify-center mx-auto mb-3 border border-[#E5DEC9]">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg text-[#18352D]">
            No verified listings match
          </h3>
          <p className="text-xs sm:text-sm text-[#63736A] mt-1.5 leading-relaxed">
            Try adjusting your category selection, keyword query, or transaction filters to discover more items in the marketplace.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-5 px-5 py-2 rounded-xl bg-[#18352D] text-white text-xs font-medium hover:bg-[#234C40] transition-colors shadow-xs inline-flex items-center gap-2"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-[#C46A42]" />
            <span>Reset all filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              durationTier={preferredDuration}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onOpenDetail={onOpenProductDetail}
            />
          ))}
        </div>
      )}
    </section>
  );
}
