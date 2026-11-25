"use client";

import React from "react";
import {
  Laptop,
  BookOpen,
  Home,
  Shirt,
  Dumbbell,
  Package,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface CategoryGridProps {
  categories: any[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  cosmicMode?: boolean;
}

const CATEGORY_IMAGES: Record<string, string> = {
  electronics: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80",
  education: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
  "college-essentials": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
  lifestyle: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  "sports-fitness": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
  "events-entertainment": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
};

export function CategoryGrid({
  categories,
  selectedCategory,
  onSelectCategory,
  cosmicMode = false,
}: CategoryGridProps) {
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
      default:
        return Package;
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-[#0E1F1A] text-[#F5F0E8] border-y border-[#2C3831]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#C46A42]">
              Equipment architecture
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl text-white tracking-tight">
              Explore by discipline &amp; category
            </h2>
            <p className="text-sm text-[#D6E0D9] max-w-xl leading-relaxed">
              Calibrated hardware, academic gear, and lifestyle instruments organized by campus field.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectCategory("all")}
            className="text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors self-start md:self-auto px-5 py-2.5 rounded-xl bg-white/10 border border-white/15 hover:border-[#C46A42] text-white"
          >
            <span>View complete catalog</span>
            <ArrowRight className="w-4 h-4 text-[#C46A42]" />
          </button>
        </div>

        {/* Asymmetric Category Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, index) => {
            const Icon = getIcon(cat.icon);
            const isSelected = selectedCategory === cat.slug;
            const bgImg = CATEGORY_IMAGES[cat.slug] || CATEGORY_IMAGES.electronics;
            const isFeatured = index === 0;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 flex flex-col justify-between bg-[#142921] ${
                  isFeatured ? "md:col-span-2 lg:col-span-2" : ""
                } ${
                  isSelected
                    ? "border-[#C46A42] ring-1 ring-[#C46A42]"
                    : "border-[#2C3831] hover:border-[#789681]"
                }`}
              >
                {/* Image Canvas */}
                <div
                  className={`relative overflow-hidden ${
                    isFeatured ? "h-60 sm:h-68" : "h-48 sm:h-52"
                  }`}
                >
                  <img
                    src={bgImg}
                    alt={cat.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1713] via-[#0A1713]/40 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#0E1F1A]/90 text-white flex items-center justify-center border border-white/15">
                      <Icon className="w-4 h-4 text-[#C46A42]" />
                    </div>
                  </div>

                  {/* Bottom Overlay Title */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight group-hover:text-[#C46A42] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#D6E0D9] mt-1 line-clamp-1 max-w-lg">
                      {cat.description}
                    </p>
                  </div>
                </div>

                {/* Subcategory Pills Footer */}
                <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#142921]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {cat.subcategories?.slice(0, 3).map((sub: any) => (
                      <span
                        key={sub.id}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-[#D6E0D9]"
                      >
                        {sub.name}
                      </span>
                    ))}
                    {cat.subcategories?.length > 3 && (
                      <span className="text-[11px] font-mono px-1 text-[#C46A42]">
                        +{cat.subcategories.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-[#F5F0E8] group-hover:text-[#C46A42] group-hover:translate-x-0.5 transition-all">
                    <span>Browse</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
