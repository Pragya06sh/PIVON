"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MagneticButton from "./MagneticButton";

type Status = "idle" | "thinking" | "done" | "error";

const THINKING_STEPS = [
  "Lead received via WhatsApp…",
  "Categorising by project & source…",
  "Scoring intent — budget, timeline, urgency…",
  "Sending WhatsApp response in Hindi…",
  "Scheduling follow-up sequence…",
  "Routing warm lead to your sales team…",
];

export default function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    location: "",
    business: "",
    motive: "",
    project: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("thinking");
    setStepIndex(0);

    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, THINKING_STEPS.length - 1));
    }, 600);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email || undefined,
          company: form.company,
          phone: form.phone,
          location: form.location || undefined,
          business: form.business || undefined,
          motive: form.motive || undefined,
          intent: form.project || undefined,
          engagement: {
            page: "landing",
            source: "demo-cta",
          },
        }),
      });

      await new Promise((r) =>
        setTimeout(r, THINKING_STEPS.length * 600 + 300)
      );
      clearInterval(stepTimer);

      setStatus(res.ok ? "done" : "error");
    } catch {
      clearInterval(stepTimer);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="glass-card glass-card--success">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p className="eyebrow eyebrow--green" style={{ marginBottom: "0.75rem" }}>
          Lead Qualified ✓
        </p>
        <p className="glass-card__title" style={{ fontSize: "1.5rem" }}>
          {form.name.split(" ")[0] || "Lead"} has been qualified and routed.
        </p>
        <p className="glass-card__desc" style={{ marginTop: "0.5rem" }}>
          In a live system, {form.name.split(" ")[0] || "the lead"} would
          receive a WhatsApp message in Hindi within 60 seconds and your sales
          team would get an instant notification.
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setForm({ name: "", email: "", company: "", phone: "", location: "", business: "", motive: "", project: "" });
          }}
          className="btn-secondary"
          style={{ marginTop: "1.5rem" }}
        >
          Try another lead
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card glass-card--form"
    >
      <AnimatePresence mode="wait">
        {status === "thinking" ? (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="form-thinking"
          >
            <p
              className="eyebrow"
              style={{ marginBottom: "1.5rem", textAlign: "center" }}
            >
              Processing lead in real-time
            </p>
            {THINKING_STEPS.map((step, i) => (
              <div key={step} className="thinking-step">
                <span
                  className={`thinking-step__dot ${
                    i <= stepIndex
                      ? "thinking-step__dot--active"
                      : ""
                  }`}
                />
                <span
                  className={`thinking-step__text ${
                    i <= stepIndex
                      ? "thinking-step__text--active"
                      : ""
                  }`}
                >
                  {step}
                </span>
                {i <= stepIndex && i < THINKING_STEPS.length - 1 && (
                  <span className="thinking-step__check">✓</span>
                )}
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="form-fields"
          >
            <div className="form-row">
              <div className="form-field">
                <label className="eyebrow form-field__label" htmlFor="lead-name">
                  Lead name *
                </label>
                <input
                  id="lead-name"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-field__input"
                />
              </div>
              <div className="form-field">
                <label className="eyebrow form-field__label" htmlFor="lead-email">
                  Email
                </label>
                <input
                  id="lead-email"
                  type="email"
                  placeholder="e.g. rajesh@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="form-field__input"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="eyebrow form-field__label" htmlFor="lead-company">
                  Builder / Company *
                </label>
                <input
                  id="lead-company"
                  required
                  placeholder="e.g. Shree Builders"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="form-field__input"
                />
              </div>
              <div className="form-field">
                <label className="eyebrow form-field__label" htmlFor="lead-phone">
                  Phone *
                </label>
                <input
                  id="lead-phone"
                  required
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="form-field__input"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="eyebrow form-field__label" htmlFor="lead-location">
                  Location
                </label>
                <input
                  id="lead-location"
                  placeholder="e.g. Indore, MP"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="form-field__input"
                />
              </div>
              <div className="form-field">
                <label className="eyebrow form-field__label" htmlFor="lead-business">
                  Business type
                </label>
                <input
                  id="lead-business"
                  placeholder="e.g. Real Estate Developer"
                  value={form.business}
                  onChange={(e) => setForm({ ...form, business: e.target.value })}
                  className="form-field__input"
                />
              </div>
            </div>
            <div className="form-field">
              <label className="eyebrow form-field__label" htmlFor="lead-motive">
                What are you looking for?
              </label>
              <textarea
                id="lead-motive"
                placeholder="e.g. We want to automate our lead response for 3 projects running in Indore"
                value={form.motive}
                onChange={(e) => setForm({ ...form, motive: e.target.value })}
                className="form-field__input form-field__textarea"
                rows={3}
              />
            </div>
            <div className="form-field">
              <label className="eyebrow form-field__label" htmlFor="lead-project">
                Project interest
              </label>
              <input
                id="lead-project"
                placeholder="e.g. Green Valley Phase 2"
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
                className="form-field__input"
              />
            </div>
            {status === "error" && (
              <p className="form-error">
                Couldn&apos;t process — please check your connection and try again.
              </p>
            )}
            <MagneticButton type="submit" className="form-submit">
              See PIVON qualify this lead →
            </MagneticButton>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
