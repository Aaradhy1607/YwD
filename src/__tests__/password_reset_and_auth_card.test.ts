import { describe, it, expect, beforeEach } from "vitest";
import { forgotPasswordSchema, resetPasswordSchema, registerFormSchema } from "@/lib/validations";
import { hashPassword, verifyPassword } from "@/lib/security";
import { store } from "@/services/store";

describe("Password Reset & Auth Validation Suite", () => {
  beforeEach(() => {
    // Ensure clean test store state
    store.updateDB((db) => {
      db.verificationTokens = [];
    });
  });

  it("validates registerFormSchema matching passwords and terms", () => {
    const validRegistration = {
      name: "Aaradhya Dev",
      email: "aaradhya@test.edu",
      password: "StrongPassword89#",
      confirmPassword: "StrongPassword89#",
      termsAccepted: true,
    };
    expect(registerFormSchema.safeParse(validRegistration).success).toBe(true);

    const mismatchedPasswords = {
      name: "Aaradhya Dev",
      email: "aaradhya@test.edu",
      password: "StrongPassword89#",
      confirmPassword: "DifferentPassword89#",
      termsAccepted: true,
    };
    const mismatchRes = registerFormSchema.safeParse(mismatchedPasswords);
    expect(mismatchRes.success).toBe(false);

    const unacceptedTerms = {
      name: "Aaradhya Dev",
      email: "aaradhya@test.edu",
      password: "StrongPassword89#",
      confirmPassword: "StrongPassword89#",
      termsAccepted: false,
    };
    expect(registerFormSchema.safeParse(unacceptedTerms).success).toBe(false);
  });

  it("validates forgotPasswordSchema and resetPasswordSchema", () => {
    expect(forgotPasswordSchema.safeParse({ email: "valid@ywd.in" }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: "invalid-email" }).success).toBe(false);

    const validReset = {
      email: "user@ywd.in",
      token: "849201",
      newPassword: "BrandNewSecurePassword123#",
      confirmNewPassword: "BrandNewSecurePassword123#",
    };
    expect(resetPasswordSchema.safeParse(validReset).success).toBe(true);

    const mismatchReset = {
      email: "user@ywd.in",
      token: "849201",
      newPassword: "BrandNewSecurePassword123#",
      confirmNewPassword: "MismatchPassword123#",
    };
    expect(resetPasswordSchema.safeParse(mismatchReset).success).toBe(false);
  });

  it("hashes new password and verifies correctly after simulated reset", () => {
    const newPlaintext = "UpdatedPass2026!";
    const hashed = hashPassword(newPlaintext);
    expect(verifyPassword(newPlaintext, hashed)).toBe(true);
    expect(verifyPassword("WrongPassword!", hashed)).toBe(false);
  });
});
