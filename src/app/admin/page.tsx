"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Package,
  Calendar,
  AlertTriangle,
  Users,
  FileText,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Lock,
  IndianRupee,
} from "lucide-react";
import { paiseToRupees } from "@/lib/payments/upi";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "bookings" | "disputes" | "users" | "audit" | "upi-rentals">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // UPI Rentals state
  const [upiRentals, setUpiRentals] = useState<any[]>([]);
  const [upiLoading, setUpiLoading] = useState(false);
  const [damageInputs, setDamageInputs] = useState<Record<string, string>>({});

  const fetchAdminData = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/admin");
      if (res.status === 401 || res.status === 403) {
        setAuthorized(false);
        const err = await res.json();
        setAuthError(err.error || "Administrator credentials required.");
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData(json);
      setAuthorized(true);
    } catch (e: any) {
      setAuthError(e.message || "Failed to load administrative data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUpiRentals = async () => {
    setUpiLoading(true);
    try {
      const res = await fetch("/api/admin/rentals");
      if (res.ok) {
        const json = await res.json();
        setUpiRentals(json.rentals || []);
      }
    } catch {}
    setUpiLoading(false);
  };

  const handleRentalAction = async (id: string, action: string, damagePaise?: number) => {
    setActionLoading(true);
    try {
      const body: any = { action };
      if (damagePaise !== undefined) body.damagePaise = damagePaise;
      const res = await fetch(`/api/admin/rentals/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setActionMessage(`Rental ${id}: action ${action} applied.`);
        fetchUpiRentals();
      } else {
        const err = await res.json();
        setActionMessage(`Error: ${err.error}`);
      }
    } catch {}
    setActionLoading(false);
    setTimeout(() => setActionMessage(null), 5000);
  };

  useEffect(() => {
    fetchAdminData();
    fetchUpiRentals();
  }, []);

  const handleToggleProduct = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_PRODUCT_SUSPENSION", targetId: id }),
      });
      if (res.ok) {
        setActionMessage("Product listing status updated successfully.");
        fetchAdminData();
      }
    } catch {}
    setActionLoading(false);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!window.confirm(`Permanently delete "${title}"? This cannot be undone.`)) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_PRODUCT", targetId: id }),
      });
      const json = await res.json();
      if (res.ok) {
        setActionMessage("Product listing permanently deleted.");
        fetchAdminData();
      } else {
        setActionMessage(`Error: ${json.error || "Failed to delete product"}`);
      }
    } catch {}
    setActionLoading(false);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleResolveDispute = async (id: string, refundDecision: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESOLVE_DISPUTE",
          targetId: id,
          payload: {
            resolution: `Resolved by platform administrator. Decision: ${refundDecision}`,
            refundDecision,
          },
        }),
      });
      if (res.ok) {
        setActionMessage("Dispute resolved successfully.");
        fetchAdminData();
      }
    } catch {}
    setActionLoading(false);
    setTimeout(() => setActionMessage(null), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1F1A] text-white flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-[#C46A42] animate-spin" />
        <p className="text-sm tracking-widest text-[#789681] uppercase font-mono">Authenticating System Access...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#0E1F1A] text-white flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#18352D]/80 border border-[#234C40] p-8 rounded-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#C46A42]/10 border border-[#C46A42]/30 flex items-center justify-center text-[#C46A42]">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-[#FAF7F2]">Platform Administration</h1>
            <p className="text-sm text-[#789681] mt-2">
              {authError || "This operations console is strictly restricted to verified platform administrators."}
            </p>
          </div>
          <div className="p-4 bg-[#0E1F1A]/80 border border-[#234C40] rounded-xl text-xs text-center font-mono space-y-1 text-[#789681]">
            <ShieldCheck className="w-4 h-4 mx-auto text-[#7052DF]" />
            <p>Privileged Session Required</p>
            <p className="text-[11px] text-[#63736A]">Sign in with your authorized administrator email and password.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/auth?tab=login"
              className="flex-1 py-3 px-4 bg-[#C46A42] hover:bg-[#A8532F] text-white text-sm font-medium rounded-xl transition text-center"
            >
              Sign In as Admin
            </Link>
            <Link
              href="/"
              className="flex-1 py-3 px-4 bg-[#234C40] hover:bg-[#202522] text-[#FAF7F2] text-sm font-medium rounded-xl transition text-center border border-[#789681]/30"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { metrics, products, bookings, disputes, users, auditLogs } = data || {};

  return (
    <div className="min-h-screen bg-[#0E1F1A] text-[#FAF7F2] font-sans pb-20">
      {/* Top Banner & Header */}
      <header className="border-b border-[#234C40] bg-[#142921]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="p-2 rounded-lg bg-[#18352D] hover:bg-[#234C40] text-[#789681] hover:text-white transition"
              title="Return to Marketplace"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-serif tracking-wide text-lg text-white">YwD TrustOps Console</span>
              <span className="text-xs bg-[#7052DF]/30 text-[#A892F7] px-2 py-0.5 rounded border border-[#7052DF]/40 font-mono">
                ADMIN ACCESS
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchAdminData}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#18352D] hover:bg-[#234C40] border border-[#234C40] text-xs font-mono text-[#789681] hover:text-white transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Database</span>
            </button>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg bg-[#C46A42] hover:bg-[#A8532F] text-xs font-medium text-white transition"
            >
              Live Site
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {actionMessage && (
          <div className="p-4 bg-emerald-900/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm flex items-center space-x-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Metric KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-[#18352D]/70 border border-[#234C40] p-4 rounded-xl">
            <div className="flex items-center justify-between text-[#789681]">
              <span className="text-xs uppercase font-mono">Members</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl font-serif text-white mt-2">{metrics?.totalUsers || 0}</div>
            <div className="text-[11px] text-[#789681] mt-0.5">Verified Accounts</div>
          </div>

          <div className="bg-[#18352D]/70 border border-[#234C40] p-4 rounded-xl">
            <div className="flex items-center justify-between text-[#789681]">
              <span className="text-xs uppercase font-mono">Catalog</span>
              <Package className="w-4 h-4" />
            </div>
            <div className="text-2xl font-serif text-white mt-2">{metrics?.totalProducts || 0}</div>
            <div className="text-[11px] text-[#789681] mt-0.5">Active Products</div>
          </div>

          <div className="bg-[#18352D]/70 border border-[#234C40] p-4 rounded-xl">
            <div className="flex items-center justify-between text-[#789681]">
              <span className="text-xs uppercase font-mono">Active Loans</span>
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-2xl font-serif text-white mt-2">{metrics?.activeRentals || 0}</div>
            <div className="text-[11px] text-[#789681] mt-0.5">Handed Over</div>
          </div>

          <div className="bg-[#18352D]/70 border border-[#234C40] p-4 rounded-xl">
            <div className="flex items-center justify-between text-[#789681]">
              <span className="text-xs uppercase font-mono">Escrow Vault</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-2xl font-serif text-emerald-400 mt-2">
              ₹{(metrics?.totalEscrowHeld || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-[#789681] mt-0.5">Deposits Protected</div>
          </div>

          <div className="bg-[#18352D]/70 border border-[#234C40] p-4 rounded-xl">
            <div className="flex items-center justify-between text-[#789681]">
              <span className="text-xs uppercase font-mono">Disputes</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-serif text-[#C46A42] mt-2">{metrics?.openDisputes || 0}</div>
            <div className="text-[11px] text-[#789681] mt-0.5">Pending Review</div>
          </div>

          <div className="bg-[#18352D]/70 border border-[#234C40] p-4 rounded-xl">
            <div className="flex items-center justify-between text-[#789681]">
              <span className="text-xs uppercase font-mono">Transactions</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-2xl font-serif text-white mt-2">{metrics?.totalPayments || 0}</div>
            <div className="text-[11px] text-[#789681] mt-0.5">Recorded Payments</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-b border-[#234C40] pb-2 overflow-x-auto">
          {[
            { id: "overview", label: "Operations Overview", icon: ShieldCheck },
            { id: "products", label: `Catalog Moderation (${products?.length || 0})`, icon: Package },
            { id: "bookings", label: `Bookings & Escrow (${bookings?.length || 0})`, icon: Calendar },
            { id: "disputes", label: `Dispute Resolution (${disputes?.length || 0})`, icon: AlertTriangle },
            { id: "users", label: `Member Accounts (${users?.length || 0})`, icon: Users },
            { id: "audit", label: `Security Audit Trail (${auditLogs?.length || 0})`, icon: FileText },
            { id: "upi-rentals", label: `UPI Rentals (${upiRentals.length})`, icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition whitespace-nowrap ${
                  active
                    ? "bg-[#18352D] text-[#C46A42] border border-[#234C40] font-semibold"
                    : "text-[#789681] hover:text-white hover:bg-[#18352D]/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#18352D]/60 border border-[#234C40] rounded-xl p-6 space-y-4">
                <h3 className="font-serif text-lg text-white">Live Platform Status</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-[#234C40]">
                    <span className="text-[#789681]">Database Engine</span>
                    <span className="font-mono text-emerald-400">Neon Serverless PostgreSQL (Active)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#234C40]">
                    <span className="text-[#789681]">Connection Pooling</span>
                    <span className="font-mono text-white">@prisma/adapter-pg (IPv4 Enabled)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#234C40]">
                    <span className="text-[#789681]">Cryptographic Dual-OTP</span>
                    <span className="font-mono text-emerald-400">Node Native CSPRNG (Active)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#234C40]">
                    <span className="text-[#789681]">Escrow Protocol</span>
                    <span className="font-mono text-white">Platform Ledger Verification</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#789681]">Privacy Shielding</span>
                    <span className="font-mono text-emerald-400">Autonomous Aliases Enforced</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#18352D]/60 border border-[#234C40] rounded-xl p-6 space-y-4">
                <h3 className="font-serif text-lg text-white">Immediate Admin Action Queue</h3>
                <div className="space-y-3">
                  {disputes && disputes.filter((d: any) => d.status === "OPEN").length > 0 ? (
                    disputes
                      .filter((d: any) => d.status === "OPEN")
                      .map((d: any) => (
                        <div
                          key={d.id}
                          className="p-3 bg-[#0E1F1A] border border-[#C46A42]/40 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-mono text-[#C46A42]">Dispute on {d.bookingNumber}</div>
                            <div className="text-sm font-medium text-white">{d.reason}</div>
                          </div>
                          <button
                            onClick={() => setActiveTab("disputes")}
                            className="px-3 py-1 bg-[#C46A42] hover:bg-[#A8532F] text-xs font-medium rounded text-white"
                          >
                            Review
                          </button>
                        </div>
                      ))
                  ) : (
                    <div className="p-6 text-center text-[#789681] font-mono text-sm">
                      Zero open disputes. All rental loans operating normally.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === "products" && (
          <div className="bg-[#18352D]/60 border border-[#234C40] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#234C40] flex justify-between items-center">
              <h3 className="font-serif text-lg text-white">Marketplace Product Catalog</h3>
              <span className="text-xs font-mono text-[#789681]">{products?.length || 0} Total Listings</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#142921] text-xs font-mono uppercase text-[#789681] border-b border-[#234C40]">
                  <tr>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Owner Alias</th>
                    <th className="py-3 px-4">Rates (INR)</th>
                    <th className="py-3 px-4">Deposit</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#234C40]">
                  {products?.map((p: any) => (
                    <tr key={p.id} className="hover:bg-[#18352D]">
                      <td className="py-3 px-4">
                        <div className="font-medium text-white line-clamp-1">{p.title}</div>
                        <div className="text-xs text-[#789681] font-mono">{p.campusHub}</div>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-[#789681]">{p.category}</td>
                      <td className="py-3 px-4 text-xs font-mono text-emerald-400">{p.ownerAlias}</td>
                      <td className="py-3 px-4 font-mono text-xs text-white">
                        ₹{p.rentalPriceDaily}/day
                        {p.buyPrice && <span className="text-[#C46A42] block">Buy: ₹{p.buyPrice}</span>}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-white">₹{p.deposit}</td>
                      <td className="py-3 px-4">
                        {p.isPaused ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-red-900/40 text-red-300 border border-red-500/30">
                            Suspended
                          </span>
                        ) : p.isAvailable ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-emerald-900/40 text-emerald-300 border border-emerald-500/30">
                            Live & Ready
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs bg-amber-900/40 text-amber-300 border border-amber-500/30">
                            On Loan / Sold
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleToggleProduct(p.id)}
                          className={`px-3 py-1 rounded text-xs font-mono transition ${
                            p.isPaused
                              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                              : "bg-red-950/80 hover:bg-red-900 border border-red-600/50 text-red-300"
                          }`}
                        >
                          {p.isPaused ? "Unsuspend" : "Suspend"}
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleDeleteProduct(p.id, p.title)}
                          className="px-3 py-1 rounded text-xs font-mono bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-200 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="bg-[#18352D]/60 border border-[#234C40] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#234C40] flex justify-between items-center">
              <h3 className="font-serif text-lg text-white">Rental Reservations & Escrow Ledger</h3>
              <span className="text-xs font-mono text-[#789681]">{bookings?.length || 0} Bookings</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#142921] text-xs font-mono uppercase text-[#789681] border-b border-[#234C40]">
                  <tr>
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Hardware Item</th>
                    <th className="py-3 px-4">Renter Alias</th>
                    <th className="py-3 px-4">Total / Deposit</th>
                    <th className="py-3 px-4">Dual OTP Codes</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Escrow Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#234C40]">
                  {bookings?.map((b: any) => (
                    <tr key={b.id} className="hover:bg-[#18352D]">
                      <td className="py-3 px-4 font-mono text-xs text-[#C46A42]">{b.bookingNumber}</td>
                      <td className="py-3 px-4 text-white font-medium line-clamp-1">{b.productTitle}</td>
                      <td className="py-3 px-4 font-mono text-xs text-[#789681]">{b.renterAlias}</td>
                      <td className="py-3 px-4 font-mono text-xs text-white">
                        ₹{b.totalAmount} <span className="text-emerald-400 block">Dep: ₹{b.depositAmount}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        <span className="text-[#789681]">Pickup:</span> <span className="text-white">{b.pickupOtp}</span>
                        <span className="text-[#789681] block">Return: <span className="text-white">{b.returnOtp}</span></span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs bg-[#234C40] text-emerald-300 font-mono">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-emerald-400">{b.escrowStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DISPUTES */}
        {activeTab === "disputes" && (
          <div className="bg-[#18352D]/60 border border-[#234C40] rounded-xl overflow-hidden space-y-4 p-6">
            <h3 className="font-serif text-lg text-white">Dispute Arbitration & Condition Audit</h3>
            {disputes && disputes.length > 0 ? (
              <div className="space-y-4">
                {disputes.map((d: any) => (
                  <div key={d.id} className="bg-[#0E1F1A] border border-[#234C40] p-5 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-mono text-[#C46A42]">{d.bookingNumber}</span>
                        <h4 className="text-base font-semibold text-white mt-1">{d.reason}</h4>
                        <p className="text-sm text-[#789681] mt-1">{d.description}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-xs font-mono ${
                        d.status === "OPEN" ? "bg-[#C46A42]/20 text-[#C46A42] border border-[#C46A42]/40" : "bg-emerald-950 text-emerald-400"
                      }`}>
                        {d.status}
                      </span>
                    </div>

                    {d.status === "OPEN" && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#234C40]">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleResolveDispute(d.id, "REFUNDED")}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded transition"
                        >
                          Resolve & Refund Deposit
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleResolveDispute(d.id, "DEDUCTED")}
                          className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white text-xs font-medium rounded transition"
                        >
                          Resolve & Deduct Deposit (Damage)
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleResolveDispute(d.id, "PARTIALLY_REFUNDED")}
                          className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs font-medium rounded transition"
                        >
                          Split / Partial Refund
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-[#789681] font-mono text-sm">
                No disputes filed.
              </div>
            )}
          </div>
        )}

        {/* TAB 5: USERS */}
        {activeTab === "users" && (
          <div className="bg-[#18352D]/60 border border-[#234C40] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#234C40] flex justify-between items-center">
              <h3 className="font-serif text-lg text-white">Registered Student Accounts</h3>
              <span className="text-xs font-mono text-[#789681]">{users?.length || 0} Registered</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#142921] text-xs font-mono uppercase text-[#789681] border-b border-[#234C40]">
                  <tr>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Legal Name (Private)</th>
                    <th className="py-3 px-4">Anonymous Alias</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Trust Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#234C40]">
                  {users?.map((u: any) => (
                    <tr key={u.id} className="hover:bg-[#18352D]">
                      <td className="py-3 px-4 font-mono text-xs text-[#789681]">{u.id}</td>
                      <td className="py-3 px-4 text-white font-medium">{u.name}</td>
                      <td className="py-3 px-4 font-mono text-xs text-emerald-400">{u.alias}</td>
                      <td className="py-3 px-4 font-mono text-xs text-[#789681]">{u.email}</td>
                      <td className="py-3 px-4 font-mono text-xs">
                        <span className={`px-2 py-0.5 rounded ${u.role === "ADMIN" ? "bg-[#7052DF]/30 text-[#A892F7]" : "bg-[#234C40] text-white"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-emerald-400">{u.trustScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT LOGS */}
        {activeTab === "audit" && (
          <div className="bg-[#18352D]/60 border border-[#234C40] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#234C40] flex justify-between items-center">
              <h3 className="font-serif text-lg text-white">Cryptographic Security Audit Trail</h3>
              <span className="text-xs font-mono text-[#789681]">{auditLogs?.length || 0} Events Recorded</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#142921] text-xs font-mono uppercase text-[#789681] border-b border-[#234C40]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Resource</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#234C40]">
                  {auditLogs?.map((a: any) => (
                    <tr key={a.id} className="hover:bg-[#18352D]">
                      <td className="py-3 px-4 font-mono text-xs text-[#789681]">{new Date(a.createdAt).toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-xs text-[#C46A42] font-semibold">{a.action}</td>
                      <td className="py-3 px-4 font-mono text-xs text-white">{a.resource}</td>
                      <td className="py-3 px-4 font-mono text-xs text-[#789681]">{a.userId}</td>
                      <td className="py-3 px-4 font-mono text-xs text-[#789681]">{a.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: UPI RENTALS */}
        {activeTab === "upi-rentals" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-white">UPI Pilot Rentals</h3>
              <button
                onClick={fetchUpiRentals}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#18352D] hover:bg-[#234C40] border border-[#234C40] text-xs font-mono text-[#789681] hover:text-white transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${upiLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>

            {upiRentals.length === 0 ? (
              <div className="py-12 text-center text-[#789681] font-mono text-sm bg-[#18352D]/60 border border-[#234C40] rounded-xl">
                No UPI rentals yet.
              </div>
            ) : (
              <div className="space-y-4">
                {upiRentals.map((r: any) => {
                  const statusColors: Record<string, string> = {
                    CREATED: "bg-blue-900/40 text-blue-300 border-blue-500/30",
                    PENDING: "bg-amber-900/40 text-amber-300 border-amber-500/30",
                    ACTIVE: "bg-emerald-900/40 text-emerald-300 border-emerald-500/30",
                    INSPECT: "bg-purple-900/40 text-purple-300 border-purple-500/30",
                    REFUNDED: "bg-[#234C40] text-[#789681] border-[#234C40]",
                    REJECTED: "bg-red-900/40 text-red-300 border-red-500/30",
                  };
                  return (
                    <div
                      key={r.id}
                      className="bg-[#18352D]/60 border border-[#234C40] rounded-xl p-5 space-y-3"
                    >
                      {/* Header row */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-mono text-[#C46A42]">#{r.id}</span>
                          <h4 className="text-base font-semibold text-white mt-0.5">
                            {r.product?.title || r.productId}
                          </h4>
                          <p className="text-sm text-[#789681]">
                            Student: {r.studentName} &middot; Amt:{" "}
                            {paiseToRupees(r.totalPaise)} (Deposit:{" "}
                            {paiseToRupees(r.depositPaise)})
                          </p>
                          <p className="text-xs text-[#63736A] font-mono">
                            {new Date(r.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-mono border ${statusColors[r.status] || ""}`}
                        >
                          {r.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#234C40]">
                        {(r.status === "CREATED" || r.status === "PENDING") && (
                          <>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleRentalAction(r.id, "MARK_PAID")}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded transition"
                            >
                              Mark as Paid
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleRentalAction(r.id, "REJECT")}
                              className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white text-xs font-medium rounded transition"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {r.status === "ACTIVE" && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={r.depositPaise}
                              placeholder="Damage (paise)"
                              value={damageInputs[r.id] || ""}
                              onChange={(e) =>
                                setDamageInputs((prev) => ({ ...prev, [r.id]: e.target.value }))
                              }
                              className="w-36 px-2 py-1.5 bg-[#0E1F1A] border border-[#234C40] text-white text-xs rounded font-mono"
                            />
                            <button
                              disabled={actionLoading}
                              onClick={() =>
                                handleRentalAction(
                                  r.id,
                                  "INSPECT",
                                  Math.round(Number(damageInputs[r.id] || 0))
                                )
                              }
                              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-medium rounded transition"
                            >
                              Mark Returned + Inspect
                            </button>
                          </div>
                        )}

                        {r.status === "INSPECT" && (
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-[#789681]">
                              Refund: {paiseToRupees(r.depositPaise - (r.damagePaise || 0))}
                            </span>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleRentalAction(r.id, "MARK_REFUNDED")}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded transition"
                            >
                              Mark as Refunded
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Ledger entries */}
                      {r.ledger && r.ledger.length > 0 && (
                        <details className="pt-1">
                          <summary className="text-xs font-mono text-[#789681] cursor-pointer hover:text-white">
                            Ledger ({r.ledger.length} entries)
                          </summary>
                          <div className="mt-2 space-y-1">
                            {r.ledger.map((entry: any) => (
                              <div
                                key={entry.id}
                                className="flex justify-between text-xs font-mono px-3 py-1.5 bg-[#0E1F1A] rounded border border-[#234C40]"
                              >
                                <span className="text-[#789681]">{entry.event}</span>
                                <span className="text-white">{paiseToRupees(entry.amountPaise)}</span>
                                <span className="text-[#63736A]">
                                  {new Date(entry.createdAt).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

