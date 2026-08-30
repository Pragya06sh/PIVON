"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import PaymentGate from "@/components/ui/PaymentGate";
import Link from "next/link";

/* ─── Types ────────────────────────────────────────────────────────── */

type PaymentStatus = {
  hasPaid: boolean;
  payment: {
    id: string;
    plan: string;
    amount: number;
    status: string;
    upiTransactionId: string;
    createdAt: string;
    verifiedAt: string | null;
  } | null;
};

type DemoStage = "input" | "processing" | "results";

type LeadInput = {
  name: string;
  phone: string;
  source: string;
  project: string;
  location: string;
  budget: string;
};

/* ─── Pipeline Steps ───────────────────────────────────────────────── */

const PIPELINE_STEPS = [
  {
    id: "capture",
    icon: "📥",
    title: "1. Webhook Lead Ingestion",
    detail: "Instant API capture with source attribution & deduplication",
    duration: 1100,
  },
  {
    id: "automation",
    icon: "⚙️",
    title: "2. Make.com Workflow Triggered",
    detail: "Data normalization, phone formatting (+91), timestamp logging",
    duration: 1300,
  },
  {
    id: "crm",
    icon: "📊",
    title: "3. Auto-Sync to Zoho CRM / Sheets",
    detail: "Lead record created with project tags and sales stage = New",
    duration: 1200,
  },
  {
    id: "scoring",
    icon: "🤖",
    title: "4. AI Qualification & Scoring",
    detail: "Intent rating (0-100%), budget fit, and urgency classification",
    duration: 1800,
  },
  {
    id: "whatsapp",
    icon: "💬",
    title: "5. Hindi WhatsApp Script Generated",
    detail: "Personalized tone adapted for Indore real estate buyer profile",
    duration: 1500,
  },
  {
    id: "delivery",
    icon: "📱",
    title: "6. WhatsApp Cloud API Dispatch",
    detail: "Delivered in <60s via AiSensy with double blue tick receipt",
    duration: 1000,
  },
  {
    id: "followup",
    icon: "🔄",
    title: "7. 6-Touchpoint Follow-Up Scheduled",
    detail: "Automated sequence set for Day 3, 7, 14, 21, and 30",
    duration: 1100,
  },
  {
    id: "booking",
    icon: "📅",
    title: "8. Site Visit Auto-Booking Ready",
    detail: "Calendar slot and builder salesperson WhatsApp alert dispatched",
    duration: 900,
  },
];

const PRESET_LEADS: Record<string, LeadInput> = {
  "3bhk": {
    name: "Vikramaditya Sharma",
    phone: "+91 98260 12345",
    source: "99acres",
    project: "Shree Krishna Heights (3 BHK Luxury)",
    location: "Vijay Nagar, Indore",
    budget: "65–80 Lakhs",
  },
  "villa": {
    name: "Dr. Ananya Patel",
    phone: "+91 94250 88765",
    source: "Facebook Lead Ad",
    project: "Emerald County Villas",
    location: "Super Corridor, Indore",
    budget: "1.2–1.6 Cr",
  },
  "commercial": {
    name: "Manish Agrawal",
    phone: "+91 98930 45678",
    source: "MagicBricks",
    project: "Indore Trade Centre (Retail)",
    location: "AB Road, Indore",
    budget: "45–60 Lakhs",
  },
};

const LEAD_SOURCES = [
  "99acres",
  "MagicBricks",
  "Facebook Lead Ad",
  "Google Search Ad",
  "Housing.com",
  "JustDial",
  "Builder Direct Website",
];

const FOLLOW_UP_SCHEDULE = [
  { day: "Immediate (<60s)", action: "Personalized WhatsApp welcome + Project digital brochure", status: "sent" },
  { day: "Day 3 (4:00 PM)", action: "WhatsApp follow-up: 'Did you review the floor plan?'", status: "scheduled" },
  { day: "Day 7 (11:00 AM)", action: "Site visit video walkthrough & limited inventory alert", status: "scheduled" },
  { day: "Day 14 (5:30 PM)", action: "Bank loan pre-approval assistance & festive pricing", status: "scheduled" },
  { day: "Day 21 (12:00 PM)", action: "Construction progress update & architect overview", status: "scheduled" },
  { day: "Day 30 (3:00 PM)", action: "Final executive follow-up with customized payment plan", status: "scheduled" },
];

