import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validations";
import { checkRateLimit, hashPassword, logAuditEvent } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { store } from "@/services/store";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    const rateLimit = checkRateLimit(`reset_pw_${ip}`, 5, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = resetPasswordSchema.parse(body);
    const normalizedEmail = validated.email.toLowerCase().trim();
    const token = validated.token.trim();

    let validToken = false;
    const isPg = await store.checkPostgres();

    if (isPg) {
      try {
        const storedToken = await prisma.verificationToken.findFirst({
          where: {
            identifier: normalizedEmail,
            token,
            expires: { gt: new Date() },
          },
        });
        if (storedToken) {
          validToken = true;
          // Clean up token after use
          await prisma.verificationToken.deleteMany({
            where: { identifier: normalizedEmail },
          });
        }
      } catch (e) {
        console.warn("[Reset Password] Postgres lookup failed:", e);
      }
    }

    // Check store fallback
    if (!validToken) {
      const dbTokens = store.getDB().verificationTokens || [];
      const match = dbTokens.find(
        (t) =>
          t.identifier === normalizedEmail &&
          t.token === token &&
          new Date(t.expires).getTime() > Date.now()
      );
      if (match) {
        validToken = true;
        store.updateDB((db) => {
          db.verificationTokens = (db.verificationTokens || []).filter(
            (t) => !(t.identifier === normalizedEmail && t.token === token)
          );
        });
      }
    }

    if (!validToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset code. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash the new password using cryptographic scrypt
    const hashedPassword = hashPassword(validated.newPassword);

    let updated = false;
    if (isPg) {
      try {
        const user = await prisma.user.update({
          where: { email: normalizedEmail },
          data: { passwordHash: hashedPassword },
        });
        if (user) updated = true;
      } catch (e) {
        console.warn("[Reset Password] Postgres update failed, updating store:", e);
      }
    }

    // Update store fallback
    store.updateDB((db) => {
      const u = db.users.find((user) => user.email === normalizedEmail);
      if (u) {
        u.passwordHash = hashedPassword;
        u.updatedAt = new Date().toISOString();
        updated = true;
      }
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Account could not be updated." },
        { status: 404 }
      );
    }

    await logAuditEvent({
      userId: normalizedEmail,
      action: "PASSWORD_RESET_SUCCESS",
      resource: "auth",
      metadata: { email: normalizedEmail },
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully reset. You can now sign in.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to reset password" },
      { status: 400 }
    );
  }
}
