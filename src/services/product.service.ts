import { store } from "./store";
import { prisma } from "@/lib/prisma";
import { sanitizeProductForPublic, sanitizeToAnonymousProfile } from "@/lib/privacy";

export interface ProductFilterParams {
  category?: string;
  query?: string;
  mode?: "all" | "rent" | "buy";
  condition?: string;
  sortBy?: "featured" | "price_low" | "price_high" | "deposit_low" | "newest";
  hub?: string;
  page?: number;
  limit?: number;
}

export async function getCategories() {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const cats = await prisma.category.findMany({
        include: { subcategories: true },
        orderBy: { order: "asc" },
      });
      if (cats.length > 0) return cats;
    } catch (e) {
      console.warn("[Category Service] Falling back to store:", e);
    }
  }
  return store.getDB().categories.map((c) => ({
    ...c,
    subcategories: store.getDB().subcategories.filter((s) => s.categoryId === c.id),
  }));
}

export async function getProducts(params: ProductFilterParams = {}) {
  const {
    category = "all",
    query = "",
    mode = "all",
    condition,
    sortBy = "featured",
    page = 1,
    limit = 24,
  } = params;

  let allProducts = store.getDB().products;

  // Filter by category
  if (category && category !== "all") {
    allProducts = allProducts.filter(
      (p) => p.categorySlug === category || p.categoryId === category
    );
  }

  // Filter by transaction mode (Rent vs Buy)
  if (mode === "rent") {
    allProducts = allProducts.filter((p) => p.isRentable);
  } else if (mode === "buy") {
    allProducts = allProducts.filter((p) => p.isPurchasable && Boolean(p.buyPrice));
  }

  // Filter by condition
  if (condition && condition !== "all") {
    allProducts = allProducts.filter((p) =>
      p.conditionGrade.toLowerCase().includes(condition.toLowerCase())
    );
  }

  // Filter by search query
  if (query.trim()) {
    const q = query.toLowerCase().trim();
    allProducts = allProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.campusHub && p.campusHub.toLowerCase().includes(q))
    );
  }

  // Sort
  if (sortBy === "price_low") {
    allProducts.sort((a, b) => a.rentalPriceDaily - b.rentalPriceDaily);
  } else if (sortBy === "price_high") {
    allProducts.sort((a, b) => b.rentalPriceDaily - a.rentalPriceDaily);
  } else if (sortBy === "deposit_low") {
    allProducts.sort((a, b) => a.deposit - b.deposit);
  } else if (sortBy === "newest") {
    allProducts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const total = allProducts.length;
  const startIndex = (page - 1) * limit;
  const paginated = allProducts.slice(startIndex, startIndex + limit);

  // Apply strict anonymous privacy filter to all returned products
  const sanitized = paginated.map((p) => sanitizeProductForPublic(p));

  return {
    products: sanitized,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getProductById(id: string) {
  const p = store.getDB().products.find((prod) => prod.id === id);
  if (!p) return null;

  // Fetch reviews for this product
  const reviews = store.getDB().reviews.filter((r) => r.productId === id);

  return {
    ...sanitizeProductForPublic(p),
    reviews,
  };
}

export async function createProductListing(data: any, ownerId: string) {
  const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const categories = store.getDB().categories;
  const category = categories.find((c) => c.id === data.categoryId) || categories[0];

  const userProfile =
    store.getDB().anonymousProfiles.find((ap) => ap.userId === ownerId) || {
      alias: "EcoLender-9901",
      avatarColor: "#18352D",
      trustScore: 99.0,
      completedRentals: 1,
      campusHub: data.campusHub || "Central Verified Locker • Hub A",
    };

  const newProduct = {
    id: newId,
    title: data.title,
    description: data.description,
    categoryId: category.id,
    categorySlug: category.slug,
    subcategoryId: data.subcategoryId || null,
    ownerId,
    conditionGrade: data.conditionGrade,
    rentalPriceHourly: data.rentalPriceHourly || Math.round(data.rentalPriceDaily / 6),
    rentalPriceDaily: data.rentalPriceDaily,
    rentalPriceWeekly: data.rentalPriceWeekly,
    rentalPriceMonthly: data.rentalPriceMonthly || Math.round(data.rentalPriceWeekly * 3.4),
    rentalPriceSemester: data.rentalPriceSemester || Math.round(data.rentalPriceWeekly * 8.5),
    buyPrice: data.buyPrice || null,
    mrpReference: data.mrpReference,
    deposit: data.deposit,
    isRentable: data.isRentable !== false,
    isPurchasable: Boolean(data.isPurchasable && data.buyPrice),
    isAvailable: true,
    isPaused: false,
    pickupAvailable: data.pickupAvailable !== false,
    deliveryAvailable: data.deliveryAvailable !== false,
    campusHub: data.campusHub || "North Campus Central Hub",
    pickupAddress: data.pickupAddress || null,
    images: (data.images || []).map((url: string, i: number) => ({
      id: `img_${newId}_${i}`,
      url,
      isPrimary: i === 0,
    })),
    conditionPhotos: data.images && data.images.length >= 4 ? data.images.slice(0, 4) : [
      data.images?.[0] || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
      data.images?.[0] || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
      data.images?.[0] || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
      data.images?.[0] || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    ],
    specs: data.specs || {},
    owner: {
      alias: userProfile.alias,
      avatarColor: userProfile.avatarColor,
      trustScore: userProfile.trustScore,
      completedRentals: userProfile.completedRentals,
      campusHub: userProfile.campusHub,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.updateDB((db) => {
    db.products.unshift(newProduct);
  });

  return sanitizeProductForPublic(newProduct);
}

export async function getUserListings(userId: string) {
  const products = store.getDB().products.filter((p) => p.ownerId === userId);
  return products.map((p) => sanitizeProductForPublic(p));
}

export async function toggleProductAvailability(productId: string, userId: string) {
  let updatedProduct = null;
  store.updateDB((db) => {
    const prod = db.products.find((p) => p.id === productId);
    if (prod && prod.ownerId === userId) {
      prod.isAvailable = !prod.isAvailable;
      prod.isPaused = !prod.isAvailable;
      prod.updatedAt = new Date().toISOString();
      updatedProduct = prod;
    }
  });
  return updatedProduct ? sanitizeProductForPublic(updatedProduct) : null;
}