/* ─── Helper: Generate Real Hindi WhatsApp Message ──────────────────── */

function generateWhatsAppMessage(lead: LeadInput): string {
  const firstName = lead.name.split(" ")[0] || "Sir/Ma'am";
  return `🙏 नमस्ते ${firstName} जी!\n\n${lead.project || "हमारे प्रोजेक्ट"} में आपकी रुचि के लिए PIVON रियल एस्टेट की ओर से बहुत-बहुत धन्यवाद।\n\nहमने ${lead.source || "पोर्टल"} से आपकी enquiry प्राप्त कर ली है:\n\n📍 लोकेशन: ${lead.location || "Indore"}\n💰 बजट: ${lead.budget || "अनुकूल विकल्प उपलब्ध"}\n✅ RERA रजिस्टर्ड एवं 8+ बैंकों से होम लोन सुविधा\n✅ क्लब हाउस, गार्डन और 24/7 सुरक्षा\n\n📄 क्या मैं आपको प्रोजेक्ट का Floor Plan एवं E-Brochure WhatsApp पर शेयर करूँ?\n\n🚗 इस सप्ताह साइट विजिट के लिए आप कब उपलब्ध होंगे? बस यहाँ रिप्लाई करें, हमारी टीम सब कुछ arrange कर देगी! 🙏`;
}

/* ─── Helper: AI Qualification Logic ───────────────────────────────── */

function generateQualification(lead: LeadInput) {
  const hasProject = lead.project.trim().length > 0;
  const hasBudget = lead.budget.trim().length > 0;
  const hasLocation = lead.location.trim().length > 0;

  let intentScore = 55 + Math.floor(Math.random() * 20);
  if (hasProject) intentScore += 12;
  if (hasBudget) intentScore += 8;
  if (hasLocation) intentScore += 5;
  intentScore = Math.min(intentScore, 97);

  const urgency = intentScore >= 80 ? "HIGH (Hot Lead 🔥)" : intentScore >= 65 ? "MEDIUM (Warm Lead 🟡)" : "LOW (Nurture ❄️)";
  const category = intentScore >= 80 ? "Hot Buyer" : intentScore >= 65 ? "Warm Prospect" : "Casual Enquiry";
  const conversionProb = Math.min(intentScore - 8 + Math.floor(Math.random() * 12), 94);

  return {
    intentScore,
    urgency,
    category,
    conversionProbability: conversionProb,
    budgetMatch: hasBudget ? "Validated ✓" : "To be verified",
    locationMatch: hasLocation ? "Prime Indore Sector ✓" : "General",
    projectInterest: lead.project || "Multi-unit general",
    recommendedAction: intentScore >= 80
      ? "Assign immediately to Senior Sales Executive & dispatch WhatsApp Brochure."
      : "Send automated floor plan PDF & queue Day 3 follow-up sequence.",
  };
}

/* ─── Main Automation Page ─────────────────────────────────────────── */

