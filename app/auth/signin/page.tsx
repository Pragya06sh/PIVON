"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
  });

  const [signUpForm, setSignUpForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    business: "",
    motive: "",
  });

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: signInForm.email,
        password: signInForm.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      setSuccessMsg("Logged in successfully! Redirecting...");
      setTimeout(() => {
        router.push(callbackUrl);
        router.refresh();
      }, 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccessMsg("Account created! Logging you in...");

      const loginRes = await signIn("credentials", {
        redirect: false,
        email: signUpForm.email,
        password: signUpForm.password,
      });

      if (loginRes?.error) {
        setError("Account created, but sign-in failed. Please sign in manually.");
        setMode("signin");
      } else {
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 1000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-obsidian text-ink flex items-center justify-center p-4 sm:p-6">
      <div className="glass-card max-w-md w-full p-8 border border-brass/40 relative">
        <Link
          href="/"
          className="text-xs font-mono text-ink-muted hover:text-brass-bright mb-6 inline-block"
        >
          ← Return to PIVON Website
        </Link>

        {/* Mode Switcher Tabs */}
        <div className="auth-modal-tabs mb-6">
          <button
            className={`auth-modal-tab ${mode === "signin" ? "auth-modal-tab--active" : ""}`}
            onClick={() => {
              setMode("signin");
              setError("");
              setSuccessMsg("");
            }}
          >
            Sign In
          </button>
          <button
            className={`auth-modal-tab ${mode === "signup" ? "auth-modal-tab--active" : ""}`}
            onClick={() => {
              setMode("signup");
              setError("");
              setSuccessMsg("");
            }}
          >
            Register / Sign Up
          </button>
        </div>

        <h1 className="font-display text-2xl text-ink mb-1">
          {mode === "signin" ? "PIVON Portal Sign In" : "Register PIVON Account"}
        </h1>
        <p className="text-xs text-ink-muted mb-6">
          {mode === "signin"
            ? "Enter your credentials to access the Admin Portal or client account."
            : "Create an account to manage your real estate lead response automation."}
        </p>

        {error && <div className="auth-alert auth-alert--error mb-4">{error}</div>}
        {successMsg && <div className="auth-alert auth-alert--success mb-4">{successMsg}</div>}

        {mode === "signin" ? (
          <form onSubmit={handleSignIn} className="auth-form">
            <div className="form-field">
              <label className="eyebrow form-field__label" htmlFor="page-email">
                Email Address *
              </label>
              <input
                id="page-email"
                type="email"
                required
                placeholder="e.g. pivon.agency@gmail.com"
                value={signInForm.email}
                onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                className="form-field__input"
              />
            </div>

            <div className="form-field">
              <label className="eyebrow form-field__label" htmlFor="page-password">
                Password *
              </label>
              <input
                id="page-password"
                type="password"
                required
                placeholder="••••••••"
                value={signInForm.password}
                onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                className="form-field__input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="auth-form">
            <div className="form-field">
              <label className="eyebrow form-field__label" htmlFor="signup-name">
                Full Name *
              </label>
              <input
                id="signup-name"
                required
                placeholder="e.g. Pragya Shree"
                value={signUpForm.name}
                onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                className="form-field__input"
              />
            </div>

            <div className="form-field">
              <label className="eyebrow form-field__label" htmlFor="signup-email">
                Work / Admin Email *
              </label>
              <input
                id="signup-email"
                type="email"
                required
                placeholder="e.g. pivon.agency@gmail.com"
                value={signUpForm.email}
                onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                className="form-field__input"
              />
            </div>

            <div className="form-field">
              <label className="eyebrow form-field__label" htmlFor="signup-password">
                Password *
              </label>
              <input
                id="signup-password"
                type="password"
                required
                minLength={8}
                placeholder="Min 8 characters"
                value={signUpForm.password}
                onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                className="form-field__input"
              />
            </div>

            <div className="form-field">
              <label className="eyebrow form-field__label" htmlFor="signup-phone">
                Phone / WhatsApp *
              </label>
              <input
                id="signup-phone"
                required
                placeholder="+91 7992484007"
                value={signUpForm.phone}
                onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                className="form-field__input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? "Creating Account..." : "Create Account & Sign In →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian text-ink flex items-center justify-center font-mono">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
