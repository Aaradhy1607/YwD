"use client";

import React, { useMemo, useState } from "react";
import {
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { ProductGrid } from "./ProductGrid";
import { formatINR } from "@/lib/pricing";

export interface ExploreCatalogProps {
  categories: any[];
  allProducts: any[];
  filteredProducts: any[];
  loading: boolean;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (sub: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  transactionFilter: "all" | "rent" | "buy";
  setTransactionFilter: (f: "all" | "rent" | "buy") => void;
  preferredDuration: string;
  setPreferredDuration: (d: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  maxDailyPrice: number | null;
  setMaxDailyPrice: (price: number | null) => void;
  selectedHubFilter: string;
  setSelectedHubFilter: (hub: string) => void;
  selectedCondition: string;
  setSelectedCondition: (cond: string) => void;
  instantAvailableOnly: boolean;
  setInstantAvailableOnly: (val: boolean) => void;
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onOpenProductDetail: (id: string, mode?: "rent" | "buy", duration?: string) => void;
  onResetFilters: () => void;
}

export function ExploreCatalog({
  categories,
  allProducts,
  filteredProducts,
  loading,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  searchQuery,
  setSearchQuery,
  transactionFilter,
  setTransactionFilter,
  preferredDuration,
  setPreferredDuration,
  sortBy,
  setSortBy,
  maxDailyPrice,
  setMaxDailyPrice,
  selectedHubFilter,
  setSelectedHubFilter,
  selectedCondition,
  setSelectedCondition,
  instantAvailableOnly,
  setInstantAvailableOnly,
  wishlistIds,
  onToggleWishlist,
  onOpenProductDetail,
  onResetFilters,
}: ExploreCatalogProps) {
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Compute reliable category counts from actual products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of allProducts) {
      const slug = p.categorySlug || p.categoryId;
      if (slug) {
        counts[slug] = (counts[slug] || 0) + 1;
      }
    }
    return counts;
  }, [allProducts]);

  // Derive real filter options from actual products
  const availableHubs = useMemo(() => {
    const hubs = new Set<string>();
    for (const p of allProducts) {
      if (p.campusHub) hubs.add(p.campusHub);
    }
    return Array.from(hubs).sort();
  }, [allProducts]);

  const availableConditions = useMemo(() => {
    const grades = new Set<string>();
    for (const p of allProducts) {
      if (p.conditionGrade) grades.add(p.conditionGrade);
    }
    return Array.from(grades).sort();
  }, [allProducts]);

  const maxProductDailyRate = useMemo(() => {
    let max = 0;
    for (const p of allProducts) {
      if (typeof p.rentalPriceDaily === "number" && p.rentalPriceDaily > max) {
        max = p.rentalPriceDaily;
      }
    }
    return max > 0 ? Math.ceil(max / 100) * 100 : 2000;
  }, [allProducts]);

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const activeSubcategoryObj = activeCategoryObj?.subcategories?.find(
    (s: any) => s.slug === selectedSubcategory
  );

  // Active filter chips
  const activeChips: { id: string; label: string; onRemove: () => void }[] = [];
  if (selectedCategory !== "all") {
    activeChips.push({
      id: "category",
      label: activeCategoryObj?.name || selectedCategory,
      onRemove: () => {
        setSelectedCategory("all");
        setSelectedSubcategory("all");
      },
    });
  }
  if (selectedSubcategory !== "all") {
    activeChips.push({
      id: "subcategory",
      label: activeSubcategoryObj?.name || selectedSubcategory,
      onRemove: () => setSelectedSubcategory("all"),
    });
  }
  if (transactionFilter !== "all") {
    activeChips.push({
      id: "mode",
      label: transactionFilter === "rent" ? "Rent only" : "Buy only",
      onRemove: () => setTransactionFilter("all"),
    });
  }
  if (searchQuery.trim()) {
    activeChips.push({
      id: "search",
      label: `"${searchQuery.trim()}"`,
      onRemove: () => setSearchQuery(""),
    });
  }
  if (maxDailyPrice !== null) {
    activeChips.push({
      id: "price",
      label: `Up to ${formatINR(maxDailyPrice)}/day`,
      onRemove: () => setMaxDailyPrice(null),
    });
  }
  if (selectedHubFilter !== "all") {
    activeChips.push({
      id: "hub",
      label: selectedHubFilter,
      onRemove: () => setSelectedHubFilter("all"),
    });
  }
  if (selectedCondition !== "all") {
    activeChips.push({
      id: "condition",
      label: selectedCondition,
      onRemove: () => setSelectedCondition("all"),
    });
  }
  if (instantAvailableOnly) {
    activeChips.push({
      id: "available",
      label: "Available now",
      onRemove: () => setInstantAvailableOnly(false),
    });
  }

  const durationOptions = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "semester", label: "Semester" },
  ];

  const filterRailContent = (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="explore-price-range"
            className="text-xs font-semibold text-[#18352D]"
          >
            Max daily rate
          </label>
          <span className="text-xs font-mono text-[#C46A42]">
            {maxDailyPrice !== null ? formatINR(maxDailyPrice) : "Any"}
          </span>
        </div>
        <input
          id="explore-price-range"
          type="range"
          min={50}
          max={maxProductDailyRate}
          step={50}
          value={maxDailyPrice ?? maxProductDailyRate}
          onChange={(e) => {
            const val = Number(e.target.value);
            setMaxDailyPrice(val >= maxProductDailyRate ? null : val);
          }}
          className="w-full accent-[#18352D] cursor-pointer"
        />
        <div className="flex justify-between text-[11px] font-mono text-[#63736A]">
          <span>{formatINR(50)}</span>
          <span>{formatINR(maxProductDailyRate)}</span>
        </div>
      </div>

      {/* Campus Hub */}
      {availableHubs.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-[#E5DEC9]">
          <span className="text-xs font-semibold text-[#18352D] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#C46A42]" />
            <span>Campus hub</span>
          </span>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setSelectedHubFilter("all")}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                selectedHubFilter === "all"
                  ? "bg-[#18352D] text-white font-medium"
                  : "text-[#63736A] hover:bg-[#F5F0E8] hover:text-[#18352D]"
              }`}
            >
              All campus hubs
            </button>
            {availableHubs.map((hub) => (
              <button
                key={hub}
                type="button"
                onClick={() => setSelectedHubFilter(hub)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors truncate ${
                  selectedHubFilter === hub
                    ? "bg-[#18352D] text-white font-medium"
                    : "text-[#63736A] hover:bg-[#F5F0E8] hover:text-[#18352D]"
                }`}
                title={hub}
              >
                {hub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Condition Grade */}
      {availableConditions.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-[#E5DEC9]">
          <span className="text-xs font-semibold text-[#18352D] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#789681]" />
            <span>Condition grade</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCondition("all")}
              className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                selectedCondition === "all"
                  ? "bg-[#18352D] text-white border-[#18352D] font-medium"
                  : "bg-[#FFFFFF] text-[#63736A] border-[#E5DEC9] hover:border-[#18352D]/40"
              }`}
            >
              All
            </button>
            {availableConditions.map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => setSelectedCondition(grade)}
                className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                  selectedCondition === grade
                    ? "bg-[#18352D] text-white border-[#18352D] font-medium"
                    : "bg-[#FFFFFF] text-[#63736A] border-[#E5DEC9] hover:border-[#18352D]/40"
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instant Availability */}
      <div className="pt-4 border-t border-[#E5DEC9]">
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span className="text-xs font-semibold text-[#18352D] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#789681]" />
            <span>Available now</span>
          </span>
          <input
            type="checkbox"
            checked={instantAvailableOnly}
            onChange={(e) => setInstantAvailableOnly(e.target.checked)}
            className="w-4 h-4 rounded accent-[#18352D] cursor-pointer"
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* STICKY COMPACT FILTER BAR DIRECTLY BELOW NAVBAR */}
      <div className="sticky top-16 z-30 bg-[#FAF7F2] border-b border-[#E5DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2.5 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:gap-4">
          {/* Horizontal Category Pills */}
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar"
            role="tablist"
            aria-label="Filter marketplace by category"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === "all"}
              onClick={() => {
                setSelectedCategory("all");
                setSelectedSubcategory("all");
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === "all"
                  ? "bg-[#18352D] text-white border-[#18352D]"
                  : "bg-[#FFFFFF] text-[#63736A] border-[#E5DEC9] hover:text-[#18352D] hover:border-[#18352D]/30"
              }`}
            >
              All ({allProducts.length})
            </button>
            {categories.map((cat) => {
              const count = categoryCounts[cat.slug] || 0;
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setSelectedSubcategory("all");
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                    isSelected
                      ? "bg-[#18352D] text-white border-[#18352D]"
                      : "bg-[#FFFFFF] text-[#63736A] border-[#E5DEC9] hover:text-[#18352D] hover:border-[#18352D]/30"
                  }`}
                >
                  {cat.name}
                  {allProducts.length > 0 ? ` (${count})` : ""}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Rent/Buy + Duration + Mobile Filters */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5 shrink-0">
            {/* Rent / Buy / All Segmented Control */}
            <div
              className="flex items-center bg-[#FFFFFF] p-0.5 rounded-xl border border-[#E5DEC9]"
              role="group"
              aria-label="Transaction type"
            >
              {[
                { id: "all", label: "All" },
                { id: "rent", label: "Rent" },
                { id: "buy", label: "Buy" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setTransactionFilter(mode.id as "all" | "rent" | "buy")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    transactionFilter === mode.id
                      ? "bg-[#18352D] text-white"
                      : "text-[#63736A] hover:text-[#18352D]"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Duration Selector */}
            <div
              className="hidden sm:flex items-center bg-[#FFFFFF] p-0.5 rounded-xl border border-[#E5DEC9]"
              role="group"
              aria-label="Rental duration"
            >
              {durationOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPreferredDuration(opt.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    preferredDuration === opt.id
                      ? "bg-[#C46A42] text-white"
                      : "text-[#63736A] hover:text-[#18352D]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Mobile Filters Button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
              aria-expanded={mobileFiltersOpen}
              className="lg:hidden px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E5DEC9] text-xs font-medium text-[#18352D] flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C46A42]" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Mobile Collapsible Filter Panel */}
        {mobileFiltersOpen && (
          <div className="lg:hidden border-t border-[#E5DEC9] bg-[#FAF7F2] px-4 py-4">
            <div className="max-w-7xl mx-auto">{filterRailContent}</div>
          </div>
        )}
      </div>

      {/* MAIN CATALOG BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Collapsible Filter Rail */}
          <aside
            aria-label="Catalog filters"
            className={`hidden lg:block shrink-0 transition-all duration-200 ${
              railCollapsed ? "w-11" : "w-64"
            }`}
          >
            <div className="sticky top-[148px] bg-[#FAF7F2] rounded-2xl border border-[#E5DEC9] p-4">
              <div className="flex items-center justify-between gap-2">
                {!railCollapsed && (
                  <span className="text-xs font-semibold text-[#18352D] flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#C46A42]" />
                    <span>Refine catalog</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setRailCollapsed((prev) => !prev)}
                  aria-label={railCollapsed ? "Expand filter rail" : "Collapse filter rail"}
                  className="p-1.5 rounded-lg text-[#63736A] hover:text-[#18352D] hover:bg-[#F5F0E8] transition-colors"
                >
                  {railCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>
              </div>

              {!railCollapsed && <div className="mt-5">{filterRailContent}</div>}
            </div>
          </aside>

          {/* Product Grid Column */}
          <div className="flex-1 min-w-0 w-full">
            {/* Active Filter Chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-[#63736A] mr-1">Active filters:</span>
                {activeChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={chip.onRemove}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E5DEC9] hover:border-[#18352D]/40 text-xs font-medium text-[#18352D] transition-colors"
                  >
                    <span>{chip.label}</span>
                    <X className="w-3 h-3 text-[#63736A]" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#C46A42] hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear all</span>
                </button>
              </div>
            )}

            <ProductGrid
              products={filteredProducts}
              loading={loading}
              preferredDuration={preferredDuration}
              setPreferredDuration={setPreferredDuration}
              sortBy={sortBy}
              setSortBy={setSortBy}
              wishlistIds={wishlistIds}
              onToggleWishlist={onToggleWishlist}
              onOpenProductDetail={onOpenProductDetail}
              onResetFilters={onResetFilters}
              activeCategoryName={
                selectedCategory !== "all"
                  ? `${activeCategoryObj?.name || "Selected Category"}`
                  : "All Available Marketplace Gear"
              }
              embedded
            />
          </div>
        </div>
      </div>
    </div>
  );
}
