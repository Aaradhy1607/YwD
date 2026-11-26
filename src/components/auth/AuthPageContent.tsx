"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, ArrowLeft, Check, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { AuthRole, loginUser, registerUser } from "@/services/auth.client";
import { StandaloneFooter, StandaloneHeader } from "@/components/landing/StandaloneChrome";
import { AuthDoodles } from "@/components/landing/LandingDoodles";

type Tab = "login" | "signup";
type ErrorMap = Record<string, string>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthPageContent() {
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();
  const initialTab: Tab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleConfigured, setGoogleConfigured] = useState<boolean | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [status, setStatus] = useState("");

  const callbackUrl = searchParams.get("callbackUrl") || "/marketplace";

  useEffect(() => {
    fetch("/api/auth/providers-status")
      .then((res) => res.json())
      .then((data) => {
        setGoogleConfigured(Boolean(data?.providers?.google?.configured));
      })
      .catch(() => setGoogleConfigured(false));

    const errorParam = searchParams.get("error");
    if (errorParam) {
      const errorMap: Record<string, string> = {
        AccessDenied: "Google sign-in was cancelled or denied. Please try again or use email.",
        Configuration: "Google OAuth is not configured properly on this server.",
        OAuthAccountNotLinked: "This email is already registered with another sign-in method.",
        OAuthCallbackError: "Google sign-in could not be completed. Please try again.",
      };
      setOauthError(
        errorMap[errorParam] ||
          "Google sign-in could not be completed. Please try again or use email."
      );
    }
  }, [searchParams]);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [role, setRole] = useState<AuthRole>("buyer");

  const roleOptions: Array<{ value: AuthRole; label: string }> = [
    { value: "buyer", label: "Buyer" },
    { value: "seller", label: "Seller" },
    { value: "super_admin", label: "Super Admin" },
  ];

  const switchTab = (nextTab: Tab) => {
    setTab(nextTab);
    setErrors({});
    setStatus("");
    setOauthError(null);
  };

  const handleGoogleSignIn = async () => {
    setErrors({});
    setStatus("");
    setOauthError(null);

    if (googleConfigured === false) {
      setOauthError(
        "Google sign-in is not configured on this server. Please sign in with email and password."
      );
      return;
    }

    setGoogleLoading(true);
    try {
      const res = await signIn("google", { callbackUrl });
      if (res?.error) {
        setOauthError("Google sign-in could not be completed. Please try again.");
        setGoogleLoading(false);
      }
    } catch {
      setOauthError("Unable to start Google sign-in. Please try again.");
      setGoogleLoading(false);
    }
  };

  const validateLogin = () => {
    const nextErrors: ErrorMap = {};
    if (!loginEmail.trim()) nextErrors.loginEmail = "Email is required.";
    else if (!emailPattern.test(loginEmail)) nextErrors.loginEmail = "Enter a valid email address.";
    if (!loginPassword) nextErrors.loginPassword = "Password is required.";
    else if (loginPassword.length < 8) nextErrors.loginPassword = "Password must be at least 8 characters.";
    return nextErrors;
  };

  const validateRegistration = () => {
    const nextErrors: ErrorMap = {};
    if (!fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!registerEmail.trim()) nextErrors.registerEmail = "Email is required.";
    else if (!emailPattern.test(registerEmail)) nextErrors.registerEmail = "Enter a valid email address.";
    if (!registerPassword) nextErrors.registerPassword = "Password is required.";
    else if (registerPassword.length < 8) nextErrors.registerPassword = "Password must be at least 8 characters.";
    if (!confirmPassword) nextErrors.confirmPassword = "Please confirm your password.";
    else if (confirmPassword !== registerPassword) nextErrors.confirmPassword = "Passwords do not match.";
    if (!acceptedTerms) nextErrors.acceptedTerms = "Accept the terms to create an account.";
    return nextErrors;
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateLogin();
    setErrors(nextErrors);
    setStatus("");
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    await loginUser({ email: loginEmail, password: loginPassword, role });
    setStatus("Login details submitted.");
    setLoading(false);
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateRegistration();
    setErrors(nextErrors);
    setStatus("");
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    await registerUser({
      name: fullName,
      email: registerEmail,
      password: registerPassword,
      confirmPassword,
      acceptedTerms,
      role,
    });
    setStatus("Account details submitted.");
    setLoading(false);
  };

  const inputClass = (field: string) =>
    `w-full rounded-xl border bg-ywd-white px-3.5 py-3 text-sm text-ywd-forest placeholder:text-ywd-muted/70 shadow-ywd-subtle transition-luxury focus:outline-none focus:ring-2 focus:ring-ywd-orange focus:border-ywd-orange ${
      errors[field] ? "border-ywd-terracotta" : "border-ywd-border"
    }`;

  const roleSelector = (
    <fieldset>
      <legend className="mb-1.5 block text-xs font-semibold text-ywd-forest">Choose account role</legend>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Account role">
        {roleOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={role === option.value}
            onClick={() => setRole(option.value)}
            className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-luxury focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-orange ${
              role === option.value
                ? "border-ywd-orange bg-ywd-orange/10 text-ywd-orange-dark"
                : "border-ywd-border bg-ywd-white text-ywd-muted hover:border-ywd-sage hover:text-ywd-forest"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-ywd-cream">
      <AuthDoodles />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(#789681_0.65px,transparent_0.65px)] [background-size:22px_22px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 top-32 h-72 w-72 rounded-full border border-ywd-sage/25" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 bottom-16 h-56 w-56 rounded-full border border-ywd-orange/20" aria-hidden="true" />
      <StandaloneHeader />
      <main className="relative z-10 flex flex-1 items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-stretch overflow-hidden rounded-3xl border border-ywd-border bg-ywd-white shadow-ywd-lg lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="relative hidden overflow-hidden bg-ywd-forest p-8 text-ywd-cream lg:flex lg:flex-col lg:justify-between">
            <img
              src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ywd-forest-dark/55 via-ywd-forest/80 to-ywd-forest-dark/95" />
            <div className="pointer-events-none absolute -left-16 top-28 h-56 w-56 rounded-full border border-ywd-sage-light/20" aria-hidden="true" />
            <div className="pointer-events-none absolute right-8 top-52 h-32 w-32 rounded-full border border-ywd-orange-light/30" aria-hidden="true" />
            <div className="pointer-events-none absolute left-6 right-6 top-44 h-px bg-gradient-to-r from-transparent via-ywd-sage-light/30 to-transparent" aria-hidden="true" />
            <div className="relative z-10">
              <Link href="/marketplace" className="inline-flex items-center gap-2 text-xs font-semibold text-ywd-sage-light hover:text-ywd-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-cream">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to marketplace
              </Link>
              <h1 className="mt-12 text-3xl font-semibold leading-tight text-ywd-white">
                Your campus gear network.
              </h1>
              <p className="mt-4 text-sm leading-7 text-ywd-sage-light">
                Rent, borrow and discover verified equipment without carrying unnecessary ownership.
              </p>
            </div>
            <div className="space-y-3 rounded-2xl border border-ywd-sage/30 bg-ywd-forest-light/40 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-ywd-white">
                <LockKeyhole className="h-4 w-4 text-ywd-sage-light" />
                Protected access
              </div>
              <p className="text-[11px] leading-5 text-ywd-sage-light">
                Real identities stay private. Public marketplace profiles use a protected anonymous alias.
              </p>
            </div>
          </aside>

          <motion.section
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="p-6 sm:p-8"
            aria-labelledby="auth-heading"
          >
            <div className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-ywd-border bg-ywd-cream-light">
                <LockKeyhole className="h-5 w-5 text-ywd-orange" />
              </div>
              <h2 id="auth-heading" className="mt-4 text-2xl font-semibold tracking-tight text-ywd-forest">
                {tab === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-1 text-xs text-ywd-muted">
                {tab === "login" ? "Sign in to continue to YwD" : "Join the YwD campus marketplace"}
              </p>
            </div>

            <div
              className="mt-6 grid grid-cols-2 rounded-xl border border-ywd-border bg-ywd-cream-light p-1"
              role="tablist"
              aria-label="Authentication options"
            >
              {(["login", "signup"] as Tab[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={tab === item}
                  onClick={() => switchTab(item)}
                  className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition-luxury focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-orange ${
                    tab === item ? "bg-ywd-forest text-ywd-white shadow-ywd-subtle" : "text-ywd-muted hover:text-ywd-forest"
                  }`}
                >
                  {item === "login" ? "Login" : "Create Account"}
                </button>
              ))}
            </div>

            {tab === "login" ? (
              <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit} noValidate>
                {roleSelector}
                <div>
                  <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold text-ywd-forest">Email address</label>
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    placeholder="name@university.edu"
                    className={inputClass("loginEmail")}
                    aria-invalid={Boolean(errors.loginEmail)}
                    aria-describedby={errors.loginEmail ? "login-email-error" : undefined}
                  />
                  {errors.loginEmail && <p id="login-email-error" className="mt-1.5 text-xs text-ywd-terracotta">{errors.loginEmail}</p>}
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="login-password" className="text-xs font-semibold text-ywd-forest">Password</label>
                    <Link href="#" className="text-xs font-semibold text-ywd-orange hover:text-ywd-orange-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-orange">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      placeholder="At least 8 characters"
                      className={`${inputClass("loginPassword")} pr-11`}
                      aria-invalid={Boolean(errors.loginPassword)}
                      aria-describedby={errors.loginPassword ? "login-password-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ywd-muted hover:text-ywd-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-orange"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.loginPassword && <p id="login-password-error" className="mt-1.5 text-xs text-ywd-terracotta">{errors.loginPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="transition-luxury flex h-12 w-full items-center justify-center rounded-xl bg-ywd-orange text-sm font-semibold text-ywd-white shadow-ywd-subtle hover:bg-ywd-orange-dark disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-orange focus-visible:ring-offset-2"
                >
                  {loading ? "Signing in…" : "Login"}
                </button>
              </form>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={handleRegisterSubmit} noValidate>
                {roleSelector}
                <div>
                  <label htmlFor="full-name" className="mb-1.5 block text-xs font-semibold text-ywd-forest">Full name</label>
                  <input id="full-name" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your full name" className={inputClass("fullName")} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "full-name-error" : undefined} />
                  {errors.fullName && <p id="full-name-error" className="mt-1.5 text-xs text-ywd-terracotta">{errors.fullName}</p>}
                </div>

                <div>
                  <label htmlFor="register-email" className="mb-1.5 block text-xs font-semibold text-ywd-forest">Email address</label>
                  <input id="register-email" type="email" value={registerEmail} onChange={(event) => setRegisterEmail(event.target.value)} placeholder="name@university.edu" className={inputClass("registerEmail")} aria-invalid={Boolean(errors.registerEmail)} aria-describedby={errors.registerEmail ? "register-email-error" : undefined} />
                  {errors.registerEmail && <p id="register-email-error" className="mt-1.5 text-xs text-ywd-terracotta">{errors.registerEmail}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="register-password" className="mb-1.5 block text-xs font-semibold text-ywd-forest">Password</label>
                    <div className="relative">
                      <input id="register-password" type={showPassword ? "text" : "password"} value={registerPassword} onChange={(event) => setRegisterPassword(event.target.value)} placeholder="Min. 8 characters" className={`${inputClass("registerPassword")} pr-11`} aria-invalid={Boolean(errors.registerPassword)} aria-describedby={errors.registerPassword ? "register-password-error" : undefined} />
                      <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ywd-muted hover:text-ywd-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-orange" aria-label={showPassword ? "Hide password" : "Show password"}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.registerPassword && <p id="register-password-error" className="mt-1.5 text-xs text-ywd-terracotta">{errors.registerPassword}</p>}
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-semibold text-ywd-forest">Confirm password</label>
                    <div className="relative">
                      <input id="confirm-password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat password" className={`${inputClass("confirmPassword")} pr-11`} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined} />
                      <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ywd-muted hover:text-ywd-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-orange" aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p id="confirm-password-error" className="mt-1.5 text-xs text-ywd-terracotta">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <div>
                  <label className="flex items-start gap-2.5 text-xs leading-5 text-ywd-muted">
                    <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-ywd-border text-ywd-forest focus:ring-ywd-orange" aria-invalid={Boolean(errors.acceptedTerms)} aria-describedby={errors.acceptedTerms ? "terms-error" : undefined} />
                    <span>I agree to the terms of use and privacy policy.</span>
                  </label>
                  {errors.acceptedTerms && <p id="terms-error" className="mt-1.5 text-xs text-ywd-terracotta">{errors.acceptedTerms}</p>}
                </div>

                <button type="submit" disabled={loading} className="transition-luxury flex h-12 w-full items-center justify-center rounded-xl bg-ywd-orange text-sm font-semibold text-ywd-white shadow-ywd-subtle hover:bg-ywd-orange-dark disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-orange focus-visible:ring-offset-2">
                  {loading ? "Creating account…" : "Create Account"}
                </button>
              </form>
            )}

            {status && (
              <div role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-ywd-sage/30 bg-ywd-sage/10 px-3 py-2.5 text-xs font-semibold text-ywd-sage-dark">
                <Check className="h-4 w-4" /> {status}
              </div>
            )}

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-ywd-border" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ywd-muted">Or continue with</span>
              <div className="h-px flex-1 bg-ywd-border" />
            </div>

            <button
              type="button"
              disabled={loading || googleLoading}
              onClick={handleGoogleSignIn}
              className="transition-luxury flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-ywd-border bg-ywd-white text-sm font-semibold text-ywd-forest shadow-ywd-subtle hover:border-ywd-sage hover:bg-ywd-cream-light disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-orange focus-visible:ring-offset-2"
            >
              {googleLoading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-ywd-forest/25 border-t-ywd-forest" />
                  <span>Connecting to Google…</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {oauthError && (
              <p role="alert" className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-ywd-terracotta/30 bg-ywd-terracotta/10 px-3 py-2.5 text-xs font-medium text-ywd-terracotta">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {oauthError}
              </p>
            )}

            {Object.keys(errors).length > 0 && (
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ywd-terracotta">
                <AlertCircle className="h-3.5 w-3.5" /> Please correct the highlighted fields.
              </p>
            )}
          </motion.section>
        </div>
      </main>
      <StandaloneFooter />
    </div>
  );
}
