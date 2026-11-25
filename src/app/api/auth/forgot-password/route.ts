import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations";
import { checkRateLimit, generateSecureOTP, logAuditEvent } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { store } from "@/services/store";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    const rateLimit = checkRateLimit(`forgot_pw_${ip}`, 5, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many password reset requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = forgotPasswordSchema.parse(body);
    const normalizedEmail = validated.email.toLowerCase().trim();

    let user: any = null;
    const isPg = await store.checkPostgres();
    if (isPg) {
      try {
        user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      } catch (e) {
        console.warn("[Forgot Password] Postgres lookup failed:", e);
      }
    }

    if (!user) {
      user = store.getDB().users.find((u) => u.email === normalizedEmail);
    }

    // Generate secure 6-digit verification code
    const resetCode = generateSecureOTP();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    if (user) {
      if (isPg) {
        try {
          // Delete any existing token for this email identifier
          await prisma.verificationToken.deleteMany({
            where: { identifier: normalizedEmail },
          });
          await prisma.verificationToken.create({
            data: {
              identifier: normalizedEmail,
              token: resetCode,
              expires,
            },
          });
        } catch (e) {
          console.warn("[Forgot Password] Prisma token insert failed, saving to store:", e);
        }
      }

      // Also persist to store for local dev & fallback resilience
      store.updateDB((db) => {
        db.verificationTokens = (db.verificationTokens || []).filter(
          (t) => t.identifier !== normalizedEmail
        );
        db.verificationTokens.push({
          identifier: normalizedEmail,
          token: resetCode,
          expires: expires.toISOString(),
        });
      });

      await logAuditEvent({
        userId: user.id,
        action: "PASSWORD_RESET_REQUESTED",
        resource: "auth",
        metadata: { email: normalizedEmail },
        ipAddress: ip,
      });
    }

    // Security practice: Always respond with generic success to prevent account enumeration
    // Never expose password-reset OTPs in production API responses
    if (process.env.NODE_ENV !== "production" && user) {
      console.log(`[AUTH DEV] Password reset code for ${normalizedEmail}: ${resetCode}`);
    }

    return NextResponse.json({
      success: true,
      message: "If an account with this email exists, a verification code has been issued.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process password reset request" },
      { status: 400 }
    );
  }
}
