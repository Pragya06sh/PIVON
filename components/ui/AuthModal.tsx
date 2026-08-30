"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signup" | "signin";
  initialPlan?: string;
};

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "signup",
  initialPlan = "",
}: AuthModalProps) {
  const [mode, setMode] = useState<"signup" | "signin">(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sign Up Form state
  const [signUpForm, setSignUpForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    business: "",
    motive: initialPlan ? `Interested in ${initialPlan} Plan` : "",
  });

  // Sign In Form state
  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
  });

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

      setSuccessMsg("Account created successfully! Logging you in...");

      // Automatically sign in user
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: signUpForm.email,
        password: signUpForm.password,
      });

      if (loginRes?.error) {
        setError("Account created, but automatic sign-in failed. Please sign in manually.");
        setMode("signin");
      } else {
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1200);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

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

      setSuccessMsg("Logged in successfully!");
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="auth-modal-backdrop" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="auth-modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button className="auth-modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>

          {/* Mode Switcher Tabs */}
          <div className="auth-modal-tabs">
            <button
              className={`auth-modal-tab ${mode === "signup" ? "auth-modal-tab--active" : ""}`}
              onClick={() => {
                setMode("signup");
                setError("");
                setSuccessMsg("");
              }}
            >
              Get Started / Register
            </button>
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
          </div>

          <div className="auth-modal-header">
            <h2 className="auth-modal-title">
              {mode === "signup" ? "Create your PIVON account" : "Welcome back to PIVON"}
            </h2>
            <p className="auth-modal-subtitle">
              {mode === "signup"
                ? "Fill in your details to start automating your real estate lead pipeline."
                : "Sign in to access your dashboard and manage lead response systems."}
            </p>
          </div>

          {error && <div className="auth-alert auth-alert--error">{error}</div>}
          {successMsg && <div className="auth-alert auth-alert--success">{successMsg}</div>}

          {mode === "signup" ? (
            <form onSubmit={handleSignUp} className="auth-form">
              <div className="form-row">
                <div className="form-field">
                  <label className="eyebrow form-field__label" htmlFor="reg-name">
                    Full Name *
                  </label>
                  <input
                    id="reg-name"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={signUpForm.name}
                    onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                    className="form-field__input"
                  />
                </div>
                <div className="form-field">
                  <label className="eyebrow form-field__label" htmlFor="reg-email">
                    Work Email *
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="e.g. rajesh@shreebuilders.com"
                    value={signUpForm.email}
                    onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                    className="form-field__input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="eyebrow form-field__label" htmlFor="reg-password">
                    Password *
                  </label>
                  <input
                    id="reg-password"
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
                  <label className="eyebrow form-field__label" htmlFor="reg-phone">
                    Phone / WhatsApp *
                  </label>
                  <input
                    id="reg-phone"
                    required
                    placeholder="+91 98765 43210"
                    value={signUpForm.phone}
                    onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                    className="form-field__input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="eyebrow form-field__label" htmlFor="reg-location">
                    City / Location
                  </label>
                  <input
                    id="reg-location"
                    placeholder="e.g. Indore, MP"
                    value={signUpForm.location}
                    onChange={(e) => setSignUpForm({ ...signUpForm, location: e.target.value })}
                    className="form-field__input"
                  />
                </div>
                <div className="form-field">
                  <label className="eyebrow form-field__label" htmlFor="reg-business">
                    Company / Builder Name
                  </label>
                  <input
                    id="reg-business"
                    placeholder="e.g. Shree Builders & Developers"
                    value={signUpForm.business}
                    onChange={(e) => setSignUpForm({ ...signUpForm, business: e.target.value })}
                    className="form-field__input"
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="eyebrow form-field__label" htmlFor="reg-motive">
                  What is your primary motive / requirement?
                </label>
                <textarea
                  id="reg-motive"
                  rows={2}
                  placeholder="e.g. Need WhatsApp auto-reply in Hindi for our new project in Vijay Nagar"
                  value={signUpForm.motive}
                  onChange={(e) => setSignUpForm({ ...signUpForm, motive: e.target.value })}
                  className="form-field__input form-field__textarea"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary auth-submit-btn">
                {loading ? "Creating Account..." : "Complete Registration & Get Started →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="auth-form">
              <div className="form-field">
                <label className="eyebrow form-field__label" htmlFor="signin-email">
                  Email Address *
                </label>
                <input
                  id="signin-email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={signInForm.email}
                  onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                  className="form-field__input"
                />
              </div>

              <div className="form-field">
                <label className="eyebrow form-field__label" htmlFor="signin-password">
                  Password *
                </label>
                <input
                  id="signin-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={signInForm.password}
                  onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                  className="form-field__input"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary auth-submit-btn">
                {loading ? "Signing in..." : "Sign In to Account →"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
