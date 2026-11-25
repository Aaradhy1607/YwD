"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Info,
} from "lucide-react";
import Link from "next/link";

interface AuthCardProps {
  initialTab?: "signin" | "register" | "forgot";
  callbackUrl?: string;
  onSuccess?: (user?: any) => void;
  isModal?: boolean;
}

export function AuthCard({
  initialTab = "signin",
  callbackUrl = "/",
  onSuccess,
  isModal = false,
}: AuthCardProps) {
  const router = useRouter();

  // Navigation tab
  const [tab, setTab] = useState<"signin" | "register" | "forgot" | "reset">(initialTab);

  // Form input states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Reset workflow states
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [googleStatus, setGoogleStatus] = useState<boolean | null>(null);
  const [googleUnconfiguredNotice, setGoogleUnconfiguredNotice] = useState(false);

  // Check Google OAuth configuration status from the backend
  useEffect(() => {
    fetch("/api/auth/providers-status")
      .then((res) => res.json())
      .then((data) => {
        setGoogleStatus(Boolean(data?.providers?.google?.configured));
      })
      .catch(() => setGoogleStatus(false));
  }, []);

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setGoogleUnconfiguredNotice(false);
  };

  // Google OAuth sign in
  const handleGoogleSignIn = async () => {
    clearMessages();

    // If Google is known to be unconfigured, do not fail silently or fake a login
    if (googleStatus === false) {
      setGoogleUnconfiguredNotice(true);
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("google", { callbackUrl });
      if (res?.error) {
        setErrorMessage("Google sign-in could not be completed. Please check credentials or use Email sign-in.");
      }
    } catch {
      setGoogleUnconfiguredNotice(true);
    } finally {
      setLoading(false);
    }
  };

  // Credentials / Registration handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (tab === "signin") {
      setLoading(true);
      try {
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl,
        });

        if (res?.ok) {
          setSuccessMessage("Sign in successful. Redirecting...");
          if (onSuccess) {
            onSuccess({ email });
          } else {
            router.push(callbackUrl);
          }
        } else {
          setErrorMessage("Invalid email or password. Please verify your credentials.");
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Authentication failed.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (tab === "register") {
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }
      if (password.length < 8) {
        setErrorMessage("Password must be at least 8 characters long.");
        return;
      }
      if (!termsAccepted) {
        setErrorMessage("Please accept the Terms of Service and Privacy Policy to create your account.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Registration failed.");
        }

        setSuccessMessage("Account created successfully. Signing you in...");

        // Auto sign in after registration
        const loginRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl,
        });

        if (loginRes?.ok) {
          if (onSuccess) {
            onSuccess({ email, name });
          } else {
            router.push(callbackUrl);
          }
        } else {
          setTab("signin");
          setSuccessMessage("Account registered successfully. Please sign in with your password.");
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Registration failed.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (tab === "forgot") {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Could not process reset request.");
        }

        setSuccessMessage("If an account exists, a verification code has been issued.");
        setTab("reset");
      } catch (err: any) {
        setErrorMessage(err.message || "Could not request password reset.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (tab === "reset") {
      if (newPassword !== confirmNewPassword) {
        setErrorMessage("New passwords do not match.");
        return;
      }
      if (newPassword.length < 8) {
        setErrorMessage("New password must be at least 8 characters.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            token: resetToken,
            newPassword,
            confirmNewPassword,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Password reset failed.");
        }

        setSuccessMessage("Password successfully updated. You can now sign in.");
        setPassword("");
        setTab("signin");
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to reset password.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={`w-full ${isModal ? "p-0" : "max-w-md mx-auto"}`}>
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#E5DEC9] shadow-xl p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FAF7F2] border border-[#E5DEC9] shadow-xs flex items-center justify-center mx-auto">
            <img src="/images/ywd-logo.png" alt="YwD Insignia" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-semibold text-xl sm:text-2xl text-[#18352D] tracking-tight">
            {tab === "signin" && "Sign in to YwD"}
            {tab === "register" && "Create Your Account"}
            {tab === "forgot" && "Reset Your Password"}
            {tab === "reset" && "Set New Password"}
          </h1>
          <p className="text-xs text-[#63736A] max-w-xs mx-auto leading-relaxed">
            {tab === "signin" && "Access your rentals, listings, and messages."}
            {tab === "register" && "Join the verified community for renting and sharing equipment."}
            {tab === "forgot" && "Enter your email to receive a secure 6-digit verification code."}
            {tab === "reset" && "Enter the verification code and your new password."}
          </p>
        </div>

        {/* Tab Selector (Sign In vs Register) */}
        {(tab === "signin" || tab === "register") && (
          <div className="flex rounded-xl bg-[#FAF7F2] p-1 border border-[#E5DEC9] text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                clearMessages();
              }}
              className={`flex-1 py-2.5 rounded-lg transition-colors ${
                tab === "signin"
                  ? "bg-[#FFFFFF] text-[#18352D] shadow-xs font-semibold"
                  : "text-[#63736A] hover:text-[#18352D]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                clearMessages();
              }}
              className={`flex-1 py-2.5 rounded-lg transition-colors ${
                tab === "register"
                  ? "bg-[#FFFFFF] text-[#18352D] shadow-xs font-semibold"
                  : "text-[#63736A] hover:text-[#18352D]"
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{successMessage}</div>
          </div>
        )}

        {/* Google OAuth Unconfigured Notice */}
        {googleUnconfiguredNotice && (
          <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-[#92400E]">
              <Info className="w-4 h-4 shrink-0" />
              <span>Google OAuth Setup Notice</span>
            </div>
            <p className="text-[11px] text-[#92400E] leading-relaxed">
              Google OAuth is not configured on this server. To enable Google Sign-In, configure <code className="bg-[#FEF3C7] px-1 py-0.5 rounded text-[10px] font-mono">AUTH_GOOGLE_ID</code> and <code className="bg-[#FEF3C7] px-1 py-0.5 rounded text-[10px] font-mono">AUTH_GOOGLE_SECRET</code> in your environment.
            </p>
            <p className="text-[11px] text-[#92400E]">
              Please sign in using your <strong>Email and Password</strong> above.
            </p>
          </div>
        )}

        {/* Main Authentication Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Register: Full Name */}
          {tab === "register" && (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#18352D]">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Siddharth Rao"
                className="w-full h-10 px-3.5 rounded-xl border border-[#E5DEC9] text-xs text-[#18352D] placeholder-[#9BB5A3] focus:outline-none focus:border-[#18352D] focus:ring-1 focus:ring-[#18352D] transition-colors"
              />
            </div>
          )}

          {/* Email Address */}
          {tab !== "reset" && (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#18352D]">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu or personal email"
                className="w-full h-10 px-3.5 rounded-xl border border-[#E5DEC9] text-xs text-[#18352D] placeholder-[#9BB5A3] focus:outline-none focus:border-[#18352D] focus:ring-1 focus:ring-[#18352D] transition-colors"
              />
            </div>
          )}

          {/* Sign In / Register: Password */}
          {(tab === "signin" || tab === "register") && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-[#18352D]">
                  Password {tab === "register" && "(Minimum 8 characters)"}
                </label>
                {tab === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setTab("forgot");
                      clearMessages();
                    }}
                    className="text-[11px] text-[#7052DF] hover:underline transition-colors font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={tab === "register" ? 8 : 1}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-[#E5DEC9] text-xs text-[#18352D] placeholder-[#9BB5A3] focus:outline-none focus:border-[#18352D] focus:ring-1 focus:ring-[#18352D] transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 text-[#63736A] hover:text-[#18352D] p-1 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Register: Confirm Password */}
          {tab === "register" && (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#18352D]">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-[#E5DEC9] text-xs text-[#18352D] placeholder-[#9BB5A3] focus:outline-none focus:border-[#18352D] focus:ring-1 focus:ring-[#18352D] transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 text-[#63736A] hover:text-[#18352D] p-1 focus:outline-none transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[11px] text-[#9B1C1C]">Passwords do not match</p>
              )}
            </div>
          )}

          {/* Register: Terms & Privacy Checkbox */}
          {tab === "register" && (
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#E5DEC9] text-[#C46A42] focus:ring-[#C46A42]"
                />
                <span className="text-[11px] text-[#63736A] leading-tight">
                  I agree to the <span className="text-[#18352D] underline font-medium">Terms of Service</span> and acknowledge the <span className="text-[#18352D] underline font-medium">Privacy Policy</span>.
                </span>
              </label>
            </div>
          )}

          {/* Reset Tab: Code & New Password */}
          {tab === "reset" && (
            <>
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#18352D]">
                  Verification Code (6 digits)
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="123456"
                  className="w-full h-10 px-3.5 rounded-xl border border-[#E5DEC9] text-xs text-[#18352D] font-mono tracking-widest placeholder-[#9BB5A3] focus:outline-none focus:border-[#18352D] focus:ring-1 focus:ring-[#18352D]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#18352D]">
                  New Password (Min. 8 characters)
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-[#E5DEC9] text-xs text-[#18352D] font-mono focus:outline-none focus:border-[#18352D] focus:ring-1 focus:ring-[#18352D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 text-[#63736A] hover:text-[#18352D] p-1"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#18352D]">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3.5 rounded-xl border border-[#E5DEC9] text-xs text-[#18352D] font-mono focus:outline-none focus:border-[#18352D] focus:ring-1 focus:ring-[#18352D]"
                />
              </div>
            </>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#C46A42] hover:bg-[#B05C36] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>
                {tab === "signin" && "Sign In with Password"}
                {tab === "register" && "Create Account"}
                {tab === "forgot" && "Send Verification Code"}
                {tab === "reset" && "Update Password & Return to Sign In"}
              </span>
            )}
          </button>

          {/* Back button for Forgot / Reset */}
          {(tab === "forgot" || tab === "reset") && (
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                clearMessages();
              }}
              className="w-full text-center text-xs text-[#63736A] hover:text-[#18352D] flex items-center justify-center gap-1.5 py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          )}
        </form>

        {/* Divider & Google OAuth */}
        {(tab === "signin" || tab === "register") && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#E5DEC9]" />
              <span className="text-[10px] text-[#63736A] uppercase tracking-wider font-semibold">
                Or continue with
              </span>
              <div className="flex-1 h-px bg-[#E5DEC9]" />
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full h-11 px-4 rounded-xl border border-[#E5DEC9] hover:border-[#18352D] bg-[#FFFFFF] hover:bg-[#FAF7F2] text-[#18352D] font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors shadow-xs disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
