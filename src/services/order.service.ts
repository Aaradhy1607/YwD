import { store } from "./store";
import { prisma } from "@/lib/prisma";

export interface CreatePurchaseInput {
  productId: string;
  buyerId: string;
  deliveryAddress: string;
}

export async function createPurchaseOrder(input: CreatePurchaseInput) {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      return await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: input.productId },
          include: { images: true },
        });

        if (!product) throw new Error("Product listing not found.");
        if (!product.isPurchasable || !product.buyPrice) {
          throw new Error("This product is not offered for outright purchase.");
        }
        if (!product.isAvailable) {
          throw new Error("This item is already sold or unavailable.");
        }
        if (product.ownerId === input.buyerId) {
          throw new Error("You cannot purchase your own listing.");
        }

        // Atomically mark product as unavailable / sold
        await tx.product.update({
          where: { id: product.id },
          data: { isAvailable: false },
        });

        const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const orderNumber = `YWD-BUY-${Math.floor(100000 + Math.random() * 900000)}`;
        const deliveryFee = 99;
        const totalAmount = product.buyPrice + deliveryFee;

        const newOrder = await tx.purchaseOrder.create({
          data: {
            id: orderId,
            orderNumber,
            buyerId: input.buyerId,
            productId: product.id,
            price: product.buyPrice,
            deliveryFee,
            totalAmount,
            status: "PAID",
            deliveryAddress: input.deliveryAddress,
          },
          include: {
            product: { include: { images: true } },
          },
        });

        await tx.notification.create({
          data: {
            userId: input.buyerId,
            title: "Recommerce Purchase Confirmed",
            message: `Your verified order ${orderNumber} for "${product.title}" has been confirmed and queued for dispatch.`,
            type: "ORDER",
            link: "/dashboard?tab=orders",
          },
        });

        return {
          ...newOrder,
          productTitle: product.title,
          productImage: product.images?.[0]?.url || "",
          createdAt: newOrder.createdAt.toISOString(),
          updatedAt: newOrder.updatedAt.toISOString(),
        };
      });
    } catch (e) {
      if (e instanceof Error && (e.message.includes("not found") || e.message.includes("sold") || e.message.includes("cannot purchase"))) {
        throw e;
      }
      console.warn("[Order Service] Postgres createPurchaseOrder failed, falling back to store:", e);
    }
  }

  store.assertProductionDatabase();
  const product = store.getDB().products.find((p) => p.id === input.productId);
  if (!product) {
    throw new Error("Product listing not found.");
  }

  if (!product.isPurchasable || !product.buyPrice) {
    throw new Error("This product is not offered for outright purchase.");
  }

  if (!product.isAvailable) {
    throw new Error("This item is already sold or unavailable.");
  }

  if (product.ownerId === input.buyerId) {
    throw new Error("You cannot purchase your own listing.");
  }

  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const orderNumber = `YWD-BUY-${Math.floor(100000 + Math.random() * 900000)}`;
  const deliveryFee = 99;
  const totalAmount = product.buyPrice + deliveryFee;

  const newOrder = {
    id: orderId,
    orderNumber,
    buyerId: input.buyerId,
    productId: product.id,
    productTitle: product.title,
    productImage: product.images?.[0]?.url || "",
    price: product.buyPrice,
    deliveryFee,
    totalAmount,
    status: "PAID",
    deliveryAddress: input.deliveryAddress,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.updateDB((db) => {
    const prod = db.products.find((p) => p.id === product.id);
    if (prod) {
      prod.isAvailable = false;
      prod.updatedAt = new Date().toISOString();
    }

    db.purchaseOrders.unshift(newOrder);

    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: input.buyerId,
      title: "Recommerce Purchase Confirmed",
      message: `Your verified order ${orderNumber} for "${product.title}" has been confirmed and queued for dispatch.`,
      type: "ORDER",
      link: `/dashboard?tab=orders`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  });

  return newOrder;
}

export async function getUserOrders(userId: string) {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const orders = await prisma.purchaseOrder.findMany({
        where: { buyerId: userId },
        include: { product: { include: { images: true } } },
        orderBy: { createdAt: "desc" },
      });
      return orders.map((o) => ({
        ...o,
        productTitle: o.product.title,
        productImage: o.product.images?.[0]?.url || "",
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      }));
    } catch (e) {
      console.warn("[Order Service] Postgres getUserOrders failed:", e);
    }
  }

  return store.getDB().purchaseOrders.filter((o) => o.buyerId === userId);
}

