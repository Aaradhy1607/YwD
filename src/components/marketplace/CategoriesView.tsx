"use client";

import React, { useState } from "react";
import {
  Laptop,
  BookOpen,
  Home,
  Shirt,
  Dumbbell,
  Package,
  ArrowRight,
} from "lucide-react";

interface CategoriesViewProps {
  categories: any[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  onSelectSubcategory?: (categorySlug: string, subcategorySlug: string) => void;
  onExploreCategory: (slug: string) => void;
}

export function CategoriesView({
  categories,
  selectedCategory,
  onSelectCategory,
  onSelectSubcategory,
  onExploreCategory,
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
      default:
        return Package;
    }
  };

  const activeCategory =
    categories.find((c) => c.slug === activeCategorySlug) || categories[0];

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <p className="text-xs font-medium text-[#C46A42] mb-1.5">
          Marketplace directory
        </p>
        <h1 className="font-semibold text-3xl sm:text-4xl text-[#18352D] tracking-tight">
          Explore by category & equipment class
        </h1>
        <p className="text-xs sm:text-sm text-[#63736A] mt-2 leading-relaxed">
          From developer workstations and mirrorless optics to engineering tools and lifestyle gear. All listings verified with automated escrow protection.
        </p>
      </div>

      {/* Category Tabs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {categories.map((cat) => {
          const Icon = getIcon(cat.icon);
          const isSelected = activeCategorySlug === cat.slug;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategorySlug(cat.slug);
                onSelectCategory(cat.slug);
              }}
              className={`p-3.5 rounded-xl border text-left transition-colors ${
                isSelected
                  ? "bg-[#18352D] text-[#F5F0E8] border-[#18352D] shadow-xs"
                  : "bg-[#FFFFFF] text-[#18352D] border-[#E5DEC9] hover:border-[#789681] hover:bg-[#FAF7F2]"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                  isSelected ? "bg-[#C46A42] text-white" : "bg-[#FAF7F2] text-[#18352D]"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <p className="font-semibold text-xs truncate">{cat.name}</p>
              <span
                className={`text-[10px] font-mono mt-0.5 block ${
                  isSelected ? "text-[#9BB5A3]" : "text-[#789681]"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Category Deep-Dive Panel */}
      {activeCategory && (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5DEC9]">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-semibold text-2xl text-[#18352D]">
                  {activeCategory.name}
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#FAF7F2] text-[#18352D] border border-[#E5DEC9]">
                  {activeCategory.count}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#63736A] mt-1.5 max-w-2xl leading-relaxed">
                {activeCategory.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onExploreCategory(activeCategory.slug)}
              className="px-4 py-2 rounded-xl bg-[#C46A42] hover:bg-[#A8532F] text-white font-medium text-xs flex items-center gap-2 self-start sm:self-auto transition-colors shadow-xs"
            >
              <span>Explore all {activeCategory.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Subcategories Grid */}
          <div>
            <h3 className="text-xs font-mono text-[#63736A] mb-3">
              Subcategories & equipment tiers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {activeCategory.subcategories.map((sub: any) => (
                <div
                  key={sub.id}
                  onClick={() => {
                    if (onSelectSubcategory) {
                      onSelectSubcategory(activeCategory.slug, sub.slug);
                    } else {
                      onExploreCategory(activeCategory.slug);
                    }
                  }}
                  className="p-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F5F0E8] border border-[#E5DEC9] cursor-pointer transition-colors hover:border-[#789681] group"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-xs sm:text-sm text-[#18352D] group-hover:text-[#C46A42] transition-colors">
                      {sub.name}
                    </p>
                    <ArrowRight className="w-3.5 h-3.5 text-[#789681]" />
                  </div>
                  <span className="text-[11px] text-[#63736A] mt-0.5 block">
                    Verified gear listings
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