export default function AutomationPage() {
  const { data: session, status: authStatus } = useSession();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [stage, setStage] = useState<DemoStage>("input");
  const [currentStep, setCurrentStep] = useState(-1);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // In-page Auth State for Logged-out Visitors
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "Indore, MP",
    business: "",
    motive: "Real Estate Lead Automation Trial",
  });

  const [leadInput, setLeadInput] = useState<LeadInput>({
    name: "Vikramaditya Sharma",
    phone: "+91 98260 12345",
    source: "99acres",
    project: "Shree Krishna Heights (3 BHK Luxury)",
    location: "Vijay Nagar, Indore",
    budget: "65–80 Lakhs",
  });

  const [qualification, setQualification] = useState<ReturnType<typeof generateQualification> | null>(null);
  const [whatsappMsg, setWhatsappMsg] = useState("");
  const [typedMsg, setTypedMsg] = useState("");

  // Fetch Payment Status for authenticated user
  const fetchPaymentStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/payment/status");
      if (res.ok) {
        const data = await res.json();
        setPaymentStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch payment status:", err);
    } finally {
      setPaymentLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchPaymentStatus();
    } else if (authStatus === "unauthenticated") {
      setPaymentLoading(false);
    }
  }, [authStatus, fetchPaymentStatus]);

  // Typewriter effect for WhatsApp message
  useEffect(() => {
    if (stage !== "results" || !whatsappMsg) return;
    let i = 0;
    setTypedMsg("");
    const interval = setInterval(() => {
      if (i < whatsappMsg.length) {
        setTypedMsg((prev) => prev + whatsappMsg[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 10);
    return () => clearInterval(interval);
  }, [stage, whatsappMsg]);

  // In-page Register / Sign In Handlers
  async function handleInPageSignUp(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setAuthSuccess("Account created! Signing you in...");
      await signIn("credentials", {
        redirect: false,
        email: authForm.email,
        password: authForm.password,
      });
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleInPageSignIn(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: authForm.email,
        password: authForm.password,
      });

      if (res?.error) {
        throw new Error(res.error);
      }
      setAuthSuccess("Signed in successfully!");
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setAuthLoading(false);
    }
  }

  // Pipeline simulation execution
  async function runPipeline() {
    setStage("processing");
    setCurrentStep(-1);

    const qual = generateQualification(leadInput);
    const msg = generateWhatsAppMessage(leadInput);
    setQualification(qual);
    setWhatsappMsg(msg);

    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, PIPELINE_STEPS[i].duration));
    }

    await new Promise((r) => setTimeout(r, 400));
    setStage("results");
  }

  function resetDemo() {
    setStage("input");
    setCurrentStep(-1);
    setQualification(null);
    setWhatsappMsg("");
    setTypedMsg("");
  }

  function copyMessageToClipboard() {
    if (whatsappMsg) {
      navigator.clipboard.writeText(whatsappMsg).then(() => {
        setCopiedMsg(true);
        setTimeout(() => setCopiedMsg(false), 2000);
      });
    }
  }

  function loadPreset(key: string) {
    if (PRESET_LEADS[key]) {
      setLeadInput({ ...PRESET_LEADS[key] });
    }
  }

  /* ─── State 1: Loading Session ───────────────────────────────────── */

  if (authStatus === "loading" || (authStatus === "authenticated" && paymentLoading)) {
    return (
      <div className="automation-page min-h-screen bg-obsidian text-ink flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-10 h-10 border-2 border-brass border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-xs uppercase tracking-widest text-brass-bright animate-pulse">
            Loading PIVON Automation Studio...
          </p>
        </div>
      </div>
    );
  }

  /* ─── State 2: Not Logged In (Show In-Page Auth Card) ─────────────── */

  if (!session) {
    return (
      <div className="automation-page min-h-screen bg-obsidian text-ink py-10 px-4">
        {/* Nav */}
        <div className="max-w-4xl mx-auto flex items-center justify-between pb-6 border-b border-obsidian-line mb-8">
          <Link href="/" className="font-display text-xl tracking-wider text-ink font-bold">
            PIVON
          </Link>
          <Link href="/" className="text-xs font-mono text-ink-muted hover:text-brass transition-colors">
            ← Return to Website
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          <div className="glass-card p-6 sm:p-8 border border-brass/30">
            {/* Step badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brass/10 border border-brass/30 text-[11px] font-mono text-brass-bright mb-4">
              <span>●</span> Step 1: Account Access Required
            </div>

            <h1 className="font-display text-2xl text-ink mb-1">
              {authMode === "signup" ? "Register to Access Automation" : "Sign In to Your Account"}
            </h1>
            <p className="text-xs text-ink-muted mb-6 leading-relaxed">
              PIVON&apos;s real estate lead response engine is protected for registered builder clients.
            </p>

            {/* Switch Tabs */}
            <div className="grid grid-cols-2 p-1 bg-obsidian-raised rounded-lg border border-obsidian-line mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError("");
                }}
                className={`py-2 text-xs font-mono tracking-wider transition-all rounded ${
                  authMode === "signup"
                    ? "bg-brass text-obsidian font-bold shadow"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setAuthError("");
                }}
                className={`py-2 text-xs font-mono tracking-wider transition-all rounded ${
                  authMode === "signin"
                    ? "bg-brass text-obsidian font-bold shadow"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Sign In
              </button>
            </div>

            {authError && <div className="auth-alert auth-alert--error mb-4">{authError}</div>}
            {authSuccess && <div className="auth-alert auth-alert--success mb-4">{authSuccess}</div>}

            {authMode === "signup" ? (
              <form onSubmit={handleInPageSignUp} className="space-y-4">
                <div className="form-field">
                  <label className="eyebrow form-field__label" htmlFor="page-reg-name">
                    Full Name *
                  </label>
                  <input
                    id="page-reg-name"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    className="form-field__input"
                  />
                </div>

                <div className="form-field">
                  <label className="eyebrow form-field__label" htmlFor="page-reg-email">
                    Work Email *
                  </label>
                  <input
                    id="page-reg-email"
                    type="email"
                    required
                    placeholder="e.g. rajesh@shreebuilders.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="form-field__input"
                  />
                </div>

                <div className="form-field">
                  <label className="eyebrow form-field__label" htmlFor="page-reg-pass">
                    Password *
                  </label>
                  <input
                    id="page-reg-pass"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Min 8 characters"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="form-field__input"
                  />
                </div>

                <div className="form-field">
                  <label className="eyebrow form-field__label" htmlFor="page-reg-phone">
                    Phone / WhatsApp *
                  </label>
                  <input
                    id="page-reg-phone"
                    required
                    placeholder="+91 98765 43210"
                    value={authForm.phone}
                    onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                    className="form-field__input"
                  />
                </div>

                <div className="form-field">
                  <label className="eyebrow form-field__label" htmlFor="page-reg-business">
                    Builder / Company Name
                  </label>
                  <input
                    id="page-reg-business"
                    placeholder="e.g. Shree Builders & Developers"
                    value={authForm.business}
                    onChange={(e) => setAuthForm({ ...authForm, business: e.target.value })}
                    className="form-field__input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-primary w-full justify-center text-center py-3 text-xs uppercase font-bold tracking-wider mt-2"
                >
                  {authLoading ? "Creating Account..." : "Create Account & Proceed →"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleInPageSignIn} className="space-y-4">
                <div className="form-field">
                  <label className="eyebrow form-field__label" htmlFor="page-login-email">
                    Email Address *
                  </label>
                  <input
                    id="page-login-email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="form-field__input"
                  />
                </div>

                <div className="form-field">
                  <label className="eyebrow form-field__label" htmlFor="page-login-pass">
                    Password *
                  </label>
                  <input
                    id="page-login-pass"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="form-field__input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-primary w-full justify-center text-center py-3 text-xs uppercase font-bold tracking-wider mt-2"
                >
                  {authLoading ? "Signing In..." : "Sign In to Account →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ─── State 3: Logged In but Payment Unverified (Show Payment Gate) ── */

  if (!paymentStatus?.hasPaid) {
    return (
      <div className="automation-page min-h-screen bg-obsidian text-ink py-8 px-4">
        {/* Nav */}
        <div className="max-w-4xl mx-auto flex items-center justify-between pb-4 border-b border-obsidian-line mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display text-xl tracking-wider text-ink font-bold">
              PIVON
            </Link>
            <span className="text-xs font-mono text-ink-muted">/ AI Automation Setup</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-ink-muted hidden sm:inline">
              👤 {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs font-mono text-ink-faint hover:text-red-400 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        <PaymentGate
          paymentStatus={paymentStatus}
          onPaymentSubmitted={fetchPaymentStatus}
          userEmail={session.user?.email}
          userName={session.user?.name}
        />
      </div>
    );
  }

  /* ─── State 4: Logged In & Paid (Full AI Automation Experience) ──── */

  return (
    <div className="automation-page min-h-screen bg-obsidian text-ink py-6 px-4">
      {/* Top Header Navigation */}
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-obsidian-line mb-8">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display text-2xl tracking-wider text-ink font-bold">
              PIVON
            </Link>
            <span className="px-2.5 py-0.5 rounded-full bg-signal/20 border border-signal/40 text-signal-bright font-mono text-[11px] font-bold">
              ⚡ LIVE AUTOMATION ACTIVE
            </span>
            <span className="px-2 py-0.5 rounded bg-brass/20 text-brass-bright font-mono text-[10px] uppercase">
              {paymentStatus?.payment?.plan || "Trial"} Plan
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1 font-mono">
            Client Account: <strong className="text-ink">{session.user?.name || "Builder Client"}</strong> ({session.user?.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" className="btn-secondary text-xs py-2 px-3">
            ← Main Website
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="btn-secondary text-xs py-2 px-3 text-red-400 hover:border-red-400/50"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {/* ─── STAGE 1: INPUT LEAD ───────────────────────────── */}
          {stage === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="automation-input-container"
            >
              {/* Presets Bar */}
              <div className="glass-card p-4 mb-6 border-brass/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎯</span>
                    <span className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
                      Load Sample Indore Lead Presets:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => loadPreset("3bhk")}
                      className="preset-btn"
                    >
                      🏢 3 BHK Flat (Vijay Nagar)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPreset("villa")}
                      className="preset-btn"
                    >
                      🏡 Luxury Villa (Super Corridor)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPreset("commercial")}
                      className="preset-btn"
                    >
                      🏬 Commercial Retail (AB Road)
                    </button>
                  </div>
                </div>
              </div>

              {/* Lead Form */}
              <div className="glass-card p-6 sm:p-8 border border-brass/30">
                <div className="mb-6">
                  <span className="eyebrow eyebrow--green">Simulate Live Real Estate Enquiry</span>
                  <h2 className="font-display text-2xl text-ink mt-1">
                    Enter Lead Data to Test PIVON Engine
                  </h2>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    Watch our AI qualify the enquiry, determine buyer intent, generate an authentic Hindi WhatsApp reply, and schedule follow-ups in real-time.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    runPipeline();
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-field">
                      <label className="eyebrow form-field__label" htmlFor="lead-in-name">
                        Lead Full Name *
                      </label>
                      <input
                        id="lead-in-name"
                        required
                        placeholder="e.g. Vikramaditya Sharma"
                        value={leadInput.name}
                        onChange={(e) => setLeadInput({ ...leadInput, name: e.target.value })}
                        className="form-field__input"
                      />
                    </div>

                    <div className="form-field">
                      <label className="eyebrow form-field__label" htmlFor="lead-in-phone">
                        WhatsApp Contact Number *
                      </label>
                      <input
                        id="lead-in-phone"
                        required
                        placeholder="+91 98260 12345"
                        value={leadInput.phone}
                        onChange={(e) => setLeadInput({ ...leadInput, phone: e.target.value })}
                        className="form-field__input font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-field">
                      <label className="eyebrow form-field__label" htmlFor="lead-in-source">
                        Enquiry Ingestion Source *
                      </label>
                      <select
                        id="lead-in-source"
                        value={leadInput.source}
                        onChange={(e) => setLeadInput({ ...leadInput, source: e.target.value })}
                        className="form-field__input form-field__select"
                      >
                        {LEAD_SOURCES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label className="eyebrow form-field__label" htmlFor="lead-in-project">
                        Project Interest / Category *
                      </label>
                      <input
                        id="lead-in-project"
                        required
                        placeholder="e.g. Shree Krishna Heights (3 BHK Luxury)"
                        value={leadInput.project}
                        onChange={(e) => setLeadInput({ ...leadInput, project: e.target.value })}
                        className="form-field__input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-field">
                      <label className="eyebrow form-field__label" htmlFor="lead-in-location">
                        Location / Preferred Sector
                      </label>
                      <input
                        id="lead-in-location"
                        placeholder="e.g. Vijay Nagar, Indore"
                        value={leadInput.location}
                        onChange={(e) => setLeadInput({ ...leadInput, location: e.target.value })}
                        className="form-field__input"
                      />
                    </div>

                    <div className="form-field">
                      <label className="eyebrow form-field__label" htmlFor="lead-in-budget">
                        Indicative Budget
                      </label>
                      <input
                        id="lead-in-budget"
                        placeholder="e.g. 65–80 Lakhs"
                        value={leadInput.budget}
                        onChange={(e) => setLeadInput({ ...leadInput, budget: e.target.value })}
                        className="form-field__input"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="btn-primary w-full justify-center text-center py-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
                    >
                      <span className="text-base">⚡</span> Run Live PIVON Automation Pipeline →
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* ─── STAGE 2: LIVE PROCESSING SIMULATION ───────────── */}
          {stage === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="automation-processing-container"
            >
              <div className="text-center max-w-xl mx-auto mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-signal/20 border border-signal/40 text-xs font-mono text-signal-bright mb-3">
                  <span className="w-2 h-2 rounded-full bg-signal-bright animate-ping" />
                  Live Pipeline Execution
                </div>
                <h2 className="font-display text-2xl text-ink">
                  Processing Lead: <span className="text-brass-bright">{leadInput.name}</span>
                </h2>
                <p className="text-xs text-ink-muted mt-1 font-mono">
                  Origin: {leadInput.source} • Destination: {leadInput.project}
                </p>
              </div>

              {/* 8-Stage Pipeline Card */}
              <div className="glass-card p-6 sm:p-8 max-w-3xl mx-auto border border-brass/40 shadow-2xl">
                <div className="space-y-4">
                  {PIPELINE_STEPS.map((step, idx) => {
                    const isDone = idx < currentStep;
                    const isActive = idx === currentStep;
                    const isPending = idx > currentStep;

                    return (
                      <div
                        key={step.id}
                        className={`pipeline-step-row ${
                          isActive
                            ? "pipeline-step-row--active"
                            : isDone
                            ? "pipeline-step-row--done"
                            : "pipeline-step-row--pending"
                        }`}
                      >
                        <div className="pipeline-step-icon-col">
                          {isDone ? (
                            <span className="pipeline-check-icon">✓</span>
                          ) : (
                            <span className="pipeline-step-icon">{step.icon}</span>
                          )}
                        </div>

                        <div className="pipeline-step-content-col">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold font-mono tracking-wide text-ink">
                              {step.title}
                            </h4>
                            <span className="text-[10px] font-mono text-ink-faint">
                              {isDone ? "COMPLETE" : isActive ? "IN PROGRESS" : "QUEUED"}
                            </span>
                          </div>
                          <p className="text-xs text-ink-muted mt-0.5">{step.detail}</p>

                          {isActive && (
                            <div className="w-full bg-obsidian-raised h-1 rounded-full overflow-hidden mt-2 border border-obsidian-line">
                              <motion.div
                                className="bg-brass h-full"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: step.duration / 1000, ease: "linear" }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── STAGE 3: RESULTS DASHBOARD ────────────────────── */}
          {stage === "results" && qualification && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="automation-results-container space-y-8"
            >
              {/* Success Banner */}
              <div className="glass-card p-5 border-signal/40 bg-signal/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-signal-bright text-lg font-bold">✓</span>
                    <span className="font-mono text-xs uppercase tracking-widest text-signal-bright font-bold">
                      Response Cycle Completed in 48 Seconds
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-1">
                    Enquiry from <strong className="text-ink">{leadInput.name}</strong> was qualified, logged in CRM, and replied on WhatsApp with zero manual delay.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={resetDemo}
                    className="btn-primary text-xs py-2.5 px-4 whitespace-nowrap"
                  >
                    ⚡ Process Another Lead
                  </button>
                </div>
              </div>

              {/* 4-Card Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Card 1: AI Qualification Engine */}
                <div className="glass-card p-6 border-brass/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-obsidian-line mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🤖</span>
                        <h3 className="font-display text-lg text-ink">AI Qualification Scorecard</h3>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brass/20 text-brass-bright font-bold">
                        {qualification.category}
                      </span>
                    </div>

                    {/* Circular Score Gauge */}
                    <div className="flex items-center gap-6 py-2">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                          <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
                          <motion.circle
                            cx="50" cy="50" r="42"
                            stroke="#e8c77e"
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 42}
                            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - qualification.intentScore / 100) }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            strokeLinecap="round"
                            fill="none"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="font-mono text-xl font-bold text-brass-bright leading-none">
                            {qualification.intentScore}%
                          </span>
                          <span className="text-[9px] font-mono text-ink-faint uppercase mt-0.5">Intent</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-ink-muted">Urgency Rating:</span>
                          <span className="text-ink font-semibold">{qualification.urgency}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-ink-muted">Est. Conversion Probability:</span>
                          <span className="text-signal-bright font-mono font-bold">{qualification.conversionProbability}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-ink-muted">Indore Sector Match:</span>
                          <span className="text-ink">{qualification.locationMatch}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-obsidian-raised rounded border border-obsidian-line">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-brass-bright font-bold block mb-1">
                        AI Recommended Action:
                      </span>
                      <p className="text-xs text-ink-muted leading-relaxed">
                        {qualification.recommendedAction}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: WhatsApp Live Preview (Hindi) */}
                <div className="glass-card p-6 border-signal/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-obsidian-line mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💬</span>
                        <h3 className="font-display text-lg text-ink">WhatsApp Delivery Mockup</h3>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-signal/20 text-signal-bright font-bold">
                        Delivered in 48s
                      </span>
                    </div>

                    {/* WhatsApp Mobile Chat UI */}
                    <div className="whatsapp-chat-box">
                      <div className="whatsapp-chat-header">
                        <div className="whatsapp-avatar">P</div>
                        <div>
                          <div className="text-xs font-bold text-ink">PIVON Automation Engine</div>
                          <div className="text-[10px] text-signal-bright font-mono">● Online • WhatsApp Verified</div>
                        </div>
                      </div>

                      <div className="whatsapp-chat-body">
                        <div className="whatsapp-bubble">
                          <p className="whatsapp-text whitespace-pre-line">{typedMsg}</p>
                          <div className="whatsapp-time">
                            {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            <span className="text-sky-400 font-bold ml-1">✓✓</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-2">
                    <span className="text-[10px] font-mono text-ink-faint">
                      AiSensy + Meta Cloud API Integration
                    </span>
                    <button
                      type="button"
                      onClick={copyMessageToClipboard}
                      className="text-xs font-mono text-brass-bright hover:underline cursor-pointer bg-transparent border-none p-0"
                    >
                      {copiedMsg ? "✓ Copied to Clipboard!" : "📋 Copy Hindi Message"}
                    </button>
                  </div>
                </div>

                {/* Card 3: CRM Entry Record */}
                <div className="glass-card p-6 border-obsidian-line">
                  <div className="flex items-center justify-between pb-3 border-b border-obsidian-line mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📊</span>
                      <h3 className="font-display text-lg text-ink">CRM Sync Data (Zoho / Google Sheets)</h3>
                    </div>
                    <span className="text-[10px] font-mono text-ink-muted">ID: #PIV-{Math.floor(1000 + Math.random() * 9000)}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="crm-field-row">
                      <span className="text-ink-muted">Lead Name:</span>
                      <span className="text-ink font-semibold">{leadInput.name}</span>
                    </div>
                    <div className="crm-field-row">
                      <span className="text-ink-muted">Contact:</span>
                      <span className="text-ink font-mono">{leadInput.phone}</span>
                    </div>
                    <div className="crm-field-row">
                      <span className="text-ink-muted">Acquisition Source:</span>
                      <span className="text-brass-bright font-mono">{leadInput.source}</span>
                    </div>
                    <div className="crm-field-row">
                      <span className="text-ink-muted">Selected Project:</span>
                      <span className="text-ink">{leadInput.project}</span>
                    </div>
                    <div className="crm-field-row">
                      <span className="text-ink-muted">Location Preference:</span>
                      <span className="text-ink">{leadInput.location}</span>
                    </div>
                    <div className="crm-field-row">
                      <span className="text-ink-muted">Budget Tier:</span>
                      <span className="text-ink font-mono">{leadInput.budget}</span>
                    </div>
                    <div className="crm-field-row">
                      <span className="text-ink-muted">Sync Timestamp:</span>
                      <span className="text-ink font-mono">{new Date().toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Card 4: 6-Touchpoint 30-Day Nurturing Calendar */}
                <div className="glass-card p-6 border-obsidian-line">
                  <div className="flex items-center justify-between pb-3 border-b border-obsidian-line mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔄</span>
                      <h3 className="font-display text-lg text-ink">30-Day Automated Follow-up Calendar</h3>
                    </div>
                    <span className="text-[10px] font-mono text-signal-bright">6 Touchpoints</span>
                  </div>

                  <div className="space-y-2.5">
                    {FOLLOW_UP_SCHEDULE.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 text-xs p-2 rounded bg-obsidian-raised border border-obsidian-line">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${i === 0 ? "bg-signal-bright" : "bg-brass/50"}`} />
                          <span className="font-mono text-ink font-semibold">{item.day}</span>
                        </div>
                        <span className="text-ink-muted text-right text-[11px] max-w-[200px] sm:max-w-xs truncate">
                          {item.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={resetDemo}
                  className="btn-primary text-xs py-3 px-6 uppercase tracking-wider font-bold"
                >
                  ⚡ Test With Another Sample Lead
                </button>
                <Link href="/" className="btn-secondary text-xs py-3 px-6">
                  ← Return to PIVON Homepage
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
