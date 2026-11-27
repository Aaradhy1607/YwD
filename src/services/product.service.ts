import { store } from "./store";
import { prisma } from "@/lib/prisma";
import { sanitizeProductForPublic, sanitizeToAnonymousProfile } from "@/lib/privacy";

export class ListingError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "ListingError";
    this.status = status;
  }
}

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

  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const where: any = {
        isAvailable: true,
        isPaused: false,
      };

      if (category && category !== "all") {
        where.OR = [
          { category: { slug: category } },
          { categoryId: category },
        ];
      }

      if (mode === "rent") {
        where.isRentable = true;
      } else if (mode === "buy") {
        where.isPurchasable = true;
        where.buyPrice = { gt: 0 };
      }

      if (condition && condition !== "all") {
        where.conditionGrade = { contains: condition, mode: "insensitive" };
      }

      if (query.trim()) {
        const q = query.trim();
        where.AND = [
          ...(where.AND || []),
          {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { campusHub: { contains: q, mode: "insensitive" } },
            ],
          },
        ];
      }

      let orderBy: any = { createdAt: "desc" };
      if (sortBy === "price_low") orderBy = { rentalPriceDaily: "asc" };
      else if (sortBy === "price_high") orderBy = { rentalPriceDaily: "desc" };
      else if (sortBy === "deposit_low") orderBy = { deposit: "asc" };
      else if (sortBy === "newest") orderBy = { createdAt: "desc" };

      const total = await prisma.product.count({ where });
      const rawProducts = await prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { orderBy: { isPrimary: "desc" } },
          category: true,
          subcategory: true,
          owner: {
            include: {
              anonymousProfile: true,
            },
          },
        },
      });

      const products = rawProducts.map((p) => {
        let parsedSpecs = p.specs;
        if (typeof parsedSpecs === "string") {
          try {
            parsedSpecs = JSON.parse(parsedSpecs);
          } catch {}
        }
        return sanitizeProductForPublic({
          ...p,
          specs: parsedSpecs || {},
          categorySlug: p.category?.slug,
          subcategorySlug: p.subcategory?.slug,
        });
      });

      // Synchronize with local store so locally listed items are never missing on refresh
      const localProducts = (store.getDB().products || []).filter((lp) => {
        if (lp.isAvailable === false || lp.isPaused === true) return false;
        if (category && category !== "all" && lp.categorySlug !== category && lp.categoryId !== category) return false;
        if (mode === "rent" && !lp.isRentable) return false;
        if (mode === "buy" && !(lp.isPurchasable && Number(lp.buyPrice) > 0)) return false;
        if (condition && condition !== "all" && !lp.conditionGrade?.toLowerCase().includes(condition.toLowerCase())) return false;
        if (query.trim()) {
          const q = query.toLowerCase().trim();
          const matches =
            lp.title?.toLowerCase().includes(q) ||
            lp.description?.toLowerCase().includes(q) ||
            lp.campusHub?.toLowerCase().includes(q);
          if (!matches) return false;
        }
        return true;
      });
      const pgIds = new Set(products.map((p) => p.id));
      const localOnly = localProducts.filter((lp) => !pgIds.has(lp.id));

      const merged = [...localOnly.map((p) => sanitizeProductForPublic(p)), ...products];

      return {
        products: merged,
        total: total + localOnly.length,
        page,
        totalPages: Math.ceil((total + localOnly.length) / limit) || 1,
      };
    } catch (e) {
      console.warn("[Product Service] Postgres query failed, evaluating store fallback:", e);
    }
  }

  let allProducts = store.getDB().products.filter(
    (p) => p.isAvailable !== false && p.isPaused !== true
  );

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
    allProducts = allProducts.filter((p) => p.isPurchasable && Number(p.buyPrice) > 0);
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
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const p = await prisma.product.findUnique({
        where: { id },
        include: {
          images: { orderBy: { isPrimary: "desc" } },
          category: true,
          subcategory: true,
          owner: {
            include: {
              anonymousProfile: true,
            },
          },
          reviews: true,
        },
      });

      if (p) {
        let parsedSpecs = p.specs;
        if (typeof parsedSpecs === "string") {
          try {
            parsedSpecs = JSON.parse(parsedSpecs);
          } catch {}
        }
        return {
          ...sanitizeProductForPublic({
            ...p,
            specs: parsedSpecs || {},
            categorySlug: p.category?.slug,
            subcategorySlug: p.subcategory?.slug,
          }),
          reviews: p.reviews || [],
        };
      }
    } catch (e) {
      console.warn("[Product Service] Postgres getProductById failed, evaluating store fallback:", e);
    }
  }

  const p = store.getDB().products.find((prod) => prod.id === id);
  if (!p) return null;

  // Fetch reviews for this product
  const reviews = store.getDB().reviews.filter((r) => r.productId === id);

  return {
    ...sanitizeProductForPublic(p),
    reviews,
  };
}

