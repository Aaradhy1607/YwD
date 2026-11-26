import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockAccountFindUnique,
  mockAccountCreate,
  mockAccountUpdate,
  mockUserFindUnique,
  mockUserCreate,
  mockUserUpdate,
  mockProfileCreate,
  mockNotificationCreate,
  mockAuditLogCreate,
  mockCheckPostgres,
} = vi.hoisted(() => ({
  mockAccountFindUnique: vi.fn(),
  mockAccountCreate: vi.fn(),
  mockAccountUpdate: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockUserCreate: vi.fn(),
  mockUserUpdate: vi.fn(),
  mockProfileCreate: vi.fn(),
  mockNotificationCreate: vi.fn(),
  mockAuditLogCreate: vi.fn(),
  mockCheckPostgres: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    account: {
      findUnique: mockAccountFindUnique,
      create: mockAccountCreate,
      update: mockAccountUpdate,
    },
    user: {
      findUnique: mockUserFindUnique,
      create: mockUserCreate,
      update: mockUserUpdate,
    },
    anonymousProfile: {
      create: mockProfileCreate,
    },
    notification: {
      create: mockNotificationCreate,
    },
    auditLog: {
      create: mockAuditLogCreate,
    },
  },
}));

vi.mock("@/services/store", () => {
  const devUsers: any[] = [];
  const devProfiles: any[] = [];
  const devNotifications: any[] = [];
  return {
    store: {
      checkPostgres: mockCheckPostgres,
      assertProductionDatabase: vi.fn(),
      getDB: () => ({
        users: devUsers,
        anonymousProfiles: devProfiles,
        notifications: devNotifications,
        auditLogs: [],
      }),
      updateDB: (fn: (db: any) => void) => {
        fn({
          users: devUsers,
          anonymousProfiles: devProfiles,
          notifications: devNotifications,
          auditLogs: [],
        });
      },
    },
  };
});

import { syncGoogleUser } from "@/lib/google-auth";

