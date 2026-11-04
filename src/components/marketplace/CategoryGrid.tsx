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
} from "lucide-react";

interface CategoryGridProps {
  categories: any[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
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
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#E5DEC9]">
        <div>
          <p className="text-xs font-medium text-[#C46A42] mb-2">
            Curated equipment architecture
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#18352D] tracking-tight">
            Explore by discipline & category
          </h2>
          <p className="text-sm text-[#63736A] mt-2 max-w-xl leading-relaxed">
            Calibrated hardware, academic gear, and lifestyle instruments organized by academic field with instant escrow checkout.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelectCategory("all")}
          className="text-xs sm:text-sm font-medium text-[#18352D] hover:text-[#C46A42] flex items-center gap-1.5 transition-colors self-start md:self-auto"
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
              className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-colors flex flex-col justify-between ${
                isFeatured ? "md:col-span-2 lg:col-span-2" : ""
              } ${
                isSelected
                  ? "border-[#18352D] ring-1 ring-[#18352D]"
                  : "border-[#E5DEC9] bg-[#FFFFFF] hover:border-[#789681]"
              }`}
            >
              {/* Image Canvas */}
              <div
                className={`relative overflow-hidden bg-[#FAF7F2] ${
                  isFeatured ? "h-60 sm:h-64" : "h-48 sm:h-52"
                }`}
              >
                <img
                  src={bgImg}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#18352D] via-[#18352D]/35 to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#202522]/90 backdrop-blur-md text-[#F5F0E8] flex items-center justify-center border border-white/10">
                    <Icon className="w-4 h-4 text-[#F5F0E8]" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-[#18352D]/90 backdrop-blur-md text-[#F5F0E8] border border-white/10">
                    {cat.count}
                  </span>
                </div>

                {/* Bottom Overlay Title */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5">
                  <h3 className="text-xl font-semibold text-white tracking-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#D6E0D9] mt-0.5 line-clamp-1">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Subcategories Rail */}
              {cat.subcategories && cat.subcategories.length > 0 && (
                <div className="p-4 bg-[#FFFFFF] border-t border-[#E5DEC9] flex flex-wrap items-center gap-1.5">
                  {cat.subcategories.slice(0, 4).map((sub: any) => (
                    <span
                      key={sub.id}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#FAF7F2] text-[#18352D] border border-[#E5DEC9]"
                    >
                      {sub.name}
                    </span>
                  ))}
                  {cat.subcategories.length > 4 && (
                    <span className="text-xs text-[#789681] font-medium pl-1">
                      +{cat.subcategories.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
