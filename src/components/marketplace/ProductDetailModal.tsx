"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Heart,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Truck,
  Package,
  Star,
  Lock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
} from "lucide-react";
import { calculateRentalPrice, DurationTier, formatINR } from "@/lib/pricing";
import { UpiCheckoutModal } from "@/components/marketplace/UpiCheckoutModal";

interface ProductDetailModalProps {
  productId: string | null;
  initialMode?: "rent" | "buy";
  initialDuration?: string;
  onClose: () => void;
  onBookingSuccess: (booking: any) => void;
  onPurchaseSuccess: (order: any) => void;
  onOpenChatWithSeller: (sellerId: string, sellerAlias: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
}

export function ProductDetailModal({
  productId,
  initialMode = "rent",
  initialDuration = "weekly",
  onClose,
  onBookingSuccess,
  onPurchaseSuccess,
  onOpenChatWithSeller,
  isWishlisted,
  onToggleWishlist,
}: ProductDetailModalProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [mode, setMode] = useState<"rent" | "buy">(initialMode);
  const [durationTier, setDurationTier] = useState<DurationTier>(initialDuration as DurationTier);
  const [durationUnits, setDurationUnits] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Dates
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 8);
    return d.toISOString().split("T")[0];
  });

  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    available?: boolean;
    conflictReason?: string;
  } | null>(null);

  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [upiModalData, setUpiModalData] = useState<any>(null);

  // Fetch product data
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load product:", err);
        setLoading(false);
      });
  }, [productId]);

  // Re-check availability whenever dates change
  useEffect(() => {
    if (!productId || mode !== "rent") return;
    setAvailabilityChecking(true);
    fetch("/api/bookings/check-availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        setAvailabilityChecking(false);
        setAvailabilityStatus({
          available: res.isAvailable,
          conflictReason: res.conflictReason,
        });
      })
      .catch(() => setAvailabilityChecking(false));
  }, [productId, startDate, endDate, mode]);

  if (!productId) return null;

  const durationTiers: { id: DurationTier; label: string; days: number }[] = [
    { id: "hourly", label: "Hourly", days: 0.25 },
    { id: "daily", label: "Daily", days: 1 },
    { id: "weekly", label: "Weekly", days: 7 },
    { id: "monthly", label: "Monthly", days: 30 },
    { id: "semester", label: "Semester", days: 120 },
  ];

  // Live dynamic rate calculations from actual business rules
  const pricing = product
    ? calculateRentalPrice({
        rates: {
          hourly: product.rentalPriceHourly || Math.round(product.rentalPriceDaily / 6),
          daily: product.rentalPriceDaily,
          weekly: product.rentalPriceWeekly,
          monthly: product.rentalPriceMonthly || Math.round(product.rentalPriceWeekly * 3.4),
          semester: product.rentalPriceSemester || Math.round(product.rentalPriceWeekly * 8.5),
          deposit: product.deposit,
        },
        durationTier,
        durationUnits,
        deliveryMethod,
        customDeliveryFee: deliveryMethod === "DELIVERY" ? 99 : 0,
      })
    : null;

  // Handle Rental Booking — UPI pilot flow
  const handleProceedBooking = async () => {
    if (!product) return;
    setProcessing(true);
    setErrorMsg(null);

    try {
      if (new Date(startDate) >= new Date(endDate)) {
        throw new Error("End date must be after start date.");
      }

      if (deliveryMethod === "DELIVERY" && !deliveryAddress.trim()) {
        throw new Error("Please enter your complete delivery/shipping address.");
      }

      // Calculate days for backend
      const msPerDay = 1000 * 60 * 60 * 24;
      const days = Math.max(
        1,
        Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / msPerDay)
      );

      // Backend creates rental + returns UPI link (amounts are backend-authoritative)
      const res = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          durationTier,
          durationUnits,
          deliveryMethod,
          days,
          studentName: undefined, // backend uses session name
          studentUpi: undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create rental");
      }

      // Open UPI checkout modal
      setUpiModalData({ ...data, productTitle: product.title });
      setProcessing(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
      setProcessing(false);
    }
  };

  // Handle Outright Purchase
  const handleProceedPurchase = async () => {
    if (!product) return;
    setProcessing(true);
    setErrorMsg(null);

    try {
      if (!deliveryAddress.trim()) {
        throw new Error("Please enter your complete shipping/delivery address.");
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          deliveryAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create purchase order");
      }

      onPurchaseSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to complete purchase.");
      setProcessing(false);
    }
  };

  const images = product?.images?.map((i: any) => (typeof i === "string" ? i : i.url)) || [];
  if (images.length === 0 && product?.conditionPhotos) {
    images.push(...product.conditionPhotos);
  }

  return (
    <>
      {upiModalData && (
        <UpiCheckoutModal
          rental={upiModalData}
          onPaid={() => {
            onBookingSuccess(upiModalData);
            setUpiModalData(null);
          }}
          onClose={() => setUpiModalData(null)}
        />
      )}
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#202522]/75 flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#FAF7F2] w-full max-w-5xl rounded-3xl shadow-2xl border border-[#E5DEC9] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="bg-[#18352D] text-[#F5F0E8] px-6 py-4 flex items-center justify-between border-b border-[#2C483F] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[#FAF7F2] border border-white/20 shrink-0">
              <img src="/images/ywd-logo.png" alt="YwD Insignia" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wide text-white block">
                {mode === "rent" ? "Rental Details & Booking" : "Purchase Details"}
              </span>
              <span className="text-[11px] text-[#9BB5A3] block">
                Verified campus listing • Protected deposit
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleWishlist(product?.id)}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F0E8] transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? "fill-[#C46A42] text-[#C46A42]" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F0E8] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        {loading || !product ? (
          <div className="p-16 text-center text-[#63736A] space-y-3">
            <div className="w-9 h-9 border-2 border-[#18352D] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-[#18352D]">Loading listing specifications...</p>
          </div>
        ) : (
          <div className="overflow-y-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#FFFFFF]">
            {/* Left Column: Gallery & Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Primary Image View */}
              <div className="relative h-72 sm:h-96 bg-[#EAE2D5] rounded-2xl overflow-hidden border border-[#E5DEC9]">
                <img
                  src={images[activeImageIdx] || images[0]}
                  alt={product.title}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FAF7F2]/95 text-[#18352D] border border-[#E5DEC9]">
                    {product.conditionGrade || "Mint Grade"}
                  </span>
                </div>
              </div>

              {/* 4-Angle Thumbnail Strip */}
              {images.length > 1 && (
                <div>
                  <span className="text-xs font-medium text-[#63736A] block mb-2">
                    Verified condition photographs:
                  </span>
                  <div className="grid grid-cols-4 gap-2.5">
                    {images.slice(0, 4).map((url: string, i: number) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImageIdx(i)}
                        className={`h-20 rounded-xl overflow-hidden border transition-all ${
                          activeImageIdx === i
                            ? "border-[#18352D] ring-1 ring-[#18352D]"
                            : "border-[#E5DEC9] opacity-75 hover:opacity-100"
                        }`}
                      >
                        <img src={url} alt={`Condition Angle ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Title & Description */}
              <div>
                <div className="flex items-center gap-1.5 text-xs text-[#63736A] font-medium mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C46A42]" />
                  <span>{product.campusHub || "Central Logistics Hub"}</span>
                </div>
                <h1 className="font-editorial text-2xl sm:text-4xl text-[#18352D] tracking-tight leading-snug">
                  {product.title}
                </h1>
                <p className="text-xs sm:text-sm text-[#63736A] mt-3 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Hardware Specifications Table */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="bg-[#FAF7F2] rounded-xl p-4 sm:p-5 border border-[#E5DEC9] space-y-2.5">
                  <h4 className="text-xs font-medium text-[#18352D]">
                    Hardware specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="bg-[#FFFFFF] p-2.5 rounded-lg border border-[#E5DEC9]">
                        <span className="text-[#63736A] block text-[11px]">{key}</span>
                        <span className="font-medium text-[#18352D] mt-0.5 block">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidential Supplier Profile Card */}
              <div className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#E5DEC9] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#18352D] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {product.owner?.alias?.slice(0, 2).toUpperCase() || "PE"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-[#18352D]">
                        {product.owner?.alias || "Verified Peer"}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#789681]/20 text-[#18352D]">
                        Verified lender
                      </span>
                    </div>
                    <p className="text-xs text-[#63736A] mt-0.5">
                      {product.owner?.trustScore ?? 99}% trust score • {product.owner?.completedRentals ?? 14} verified handovers
                    </p>
                    <p className="text-[11px] text-[#789681] mt-0.5 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#C46A42]" />
                      <span>Zero personal contact numbers exposed</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenChatWithSeller(product.ownerId || "usr_vendor_1", product.owner?.alias)}
                  className="px-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5DEC9] hover:bg-[#F5F0E8] text-[#18352D] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#C46A42]" />
                  <span>Relay Chat</span>
                </button>
              </div>

              {/* Honest Reviews Section */}
              {product.reviews && product.reviews.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold text-[#18352D]">
                    Peer Experience Records ({product.reviews.length})
                  </h4>
                  <div className="space-y-2">
                    {product.reviews.map((rev: any) => (
                      <div key={rev.id} className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E5DEC9] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-medium text-[#18352D]">{rev.authorAlias}</span>
                          <div className="flex text-[#C46A42]">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-[#C46A42]" />
                            ))}
                          </div>
                        </div>
                        <p className="text-[#63736A] leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Interactive Booking / Purchase Engine */}
            <div className="lg:col-span-5 bg-[#FAF7F2] p-5 sm:p-6 rounded-3xl border border-[#E5DEC9] space-y-5 h-fit">
              {/* Transaction Mode Switcher (Rent vs Buy) */}
              <div className="grid grid-cols-2 gap-1.5 bg-[#FFFFFF] p-1.5 rounded-xl border border-[#E5DEC9]">
                <button
                  type="button"
                  onClick={() => setMode("rent")}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors text-center ${
                    mode === "rent"
                      ? "bg-[#18352D] text-white shadow-xs"
                      : "text-[#63736A] hover:text-[#18352D]"
                  }`}
                >
                  Rent for duration
                </button>
                <button
                  type="button"
                  onClick={() => setMode("buy")}
                  disabled={!product.isPurchasable}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors text-center ${
                    !product.isPurchasable
                      ? "opacity-40 cursor-not-allowed text-[#63736A]"
                      : mode === "buy"
                      ? "bg-[#18352D] text-white shadow-xs"
                      : "text-[#63736A] hover:text-[#18352D]"
                  }`}
                >
                  Buy pre-owned {product.buyPrice ? `(${formatINR(product.buyPrice)})` : "(Rent only)"}
                </button>
              </div>

              {/* RENTAL ENGINE */}
              {mode === "rent" && (
                <div className="space-y-4">
                  {/* Duration Tier Buttons */}
                  <div>
                    <label className="text-xs font-medium text-[#18352D] block mb-1.5">
                      Duration tier:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {durationTiers.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setDurationTier(t.id)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors text-center ${
                            durationTier === t.id
                              ? "bg-[#C46A42] text-white border-[#C46A42]"
                              : "bg-[#FFFFFF] text-[#63736A] border-[#E5DEC9] hover:border-[#789681]"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Pickers & Availability Conflict Indicator */}
                  <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5DEC9] space-y-3">
                    <span className="text-xs font-semibold text-[#18352D] block">
                      Rental Calendar Dates:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[11px] font-medium text-[#63736A] block mb-1">
                          Start date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E5DEC9] font-medium text-[#18352D] focus:outline-none focus:border-[#18352D]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-[#63736A] block mb-1">
                          End date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E5DEC9] font-medium text-[#18352D] focus:outline-none focus:border-[#18352D]"
                        />
                      </div>
                    </div>

                    {/* Conflict Status Bar */}
                    {availabilityChecking ? (
                      <p className="text-[11px] text-[#63736A] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C46A42] animate-pulse" />
                        Checking calendar reservation status...
                      </p>
                    ) : availabilityStatus?.available ? (
                      <p className="text-[11px] text-[#18352D] font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#789681]" />
                        Selected dates are available with zero reservation conflicts.
                      </p>
                    ) : availabilityStatus?.conflictReason ? (
                      <p className="text-[11px] text-[#A64F45] font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {availabilityStatus.conflictReason}
                      </p>
                    ) : null}
                  </div>

                  {/* Delivery vs Pickup */}
                  <div>
                    <label className="text-xs font-semibold text-[#18352D] block mb-2">
                      Fulfillment Method:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod("PICKUP")}
                        className={`p-3 rounded-2xl border text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${
                          deliveryMethod === "PICKUP"
                            ? "bg-[#FFFFFF] border-[#18352D] text-[#18352D] ring-1 ring-[#18352D] shadow-xs"
                            : "bg-[#FFFFFF] border-[#E5DEC9] text-[#63736A]"
                        }`}
                      >
                        <Package className="w-4 h-4 text-[#789681]" />
                        <div>
                          <span>Locker Handover</span>
                          <span className="text-[10px] font-normal block text-[#63736A]">₹0 Free</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryMethod("DELIVERY")}
                        className={`p-3 rounded-2xl border text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${
                          deliveryMethod === "DELIVERY"
                            ? "bg-[#FFFFFF] border-[#18352D] text-[#18352D] ring-1 ring-[#18352D] shadow-xs"
                            : "bg-[#FFFFFF] border-[#E5DEC9] text-[#63736A]"
                        }`}
                      >
                        <Truck className="w-4 h-4 text-[#C46A42]" />
                        <div>
                          <span>Express Delivery</span>
                          <span className="text-[10px] font-normal block text-[#63736A]">₹99 Insured</span>
                        </div>
                      </button>
                    </div>

                    {deliveryMethod === "DELIVERY" && (
                      <div className="mt-2.5">
                        <input
                          type="text"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Building, flat/hostel room number, street address..."
                          className="w-full p-2.5 bg-[#FFFFFF] rounded-xl border border-[#E5DEC9] text-xs text-[#18352D] focus:outline-none focus:border-[#18352D]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Transparent Price Breakdown */}
                  {pricing && (
                    <div className="bg-[#FFFFFF] rounded-xl p-4 border border-[#E5DEC9] space-y-2 text-xs">
                      <h4 className="font-semibold text-[#18352D] text-xs pb-1.5 border-b border-[#E5DEC9]">
                        Transparent escrow breakdown
                      </h4>

                      <div className="flex justify-between text-[#63736A]">
                        <span>Rental charge ({pricing.durationTier})</span>
                        <span className="font-mono tabular-nums text-[#18352D] font-medium">{formatINR(pricing.grossRent)}</span>
                      </div>

                      <div className="flex justify-between text-[#63736A]">
                        <span className="flex items-center gap-1.5">
                          Security deposit
                          <span className="px-1.5 py-0.2 rounded bg-[#789681]/15 text-[#18352D] text-[10px] font-medium">
                            100% refundable
                          </span>
                        </span>
                        <span className="font-mono tabular-nums text-[#18352D] font-medium">{formatINR(pricing.securityDeposit)}</span>
                      </div>

                      {pricing.deliveryFee > 0 && (
                        <div className="flex justify-between text-[#63736A]">
                          <span>Insured delivery</span>
                          <span className="font-mono tabular-nums text-[#18352D]">{formatINR(pricing.deliveryFee)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-[#63736A]">
                        <span>Platform escrow fee (3.5%)</span>
                        <span className="font-mono tabular-nums text-[#18352D]">{formatINR(pricing.platformFee)}</span>
                      </div>

                      <div className="flex justify-between text-[#63736A]">
                        <span>Taxes & GST (18%)</span>
                        <span className="font-mono tabular-nums text-[#18352D]">{formatINR(pricing.gstAmount)}</span>
                      </div>

                      <div className="pt-2 border-t border-[#E5DEC9] flex items-baseline justify-between font-semibold text-[#18352D] text-xs sm:text-sm">
                        <span>Total payable now:</span>
                        <span className="font-mono tabular-nums text-base text-[#C46A42]">{formatINR(pricing.totalPayable)}</span>
                      </div>

                      <div className="bg-[#FAF7F2] text-[#18352D] p-2 rounded-lg text-[11px] font-medium text-center mt-2 border border-[#E5DEC9]">
                        Effective cost after clean return refund: {formatINR(pricing.netEffectiveCost)}
                      </div>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium space-y-2">
                      <p>{errorMsg}</p>
                      {(errorMsg.toLowerCase().includes("authentication") || errorMsg.toLowerCase().includes("sign in")) && (
                        <a
                          href="/login"
                          className="inline-block px-3 py-1 bg-[#18352D] text-white rounded-lg text-xs font-semibold hover:bg-[#234C40] transition"
                        >
                          Sign In / Demo Login &rarr;
                        </a>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={processing || availabilityStatus?.available === false}
                    onClick={handleProceedBooking}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#C46A42] hover:bg-[#A8532F] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    {processing ? (
                      <span>Securing Booking in Escrow...</span>
                    ) : (
                      <>
                        <span>Confirm & Secure in Escrow ({pricing ? formatINR(pricing.totalPayable) : ""})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* OUTRIGHT PURCHASE ENGINE */}
              {mode === "buy" && (
                <div className="space-y-4">
                  <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E5DEC9] space-y-1.5">
                    <span className="text-xs text-[#63736A] font-medium block">
                      Recommerce Buy Price
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#18352D] font-mono tabular-nums">
                        {formatINR(product.buyPrice || 0)}
                      </span>
                      <span className="text-xs text-[#63736A] line-through">
                        {formatINR(product.mrpReference)} retail
                      </span>
                    </div>
                    <p className="text-xs text-[#789681] font-medium">
                      Verified pre-owned hardware with 7-day operational guarantee.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#18352D] block mb-1">
                      Shipping / Delivery Address:
                    </label>
                    <textarea
                      rows={3}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Room number, building, complete address, pincode..."
                      className="w-full p-2.5 bg-[#FFFFFF] rounded-xl border border-[#E5DEC9] text-xs text-[#18352D] focus:outline-none focus:border-[#18352D]"
                    />
                  </div>

                  <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E5DEC9] space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#63736A]">
                      <span>Item Subtotal</span>
                      <span className="font-mono tabular-nums text-[#18352D] font-medium">{formatINR(product.buyPrice || 0)}</span>
                    </div>
                    <div className="flex justify-between text-[#63736A]">
                      <span>Logistics & Express Shipping</span>
                      <span className="font-mono tabular-nums text-[#18352D]">₹99</span>
                    </div>
                    <div className="pt-2 border-t border-[#E5DEC9] flex justify-between font-bold text-sm text-[#18352D]">
                      <span>Total Amount:</span>
                      <span className="font-mono tabular-nums text-[#C46A42]">{formatINR((product.buyPrice || 0) + 99)}</span>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium space-y-2">
                      <p>{errorMsg}</p>
                      {(errorMsg.toLowerCase().includes("authentication") || errorMsg.toLowerCase().includes("sign in")) && (
                        <a
                          href="/login"
                          className="inline-block px-3 py-1 bg-[#18352D] text-white rounded-lg text-xs font-semibold hover:bg-[#234C40] transition"
                        >
                          Sign In / Demo Login &rarr;
                        </a>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleProceedPurchase}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#18352D] hover:bg-[#234C40] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    {processing ? (
                      <span>Processing Purchase...</span>
                    ) : (
                      <>
                        <span>Complete Purchase ({formatINR((product.buyPrice || 0) + 99)})</span>
                        <ArrowRight className="w-4 h-4 text-[#C46A42]" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
