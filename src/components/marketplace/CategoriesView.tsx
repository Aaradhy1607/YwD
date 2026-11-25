"use client";

import React, { useMemo, useState } from "react";
import {
  Laptop,
  BookOpen,
  Home,
  Shirt,
  Dumbbell,
  Package,
  Sparkles,
  ArrowRight,
  Cpu,
  Camera,
  GraduationCap,
} from "lucide-react";
import { formatINR } from "@/lib/pricing";

interface CategoriesViewProps {
  categories: any[];
  allProducts?: any[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  onSelectSubcategory?: (categorySlug: string, subcategorySlug: string) => void;
  onExploreCategory: (slug: string) => void;
  onSelectCollection?: (opts: { categorySlug?: string; subcategorySlug?: string; searchQuery?: string }) => void;
  onOpenProductDetail?: (productId: string, mode?: "rent" | "buy", duration?: string) => void;
}

export function CategoriesView({
  categories,
  allProducts = [],
  selectedCategory,
  onSelectCategory,
  onSelectSubcategory,
  onExploreCategory,
  onSelectCollection,
  onOpenProductDetail,
}: CategoriesViewProps) {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>(
    selectedCategory !== "all" ? selectedCategory : categories[0]?.slug || "electronics"
  );

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Laptop":
        return Laptop;
      case "BookOpen":
        return BookOpen;
      case "Home":
        return Home;
      case "Shirt":
        return Shirt;
      case "Dumbbell":
        return Dumbbell;
      case "Sparkles":
        return Sparkles;
      default:
        return Package;
    }
  };

  // Compute actual product counts per category & subcategory
  const { categoryCounts, subcategoryCounts } = useMemo(() => {
    const catMap: Record<string, number> = {};
    const subMap: Record<string, number> = {};
    for (const p of allProducts) {
      const cSlug = p.categorySlug || p.categoryId;
      if (cSlug) catMap[cSlug] = (catMap[cSlug] || 0) + 1;
      if (p.subcategorySlug) {
        subMap[p.subcategorySlug] = (subMap[p.subcategorySlug] || 0) + 1;
      }
    }
    return { categoryCounts: catMap, subcategoryCounts: subMap };
  }, [allProducts]);

  const activeCategory =
    categories.find((c) => c.slug === activeCategorySlug) || categories[0];

  const categoryProducts = useMemo(() => {
    if (!activeCategory) return [];
    return allProducts.filter(
      (p) => p.categorySlug === activeCategory.slug || p.categoryId === activeCategory.slug
    );
  }, [allProducts, activeCategory]);

  // Only show non-empty subcategories when products are loaded
  const nonEmptySubcategories = useMemo(() => {
    if (!activeCategory?.subcategories) return [];
    if (allProducts.length === 0) return activeCategory.subcategories;
    return activeCategory.subcategories.filter(
      (sub: any) => (subcategoryCounts[sub.slug] || 0) > 0
    );
  }, [activeCategory, allProducts.length, subcategoryCounts]);

  const curatedProducts = categoryProducts.slice(0, 4);

  // 3 Purpose-driven Use-Case Collections mapped to real taxonomy/products
  const collections = useMemo(
    () => [
      {
        id: "hackathon-ml",
        title: "Hackathon & ML Kit",
        subtitle: "Workstations, tablets, and high-compute laptops",
        icon: Cpu,
        count: allProducts.filter(
          (p) =>
            p.categorySlug === "electronics" &&
            ["laptops", "tablets"].includes(p.subcategorySlug)
        ).length,
        action: { categorySlug: "electronics", subcategorySlug: "laptops" },
      },
      {
        id: "film-thesis",
        title: "Film & Thesis Shoot",
        subtitle: "Mirrorless bodies, optics, audio, and production gear",
        icon: Camera,
        count: allProducts.filter(
          (p) =>
            ["cameras", "audio"].includes(p.subcategorySlug) ||
            p.categorySlug === "events-entertainment"
        ).length,
        action: { categorySlug: "electronics", subcategorySlug: "cameras" },
      },
      {
        id: "exam-essentials",
        title: "Exam Week Essentials",
        subtitle: "Graphing calculators, textbooks, and lab kits",
        icon: GraduationCap,
        count: allProducts.filter((p) => p.categorySlug === "education").length,
        action: { categorySlug: "education", subcategorySlug: "all" },
      },
    ],
    [allProducts]
  );

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Editorial Header */}
      <div className="max-w-2xl">
        <p className="text-xs font-medium text-[#C46A42] mb-1.5">
          Editorial directory
        </p>
        <h1 className="font-semibold text-3xl sm:text-4xl text-[#18352D] tracking-tight">
          Browse by equipment class or study goal
        </h1>
        <p className="text-sm text-[#63736A] mt-2 leading-relaxed">
          Explore verified campus hardware organized by discipline, subcategory, and project purpose.
        </p>
      </div>

      {/* 3 Compact Horizontal Use-Case Collections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {collections.map((col) => {
          const ColIcon = col.icon;
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => {
                if (onSelectCollection) {
                  onSelectCollection(col.action);
                } else {
                  onExploreCategory(col.action.categorySlug);
                }
              }}
              className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DEC9] hover:border-[#18352D]/40 text-left transition-all flex items-start justify-between gap-4 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#18352D] text-white flex items-center justify-center shrink-0">
                    <ColIcon className="w-4 h-4 text-[#C46A42]" />
                  </span>
                  <span className="text-[11px] font-mono text-[#63736A]">
                    {col.count} {col.count === 1 ? "listing" : "listings"}
                  </span>
                </div>
                <h2 className="font-semibold text-sm sm:text-base text-[#18352D] group-hover:text-[#C46A42] transition-colors pt-1">
                  {col.title}
                </h2>
                <p className="text-xs text-[#63736A] leading-relaxed">
                  {col.subtitle}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#789681] group-hover:text-[#C46A42] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </button>
          );
        })}
      </div>

      {/* Split-Panel Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: Vertical Category List */}
        <div
          className="lg:col-span-4 space-y-2"
          role="tablist"
          aria-label="Equipment categories"
        >
          {categories.map((cat) => {
            const Icon = getIcon(cat.icon);
            const isSelected = activeCategorySlug === cat.slug;
            const liveCount = categoryCounts[cat.slug] ?? 0;

            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setActiveCategorySlug(cat.slug);
                  onSelectCategory(cat.slug);
                }}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? "bg-[#18352D] text-[#F5F0E8] border-[#18352D]"
                    : "bg-[#FAF7F2] text-[#18352D] border-[#E5DEC9] hover:border-[#18352D]/30"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? "bg-[#C46A42] text-white" : "bg-[#FFFFFF] text-[#18352D] border border-[#E5DEC9]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm truncate">{cat.name}</span>
                    <span
                      className={`text-[11px] font-mono shrink-0 ${
                        isSelected ? "text-[#9BB5A3]" : "text-[#63736A]"
                      }`}
                    >
                      {liveCount}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                      isSelected ? "text-[#D6E0D9]" : "text-[#63736A]"
                    }`}
                  >
                    {cat.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT PANEL: Selected Category Hero, Subcategories & Curated Products */}
        {activeCategory && (
          <div className="lg:col-span-8 bg-[#FAF7F2] rounded-2xl border border-[#E5DEC9] p-6 sm:p-8 space-y-8">
            {/* Category Hero Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5DEC9]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-semibold text-2xl text-[#18352D] tracking-tight">
                    {activeCategory.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#FFFFFF] text-[#18352D] border border-[#E5DEC9]">
                    {categoryCounts[activeCategory.slug] ?? 0} listings
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#63736A] max-w-xl leading-relaxed">
                  {activeCategory.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onExploreCategory(activeCategory.slug)}
                className="px-5 py-2.5 rounded-xl bg-[#C46A42] hover:bg-[#A8532F] text-white font-semibold text-xs flex items-center gap-2 self-start sm:self-auto transition-colors shrink-0"
              >
                <span>View all in {activeCategory.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Subcategories (Non-empty only) */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#63736A]">
                Subcategories
              </h3>
              {nonEmptySubcategories.length === 0 ? (
                <p className="text-xs text-[#63736A] bg-[#FFFFFF] rounded-xl border border-[#E5DEC9] p-4">
                  No active subcategory listings in this category yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {nonEmptySubcategories.map((sub: any) => {
                    const subCount = subcategoryCounts[sub.slug] ?? 0;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          if (onSelectSubcategory) {
                            onSelectSubcategory(activeCategory.slug, sub.slug);
                          } else {
                            onExploreCategory(activeCategory.slug);
                          }
                        }}
                        className="p-4 rounded-xl bg-[#FFFFFF] hover:bg-[#F5F0E8] border border-[#E5DEC9] hover:border-[#18352D]/40 text-left transition-colors group flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="font-semibold text-sm text-[#18352D] group-hover:text-[#C46A42] transition-colors">
                            {sub.name}
                          </p>
                          <span className="text-xs text-[#63736A] font-mono mt-0.5 block">
                            {subCount} {subCount === 1 ? "item" : "items"}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#789681] group-hover:text-[#C46A42] transition-colors shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Curated Products from Selected Category */}
            <div className="space-y-3 pt-2 border-t border-[#E5DEC9]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#63736A]">
                  Available in {activeCategory.name}
                </h3>
                {curatedProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onExploreCategory(activeCategory.slug)}
                    className="text-xs font-medium text-[#C46A42] hover:underline"
                  >
                    View all
                  </button>
                )}
              </div>

              {curatedProducts.length === 0 ? (
                <div className="bg-[#FFFFFF] rounded-xl border border-[#E5DEC9] p-8 text-center">
                  <p className="text-xs sm:text-sm text-[#63736A]">
                    No verified listings are currently available in this category.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {curatedProducts.map((product) => {
                    const img =
                      (Array.isArray(product.images) &&
                        (typeof product.images[0] === "string"
                          ? product.images[0]
                          : product.images[0]?.url)) ||
                      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80";

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => onOpenProductDetail?.(product.id, "rent", "daily")}
                        className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5DEC9] hover:border-[#18352D]/40 text-left transition-all flex items-center gap-3.5 group"
                      >
                        <img
                          src={img}
                          alt={product.title}
                          className="w-16 h-16 rounded-lg object-cover border border-[#E5DEC9] shrink-0 bg-[#EAE2D5]"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm text-[#18352D] group-hover:text-[#C46A42] transition-colors truncate">
                            {product.title}
                          </h4>
                          <p className="text-xs text-[#63736A] truncate mt-0.5">
                            {product.campusHub || "Campus Hub"}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs font-mono">
                            <span className="font-semibold text-[#18352D]">
                              {formatINR(product.rentalPriceDaily)}/day
                            </span>
                            <span className="text-[#63736A]">
                              • Dep {formatINR(product.deposit)}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
