import { NextRequest, NextResponse } from "next/server";
import {
  getProductById,
  toggleProductAvailability,
  updateProductListing,
  deleteProductListing,
  ListingError,
} from "@/services/product.service";
import { auth } from "@/lib/auth";
import { assertAdminSession } from "@/lib/adminGuard";
import { logAuditEvent } from "@/lib/security";

async function resolveActor() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }
  const adminCheck = await assertAdminSession();
  return {
    userId,
    isAdmin: adminCheck.authorized,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const prod = product as any;
    if (prod.isPaused || prod.isAvailable === false) {
      const actor = await resolveActor();
      if (!actor || (prod.ownerId !== actor.userId && !actor.isAdmin)) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const actor = await resolveActor();
    if (!actor) {
      return NextResponse.json({ error: "Unauthorized: Authentication required." }, { status: 401 });
    }

    const updated = await toggleProductAvailability(id, actor.userId, { isAdmin: actor.isAdmin });
    if (!updated) {
      return NextResponse.json(
        { error: "Unauthorized or product not found" },
        { status: 403 }
      );
    }

    await logAuditEvent({
      userId: actor.userId,
      action: actor.isAdmin ? "ADMIN_TOGGLE_PRODUCT_AVAILABILITY" : "USER_TOGGLE_PRODUCT_AVAILABILITY",
      resource: `product:${id}`,
      metadata: { isAvailable: updated.isAvailable, isPaused: updated.isPaused },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error instanceof ListingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message || "Failed to update listing" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const actor = await resolveActor();
    if (!actor) {
      return NextResponse.json({ error: "Unauthorized: Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const updated = await updateProductListing(id, body, actor.userId, { isAdmin: actor.isAdmin });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error instanceof ListingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error.message || "Failed to update listing" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const actor = await resolveActor();
    if (!actor) {
      return NextResponse.json({ error: "Unauthorized: Authentication required." }, { status: 401 });
    }

    const result = await deleteProductListing(id, actor.userId, { isAdmin: actor.isAdmin });

    await logAuditEvent({
      userId: actor.userId,
      action: actor.isAdmin ? "ADMIN_DELETE_PRODUCT" : "USER_DELETE_PRODUCT",
      resource: `product:${id}`,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof ListingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error.message || "Failed to delete listing" },
      { status: 400 }
    );
  }
}