// -----------------------------------------------------------------------------
// CART OPERATIONS
// -----------------------------------------------------------------------------

export async function getCartItems(userId: string) {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const items = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: { include: { images: true } } },
        orderBy: { createdAt: "desc" },
      });
      return items;
    } catch (e) {
      console.warn("[Order Service] Postgres getCartItems failed:", e);
    }
  }

  const items = store.getDB().cartItems.filter((c) => c.userId === userId);
  return items.map((item) => {
    const product = store.getDB().products.find((p) => p.id === item.productId);
    return {
      ...item,
      product: product || null,
    };
  });
}

export async function addToCart(params: {
  userId: string;
  productId: string;
  isRental?: boolean;
  durationTier?: string;
}) {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const existing = await prisma.cartItem.findFirst({
        where: {
          userId: params.userId,
          productId: params.productId,
          isRental: Boolean(params.isRental),
        },
      });

      if (existing) {
        return await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + 1 },
          include: { product: { include: { images: true } } },
        });
      }

      return await prisma.cartItem.create({
        data: {
          userId: params.userId,
          productId: params.productId,
          isRental: Boolean(params.isRental),
          durationTier: params.durationTier || "daily",
          quantity: 1,
        },
        include: { product: { include: { images: true } } },
      });
    } catch (e) {
      console.warn("[Order Service] Postgres addToCart failed:", e);
    }
  }

  let addedItem = null;
  store.updateDB((db) => {
    const existing = db.cartItems.find(
      (c) =>
        c.userId === params.userId &&
        c.productId === params.productId &&
        c.isRental === Boolean(params.isRental)
    );

    if (existing) {
      existing.quantity += 1;
      addedItem = existing;
    } else {
      const newItem = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: params.userId,
        productId: params.productId,
        isRental: Boolean(params.isRental),
        durationTier: params.durationTier || "daily",
        quantity: 1,
        createdAt: new Date().toISOString(),
      };
      db.cartItems.push(newItem);
      addedItem = newItem;
    }
  });

  return addedItem;
}

export async function removeFromCart(cartItemId: string, userId: string) {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      await prisma.cartItem.deleteMany({
        where: { id: cartItemId, userId },
      });
      return { success: true };
    } catch (e) {
      console.warn("[Order Service] Postgres removeFromCart failed:", e);
    }
  }

  store.updateDB((db) => {
    db.cartItems = db.cartItems.filter(
      (c) => !(c.id === cartItemId && c.userId === userId)
    );
  });
  return { success: true };
}

// -----------------------------------------------------------------------------
// WISHLIST OPERATIONS
// -----------------------------------------------------------------------------

export async function getWishlist(userId: string) {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const items = await prisma.wishlistItem.findMany({
        where: { userId },
        include: { product: { include: { images: true } } },
        orderBy: { createdAt: "desc" },
      });
      return items;
    } catch (e) {
      console.warn("[Order Service] Postgres getWishlist failed:", e);
    }
  }

  const items = store.getDB().wishlistItems.filter((w) => w.userId === userId);
  return items.map((w) => {
    const product = store.getDB().products.find((p) => p.id === w.productId);
    return {
      ...w,
      product: product || null,
    };
  });
}

export async function toggleWishlist(userId: string, productId: string) {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const existing = await prisma.wishlistItem.findFirst({
        where: { userId, productId },
      });
      if (existing) {
        await prisma.wishlistItem.delete({ where: { id: existing.id } });
        return { isSaved: false, wishlisted: false };
      } else {
        await prisma.wishlistItem.create({
          data: { userId, productId },
        });
        return { isSaved: true, wishlisted: true };
      }
    } catch (e) {
      console.warn("[Order Service] Postgres toggleWishlist failed:", e);
    }
  }

  let isSaved = false;
  store.updateDB((db) => {
    const idx = db.wishlistItems.findIndex(
      (w) => w.userId === userId && w.productId === productId
    );
    if (idx >= 0) {
      db.wishlistItems.splice(idx, 1);
      isSaved = false;
    } else {
      db.wishlistItems.push({
        id: `wsh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        productId,
        createdAt: new Date().toISOString(),
      });
      isSaved = true;
    }
  });
  return { isSaved, wishlisted: isSaved };
}
