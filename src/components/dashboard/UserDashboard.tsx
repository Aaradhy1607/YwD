"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Calendar,
  AlertCircle,
  ArrowRight,
  User,
  Key,
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
}

export function UserDashboard({
  initialTab = "rentals",
  bookings,
  orders,
  myListings,
  wishlistItems,
  userAlias = "EcoRenter-4912",
  onOpenReturnModal,
  onToggleListingAvailability,
  onOpenProductDetail,
  onOpenListProduct,
}: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ id: string; msg: string; type: "success" | "error" } | null>(null);

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
      setActionFeedback({ id: bookingId, msg: "Handover verified! Rental is now active.", type: "success" });
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      setActionFeedback({ id: bookingId, msg: err.message, type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking? Any held security deposit will be released.")) return;
    setActionLoadingId(bookingId);
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, reason: "Cancelled by user" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancellation failed");
      setActionFeedback({ id: bookingId, msg: "Booking cancelled and deposit released.", type: "success" });
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      setActionFeedback({ id: bookingId, msg: err.message, type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Package },
    { id: "rentals", label: `Active Rentals (${bookings.length})`, icon: Clock },
    { id: "orders", label: `Purchases (${orders.length})`, icon: ShoppingBag },
    { id: "listings", label: `My Listings (${myListings.length})`, icon: ListPlus },
    { id: "refunds", label: "Escrow & Refunds", icon: RotateCcw },
    { id: "wishlist", label: `Wishlist (${wishlistItems.length})`, icon: Heart },
    { id: "privacy", label: "Privacy & Identity", icon: Lock },
  ];

  const totalHeldDeposit = bookings
    .filter((b) => b.escrowStatus === "HELD")
    .reduce((acc, curr) => acc + (curr.depositAmount || 0), 0);

  const totalRefunded = bookings
    .filter((b) => b.escrowStatus === "REFUNDED")
    .reduce((acc, curr) => acc + (curr.depositAmount || 0), 0);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Top Welcome Card with Deep Forest & Burnt Orange Accent */}
      <div className="bg-[#18352D] text-[#F5F0E8] p-6 sm:p-7 rounded-3xl border border-[#2C483F] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-white/20 shadow-md shrink-0">
            <img src="/images/ywd-logo.png" alt="YwD Insignia" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-xl sm:text-2xl text-white tracking-tight">
                {userAlias}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#789681]/20 text-[#9BB5A3] border border-[#789681]/30">
                Verified member
              </span>
            </div>
            <p className="text-xs text-[#9BB5A3]">
              Anonymous identity protected • No personal phone or email shared publicly
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenListProduct}
            className="px-4 py-2 rounded-xl bg-[#C46A42] hover:bg-[#A8532F] text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-xs"
          >
            <span>+ List an Item</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5DEC9]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-[#18352D] text-white shadow-xs"
                  : "bg-[#FFFFFF] text-[#63736A] hover:text-[#18352D] hover:bg-[#FAF7F2] border border-[#E5DEC9]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT WITH FLUID ANIMATION */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* 1. OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E5DEC9] space-y-1 shadow-xs">
                  <span className="text-xs font-medium text-[#63736A] block">
                    Active rentals
                  </span>
                  <p className="text-2xl sm:text-3xl font-semibold text-[#18352D] font-mono tabular-nums">
                    {bookings.filter((b) => ["CONFIRMED", "ACTIVE"].includes(b.status)).length}
                  </p>
                  <span className="text-xs text-[#789681] font-medium block pt-0.5">
                    Protected by YwD Escrow Vault
                  </span>
                </div>

                <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E5DEC9] space-y-1 shadow-xs">
                  <span className="text-xs font-medium text-[#63736A] block">
                    Security deposit held in escrow
                  </span>
                  <p className="text-2xl sm:text-3xl font-semibold text-[#C46A42] font-mono tabular-nums">
                    {formatINR(totalHeldDeposit)}
                  </p>
                  <span className="text-xs text-[#63736A] block pt-0.5">
                    Auto-refunded upon clean return inspection
                  </span>
                </div>

                <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E5DEC9] space-y-1 shadow-xs">
                  <span className="text-xs font-medium text-[#63736A] block">
                    Total deposits refunded
                  </span>
                  <p className="text-2xl sm:text-3xl font-semibold text-[#18352D] font-mono tabular-nums">
                    {formatINR(totalRefunded)}
                  </p>
                  <span className="text-xs text-[#789681] font-medium block pt-0.5">
                    Dispatched via automated UPI
                  </span>
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9] p-6 space-y-4 shadow-xs">
                <h3 className="font-semibold text-base text-[#18352D]">Recent Activity</h3>
                {bookings.length === 0 && orders.length === 0 ? (
                  <p className="text-xs text-[#63736A]">
                    You have no active orders yet. Browse the marketplace to book or buy verified items.
                  </p>
                ) : (
                  <div className="divide-y divide-[#E5DEC9] text-xs">
                    {bookings.slice(0, 4).map((b) => (
                      <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <span className="font-semibold text-sm text-[#18352D] block">{b.productTitle}</span>
                          <span className="text-[#63736A] mt-0.5 block">
                            {b.bookingNumber} • Handover OTP: <strong className="font-mono text-[#C46A42]">{b.pickupOtp}</strong>
                          </span>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#18352D]/10 text-[#18352D]">
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. ACTIVE RENTALS */}
          {activeTab === "rentals" && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="bg-[#FFFFFF] rounded-3xl border border-[#E5DEC9] p-12 text-center max-w-md mx-auto">
                  <Clock className="w-9 h-9 text-[#789681] mx-auto mb-3" />
                  <h4 className="font-semibold text-base text-[#18352D]">No active rental bookings</h4>
                  <p className="text-xs text-[#63736A] mt-1.5 leading-relaxed">
                    Browse verified listings to rent laptops, cameras, academic materials, or equipment.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9] p-5 space-y-4 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-mono font-semibold text-[#C46A42]">
                            {booking.bookingNumber}
                          </span>
                          <h4 className="font-semibold text-base text-[#18352D] mt-0.5 line-clamp-1">
                            {booking.productTitle}
                          </h4>
                          <span className="text-xs text-[#63736A]">
                            Lender Alias: <strong className="font-mono text-[#18352D]">{booking.ownerAlias}</strong>
                          </span>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === "COMPLETED"
                              ? "bg-stone-100 text-stone-700"
                              : booking.status === "DISPUTED"
                              ? "bg-[#A64F45]/15 text-[#A64F45]"
                              : "bg-[#18352D]/10 text-[#18352D]"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      {/* Dual-OTP Handover Box */}
                      <div className="grid grid-cols-2 gap-3 bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E5DEC9] text-xs">
                        <div>
                          <span className="text-[11px] text-[#63736A] font-medium block">
                            Pickup OTP
                          </span>
                          <span className="font-mono font-bold text-lg text-[#C46A42] tabular-nums">
                            {booking.pickupOtp}
                          </span>
                          <span className="text-[10px] text-[#63736A] block">Verify at pickup</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#63736A] font-medium block">
                            Return OTP
                          </span>
                          <span className="font-mono font-bold text-lg text-[#18352D] tabular-nums">
                            {booking.returnOtp}
                          </span>
                          <span className="text-[10px] text-[#63736A] block">Provide upon dropoff</span>
                        </div>
                      </div>

                      {/* Escrow Status & Dates */}
                      <div className="flex items-center justify-between text-xs text-[#63736A]">
                        <div>
                          <span>Duration: </span>
                          <strong className="text-[#18352D] capitalize font-mono">{booking.durationTier}</strong>
                        </div>
                        <div>
                          <span>Escrow Deposit: </span>
                          <strong className="text-[#18352D] font-mono tabular-nums">{formatINR(booking.depositAmount)}</strong>
                        </div>
                      </div>

                      {/* Action Triggers */}
                      {actionFeedback && actionFeedback.id === booking.id && (
                        <div
                          className={`p-2.5 rounded-xl text-xs font-medium ${
                            actionFeedback.type === "success"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-red-50 text-red-800 border border-red-200"
                          }`}
                        >
                          {actionFeedback.msg}
                        </div>
                      )}

                      {booking.status === "CONFIRMED" && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={actionLoadingId === booking.id}
                            onClick={() => handleVerifyHandover(booking.id, booking.pickupOtp)}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-[#18352D] hover:bg-[#234C40] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
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
                          className="w-full py-2.5 px-3 rounded-xl bg-[#18352D] hover:bg-[#234C40] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#C46A42]" />
                          <span>Initiate Return & Escrow Refund</span>
                        </button>
                      )}

                      {booking.status === "COMPLETED" && (
                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-xs font-medium flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Completed • 100% Deposit Refunded</span>
                        </div>
                      )}

                      {booking.status === "CANCELLED" && (
                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 text-xs font-medium text-center">
                          Cancelled
                        </div>
                      )}

                      {booking.status === "DISPUTED" && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium text-center">
                          Under Dispute Mediation • Escrow Locked
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. PURCHASES */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-[#FFFFFF] rounded-3xl border border-[#E5DEC9] p-12 text-center max-w-md mx-auto">
                  <ShoppingBag className="w-9 h-9 text-[#789681] mx-auto mb-3" />
                  <h4 className="font-semibold text-base text-[#18352D]">No purchases yet</h4>
                  <p className="text-xs text-[#63736A] mt-1.5">
                    Explore recommerce listings to buy pre-owned electronics, textbooks, and accessories.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5DEC9] bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9]">
                  {orders.map((o) => (
                    <div key={o.id} className="p-5 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-mono font-semibold text-xs text-[#C46A42]">{o.orderNumber}</span>
                        <h4 className="font-semibold text-sm sm:text-base text-[#18352D] mt-0.5">{o.productTitle}</h4>
                        <p className="text-xs text-[#63736A] mt-1">Shipping Address: {o.deliveryAddress}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-base sm:text-lg font-bold text-[#18352D] tabular-nums">
                          {formatINR(o.totalAmount)}
                        </span>
                        <span className="block text-[11px] font-medium text-[#789681] mt-0.5">
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
                <div className="bg-[#FFFFFF] rounded-3xl border border-[#E5DEC9] p-12 text-center max-w-md mx-auto">
                  <ListPlus className="w-9 h-9 text-[#789681] mx-auto mb-3" />
                  <h4 className="font-semibold text-base text-[#18352D]">You have no active listings</h4>
                  <p className="text-xs text-[#63736A] mt-1.5">
                    Turn your idle gear into recurring monthly income without exposing personal details.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenListProduct}
                    className="mt-4 px-4 py-2 rounded-full bg-[#C46A42] text-white text-xs font-semibold hover:bg-[#A8532F] transition-colors"
                  >
                    + List an Item
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {myListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9] p-4 flex gap-4 items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={listing.images?.[0]?.url || (Array.isArray(listing.images) && listing.images[0]) || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80"}
                          alt={listing.title}
                          className="w-16 h-16 rounded-xl object-cover border border-[#E5DEC9]"
                        />
                        <div>
                          <h4 className="font-semibold text-xs sm:text-sm text-[#18352D] line-clamp-1">{listing.title}</h4>
                          <span className="text-xs font-mono font-medium text-[#C46A42] tabular-nums">
                            {formatINR(listing.rentalPriceDaily)}/day • Deposit: {formatINR(listing.deposit)}
                          </span>
                          <span className="block text-[11px] text-[#63736A] mt-0.5">{listing.campusHub}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                            listing.isAvailable
                              ? "bg-[#18352D]/10 text-[#18352D]"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
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

          {/* 5. ESCROW & REFUNDS */}
          {activeTab === "refunds" && (
            <div className="space-y-4">
              <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E5DEC9] flex items-center gap-3.5">
                <ShieldCheck className="w-6 h-6 text-[#789681] shrink-0" />
                <div className="text-xs space-y-0.5">
                  <strong className="text-[#18352D] block font-semibold text-sm">
                    Automated Escrow Deposit Guarantee
                  </strong>
                  <span className="text-[#63736A] leading-relaxed block">
                    100% of your security deposit is held in isolated cryptographic escrow throughout the rental duration. Once the 4-point return inspection is validated at dropoff, refunds are credited automatically to your UPI account.
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
                    <div key={b.id} className="p-4 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-[#18352D] block">{b.productTitle}</span>
                        <span className="text-[#63736A]">
                          {b.bookingNumber} • Status: <strong className="text-[#18352D]">{b.escrowStatus}</strong>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-sm font-semibold text-[#C46A42] block tabular-nums">
                          {formatINR(b.depositAmount)}
                        </span>
                        <span className="text-[11px] text-[#63736A]">
                          {b.refundUpiId ? `Dispatched to ${b.refundUpiId}` : "Held in escrow"}
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
                <div className="bg-[#FFFFFF] rounded-3xl border border-[#E5DEC9] p-12 text-center max-w-md mx-auto">
                  <Heart className="w-9 h-9 text-[#C46A42] mx-auto mb-3" />
                  <h4 className="font-semibold text-base text-[#18352D]">Your wishlist is empty</h4>
                  <p className="text-xs text-[#63736A] mt-1.5">
                    Save hardware or academic materials you want to rent or purchase for shoots, projects, or exams.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {wishlistItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onOpenProductDetail(item.productId)}
                      className="bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9] p-4 flex gap-3.5 items-center cursor-pointer hover:border-[#789681] transition-all shadow-xs group"
                    >
                      <img
                        src={item.product?.images?.[0]?.url || (Array.isArray(item.product?.images) && item.product?.images[0]) || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80"}
                        alt={item.product?.title || "Product"}
                        className="w-16 h-16 rounded-xl object-cover border border-[#E5DEC9]"
                      />
                      <div>
                        <h5 className="font-semibold text-xs sm:text-sm text-[#18352D] group-hover:text-[#C46A42] transition-colors line-clamp-1">
                          {item.product?.title}
                        </h5>
                        <span className="text-xs font-mono font-medium text-[#C46A42] tabular-nums mt-0.5 block">
                          {item.product?.rentalPriceDaily ? formatINR(item.product.rentalPriceDaily) + "/day" : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 7. PRIVACY & IDENTITY */}
          {activeTab === "privacy" && (
            <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-3xl border border-[#E5DEC9] space-y-6 max-w-2xl shadow-xs">
              <div>
                <h3 className="font-semibold text-lg text-[#18352D] flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#C46A42]" />
                  <span>Identity Privacy Architecture</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#63736A] mt-1.5 leading-relaxed">
                  YwD implements a complete counterparty privacy shield. Other users never see your real name, personal email, phone number, or social profiles.
                </p>
              </div>

              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DEC9] space-y-2.5">
                <span className="text-xs font-semibold text-[#18352D] block">
                  Your Public Identity Visible to Others:
                </span>
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#18352D] text-white flex items-center justify-center font-bold text-xs">
                    {userAlias.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-mono font-semibold text-xs sm:text-sm text-[#18352D]">{userAlias}</p>
                    <p className="text-[11px] text-[#63736A]">Assigned system anonymous alias</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-[#63736A]">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#789681] shrink-0 mt-0.5" />
                  <span>Phone numbers and email addresses are never revealed during bookings, returns, or chats.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#789681] shrink-0 mt-0.5" />
                  <span>All communications occur exclusively via YwD-managed confidential relay chat.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#789681] shrink-0 mt-0.5" />
                  <span>Handover and return verification occur via secure 6-digit cryptographic OTP codes.</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
