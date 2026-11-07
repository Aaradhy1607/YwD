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
  cosmicMode = true,
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
    <section
      className={`py-20 sm:py-28 transition-colors duration-1000 border-b ${
        cosmicMode
          ? "bg-[#060A08] text-[#F3F4F6] border-white/10"
          : "bg-[#F5F0E8] text-[#18352D] border-[#E5DEC9]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-current/10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono tracking-[0.2em] uppercase backdrop-blur-md transition-colors bg-white/5 border-current/15">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CURATED EQUIPMENT ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
              Explore by discipline & category
            </h2>
            <p className="text-sm sm:text-base opacity-75 max-w-xl leading-relaxed">
              Calibrated hardware, academic gear, and lifestyle instruments organized by campus field with instant escrow checkout.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectCategory("all")}
            className={`text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all self-start md:self-auto px-5 py-2.5 rounded-full border ${
              cosmicMode
                ? "bg-white/5 border-white/15 hover:border-emerald-400 text-white hover:text-emerald-400"
                : "bg-white border-[#E5DEC9] hover:border-[#18352D] text-[#18352D]"
            }`}
          >
            <span>View complete catalog</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
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
                className={`group relative rounded-3xl overflow-hidden border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  isFeatured ? "md:col-span-2 lg:col-span-2" : ""
                } ${
                  isSelected
                    ? "border-emerald-400 ring-2 ring-emerald-400/40"
                    : cosmicMode
                    ? "border-white/10 bg-[#0A120E]/90 hover:border-emerald-400/50 hover:shadow-2xl hover:shadow-emerald-500/10"
                    : "border-[#E5DEC9] bg-[#FFFFFF] hover:border-[#18352D] hover:shadow-lg"
                }`}
              >
                {/* Image Canvas */}
                <div
                  className={`relative overflow-hidden ${
                    isFeatured ? "h-64 sm:h-72" : "h-52 sm:h-56"
                  }`}
                >
                  <img
                    src={bgImg}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-106"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/15">
                      <Icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="px-3 py-1 rounded-lg text-xs font-mono font-medium bg-black/60 backdrop-blur-md text-white border border-white/15">
                      {cat.count}
                    </span>
                  </div>

                  {/* Bottom Overlay Title */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight group-hover:text-emerald-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-white/75 mt-1 line-clamp-1 max-w-lg font-mono">
                      {cat.description}
                    </p>
                  </div>
                </div>

                {/* Subcategory Pills Footer */}
                <div
                  className={`p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-t ${
                    cosmicMode ? "border-white/10 bg-[#0A120E]" : "border-[#E5DEC9] bg-[#FAF7F2]"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    {cat.subcategories?.slice(0, 3).map((sub: any) => (
                      <span
                        key={sub.id}
                        className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition-colors ${
                          cosmicMode
                            ? "bg-white/5 border-white/10 text-white/80 group-hover:border-white/20"
                            : "bg-[#FFFFFF] border-[#E5DEC9] text-[#63736A] group-hover:border-[#18352D]/30"
                        }`}
                      >
                        {sub.name}
                      </span>
                    ))}
                    {cat.subcategories?.length > 3 && (
                      <span className="text-[11px] font-mono text-emerald-400 px-1">
                        +{cat.subcategories.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
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
