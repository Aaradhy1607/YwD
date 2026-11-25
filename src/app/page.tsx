"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/marketplace/HeroSection";
import { CategoryGrid } from "@/components/marketplace/CategoryGrid";
import { CategoriesView } from "@/components/marketplace/CategoriesView";
import { ProductGrid } from "@/components/marketplace/ProductGrid";
import { JourneySection } from "@/components/marketplace/JourneySection";
import { ProductDetailModal } from "@/components/marketplace/ProductDetailModal";
import { ListProductModal } from "@/components/marketplace/ListProductModal";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { PrivacyChatDrawer } from "@/components/chat/PrivacyChatDrawer";
import { AuthModal } from "@/components/auth/AuthModal";
import { CampusHubModal } from "@/components/marketplace/CampusHubModal";
import { ReturnInspectionModal } from "@/components/inspection/ReturnInspectionModal";
import { TrustSection } from "@/components/trust/TrustSection";
import { AccessProtocol } from "@/components/trust/AccessProtocol";
import { CuratedSpotlight } from "@/components/marketplace/CuratedSpotlight";
import { GuidedDiscoveryModal } from "@/components/marketplace/GuidedDiscoveryModal";
import { SEED_CATEGORIES, SEED_PRODUCTS } from "@/data/seedData";
import { CheckCircle2, X } from "lucide-react";

