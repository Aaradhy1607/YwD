"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Sparkles, Clock } from "lucide-react";
import { formatINR } from "@/lib/pricing";
import { DURATION, EASING, usePrefersReducedMotion } from "@/lib/motion";

interface EditorialShowcaseProps {
  products: any[];
  onOpenProductDetail: (
    productId: string,
    mode?: "rent" | "buy",
    duration?: string
  ) => void;
  onExplore: () => void;
}

export function EditorialShowcase({
  products,
  onOpenProductDetail,
  onExplore,
}: EditorialShowcaseProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const curatedPick = useMemo(() => products.slice(0, 2), [products]);

  const recentlyAdded = useMemo(() => {
    return [...products]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      .slice(0, 4);
  }, [products]);

  const popularCommunity = useMemo(() => {
    return [...products]
      .sort(
        (a, b) =>
          (b.owner?.completedRentals || 0) - (a.owner?.completedRentals || 0)
      )
      .slice(0, 4);
  }, [products]);

  if (products.length === 0) return null;

  const getProductImage = (p: any) =>
    (Array.isArray(p.images) &&
      (typeof p.images[0] === "string" ? p.images[0] : p.images[0]?.url)) ||
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80";

  return (
    <>
      {/* SECTION A: CURATED FOR CAMPUS / GEAR FOR YOUR NEXT PROJECT */}
      <section className="py-12 sm:py-16 bg-[#FAF7F2] border-b border-[#E5DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[#C46A42] mb-1.5">
                Curated for campus
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#18352D] tracking-tight">
                Gear for your next project
              </h2>
            </div>
            <button
              type="button"
              onClick={onExplore}
              className="text-xs sm:text-sm font-semibold text-[#18352D] hover:text-[#C46A42] inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <span>Browse full catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {curatedPick.map((item, idx) => (
              <motion.article
                key={item.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: DURATION.normal,
                  delay: idx * 0.06,
                  ease: EASING.easeOutCubic,
                }}
                onClick={() => onOpenProductDetail(item.id, "rent", "weekly")}
                className="bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9] hover:border-[#18352D]/40 overflow-hidden grid grid-cols-1 sm:grid-cols-12 cursor-pointer group transition-colors"
              >
                <div className="sm:col-span-5 aspect-[4/3] sm:aspect-auto bg-[#EAE2D5] overflow-hidden">
                  <img
                    src={getProductImage(item)}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                  />
                </div>
                <div className="sm:col-span-7 p-5 sm:p-6 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#63736A]">
                      <span className="inline-flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#789681] shrink-0" />
                        <span className="truncate">{item.campusHub}</span>
                      </span>
                      {item.conditionGrade && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E5DEC9] text-[11px] font-medium text-[#18352D] shrink-0">
                          {item.conditionGrade}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-[#18352D] group-hover:text-[#C46A42] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#63736A] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E5DEC9]">
                    <div>
                      <span className="font-mono font-semibold text-base text-[#18352D]">
                        {formatINR(item.rentalPriceDaily)}
                      </span>
                      <span className="text-xs text-[#63736A]">/day</span>
                    </div>
                    <span className="text-xs font-semibold text-[#C46A42] inline-flex items-center gap-1">
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION B: RECENTLY ADDED & POPULAR IN YOUR COMMUNITY */}
      <section className="py-12 sm:py-16 bg-[#F5F0E8] border-b border-[#E5DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Recently Added */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C46A42]" />
                <h2 className="font-editorial text-2xl text-[#18352D]">
                  Recently added
                </h2>
              </div>
              <button
                type="button"
                onClick={onExplore}
                className="text-xs font-medium text-[#63736A] hover:text-[#18352D]"
              >
                See all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {recentlyAdded.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenProductDetail(item.id, "rent", "daily")}
                  className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DEC9] hover:border-[#18352D]/40 text-left flex items-center gap-3 transition-colors group"
                >
                  <img
                    src={getProductImage(item)}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-14 h-14 rounded-xl object-cover border border-[#E5DEC9] shrink-0 bg-[#EAE2D5]"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-[#18352D] group-hover:text-[#C46A42] transition-colors truncate">
                      {item.title}
                    </h3>
                    <span className="text-xs font-mono text-[#63736A] block mt-0.5">
                      {formatINR(item.rentalPriceDaily)}/day
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Popular in Your Community */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#789681]" />
                <h2 className="font-editorial text-2xl text-[#18352D]">
                  Popular in your community
                </h2>
              </div>
              <button
                type="button"
                onClick={onExplore}
                className="text-xs font-medium text-[#63736A] hover:text-[#18352D]"
              >
                Explore
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {popularCommunity.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenProductDetail(item.id, "rent", "weekly")}
                  className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DEC9] hover:border-[#18352D]/40 text-left flex items-center gap-3 transition-colors group"
                >
                  <img
                    src={getProductImage(item)}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-14 h-14 rounded-xl object-cover border border-[#E5DEC9] shrink-0 bg-[#EAE2D5]"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-[#18352D] group-hover:text-[#C46A42] transition-colors truncate">
                      {item.title}
                    </h3>
                    <span className="text-xs font-mono text-[#63736A] block mt-0.5">
                      {item.owner?.completedRentals
                        ? `${item.owner.completedRentals} handovers • `
                        : ""}
                      {formatINR(item.rentalPriceWeekly)}/wk
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