function resolveListingMode(data: any) {
  const isRentable =
    data.listingType === "rent" || data.listingType === "both"
      ? true
      : data.listingType === "sell"
      ? false
      : data.isRentable !== false;

  const hasBuyPrice = data.buyPrice != null && Number(data.buyPrice) > 0;
  const isPurchasable =
    data.listingType === "sell" || data.listingType === "both"
      ? hasBuyPrice
      : data.listingType === "rent"
      ? false
      : Boolean(data.isPurchasable && hasBuyPrice);

  const rentalPriceDaily = isRentable ? Number(data.rentalPriceDaily || 0) : 0;
  const rentalPriceWeekly = isRentable ? Number(data.rentalPriceWeekly || 0) : 0;
  const rentalPriceHourly = isRentable
    ? data.rentalPriceHourly != null && data.rentalPriceHourly !== ""
      ? Number(data.rentalPriceHourly)
      : Math.round(rentalPriceDaily / 6)
    : null;
  const rentalPriceMonthly = isRentable
    ? data.rentalPriceMonthly != null && data.rentalPriceMonthly !== ""
      ? Number(data.rentalPriceMonthly)
      : Math.round(rentalPriceWeekly * 3.4)
    : null;
  const rentalPriceSemester = isRentable
    ? data.rentalPriceSemester != null && data.rentalPriceSemester !== ""
      ? Number(data.rentalPriceSemester)
      : Math.round(rentalPriceWeekly * 8.5)
    : null;
  const deposit = isRentable ? Number(data.deposit || 0) : 0;
  const buyPrice = isPurchasable ? Number(data.buyPrice) : null;
  const mrpReference =
    data.mrpReference != null && Number(data.mrpReference) > 0
      ? Number(data.mrpReference)
      : Number(buyPrice || rentalPriceDaily || 0);

  return {
    isRentable,
    isPurchasable,
    rentalPriceHourly,
    rentalPriceDaily,
    rentalPriceWeekly,
    rentalPriceMonthly,
    rentalPriceSemester,
    deposit,
    buyPrice,
    mrpReference,
  };
}