export default function YwDApp() {
  const { scrollYProgress } = useScroll();

  // Navigation screen
  const [activeScreen, setActiveScreen] = useState<string>("home");

  // Marketplace states
  const [categories, setCategories] = useState(SEED_CATEGORIES);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [transactionFilter, setTransactionFilter] = useState<"all" | "rent" | "buy">("all");
  const [preferredDuration, setPreferredDuration] = useState<string>("daily");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [selectedHub, setSelectedHub] = useState<string>("Central Handover Point • Zone 1");

  // User & Data states
  const [userAlias, setUserAlias] = useState("EcoRenter-4912");
  const [wishlistIds, setWishlistIds] = useState<string[]>(["prod_macbook_m3"]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: "notif_escrow_1",
      title: "Security Deposit Protected",
      message: "Your security deposit of ₹8,000 for MacBook Pro M3 is protected in platform ledger.",
      type: "ESCROW",
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "notif_handover_2",
      title: "Handover OTP Generated",
      message: "Your 6-digit pickup verification code is 849201.",
      type: "BOOKING",
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  // Modals & Drawers
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const [detailInitialMode, setDetailInitialMode] = useState<"rent" | "buy">("rent");
  const [detailInitialDuration, setDetailInitialDuration] = useState<string>("weekly");
  const [isListProductOpen, setIsListProductOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState({ id: "usr_vendor_1", alias: "GearVault-8801" });
  const [returnBookingId, setReturnBookingId] = useState<string | null>(null);
  const [isGuidedDiscoveryOpen, setIsGuidedDiscoveryOpen] = useState(false);

  // Clean studio theme
  const cosmicMode = false;

  // Toasts
  const [toast, setToast] = useState<{ title: string; subtitle?: string } | null>(null);

  const showToast = (title: string, subtitle?: string) => {
    setToast({ title, subtitle });
    setTimeout(() => setToast(null), 5000);
  };

  // Initial data loading from API
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) setCategories(cats);
      })
      .catch(() => {});

    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          setAllProducts(data.products);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/bookings")
      .then((res) => res.json())
      .then((b) => {
        if (Array.isArray(b)) setBookings(b);
      })
      .catch(() => {});

    fetch("/api/orders")
      .then((res) => res.json())
      .then((o) => {
        if (Array.isArray(o)) setOrders(o);
      })
      .catch(() => {});

    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((items) => {
        if (Array.isArray(items)) {
          setWishlistIds(items.map((w: any) => w.productId));
        }
      })
      .catch(() => {});

    fetch("/api/notifications")
      .then((res) => res.json())
      .then((notifs) => {
        if (Array.isArray(notifs)) setNotifications(notifs);
      })
      .catch(() => {});

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user?.anonymousProfile?.alias) {
          setUserAlias(data.user.anonymousProfile.alias);
        }
      })
      .catch(() => {});
  }, []);

  // Filtered Products Memo
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(
        (p) => p.categorySlug === selectedCategory || p.categoryId === selectedCategory
      );
    }

    // Subcategory filter
    if (selectedSubcategory && selectedSubcategory !== "all") {
      result = result.filter((p) => p.subcategorySlug === selectedSubcategory);
    }

    // Transaction mode filter
    if (transactionFilter === "rent") {
      result = result.filter((p) => p.isRentable);
    } else if (transactionFilter === "buy") {
      result = result.filter((p) => p.isPurchasable && Boolean(p.buyPrice));
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.campusHub?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "price_low") {
      result.sort((a, b) => (a.rentalPriceDaily || 0) - (b.rentalPriceDaily || 0));
    } else if (sortBy === "price_high") {
      result.sort((a, b) => (b.rentalPriceDaily || 0) - (a.rentalPriceDaily || 0));
    } else if (sortBy === "deposit_low") {
      result.sort((a, b) => (a.deposit || 0) - (b.deposit || 0));
    } else if (sortBy === "newest") {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [allProducts, selectedCategory, selectedSubcategory, transactionFilter, searchQuery, sortBy]);

  // Wishlist toggle
  const handleToggleWishlist = async (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
    } catch (e) {}
  };

  // Open detail helper
  const handleOpenDetail = (
    productId: string,
    mode: "rent" | "buy" = "rent",
    duration: string = "weekly"
  ) => {
    setDetailProductId(productId);
    setDetailInitialMode(mode);
    setDetailInitialDuration(duration);
  };

  // Successful rental booking callback
  const handleBookingSuccess = (newBooking: any) => {
    setBookings((prev) => [newBooking, ...prev]);
    setDetailProductId(null);
    showToast(
      "Rental booking confirmed",
      `Booking ${newBooking.bookingNumber} confirmed. Pickup OTP: ${newBooking.pickupOtp}`
    );
    setActiveScreen("rentals");
  };

  // Successful purchase callback
  const handlePurchaseSuccess = (newOrder: any) => {
    setOrders((prev) => [newOrder, ...prev]);
    setDetailProductId(null);
    showToast(
      "Purchase order placed",
      `Order ${newOrder.orderNumber} placed. Tracking available in dashboard.`
    );
    setActiveScreen("orders");
  };

  // Listing published callback
  const handleListingCreated = (newProduct: any) => {
    setAllProducts((prev) => [newProduct, ...prev]);
    setIsListProductOpen(false);
    showToast(
      "Listing published",
      `"${newProduct.title}" is now active in the marketplace.`
    );
  };

  // Return inspection completed callback
  const handleReturnSuccess = (updatedBooking: any) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );
    setReturnBookingId(null);
    showToast(
      "Return verified",
      `₹${updatedBooking.depositAmount} refunded automatically to UPI ID: ${updatedBooking.refundUpiId}`
    );
    setActiveScreen("refunds");
  };

  // Open relay chat with a seller
  const handleOpenChatWithSeller = (sellerId: string, sellerAlias: string) => {
    setChatTarget({ id: sellerId, alias: sellerAlias });
    setDetailProductId(null);
    setIsChatOpen(true);
  };

  // Mark notification read
  const handleMarkNotifRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifId: id }),
    }).catch(() => {});
  };

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;
  const myListings = allProducts.filter((p) => p.ownerId === "usr_default_demo");
  const wishlistItems = allProducts
    .filter((p) => wishlistIds.includes(p.id))
    .map((p) => ({ id: `w_${p.id}`, productId: p.id, product: p }));

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0E8] text-[#18352D] selection:bg-[#18352D] selection:text-[#F5F0E8]">
      {/* Sleek Top Scroll Progress Bar */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed top-0 left-0 right-0 h-[2.5px] z-50 origin-left bg-[#C46A42]"
      />

      {/* Toast popup */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 right-5 z-50 max-w-sm bg-[#18352D] text-[#F5F0E8] px-4 py-3.5 rounded-2xl shadow-2xl border border-[#2C483F] flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-[#789681] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-white">{toast.title}</p>
              {toast.subtitle && (
                <p className="text-[11px] text-[#9BB5A3] mt-0.5">{toast.subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-[#9BB5A3] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation Bar */}
      <Navbar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        wishlistCount={wishlistIds.length}
        unreadNotifsCount={unreadNotifsCount}
        userAlias={userAlias}
        onOpenListProduct={() => setIsListProductOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenHubModal={() => setIsHubModalOpen(true)}
        notifications={notifications}
        onMarkNotifRead={handleMarkNotifRead}
        selectedHub={selectedHub}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenGuidedDiscovery={() => setIsGuidedDiscoveryOpen(true)}
        cosmicMode={cosmicMode}
      />

      {/* Main Content Area with Screen Transitions */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {/* VIEW 1: HOME VIEW */}
          {activeScreen === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Clean Editorial Hero */}
              <div id="hero-section">
                <HeroSection
                  categories={categories}
                  heroProducts={allProducts.length > 0 ? allProducts : SEED_PRODUCTS}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={(cat) => {
                    setSelectedCategory(cat);
                    setSelectedSubcategory("all");
                    setActiveScreen("explore");
                  }}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  transactionFilter={transactionFilter}
                  setTransactionFilter={setTransactionFilter}
                  preferredDuration={preferredDuration}
                  setPreferredDuration={setPreferredDuration}
                  onExplore={() => setActiveScreen("explore")}
                  onOpenProductDetail={handleOpenDetail}
                  onOpenListProduct={() => setIsListProductOpen(true)}
                  onOpenHubModal={() => setIsHubModalOpen(true)}
                  onOpenGuidedDiscovery={() => setIsGuidedDiscoveryOpen(true)}
                />
              </div>

              {/* Equipment Categories */}
              <div id="category-grid">
                <CategoryGrid
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(slug) => {
                    setSelectedCategory(slug);
                    setSelectedSubcategory("all");
                    setActiveScreen("explore");
                  }}
                  cosmicMode={cosmicMode}
                />
              </div>

              {/* Verified Product Inventory Grid */}
              <div id="product-inventory">
                <ProductGrid
                  products={filteredProducts.slice(0, 8)}
                  preferredDuration={preferredDuration}
                  setPreferredDuration={setPreferredDuration}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  wishlistIds={wishlistIds}
                  onToggleWishlist={handleToggleWishlist}
                  onOpenProductDetail={handleOpenDetail}
                  onResetFilters={() => {
                    setSelectedCategory("all");
                    setSelectedSubcategory("all");
                    setSearchQuery("");
                    setTransactionFilter("all");
                  }}
                  activeCategoryName={
                    selectedCategory !== "all"
                      ? `${activeCategoryObj?.name || "Category"} Listings`
                      : "Curated Equipment Inventory"
                  }
                />
              </div>

              {/* Editorial Spotlight: Economics of Access & Flagship Feature */}
              <div id="curated-spotlight">
                <CuratedSpotlight
                  onOpenProductDetail={handleOpenDetail}
                  onExplore={() => setActiveScreen("explore")}
                />
              </div>

              {/* The Access Protocol: 4-Step Narrative Walkthrough */}
              <div id="access-protocol">
                <AccessProtocol />
              </div>

              {/* Core Trust & Accountability Guarantees */}
              <div id="trust-section">
                <TrustSection />
              </div>
            </motion.div>
          )}

          {/* VIEW 2: EXPLORE MARKETPLACE */}
          {activeScreen === "explore" && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="pt-6"
            >
              <CategoryGrid
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(slug) => {
                  setSelectedCategory(slug);
                  setSelectedSubcategory("all");
                }}
                cosmicMode={cosmicMode}
              />
              <ProductGrid
                products={filteredProducts}
                preferredDuration={preferredDuration}
                setPreferredDuration={setPreferredDuration}
                sortBy={sortBy}
                setSortBy={setSortBy}
                wishlistIds={wishlistIds}
                onToggleWishlist={handleToggleWishlist}
                onOpenProductDetail={handleOpenDetail}
                onResetFilters={() => {
                  setSelectedCategory("all");
                  setSelectedSubcategory("all");
                  setSearchQuery("");
                  setTransactionFilter("all");
                }}
                activeCategoryName={
                  selectedCategory !== "all"
                    ? `${activeCategoryObj?.name || "Selected Category"} Listings`
                    : "All Available Marketplace Gear"
                }
              />
            </motion.div>
          )}

          {/* VIEW 3: DEDICATED CATEGORIES DIRECTORY VIEW */}
          {activeScreen === "categories" && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <CategoriesView
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(slug) => {
                  setSelectedCategory(slug);
                  setSelectedSubcategory("all");
                }}
                onSelectSubcategory={(catSlug, subSlug) => {
                  setSelectedCategory(catSlug);
                  setSelectedSubcategory(subSlug);
                  setActiveScreen("explore");
                }}
                onExploreCategory={(slug) => {
                  setSelectedCategory(slug);
                  setSelectedSubcategory("all");
                  setActiveScreen("explore");
                }}
              />
              <ProductGrid
                products={filteredProducts}
                preferredDuration={preferredDuration}
                setPreferredDuration={setPreferredDuration}
                sortBy={sortBy}
                setSortBy={setSortBy}
                wishlistIds={wishlistIds}
                onToggleWishlist={handleToggleWishlist}
                onOpenProductDetail={handleOpenDetail}
                onResetFilters={() => {
                  setSelectedCategory("all");
                  setSelectedSubcategory("all");
                  setSearchQuery("");
                  setTransactionFilter("all");
                }}
                activeCategoryName={
                  selectedCategory !== "all"
                    ? `${activeCategoryObj?.name || "Category"} Listings`
                    : "Marketplace Listings"
                }
              />
            </motion.div>
          )}

          {/* VIEW 4: DASHBOARD / ACTIVE RENTALS / ORDERS / REFUNDS / WISHLIST */}
          {(activeScreen === "dashboard" ||
            activeScreen === "rentals" ||
            activeScreen === "orders" ||
            activeScreen === "returns" ||
            activeScreen === "refunds" ||
            activeScreen === "wishlist") && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <UserDashboard
                initialTab={
                  activeScreen === "rentals"
                    ? "rentals"
                    : activeScreen === "orders"
                    ? "orders"
                    : activeScreen === "returns" || activeScreen === "refunds"
                    ? "refunds"
                    : activeScreen === "wishlist"
                    ? "wishlist"
                    : "overview"
                }
                bookings={bookings}
                orders={orders}
                myListings={myListings}
                wishlistItems={wishlistItems}
                userAlias={userAlias}
                onOpenReturnModal={(id) => setReturnBookingId(id)}
                onToggleListingAvailability={(id) => {
                  fetch(`/api/products/${id}`, { method: "PATCH" })
                    .then((res) => res.json())
                    .then((updated) => {
                      setAllProducts((prev) =>
                        prev.map((p) =>
                          p.id === id ? { ...p, isAvailable: updated.isAvailable } : p
                        )
                      );
                      showToast("Listing status updated.");
                    });
                }}
                onOpenProductDetail={handleOpenDetail}
                onOpenListProduct={() => setIsListProductOpen(true)}
              />
            </motion.div>
          )}

          {/* VIEW 5: TRUST & INSPECTION */}
          {activeScreen === "trust" && (
            <motion.div
              key="trust"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="pt-8"
            >
              <AccessProtocol />
              <TrustSection />
              <JourneySection />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer onNavigate={setActiveScreen} />

      {/* MODALS WITH SMOOTH MOTION */}

      {/* Product Detail & Booking Modal */}
      {detailProductId && (
        <ProductDetailModal
          productId={detailProductId}
          initialMode={detailInitialMode}
          initialDuration={detailInitialDuration}
          onClose={() => setDetailProductId(null)}
          onBookingSuccess={handleBookingSuccess}
          onPurchaseSuccess={handlePurchaseSuccess}
          onOpenChatWithSeller={handleOpenChatWithSeller}
          isWishlisted={wishlistIds.includes(detailProductId)}
          onToggleWishlist={handleToggleWishlist}
        />
      )}

      {/* List Product Modal */}
      {isListProductOpen && (
        <ListProductModal
          categories={categories}
          onClose={() => setIsListProductOpen(false)}
          onSuccess={handleListingCreated}
        />
      )}

      {/* Campus Hub Selector Modal */}
      {isHubModalOpen && (
        <CampusHubModal
          isOpen={isHubModalOpen}
          onClose={() => setIsHubModalOpen(false)}
          selectedHub={selectedHub}
          onSelectHub={(hub) => {
            setSelectedHub(hub);
            showToast("Campus Hub Selected", hub);
          }}
        />
      )}

      {/* Return Inspection Modal */}
      {returnBookingId && (
        <ReturnInspectionModal
          bookingId={returnBookingId}
          onClose={() => setReturnBookingId(null)}
          onSuccess={handleReturnSuccess}
        />
      )}

      {/* Privacy Relay Chat Drawer */}
      <PrivacyChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        targetUserId={chatTarget.id}
        targetAlias={chatTarget.alias}
        currentUserId="usr_default_demo"
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={(user) => {
          showToast("Signed In Successfully", `Welcome back, ${user.email}`);
        }}
      />

      {/* Talkroom Guided Discovery Experience Modal */}
      <GuidedDiscoveryModal
        isOpen={isGuidedDiscoveryOpen}
        onClose={() => setIsGuidedDiscoveryOpen(false)}
        products={allProducts.length > 0 ? allProducts : SEED_PRODUCTS}
        onOpenProductDetail={handleOpenDetail}
        onApplyFiltersToMarketplace={(catSlug, mode, dur) => {
          if (catSlug && catSlug !== "all") {
            setSelectedCategory(catSlug);
          } else {
            setSelectedCategory("all");
          }
          setSelectedSubcategory("all");
          setTransactionFilter(mode);
          setPreferredDuration(dur);
          setActiveScreen("explore");
          showToast("Discovery filters applied to marketplace.");
        }}
      />
    </div>
  );
}
