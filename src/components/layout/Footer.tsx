"use client";

import React from "react";
import { ShieldCheck, Lock, ArrowUpRight } from "lucide-react";

export function Footer({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <footer className="bg-[#202522] text-[#F5F0E8] pt-14 pb-10 border-t border-[#2C3831]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#FAF7F2] border border-white/20 shadow-md">
                <img
                  src="/images/ywd-logo.png"
                  alt="YwD Insignia"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xl tracking-tight text-white font-sans">YwD</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-[#18352D] text-[#9BB5A3] rounded-md border border-[#789681]/30">
                  EST. 2026 // RECOMMERCE
                </span>
              </div>
            </div>
            <p className="text-xs text-[#9BB5A3] max-w-sm leading-relaxed">
              College-first equipment rental and recommerce platform. Access verified gear on your exact terms—from hours to an entire semester, with automated escrow protection.
            </p>
            <div className="pt-1 flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18352D] text-[#9BB5A3] text-xs font-medium border border-[#789681]/30">
                <ShieldCheck className="w-3.5 h-3.5 text-[#789681]" />
                <span>100% Escrow Protection</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18352D] text-[#9BB5A3] text-xs font-medium border border-[#789681]/30">
                <Lock className="w-3.5 h-3.5 text-[#C46A42]" />
                <span>Confidential Relay</span>
              </div>
            </div>
          </div>

          {/* Column 2: Marketplace */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F0E8]">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs text-[#9BB5A3]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("explore")}
                  className="hover:text-white transition-colors"
                >
                  All Verified Products
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("categories")}
                  className="hover:text-white transition-colors"
                >
                  Categories Directory
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("explore")}
                  className="hover:text-white transition-colors"
                >
                  Computing Workstations
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("explore")}
                  className="hover:text-white transition-colors"
                >
                  Cinema & Camera Optics
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("explore")}
                  className="hover:text-white transition-colors"
                >
                  Academic Textbooks & Tools
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F0E8]">
              Safety & Protection
            </h4>
            <ul className="space-y-2 text-xs text-[#9BB5A3]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("trust")}
                  className="hover:text-white transition-colors"
                >
                  How Escrow Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("trust")}
                  className="hover:text-white transition-colors"
                >
                  4-Point Condition Records
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("refunds")}
                  className="hover:text-white transition-colors"
                >
                  Automated UPI Refunds
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("trust")}
                  className="hover:text-white transition-colors"
                >
                  Dual-OTP Handover System
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("trust")}
                  className="hover:text-white transition-colors"
                >
                  Zero PII Leakage Guarantee
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Account Workspace */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F0E8]">
              Workspace
            </h4>
            <ul className="space-y-2 text-xs text-[#9BB5A3]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("dashboard")}
                  className="hover:text-white transition-colors"
                >
                  Customer Workspace
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("rentals")}
                  className="hover:text-white transition-colors"
                >
                  Active Rentals & OTPs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("orders")}
                  className="hover:text-white transition-colors"
                >
                  Purchases & Deliveries
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("wishlist")}
                  className="hover:text-white transition-colors"
                >
                  Saved Wishlist
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9BB5A3]">
          <p>© {new Date().getFullYear()} YwD Marketplace. Own Less. Experience More.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-[#789681]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#789681]" />
              Automated Escrow Live
            </span>
            <span>Razorpay Verified</span>
            <span>Zero-PII Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