export async function createProductListing(data: any, ownerId: string) {
  const isPg = await store.checkPostgres();
  let createdProduct: any = null;
  const resolved = resolveListingMode(data);

  if (isPg) {
    try {
      const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const categories = await prisma.category.findMany();
      const targetCat = categories.find((c) => c.id === data.categoryId || c.slug === data.categoryId);
      const categoryId = targetCat?.id || categories[0]?.id || "cat_electronics";

      const created = await prisma.product.create({
        data: {
          id: newId,
          title: data.title,
          description: data.description,
          categoryId: categoryId,
          subcategoryId: data.subcategoryId || null,
          ownerId,
          conditionGrade: data.conditionGrade || "Mint (Like New)",
          rentalPriceHourly: resolved.rentalPriceHourly,
          rentalPriceDaily: resolved.rentalPriceDaily,
          rentalPriceWeekly: resolved.rentalPriceWeekly,
          rentalPriceMonthly: resolved.rentalPriceMonthly,
          rentalPriceSemester: resolved.rentalPriceSemester,
          buyPrice: resolved.buyPrice,
          mrpReference: resolved.mrpReference,
          deposit: resolved.deposit,
          isRentable: resolved.isRentable,
          isPurchasable: resolved.isPurchasable,
          isAvailable: true,
          isPaused: false,
          pickupAvailable: data.pickupAvailable !== false,
          deliveryAvailable: data.deliveryAvailable !== false,
          campusHub: data.campusHub || "North Campus Central Hub",
          pickupAddress: data.pickupAddress || null,
          specs: data.specs || {},
          images: {
            create: (data.images || []).map((url: string, i: number) => ({
              id: `img_${newId}_${i}`,
              url,
              isPrimary: i === 0,
            })),
          },
        },
        include: {
          images: true,
          category: true,
          subcategory: true,
          owner: { include: { anonymousProfile: true } },
        },
      });

      createdProduct = sanitizeProductForPublic({
        ...created,
        categorySlug: created.category?.slug,
        subcategorySlug: created.subcategory?.slug,
      });
    } catch (e) {
      console.warn("[Product Service] Postgres createProductListing failed, falling back to store:", e);
    }
  }

  // Dual-persistence guarantee: always persist in store so item is never lost across reloads
  store.assertProductionDatabase();
  const newId = createdProduct?.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const categories = store.getDB().categories;
  const category = categories.find((c) => c.id === data.categoryId || c.slug === data.categoryId) || categories[0];

  const userProfile =
    store.getDB().anonymousProfiles.find((ap) => ap.userId === ownerId) || {
      alias: "EcoLender-9901",
      avatarColor: "#18352D",
      trustScore: 99.0,
      completedRentals: 1,
      campusHub: data.campusHub || "Central Verified Locker • Hub A",
    };

  const storeProduct = {
    id: newId,
    title: data.title,
    description: data.description,
    categoryId: category.id,
    categorySlug: category.slug,
    subcategoryId: data.subcategoryId || null,
    ownerId,
    conditionGrade: data.conditionGrade,
    rentalPriceHourly: resolved.rentalPriceHourly,
    rentalPriceDaily: resolved.rentalPriceDaily,
    rentalPriceWeekly: resolved.rentalPriceWeekly,
    rentalPriceMonthly: resolved.rentalPriceMonthly,
    rentalPriceSemester: resolved.rentalPriceSemester,
    buyPrice: resolved.buyPrice,
    mrpReference: resolved.mrpReference,
    deposit: resolved.deposit,
    isRentable: resolved.isRentable,
    isPurchasable: resolved.isPurchasable,
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
    conditionPhotos: data.images && data.images.length >= 4
      ? data.images.slice(0, 4)
      : data.images?.[0]
      ? [data.images[0], data.images[0], data.images[0], data.images[0]]
      : [],
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
    const existingIdx = db.products.findIndex((p) => p.id === newId);
    if (existingIdx >= 0) {
      db.products[existingIdx] = storeProduct;
    } else {
      db.products.unshift(storeProduct);
    }
  });

  return createdProduct || sanitizeProductForPublic(storeProduct);
}

