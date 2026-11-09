import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateSecureOTP,
  checkRateLimit,
} from "@/lib/security";
import { registerSchema, loginSchema } from "@/lib/validations";

describe("Authentication & Security Module", () => {
  it("hashes password with cryptographic salt and verifies correctly", () => {
    const password = "SuperSecretPassword123!";
    const hashed = hashPassword(password);

    expect(hashed).toContain(":");
    expect(verifyPassword(password, hashed)).toBe(true);
    expect(verifyPassword("WrongPassword123!", hashed)).toBe(false);
  });

  it("fails verification safely against malformed or empty hashes", () => {
    expect(verifyPassword("test", "")).toBe(false);
    expect(verifyPassword("test", "invalid_hash_without_salt")).toBe(false);
  });

  it("generates a cryptographically random 6-digit OTP", () => {
    const otp = generateSecureOTP();
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  it("enforces sliding-window rate limits", () => {
    const key = `test_rate_limit_${Date.now()}`;
    // 3 attempts allowed
    expect(checkRateLimit(key, 3, 5000).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 5000).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 5000).allowed).toBe(true);
    // 4th attempt blocked
    const blocked = checkRateLimit(key, 3, 5000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("validates registration schema according to security policies", () => {
    const valid = {
      email: "student@university.edu",
      password: "StrongPassword89#",
      name: "Siddharth Rao",
    };
    expect(registerSchema.safeParse(valid).success).toBe(true);

    const tooShortPassword = {
      email: "student@university.edu",
      password: "123",
    };
    expect(registerSchema.safeParse(tooShortPassword).success).toBe(false);

    const invalidEmail = {
      email: "not-an-email",
      password: "StrongPassword89#",
    };
    expect(registerSchema.safeParse(invalidEmail).success).toBe(false);
  });
});

