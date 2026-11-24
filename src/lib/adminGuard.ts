import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { store } from "@/services/store";

export async function assertAdminSession() {
  let session: any = null;
  try {
    session = await auth();
  } catch (err) {
    console.warn("[AdminGuard] Session retrieval warning:", err);
    return { authorized: false as const, status: 401 as const, error: "Authentication required" };
  }
  if (!session || !session.user) {
    return { authorized: false as const, status: 401 as const, error: "Authentication required" };
  }

  const userId = session.user.id;
  let role = (session.user as any).role;

  const isPg = await store.checkPostgres();
  if (isPg && userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) role = user.role;
    } catch {}
  }

  if (role !== "ADMIN") {
    return {
      authorized: false as const,
      status: 403 as const,
      error: "Access Denied: Administrator role required",
    };
  }

  return { authorized: true as const, user: session.user };
}