describe("Google OAuth User Sync & Account Linking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckPostgres.mockResolvedValue(true);
  });

  it("rejects Google sign-in when email is missing or unverified", async () => {
    const missingEmail = await syncGoogleUser(
      { email: null, name: "No Email" },
      { provider: "google", providerAccountId: "g-1" }
    );
    expect(missingEmail.allowed).toBe(false);
    expect(missingEmail.errorCode).toBe("MISSING_EMAIL");

    const unverified = await syncGoogleUser(
      { email: "test@example.com", emailVerified: false },
      { provider: "google", providerAccountId: "g-2" }
    );
    expect(unverified.allowed).toBe(false);
    expect(unverified.errorCode).toBe("EMAIL_UNVERIFIED");
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  it("still allows Google sign-in even if welcome notification creation fails", async () => {
    mockAccountFindUnique.mockResolvedValue(null);
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({
      id: "usr_google_notif_fail",
      email: "notif@university.edu",
      name: "Notif User",
      role: "USER",
      anonymousProfile: { alias: "EcoRenter-5555" },
    });
    mockNotificationCreate.mockRejectedValueOnce(new Error("Notification table error"));

    const result = await syncGoogleUser(
      {
        email: "notif@university.edu",
        name: "Notif User",
        emailVerified: true,
      },
      {
        provider: "google",
        providerAccountId: "google-sub-notif",
        type: "oidc",
      }
    );

    expect(result).toEqual({ allowed: true, userId: "usr_google_notif_fail" });
  });

  it("returns OAUTH_SYNC_ERROR when Postgres throws during sync instead of throwing uncaught", async () => {
    mockAccountFindUnique.mockRejectedValueOnce(new Error("Connection terminated"));

    const result = await syncGoogleUser(
      {
        email: "dbdown@university.edu",
        name: "DB Down",
        emailVerified: true,
      },
      {
        provider: "google",
        providerAccountId: "google-sub-err",
        type: "oidc",
      }
    );

    expect(result.allowed).toBe(false);
    expect(result.errorCode).toBe("OAUTH_SYNC_ERROR");
  });

  it("creates a new User, AnonymousProfile, Account, and Notification for a first-time Google user", async () => {
    mockAccountFindUnique.mockResolvedValue(null);
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({
      id: "usr_google_new_1",
      email: "newstudent@university.edu",
      name: "Aarav Mehta",
      role: "USER",
      anonymousProfile: { alias: "EcoRenter-1234" },
    });

    const result = await syncGoogleUser(
      {
        email: "NewStudent@University.edu",
        name: "Aarav Mehta",
        image: "https://lh3.googleusercontent.com/a/photo",
        emailVerified: true,
      },
      {
        provider: "google",
        providerAccountId: "google-sub-101",
        type: "oidc",
        access_token: "ya29.test",
        id_token: "eyJ.test",
      }
    );

    expect(result).toEqual({ allowed: true, userId: "usr_google_new_1" });
    expect(mockUserCreate).toHaveBeenCalledTimes(1);
    const createArgs = mockUserCreate.mock.calls[0][0];
    expect(createArgs.data.email).toBe("newstudent@university.edu");
    expect(createArgs.data.anonymousProfile.create).toBeDefined();
    expect(createArgs.data.accounts.create).toMatchObject({
      provider: "google",
      providerAccountId: "google-sub-101",
    });
    expect(mockNotificationCreate).toHaveBeenCalledTimes(1);
  });

  it("returns existing user and refreshes tokens for a returning Google user without duplicating accounts", async () => {
    mockAccountFindUnique.mockResolvedValue({
      id: "acc_1",
      provider: "google",
      providerAccountId: "google-sub-101",
      refresh_token: "old_refresh",
      access_token: "old_access",
      expires_at: 1000,
      token_type: "Bearer",
      scope: "openid email profile",
      id_token: "old_id",
      user: {
        id: "usr_google_existing",
        email: "returning@university.edu",
        name: "Returning User",
        image: "https://lh3.googleusercontent.com/a/old",
        emailVerified: new Date(),
        anonymousProfile: { id: "prof_1", alias: "SageVault-9911" },
      },
    });

    const result = await syncGoogleUser(
      {
        email: "returning@university.edu",
        name: "Returning User",
        emailVerified: true,
      },
      {
        provider: "google",
        providerAccountId: "google-sub-101",
        access_token: "new_access",
      }
    );

    expect(result).toEqual({ allowed: true, userId: "usr_google_existing" });
    expect(mockAccountUpdate).toHaveBeenCalledTimes(1);
    expect(mockUserCreate).not.toHaveBeenCalled();
    expect(mockAccountCreate).not.toHaveBeenCalled();
  });

  it("links Google Account to an existing email/password user without creating a duplicate user", async () => {
    mockAccountFindUnique.mockResolvedValue(null);
    mockUserFindUnique.mockResolvedValue({
      id: "usr_credentials_42",
      email: "existing@university.edu",
      name: "Existing User",
      image: null,
      emailVerified: null,
      passwordHash: "salt:hash",
      anonymousProfile: { id: "prof_42", alias: "EcoRenter-4242" },
    });

    const result = await syncGoogleUser(
      {
        email: "existing@university.edu",
        name: "Existing User",
        image: "https://lh3.googleusercontent.com/a/avatar",
        emailVerified: true,
      },
      {
        provider: "google",
        providerAccountId: "google-sub-999",
        type: "oidc",
        access_token: "ya29.linked",
      }
    );

    expect(result).toEqual({ allowed: true, userId: "usr_credentials_42" });
    expect(mockAccountCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "usr_credentials_42",
        provider: "google",
        providerAccountId: "google-sub-999",
      }),
    });
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "usr_credentials_42" },
      data: expect.objectContaining({
        image: "https://lh3.googleusercontent.com/a/avatar",
      }),
    });
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  it("creates and reuses user in dev fallback store when Postgres is unavailable", async () => {
    mockCheckPostgres.mockResolvedValue(false);

    const first = await syncGoogleUser(
      {
        email: "devgoogle@university.edu",
        name: "Dev Google User",
        emailVerified: true,
      },
      { provider: "google", providerAccountId: "g-dev-1" }
    );
    expect(first.allowed).toBe(true);
    expect(first.userId).toBeDefined();

    const second = await syncGoogleUser(
      {
        email: "devgoogle@university.edu",
        name: "Dev Google User",
        emailVerified: true,
      },
      { provider: "google", providerAccountId: "g-dev-1" }
    );
    expect(second).toEqual({ allowed: true, userId: first.userId });
  });
});
