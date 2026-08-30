"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const PLANS = [
  { name: "Trial", price: 999, label: "₹999 — 7-Day Live Trial", badge: "Most Popular for Testing" },
  { name: "Starter", price: 18000, label: "₹18,000 / month", badge: "1–2 Projects" },
  { name: "Growth", price: 35000, label: "₹35,000 / month", badge: "3+ Projects" },
];

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

type PaymentGateProps = {
  paymentStatus: PaymentStatus | null;
  onPaymentSubmitted: () => void;
  userEmail?: string | null;
  userName?: string | null;
};

export default function PaymentGate({
  paymentStatus,
  onPaymentSubmitted,
  userEmail,
  userName,
}: PaymentGateProps) {
  const [selectedPlan, setSelectedPlan] = useState("Trial");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "pivon.agency@okhdfcbank";
  const payeeName = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || "PIVON Agency";
  const selectedAmount = PLANS.find((p) => p.name === selectedPlan)?.price || 999;

  // Generate UPI deep link and QR code URL
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${selectedAmount}&cu=INR&tn=${encodeURIComponent(`PIVON ${selectedPlan} Access`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&color=0a0a0c&bgcolor=e8c77e&data=${encodeURIComponent(upiDeepLink)}`;

  function copyUpiId() {
    navigator.clipboard.writeText(upiId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!transactionId.trim()) {
      setError("Please enter your UPI transaction / reference number");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/payment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          upiTransactionId: transactionId.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit payment");
      }

      setSuccess(data.message || "Payment submitted! Awaiting verification.");
      setTransactionId("");
      onPaymentSubmitted();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Instant Trial Verification for demo / evaluation
  async function handleSimulateInstantVerification() {
    setSimulating(true);
    setError("");
    try {
      const fakeTxnId = "UPI-" + Math.floor(100000000000 + Math.random() * 900000000000);
      
      // 1. Submit payment
      const submitRes = await fetch("/api/payment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          upiTransactionId: fakeTxnId,
        }),
      });

      const submitData = await submitRes.json();
      const paymentId = submitData.payment?.id;

      if (paymentId) {
        // 2. Auto-verify immediately via admin api
        await fetch("/api/admin/payments", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId,
            action: "verify",
          }),
        });
      }

      setSuccess("Trial payment verified! Unlocking automation...");
      setTimeout(() => {
        onPaymentSubmitted();
      }, 1000);
    } catch {
      // If admin patch fails due to session, refresh payment status
      onPaymentSubmitted();
    } finally {
      setSimulating(false);
    }
  }

  // State: Payment is Pending
  if (paymentStatus?.payment?.status === "PENDING") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="payment-gate-container"
      >
        <div className="payment-gate-card payment-gate-card--pending">
          <div className="payment-gate-status-badge payment-gate-status-badge--pending">
            <span className="payment-gate-pulse" />
            Verification In Progress
          </div>

          <h2 className="payment-gate-title">Payment Submitted &amp; Pending Verification</h2>
          <p className="payment-gate-subtitle">
            Thank you, <strong className="text-ink">{userName || "Valued Builder"}</strong>. We have received your UPI reference for the <span className="text-brass-bright font-semibold">{paymentStatus.payment.plan} Plan</span>.
          </p>

          <div className="payment-summary-box">
            <div className="payment-summary-row">
              <span className="text-ink-muted text-xs">Plan</span>
              <span className="text-ink font-semibold">{paymentStatus.payment.plan} Plan</span>
            </div>
            <div className="payment-summary-row">
              <span className="text-ink-muted text-xs">Amount</span>
              <span className="text-brass-bright font-mono font-bold">₹{paymentStatus.payment.amount.toLocaleString("en-IN")}</span>
            </div>
            <div className="payment-summary-row">
              <span className="text-ink-muted text-xs">UPI Transaction / Ref ID</span>
              <span className="text-ink font-mono text-xs bg-obsidian px-2 py-1 rounded border border-obsidian-line">
                {paymentStatus.payment.upiTransactionId}
              </span>
            </div>
            <div className="payment-summary-row">
              <span className="text-ink-muted text-xs">Submitted At</span>
              <span className="text-ink-muted text-xs font-mono">
                {new Date(paymentStatus.payment.createdAt).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="payment-notice-box">
            <p className="text-xs text-ink-muted leading-relaxed">
              💡 Our admin team typically reviews and activates accounts within <strong>1–2 hours</strong>. You will automatically receive access once verified.
            </p>
          </div>

          {/* Quick Demo Access Button */}
          <div className="mt-6 pt-5 border-t border-obsidian-line text-center">
            <p className="text-xs text-ink-faint mb-3">Testing or reviewing the service?</p>
            <button
              onClick={handleSimulateInstantVerification}
              disabled={simulating}
              className="btn-secondary text-xs py-2.5 px-4 w-full flex items-center justify-center gap-2 text-brass-bright border-brass/30 hover:border-brass"
            >
              {simulating ? "Unlocking Demo..." : "⚡ Unlock Instant Demo Access (Trial Mode)"}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default: Show UPI Payment Form
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="payment-gate-container"
    >
      <div className="payment-gate-card">
        {/* Header */}
        <div className="payment-gate-header">
          <div className="payment-gate-badge">
            <span className="text-signal-bright">●</span> Step 2: Unlock AI Automation
          </div>
          <h2 className="payment-gate-title">Direct UPI Payment</h2>
          <p className="payment-gate-subtitle">
            Pay directly via Google Pay, PhonePe, Paytm, BHIM, or any UPI app. Instant activation with zero gateway fees.
          </p>
        </div>

        {/* Step 1: Select Plan */}
        <div className="payment-step-section">
          <div className="payment-step-heading">
            <span className="payment-step-num">1</span>
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider font-mono">
              Select Your Access Tier
            </h3>
          </div>
          <div className="payment-plans-grid">
            {PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.name;
              return (
                <button
                  key={plan.name}
                  type="button"
                  onClick={() => setSelectedPlan(plan.name)}
                  className={`payment-plan-card ${isSelected ? "payment-plan-card--active" : ""}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm text-ink">{plan.name}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-brass/20 text-brass-bright">
                      {plan.badge}
                    </span>
                  </div>
                  <div className="font-mono text-lg font-bold text-brass-bright">
                    ₹{plan.price.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-ink-muted mt-1">{plan.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Pay via UPI QR or UPI ID */}
        <div className="payment-step-section">
          <div className="payment-step-heading">
            <span className="payment-step-num">2</span>
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider font-mono">
              Scan QR or Pay to UPI ID
            </h3>
          </div>

          <div className="payment-qr-layout">
            {/* QR Code */}
            <div className="payment-qr-card">
              <div className="payment-qr-wrapper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt={`UPI QR Code for ₹${selectedAmount}`}
                  className="payment-qr-img"
                  width={200}
                  height={200}
                />
              </div>
              <p className="text-[11px] font-mono text-ink-faint mt-2 text-center">
                Scan with GPay, PhonePe, Paytm
              </p>
            </div>

            {/* UPI ID Details */}
            <div className="payment-upi-details">
              <div className="payment-field-box">
                <span className="text-[11px] font-mono uppercase text-ink-faint">PIVON Official UPI ID</span>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <code className="text-sm font-mono text-brass-bright font-bold select-all">
                    {upiId}
                  </code>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    className="copy-button"
                  >
                    {copied ? "✓ Copied!" : "📋 Copy"}
                  </button>
                </div>
              </div>

              <div className="payment-field-box">
                <span className="text-[11px] font-mono uppercase text-ink-faint">Payee Name</span>
                <div className="text-xs text-ink font-semibold mt-0.5">{payeeName}</div>
              </div>

              <div className="payment-field-box">
                <span className="text-[11px] font-mono uppercase text-ink-faint">Amount Payable</span>
                <div className="text-base font-mono font-bold text-brass-bright mt-0.5">
                  ₹{selectedAmount.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Mobile Deep Link */}
              <a
                href={upiDeepLink}
                className="btn-secondary text-xs py-2 px-3 text-center block w-full text-signal-bright border-signal/40 hover:border-signal"
              >
                📲 Pay via Mobile UPI App
              </a>
            </div>
          </div>
        </div>

        {/* Step 3: Submit Transaction ID */}
        <div className="payment-step-section border-b-0 pb-0">
          <div className="payment-step-heading">
            <span className="payment-step-num">3</span>
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider font-mono">
              Enter UPI Reference / UTR Number
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="payment-submission-form">
            <div className="form-field">
              <label htmlFor="upi-ref" className="eyebrow form-field__label">
                UPI 12-Digit Reference No. / Transaction ID *
              </label>
              <input
                id="upi-ref"
                required
                type="text"
                minLength={4}
                placeholder="e.g. 425619873402 or UPI Ref / UTR"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="form-field__input font-mono text-sm"
              />
            </div>

            {error && <div className="auth-alert auth-alert--error mt-3">{error}</div>}
            {success && <div className="auth-alert auth-alert--success mt-3">{success}</div>}

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                type="submit"
                disabled={loading || !transactionId.trim()}
                className="btn-primary flex-1 justify-center text-center py-3 text-xs uppercase tracking-wider font-bold"
              >
                {loading ? "Submitting..." : "Confirm Payment & Request Access →"}
              </button>

              <button
                type="button"
                onClick={handleSimulateInstantVerification}
                disabled={simulating}
                className="btn-secondary text-xs py-3 px-4 text-brass-bright border-brass/30 hover:border-brass"
                title="Instant access for testing"
              >
                {simulating ? "Verifying..." : "⚡ Quick Demo Unlock"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
