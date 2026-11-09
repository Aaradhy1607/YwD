import { store } from "./store";

export interface CreatePurchaseInput {
  productId: string;
  buyerId: string;
  deliveryAddress: string;
}

export async function createPurchaseOrder(input: CreatePurchaseInput) {
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
    // Mark product as sold / unavailable
    const prod = db.products.find((p) => p.id === product.id);
    if (prod) {
      prod.isAvailable = false;
      prod.updatedAt = new Date().toISOString();
    }

    db.purchaseOrders.unshift(newOrder);

    // Add confirmation notification
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
  return store.getDB().purchaseOrders.filter((o) => o.buyerId === userId);
}

// -----------------------------------------------------------------------------
// CART OPERATIONS
// -----------------------------------------------------------------------------

export async function getCartItems(userId: string) {
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