export async function getUserListings(userId: string) {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const products = await prisma.product.findMany({
        where: { ownerId: userId },
        include: {
          images: { orderBy: { isPrimary: "desc" } },
          category: true,
          subcategory: true,
          owner: { include: { anonymousProfile: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return products.map((p) =>
        sanitizeProductForPublic({
          ...p,
          categorySlug: p.category?.slug,
          subcategorySlug: p.subcategory?.slug,
        })
      );
    } catch (e) {
      console.warn("[Product Service] Postgres getUserListings failed:", e);
    }
  }

  const products = store.getDB().products.filter((p) => p.ownerId === userId);
  return products.map((p) => sanitizeProductForPublic(p));
}

export async function toggleProductAvailability(
  productId: string,
  userId: string,
  options?: { isAdmin?: boolean }
) {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const prod = await prisma.product.findUnique({ where: { id: productId } });
      if (!prod) throw new ListingError("Product not found", 404);
      if (prod.ownerId !== userId && !options?.isAdmin) {
        throw new ListingError("Unauthorized: you can only modify your own listings.", 403);
      }

      const updated = await prisma.product.update({
        where: { id: productId },
        data: {
          isAvailable: !prod.isAvailable,
          isPaused: prod.isAvailable, // paused if currently available
        },
        include: {
          images: true,
          category: true,
          subcategory: true,
          owner: { include: { anonymousProfile: true } },
        },
      });

      // Keep local store in sync if present
      store.updateDB((db) => {
        const local = db.products.find((p) => p.id === productId);
        if (local) {
          local.isAvailable = updated.isAvailable;
          local.isPaused = updated.isPaused;
          local.updatedAt = new Date().toISOString();
        }
      });

      return sanitizeProductForPublic({
        ...updated,
        categorySlug: updated.category?.slug,
        subcategorySlug: updated.subcategory?.slug,
      });
    } catch (e) {
      if (e instanceof ListingError) throw e;
      console.warn("[Product Service] Postgres toggleAvailability failed:", e);
    }
  }

  let updatedProduct: any = null;
  store.updateDB((db) => {
    const prod = db.products.find((p) => p.id === productId);
    if (!prod) {
      throw new ListingError("Product not found", 404);
    }
    if (prod.ownerId !== userId && !options?.isAdmin) {
      throw new ListingError("Unauthorized: you can only modify your own listings.", 403);
    }
    prod.isAvailable = !prod.isAvailable;
    prod.isPaused = !prod.isAvailable;
    prod.updatedAt = new Date().toISOString();
    updatedProduct = prod;
  });
  return updatedProduct ? sanitizeProductForPublic(updatedProduct) : null;
}

export async function updateProductListing(
  productId: string,
  data: any,
  userId: string,
  options?: { isAdmin?: boolean }
) {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const prod = await prisma.product.findUnique({ where: { id: productId } });
      if (!prod) throw new ListingError("Product not found", 404);
      if (prod.ownerId !== userId && !options?.isAdmin) {
        throw new ListingError("Unauthorized: you can only modify your own listings.", 403);
      }

      const updateData: any = {};
      if (data.title) updateData.title = data.title;
      if (data.description) updateData.description = data.description;
      if (data.categoryId) updateData.categoryId = data.categoryId;
      if (data.subcategoryId !== undefined) updateData.subcategoryId = data.subcategoryId;
      if (data.conditionGrade) updateData.conditionGrade = data.conditionGrade;
      if (data.rentalPriceDaily !== undefined) updateData.rentalPriceDaily = Number(data.rentalPriceDaily);
      if (data.rentalPriceWeekly !== undefined) updateData.rentalPriceWeekly = Number(data.rentalPriceWeekly);
      if (data.buyPrice !== undefined) updateData.buyPrice = data.buyPrice ? Number(data.buyPrice) : null;
      if (data.deposit !== undefined) updateData.deposit = Number(data.deposit);
      if (data.isRentable !== undefined) updateData.isRentable = Boolean(data.isRentable);
      if (data.isPurchasable !== undefined) updateData.isPurchasable = Boolean(data.isPurchasable);
      if (data.campusHub) updateData.campusHub = data.campusHub;
      if (data.specs) updateData.specs = data.specs;

      const updated = await prisma.product.update({
        where: { id: productId },
        data: updateData,
        include: {
          images: true,
          category: true,
          subcategory: true,
          owner: { include: { anonymousProfile: true } },
        },
      });

      return sanitizeProductForPublic(updated);
    } catch (e) {
      if (e instanceof ListingError) throw e;
      console.warn("[Product Service] Postgres updateProductListing failed:", e);
    }
  }

  store.assertProductionDatabase();
  let updatedProduct: any = null;
  store.updateDB((db) => {
    const prod = db.products.find((p) => p.id === productId);
    if (!prod) {
      throw new ListingError("Product not found", 404);
    }
    if (prod.ownerId !== userId && !options?.isAdmin) {
      throw new ListingError("Unauthorized: you can only modify your own listings.", 403);
    }

    if (data.title) prod.title = data.title;
    if (data.description) prod.description = data.description;
    if (data.categoryId) prod.categoryId = data.categoryId;
    if (data.subcategoryId !== undefined) prod.subcategoryId = data.subcategoryId;
    if (data.conditionGrade) prod.conditionGrade = data.conditionGrade;
    if (data.rentalPriceHourly !== undefined) prod.rentalPriceHourly = data.rentalPriceHourly;
    if (data.rentalPriceDaily !== undefined) prod.rentalPriceDaily = data.rentalPriceDaily;
    if (data.rentalPriceWeekly !== undefined) prod.rentalPriceWeekly = data.rentalPriceWeekly;
    if (data.rentalPriceMonthly !== undefined) prod.rentalPriceMonthly = data.rentalPriceMonthly;
    if (data.rentalPriceSemester !== undefined) prod.rentalPriceSemester = data.rentalPriceSemester;
    if (data.buyPrice !== undefined) prod.buyPrice = data.buyPrice;
    if (data.deposit !== undefined) prod.deposit = data.deposit;
    if (data.isRentable !== undefined) prod.isRentable = data.isRentable;
    if (data.isPurchasable !== undefined) prod.isPurchasable = data.isPurchasable;
    if (data.pickupAvailable !== undefined) prod.pickupAvailable = data.pickupAvailable;
    if (data.deliveryAvailable !== undefined) prod.deliveryAvailable = data.deliveryAvailable;
    if (data.campusHub) prod.campusHub = data.campusHub;
    if (data.pickupAddress !== undefined) prod.pickupAddress = data.pickupAddress;
    if (data.specs) prod.specs = data.specs;

    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      prod.images = data.images.map((url: string, i: number) => ({
        id: `img_${prod.id}_${i}`,
        url,
        isPrimary: i === 0,
      }));
    }

    prod.updatedAt = new Date().toISOString();
    updatedProduct = prod;
  });

  return updatedProduct ? sanitizeProductForPublic(updatedProduct) : null;
}

