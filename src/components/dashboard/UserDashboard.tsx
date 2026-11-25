"use client";

import React, { useMemo, useState } from "react";
import {
  Package,
  Clock,
  ShieldCheck,
  RotateCcw,
  ShoppingBag,
  ListPlus,
  Heart,
  Lock,
  CheckCircle2,
  Key,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { formatINR } from "@/lib/pricing";

interface UserDashboardProps {
  initialTab?: string;
  bookings: any[];
  orders: any[];
  myListings: any[];
  wishlistItems: any[];
  userAlias?: string;
  onOpenReturnModal: (bookingId: string) => void;
  onToggleListingAvailability: (productId: string) => void;
  onOpenProductDetail: (productId: string) => void;
  onOpenListProduct: () => void;
  onExplore?: () => void;
}

const LIFECYCLE_STEPS = [
  "Reserved",
  "Pickup OTP",
  "Active",
  "Returned & Refunded",
];

function getLifecycleStepIndex(status: string): number {
  switch (status) {
    case "PENDING":
      return 0;
    case "CONFIRMED":
      return 1;
    case "ACTIVE":
      return 2;
    case "COMPLETED":
      return 3;
    default:
      return -1;
  }
}

export function UserDashboard({
  initialTab = "overview",
  bookings,
  orders,
  myListings,
  wishlistItems,
  userAlias = "EcoRenter-4912",
  onOpenReturnModal,
  onToggleListingAvailability,
  onOpenProductDetail,
  onOpenListProduct,
  onExplore,
}: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [revealedOtpIds, setRevealedOtpIds] = useState<Record<string, boolean>>({});
  const [actionFeedback, setActionFeedback] = useState<{
    id: string;
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const toggleOtpReveal = (bookingId: string) => {
    setRevealedOtpIds((prev) => ({ ...prev, [bookingId]: !prev[bookingId] }));
  };

  const handleVerifyHandover = async (bookingId: string, pickupOtp: string) => {
    setActionLoadingId(bookingId);
    try {
      const res = await fetch("/api/bookings/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, pickupOtp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Handover verification failed");
      setActionFeedback({
        id: bookingId,
        msg: "Handover verified. Rental is now active.",
        type: "success",
      });
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      setActionFeedback({ id: bookingId, msg: err.message, type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this booking? Any held security deposit will be released."
      )
    )
      return;
    setActionLoadingId(bookingId);
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, reason: "Cancelled by user" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancellation failed");
      setActionFeedback({
        id: bookingId,
        msg: "Booking cancelled and deposit released.",
        type: "success",
      });
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      setActionFeedback({ id: bookingId, msg: err.message, type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Package },
    { id: "rentals", label: `Rentals (${bookings.length})`, icon: Clock },
    { id: "orders", label: `Orders (${orders.length})`, icon: ShoppingBag },
    { id: "listings", label: `My Listings (${myListings.length})`, icon: ListPlus },
    { id: "refunds", label: "Deposits & Refunds", icon: RotateCcw },
    { id: "wishlist", label: `Wishlist (${wishlistItems.length})`, icon: Heart },
    { id: "privacy", label: "Privacy", icon: Lock },
  ];

  const activeBookingsCount = useMemo(
    () => bookings.filter((b) => ["CONFIRMED", "ACTIVE"].includes(b.status)).length,
    [bookings]
  );

  const totalHeldDeposit = useMemo(
    () =>
      bookings
        .filter((b) => b.escrowStatus === "HELD")
        .reduce((acc, curr) => acc + (curr.depositAmount || 0), 0),
    [bookings]
  );

  const upcomingReturnLabel = useMemo(() => {
    const activeDates = bookings
      .filter((b) => ["CONFIRMED", "ACTIVE"].includes(b.status) && b.endDate)
      .map((b) => new Date(b.endDate).getTime())
      .filter((t) => !isNaN(t))
      .sort((a, b) => a - b);

    if (activeDates.length === 0) return "None scheduled";
    return new Date(activeDates[0]).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }, [bookings]);

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Workspace Header */}
      <div className="bg-[#18352D] text-[#F5F0E8] p-6 sm:p-7 rounded-2xl border border-[#2C483F] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FAF7F2] border border-white/20 shrink-0">
            <img
              src="/images/ywd-logo.png"
              alt="YwD Insignia"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5">
              <h1 className="font-semibold text-xl sm:text-2xl text-white tracking-tight">
                {userAlias}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF7F2]/10 text-[#D6E0D9] border border-white/15">
                Verified member
              </span>
            </div>
            <p className="text-xs text-[#9BB5A3]">
              Confidential alias active • Personal contact details remain private
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenListProduct}
            className="px-4 py-2.5 rounded-xl bg-[#C46A42] hover:bg-[#A8532F] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors"
          >
            <span>+ List an Item</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5DEC9]"
        role="tablist"
        aria-label="Dashboard sections"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-[#18352D] text-white"
                  : "bg-[#FFFFFF] text-[#63736A] hover:text-[#18352D] hover:bg-[#FAF7F2] border border-[#E5DEC9]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* 4-Card Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5DEC9] space-y-1">
              <span className="text-xs font-medium text-[#63736A] block">
                Active Rentals
              </span>
              <p className="text-2xl sm:text-3xl font-semibold text-[#18352D] font-mono tabular-nums">
                {activeBookingsCount}
              </p>
              <span className="text-xs text-[#63736A] block">
                Confirmed or active loans
              </span>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5DEC9] space-y-1">
              <span className="text-xs font-medium text-[#63736A] block">
                Protected Deposit Held
              </span>
              <p className="text-2xl sm:text-3xl font-semibold text-[#C46A42] font-mono tabular-nums">
                {formatINR(totalHeldDeposit)}
              </p>
              <span className="text-xs text-[#63736A] block">
                Tracked separately from fees
              </span>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5DEC9] space-y-1">
              <span className="text-xs font-medium text-[#63736A] block">
                Upcoming Return
              </span>
              <p className="text-2xl sm:text-3xl font-semibold text-[#18352D] font-mono tabular-nums">
                {upcomingReturnLabel}
              </p>
              <span className="text-xs text-[#63736A] block">
                Next scheduled dropoff
              </span>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5DEC9] space-y-1">
              <span className="text-xs font-medium text-[#63736A] block">
                Saved Items
              </span>
              <p className="text-2xl sm:text-3xl font-semibold text-[#18352D] font-mono tabular-nums">
                {wishlistItems.length}
              </p>
              <span className="text-xs text-[#63736A] block">
                In your wishlist
              </span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-base text-[#18352D]">
                Recent Activity
              </h2>
              {bookings.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("rentals")}
                  className="text-xs font-medium text-[#C46A42] hover:underline"
                >
                  Manage rentals
                </button>
              )}
            </div>

            {bookings.length === 0 && orders.length === 0 ? (
              <div className="py-6 text-center space-y-3">
                <p className="text-xs sm:text-sm text-[#63736A]">
                  You have no active bookings or purchases yet.
                </p>
                {onExplore && (
                  <button
                    type="button"
                    onClick={onExplore}
                    className="px-4 py-2 rounded-xl bg-[#18352D] text-white text-xs font-semibold hover:bg-[#234C40] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Explore Gear</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[#E5DEC9] text-xs">
                {bookings.slice(0, 4).map((b) => (
                  <div
                    key={b.id}
                    className="py-3.5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-semibold text-sm text-[#18352D] block">
                        {b.productTitle}
                      </span>
                      <span className="text-[#63736A] mt-0.5 block font-mono">
                        {b.bookingNumber} • Deposit {formatINR(b.depositAmount)}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FAF7F2] text-[#18352D] border border-[#E5DEC9]">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. RENTALS */}
      {activeTab === "rentals" && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9] p-12 text-center max-w-md mx-auto">
              <Clock className="w-9 h-9 text-[#789681] mx-auto mb-3" />
              <h2 className="font-semibold text-base text-[#18352D]">
                No rental bookings yet
              </h2>
              <p className="text-xs text-[#63736A] mt-1.5 leading-relaxed">
                Reserve verified laptops, cameras, or academic tools with protected deposit handling.
              </p>
              {onExplore && (
                <button
                  type="button"
                  onClick={onExplore}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-[#18352D] text-white text-xs font-semibold hover:bg-[#234C40] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Explore Gear</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {bookings.map((booking) => {
                const stepIdx = getLifecycleStepIndex(booking.status);
                const isOtpRevealed = Boolean(revealedOtpIds[booking.id]);

                return (
                  <div
                    key={booking.id}
                    className="bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9] p-5 sm:p-6 space-y-5"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-mono font-semibold text-[#C46A42]">
                          {booking.bookingNumber}
                        </span>
                        <h3 className="font-semibold text-base text-[#18352D] mt-0.5 line-clamp-1">
                          {booking.productTitle}
                        </h3>
                        <span className="text-xs text-[#63736A]">
                          Counterparty:{" "}
                          <strong className="font-mono text-[#18352D]">
                            {booking.ownerAlias}
                          </strong>
                        </span>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          booking.status === "DISPUTED"
                            ? "bg-[#A64F45]/10 text-[#A64F45] border-[#A64F45]/20"
                            : "bg-[#FAF7F2] text-[#18352D] border-[#E5DEC9]"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    {/* 4-Step Lifecycle Progress Indicator */}
                    {stepIdx >= 0 && (
                      <div aria-label="Rental lifecycle progress" className="space-y-2">
                        <div className="grid grid-cols-4 gap-1.5">
                          {LIFECYCLE_STEPS.map((label, idx) => {
                            const reached = idx <= stepIdx;
                            return (
                              <div key={label} className="space-y-1">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    reached ? "bg-[#18352D]" : "bg-[#EAE2D5]"
                                  }`}
                                />
                                <span
                                  className={`block text-[10px] leading-tight ${
                                    reached
                                      ? "text-[#18352D] font-medium"
                                      : "text-[#63736A]"
                                  }`}
                                >
                                  {label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Stage-Appropriate OTP Display (Never shown for COMPLETED/CANCELLED/DISPUTED) */}
                    {booking.status === "CONFIRMED" && (
                      <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E5DEC9] flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[11px] text-[#63736A] font-medium block">
                            Pickup OTP
                          </span>
                          <span className="font-mono font-bold text-lg text-[#C46A42] tabular-nums">
                            {isOtpRevealed ? booking.pickupOtp : "••••••"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleOtpReveal(booking.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E5DEC9] text-xs font-medium text-[#18352D] hover:border-[#18352D]/40 inline-flex items-center gap-1.5"
                        >
                          {isOtpRevealed ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hide OTP</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Show Pickup OTP</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {booking.status === "ACTIVE" && (
                      <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E5DEC9] flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[11px] text-[#63736A] font-medium block">
                            Return OTP (for dropoff verification)
                          </span>
                          <span className="font-mono font-bold text-lg text-[#18352D] tabular-nums">
                            {isOtpRevealed ? booking.returnOtp : "••••••"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleOtpReveal(booking.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E5DEC9] text-xs font-medium text-[#18352D] hover:border-[#18352D]/40 inline-flex items-center gap-1.5"
                        >
                          {isOtpRevealed ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hide OTP</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Show Return OTP</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-[#63736A]">
                      <div>
                        <span>Duration: </span>
                        <strong className="text-[#18352D] capitalize font-mono">
                          {booking.durationTier}
                        </strong>
                      </div>
                      <div>
                        <span>Deposit: </span>
                        <strong className="text-[#18352D] font-mono tabular-nums">
                          {formatINR(booking.depositAmount)}
                        </strong>
                      </div>
                    </div>

                    {actionFeedback && actionFeedback.id === booking.id && (
                      <div
                        className={`p-2.5 rounded-xl text-xs font-medium ${
                          actionFeedback.type === "success"
                            ? "bg-[#FAF7F2] text-[#18352D] border border-[#789681]"
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                      >
                        {actionFeedback.msg}
                      </div>
                    )}

                    {/* Contextual Primary Action */}
                    {booking.status === "CONFIRMED" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={actionLoadingId === booking.id}
                          onClick={() =>
                            handleVerifyHandover(booking.id, booking.pickupOtp)
                          }
                          className="flex-1 py-2.5 px-3 rounded-xl bg-[#18352D] hover:bg-[#234C40] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <Key className="w-3.5 h-3.5 text-[#789681]" />
                          <span>Verify Handover</span>
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === booking.id}
                          onClick={() => handleCancelBooking(booking.id)}
                          className="py-2.5 px-3 rounded-xl border border-[#E5DEC9] hover:bg-[#FAF7F2] text-[#A64F45] text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {booking.status === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() => onOpenReturnModal(booking.id)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#C46A42] hover:bg-[#A8532F] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Start Return Inspection</span>
                      </button>
                    )}

                    {["COMPLETED", "CANCELLED", "DISPUTED"].includes(booking.status) && (
                      <button
                        type="button"
                        onClick={() => onOpenProductDetail(booking.productId)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F5F0E8] border border-[#E5DEC9] text-[#18352D] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>View Rental Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. ORDERS */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9] p-12 text-center max-w-md mx-auto">
              <ShoppingBag className="w-9 h-9 text-[#789681] mx-auto mb-3" />
              <h2 className="font-semibold text-base text-[#18352D]">
                No purchases yet
              </h2>
              <p className="text-xs text-[#63736A] mt-1.5 leading-relaxed">
                Explore recommerce listings to buy pre-owned electronics, textbooks, and accessories.
              </p>
              {onExplore && (
                <button
                  type="button"
                  onClick={onExplore}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-[#18352D] text-white text-xs font-semibold hover:bg-[#234C40] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Explore Gear</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#E5DEC9] bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9]">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="p-5 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-mono font-semibold text-xs text-[#C46A42]">
                      {o.orderNumber}
                    </span>
                    <h3 className="font-semibold text-sm sm:text-base text-[#18352D] mt-0.5">
                      {o.productTitle}
                    </h3>
                    <p className="text-xs text-[#63736A] mt-1">
                      Shipping Address: {o.deliveryAddress}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-base sm:text-lg font-bold text-[#18352D] tabular-nums">
                      {formatINR(o.totalAmount)}
                    </span>
                    <span className="block text-[11px] font-medium text-[#63736A] mt-0.5">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. MY LISTINGS */}
      {activeTab === "listings" && (
        <div className="space-y-4">
          {myListings.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9] p-12 text-center max-w-md mx-auto">
              <ListPlus className="w-9 h-9 text-[#789681] mx-auto mb-3" />
              <h2 className="font-semibold text-base text-[#18352D]">
                You have no active listings
              </h2>
              <p className="text-xs text-[#63736A] mt-1.5 leading-relaxed">
                List idle equipment for verified campus rentals without exposing personal contact details.
              </p>
              <button
                type="button"
                onClick={onOpenListProduct}
                className="mt-5 px-5 py-2.5 rounded-xl bg-[#C46A42] text-white text-xs font-semibold hover:bg-[#A8532F] transition-colors"
              >
                List an Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9] p-4 flex gap-4 items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={
                        listing.images?.[0]?.url ||
                        (Array.isArray(listing.images) && listing.images[0]) ||
                        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80"
                      }
                      alt={listing.title}
                      className="w-16 h-16 rounded-xl object-cover border border-[#E5DEC9]"
                    />
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-[#18352D] line-clamp-1">
                        {listing.title}
                      </h3>
                      <span className="text-xs font-mono font-medium text-[#C46A42] tabular-nums">
                        {formatINR(listing.rentalPriceDaily)}/day • Deposit:{" "}
                        {formatINR(listing.deposit)}
                      </span>
                      <span className="block text-[11px] text-[#63736A] mt-0.5">
                        {listing.campusHub}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF7F2] text-[#18352D] border border-[#E5DEC9]">
                      {listing.isAvailable ? "Active" : "Paused"}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleListingAvailability(listing.id)}
                      className="text-xs font-medium text-[#18352D] hover:underline"
                    >
                      {listing.isAvailable ? "Pause" : "Resume"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. DEPOSITS & REFUNDS */}
      {activeTab === "refunds" && (
        <div className="space-y-4">
          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E5DEC9] flex items-center gap-3.5">
            <ShieldCheck className="w-6 h-6 text-[#789681] shrink-0" />
            <div className="text-xs space-y-0.5">
              <strong className="text-[#18352D] block font-semibold text-sm">
                Protected Security Deposit Handling
              </strong>
              <span className="text-[#63736A] leading-relaxed block">
                Security deposits are tracked separately from rental fees. After return OTP and condition photo verification, refund processing is initiated to your specified UPI ID.
              </span>
            </div>
          </div>

          <div className="divide-y divide-[#E5DEC9] bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9]">
            {bookings.length === 0 ? (
              <p className="p-8 text-center text-xs text-[#63736A]">
                No deposit transactions recorded yet.
              </p>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#18352D] block">
                      {b.productTitle}
                    </span>
                    <span className="text-[#63736A]">
                      {b.bookingNumber} • Status:{" "}
                      <strong className="text-[#18352D]">{b.escrowStatus}</strong>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-semibold text-[#C46A42] block tabular-nums">
                      {formatINR(b.depositAmount)}
                    </span>
                    <span className="text-[11px] text-[#63736A]">
                      {b.refundUpiId
                        ? `UPI: ${b.refundUpiId}`
                        : b.escrowStatus === "RELEASED"
                        ? "Released on cancellation"
                        : "Held during rental"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. WISHLIST */}
      {activeTab === "wishlist" && (
        <div className="space-y-4">
          {wishlistItems.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9] p-12 text-center max-w-md mx-auto">
              <Heart className="w-9 h-9 text-[#C46A42] mx-auto mb-3" />
              <h2 className="font-semibold text-base text-[#18352D]">
                Your wishlist is empty
              </h2>
              <p className="text-xs text-[#63736A] mt-1.5 leading-relaxed">
                Save hardware or academic materials you want to rent or purchase later.
              </p>
              {onExplore && (
                <button
                  type="button"
                  onClick={onExplore}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-[#18352D] text-white text-xs font-semibold hover:bg-[#234C40] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Explore Gear</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onOpenProductDetail(item.productId)}
                  className="bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9] p-4 flex gap-3.5 items-center cursor-pointer hover:border-[#18352D]/40 transition-colors group"
                >
                  <img
                    src={
                      item.product?.images?.[0]?.url ||
                      (Array.isArray(item.product?.images) &&
                        item.product?.images[0]) ||
                      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80"
                    }
                    alt={item.product?.title || "Product"}
                    className="w-16 h-16 rounded-xl object-cover border border-[#E5DEC9]"
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-xs sm:text-sm text-[#18352D] group-hover:text-[#C46A42] transition-colors line-clamp-1">
                      {item.product?.title}
                    </h3>
                    <span className="text-xs font-mono font-medium text-[#C46A42] tabular-nums mt-0.5 block">
                      {item.product?.rentalPriceDaily
                        ? `${formatINR(item.product.rentalPriceDaily)}/day`
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. PRIVACY */}
      {activeTab === "privacy" && (
        <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-2xl border border-[#E5DEC9] space-y-6 max-w-2xl">
          <div>
            <h2 className="font-semibold text-lg text-[#18352D] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#C46A42]" />
              <span>Identity Privacy Architecture</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#63736A] mt-1.5 leading-relaxed">
              YwD protects counterparty privacy. Other users see only your assigned alias, never your real name, personal email, or phone number.
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DEC9] space-y-2.5">
            <span className="text-xs font-semibold text-[#18352D] block">
              Your Public Alias:
            </span>
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#18352D] text-white flex items-center justify-center font-bold text-xs">
                {userAlias.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-mono font-semibold text-xs sm:text-sm text-[#18352D]">
                  {userAlias}
                </p>
                <p className="text-[11px] text-[#63736A]">
                  System-assigned anonymous alias
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-[#63736A]">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#789681] shrink-0 mt-0.5" />
              <span>
                Phone numbers and email addresses are moderated out of relay messages and never exposed.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#789681] shrink-0 mt-0.5" />
              <span>
                Pickup and return handovers are verified using 6-digit server-verified OTP codes.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
