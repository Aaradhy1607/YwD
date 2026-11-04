"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  PlusCircle,
  Heart,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Clock,
  ShieldCheck,
  ShoppingBag,
  MapPin,
  MessageSquare,
  ChevronDown,
  CheckCircle2,
  Compass,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface NavbarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  wishlistCount: number;
  unreadNotifsCount: number;
  userAlias?: string;
  isLoggedIn?: boolean;
  onOpenListProduct: () => void;
  onOpenChat: () => void;
  onOpenAuth?: () => void;
  onOpenHubModal: () => void;
  notifications: any[];
  onMarkNotifRead: (id: string) => void;
  selectedHub?: string;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onOpenGuidedDiscovery?: () => void;
}

export function Navbar({
  activeScreen,
  setActiveScreen,
  wishlistCount,
  unreadNotifsCount,
  userAlias = "EcoRenter-4912",
  isLoggedIn = true,
  onOpenListProduct,
  onOpenChat,
  onOpenAuth,
  onOpenHubModal,
  notifications,
  onMarkNotifRead,
  selectedHub = "Central Verified Locker • Hub A",
  searchQuery = "",
  setSearchQuery,
  onOpenGuidedDiscovery,
}: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Sync incoming search query
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Focus input when search expands
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (setSearchQuery) {
      setSearchQuery(localSearch);
    }
    setActiveScreen("explore");
    setIsSearchOpen(false);
  };

  const primaryNavItems = [
    { id: "home", label: "Home" },
    { id: "explore", label: "Explore" },
    { id: "categories", label: "Categories" },
    { id: "trust", label: "How It Works" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E5DEC9] text-[#18352D] transition-colors shadow-[0_1px_3px_0_rgba(24,53,45,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-[76px] flex items-center justify-between gap-4">
        {/* ========================================================
            LEFT — BRAND
           ======================================================== */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setActiveScreen("home")}
            className="flex items-center gap-3 text-left group focus:outline-none py-1"
            aria-label="YwD Home"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#E5DEC9] shadow-xs group-hover:scale-105 transition-transform bg-[#FAF7F2]">
              <img
                src="/images/ywd-logo.png"
                alt="YwD Insignia"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold text-xl tracking-tight text-[#18352D] font-sans">
              YwD
            </span>
          </button>
        </div>

        {/* ========================================================
            CENTER — PRIMARY NAVIGATION
           ======================================================== */}
        <nav
          className="hidden md:flex items-center gap-7 lg:gap-9"
          aria-label="Primary Navigation"
        >
          {primaryNavItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveScreen(item.id)}
                className={`relative py-2 text-[13px] font-medium tracking-normal transition-colors whitespace-nowrap focus:outline-none ${
                  isActive
                    ? "text-[#18352D] font-semibold"
                    : "text-[#63736A] hover:text-[#18352D]"
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-indicator"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute -bottom-[21px] sm:-bottom-[20px] left-0 right-0 h-[2px] bg-[#C46A42] rounded-full"
                  />
                )}
              </button>
            );
          })}

          {/* My Rentals (visible in center on large screens when logged in) */}
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => setActiveScreen("rentals")}
              className={`hidden xl:inline-flex relative py-2 text-[13px] font-medium tracking-normal transition-colors whitespace-nowrap focus:outline-none ${
                activeScreen === "rentals"
                  ? "text-[#18352D] font-semibold"
                  : "text-[#63736A] hover:text-[#18352D]"
              }`}
            >
              <span>My Rentals</span>
              {activeScreen === "rentals" && (
                <motion.div
                  layoutId="navbar-active-indicator"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute -bottom-[21px] sm:-bottom-[20px] left-0 right-0 h-[2px] bg-[#C46A42] rounded-full"
                />
              )}
            </button>
          )}
        </nav>

        {/* ========================================================
            RIGHT — CUSTOMER ACTIONS
           ======================================================== */}
        <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 shrink-0">
          {/* Guided Discovery Prompt Button (Desktop) */}
          {onOpenGuidedDiscovery && (
            <button
              type="button"
              onClick={onOpenGuidedDiscovery}
              title="Launch Guided Discovery Room"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#18352D] bg-[#FAF7F2] hover:bg-[#E5DEC9]/60 border border-[#E5DEC9] transition-colors focus:outline-none"
            >
              <Compass className="w-3.5 h-3.5 text-[#C46A42]" />
              <span>Guided Discovery</span>
            </button>
          )}

          {/* 1. Expandable Compact Search */}
          <div className="relative flex items-center">
            <AnimatePresence>
              {isSearchOpen ? (
                <motion.form
                  key="search-open"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  onSubmit={handleSearchSubmit}
                  className="flex items-center overflow-hidden"
                >
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-[#63736A] absolute left-3 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      placeholder="Search hardware, cameras, gear..."
                      className="w-44 sm:w-60 h-9 pl-8 pr-7 rounded-full bg-[#FAF7F2] border border-[#E5DEC9] text-xs text-[#18352D] placeholder-[#63736A] focus:outline-none focus:border-[#18352D] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="absolute right-2 text-[#63736A] hover:text-[#18352D] p-0.5"
                      aria-label="Close search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.form>
              ) : (
                <button
                  key="search-closed"
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Search Marketplace"
                  title="Search Marketplace"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#18352D] hover:bg-[#FAF7F2] border border-transparent hover:border-[#E5DEC9] transition-colors focus:outline-none"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Wishlist Icon with Accurate Badge */}
          <button
            type="button"
            onClick={() => setActiveScreen("wishlist")}
            aria-label="Wishlist"
            title="Wishlist"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#18352D] hover:bg-[#FAF7F2] border border-transparent hover:border-[#E5DEC9] transition-colors relative focus:outline-none"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                activeScreen === "wishlist"
                  ? "fill-[#C46A42] text-[#C46A42]"
                  : "text-[#18352D]"
              }`}
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#C46A42] text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-xs pointer-events-none">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* 3. Notifications Icon with Real Unread Indicator */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              aria-label="Notifications"
              title="Notifications"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#18352D] hover:bg-[#FAF7F2] border border-transparent hover:border-[#E5DEC9] transition-colors relative focus:outline-none"
            >
              <Bell className="w-4 h-4 text-[#18352D]" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C46A42] pointer-events-none" />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 sm:w-88 bg-[#FFFFFF] rounded-2xl shadow-ywd-elevated border border-[#E5DEC9] p-4 z-50 text-xs text-[#18352D]"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#18352D]">
                        Notifications
                      </span>
                      {unreadNotifsCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#C46A42]/10 text-[#C46A42]">
                          {unreadNotifsCount} new
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-[#63736A] hover:text-[#18352D] p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-[#E5DEC9] max-h-72 overflow-y-auto mt-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-[#63736A] py-6 text-center">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`py-3 cursor-pointer hover:bg-[#FAF7F2] px-2 rounded-xl transition-colors ${
                            !n.isRead ? "bg-[#FAF7F2]/60" : ""
                          }`}
                          onClick={() => onMarkNotifRead(n.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-xs text-[#18352D] leading-snug">
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C46A42] shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#63736A] mt-1 leading-relaxed">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-[#789681] font-mono mt-1.5 block">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Elegant, Compact "List an Item" CTA */}
          <button
            type="button"
            onClick={onOpenListProduct}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#C46A42] hover:bg-[#A8532F] text-white transition-all shadow-xs active:scale-95 whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>List an Item</span>
          </button>

          {/* 5. Profile Avatar with Real Dropdown Menu */}
          {isLoggedIn ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                aria-label="Account Menu"
                className="flex items-center gap-2 p-1 sm:pl-1 sm:pr-2.5 rounded-full hover:bg-[#FAF7F2] border border-transparent hover:border-[#E5DEC9] transition-colors focus:outline-none"
              >
                <div className="w-7 h-7 rounded-full bg-[#18352D] text-[#F5F0E8] font-mono font-semibold text-[11px] flex items-center justify-center shadow-xs">
                  {userAlias.slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden lg:inline-block font-mono text-xs font-medium text-[#18352D] max-w-[100px] truncate">
                  {userAlias}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#63736A] hidden sm:block" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-[#FFFFFF] rounded-2xl shadow-ywd-elevated border border-[#E5DEC9] p-2 z-50 text-xs text-[#18352D] space-y-0.5"
                  >
                    {/* User Profile Header */}
                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DEC9]/60 mb-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-xs text-[#18352D]">
                          {userAlias}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#789681]/15 text-[#18352D]">
                          Verified
                        </span>
                      </div>
                      <p className="text-[10px] text-[#63736A] mt-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#789681]" />
                        <span>Anonymous ID protected</span>
                      </p>
                    </div>

                    {/* Account Links */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen("rentals");
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF7F2] font-medium text-[#18352D] flex items-center gap-2.5 transition-colors"
                    >
                      <Clock className="w-4 h-4 text-[#C46A42]" />
                      <span>My Active Rentals</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen("dashboard");
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF7F2] font-medium text-[#18352D] flex items-center gap-2.5 transition-colors"
                    >
                      <User className="w-4 h-4 text-[#18352D]" />
                      <span>Customer Workspace</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen("orders");
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF7F2] font-medium text-[#18352D] flex items-center gap-2.5 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#789681]" />
                      <span>Purchases & Recommerce</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen("refunds");
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF7F2] font-medium text-[#18352D] flex items-center gap-2.5 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#789681]" />
                      <span>Escrow & Refund Records</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenHubModal();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF7F2] font-medium text-[#18352D] flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-[#C46A42]" />
                        <span>Handover Hub</span>
                      </span>
                      <span className="text-[10px] text-[#63736A] font-mono truncate max-w-[80px]">
                        Hub A
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenChat();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF7F2] font-medium text-[#18352D] flex items-center gap-2.5 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-[#789681]" />
                      <span>Confidential Relay Chat</span>
                    </button>

                    <div className="pt-1 border-t border-[#E5DEC9]">
                      <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#A64F45]/10 text-[#A64F45] font-semibold flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-full border border-[#E5DEC9] hover:border-[#18352D] text-xs font-semibold text-[#18352D] transition-colors"
            >
              Sign in
            </Link>
          )}

          {/* 6. Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[#18352D] hover:bg-[#FAF7F2] transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ========================================================
          MOBILE NAVIGATION DRAWER
         ======================================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-[#E5DEC9] bg-[#FFFFFF] px-5 py-5 space-y-4 shadow-lg overflow-hidden"
          >
            {/* Mobile Search Field */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-[#63736A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search verified campus gear..."
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] text-xs text-[#18352D] placeholder-[#63736A] focus:outline-none focus:border-[#18352D]"
              />
            </form>

            {/* Mobile Primary Links */}
            <div className="flex flex-col gap-1 pt-1">
              {primaryNavItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveScreen(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                    activeScreen === item.id
                      ? "bg-[#18352D] text-white"
                      : "text-[#18352D] hover:bg-[#FAF7F2]"
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}

              {onOpenGuidedDiscovery && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenGuidedDiscovery();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#18352D] hover:bg-[#FAF7F2] transition-colors flex items-center gap-2"
                >
                  <Compass className="w-4 h-4 text-[#C46A42]" />
                  <span>Launch Guided Discovery</span>
                </button>
              )}

              {isLoggedIn && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveScreen("rentals");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                    activeScreen === "rentals"
                      ? "bg-[#18352D] text-white"
                      : "text-[#18352D] hover:bg-[#FAF7F2]"
                  }`}
                >
                  <span>My Active Rentals</span>
                </button>
              )}
            </div>

            {/* Mobile Actions Bottom Rail */}
            <div className="pt-3 border-t border-[#E5DEC9] space-y-2">
              <button
                type="button"
                onClick={() => {
                  onOpenListProduct();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-full bg-[#C46A42] hover:bg-[#A8532F] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List an Item</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenHubModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 rounded-xl bg-[#FAF7F2] text-[#63736A] hover:text-[#18352D] text-xs font-medium flex items-center justify-center gap-2 border border-[#E5DEC9]"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C46A42]" />
                <span className="truncate">{selectedHub}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