export async function deleteProductListing(
  productId: string,
  userId: string,
  options?: { isAdmin?: boolean }
) {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const prod = await prisma.product.findUnique({ where: { id: productId } });
      if (!prod) throw new ListingError("Product not found", 404);
      if (prod.ownerId !== userId && !options?.isAdmin) {
        throw new ListingError("Unauthorized: you can only delete your own listings.", 403);
      }

      // Check active bookings, rentals, or orders in DB
      const [activeBooking, activeRental, activeOrder] = await Promise.all([
        prisma.rentalBooking.findFirst({
          where: {
            productId,
            status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
          },
        }),
        prisma.rental.findFirst({
          where: {
            itemId: productId,
            status: { in: ["CREATED", "PENDING", "ACTIVE", "INSPECT"] },
          },
        }),
        prisma.purchaseOrder.findFirst({
          where: {
            productId,
            status: { in: ["PENDING", "PAID", "PROCESSING", "SHIPPED"] },
          },
        }),
      ]);
      if (activeBooking || activeRental || activeOrder) {
        throw new ListingError(
          "Cannot delete listing with active or confirmed bookings or orders. Please unlist it instead.",
          409
        );
      }

      const [anyBooking, anyRental, anyOrder] = await Promise.all([
        prisma.rentalBooking.findFirst({ where: { productId } }),
        prisma.rental.findFirst({ where: { itemId: productId } }),
        prisma.purchaseOrder.findFirst({ where: { productId } }),
      ]);
      if (anyBooking || anyRental || anyOrder) {
        throw new ListingError(
          "This listing has past booking or order history and cannot be permanently deleted. Please unlist it instead.",
          409
        );
      }

      await prisma.product.delete({ where: { id: productId } });

      // Remove from local store as well if present
      store.updateDB((db) => {
        db.products = db.products.filter((p) => p.id !== productId);
      });

      return { success: true, id: productId };
    } catch (e) {
      if (e instanceof ListingError) throw e;
      console.warn("[Product Service] Postgres deleteProductListing failed:", e);
    }
  }

  store.assertProductionDatabase();
  let deleted = false;
  store.updateDB((db) => {
    const prod = db.products.find((p) => p.id === productId);
    if (!prod) {
      throw new ListingError("Product not found", 404);
    }
    if (prod.ownerId !== userId && !options?.isAdmin) {
      throw new ListingError("Unauthorized: you can only delete your own listings.", 403);
    }

    // Check if there are active or confirmed bookings for this item
    const activeBooking = db.rentalBookings.find(
      (b) => b.productId === productId && ["PENDING", "CONFIRMED", "ACTIVE"].includes(b.status)
    );
    if (activeBooking) {
      throw new ListingError("Cannot delete listing with active or confirmed bookings.", 409);
    }

    db.products = db.products.filter((p) => p.id !== productId);
    deleted = true;
  });

  return { success: deleted, id: productId };
}
