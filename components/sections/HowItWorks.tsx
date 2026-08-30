"use client";

import { motion } from "framer-motion";

const FLOW_STEPS = [
  {
    n: "01",
    title: "Lead Arrives",
    detail:
      "From any source — 99acres, MagicBricks, Facebook Lead Ad, JustDial, or your builder's website — via webhook or API integration into Make.com.",
    color: "#4FA98A",
  },
  {
    n: "02",
    title: "Captured & Categorised",
    detail:
      "Make.com stores the lead in Zoho CRM (or Google Sheets for pilot clients) — categorised by project, source, and timestamp. Nothing gets lost.",
    color: "#E8C77E",
  },
  {
    n: "03",
    title: "Instant WhatsApp Message",
    detail:
      "AiSensy sends a personalised WhatsApp message in Hindi within 60–90 seconds. 24 hours a day, 7 days a week. The lead feels heard immediately.",
    color: "#4FA98A",
  },
  {
    n: "04",
    title: "Smart Follow-up Sequence",
    detail:
      "If no reply in 24 hours — automated follow-up on Day 3, Day 7, Day 14, Day 30. Total: 6 touchpoints with zero manual effort from your team.",
    color: "#E8C77E",
  },
  {
    n: "05",
    title: "AI Handles Questions",
    detail:
      "AI-assisted response handles basic questions — pricing, location, configuration — and escalates only warm leads to your salesperson.",
    color: "#4FA98A",
  },
  {
    n: "06",
    title: "Site Visit Booked",
    detail:
      "When a lead shows interest, Google Calendar sends a booking confirmation with date, time, and project address. Deal moves forward automatically.",
    color: "#E8C77E",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-hiw">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.7 }}
        className="hiw-header"
      >
        <p className="eyebrow">The automation flow</p>
        <h2 className="section-title">
          From lead to site visit —{" "}
          <span className="text-brass-bright">fully automated</span>
        </h2>
        <p className="section-subtitle">
          One enquiry, six steps, zero missed calls. This is the exact system
          that runs on every PIVON client account.
        </p>
      </motion.div>

      {/* Flow visualization */}
      <div className="hiw-flow">
        {/* Vertical connecting line */}
        <div className="hiw-flow__line" />

        {FLOW_STEPS.map((step, i) => (
          <motion.div
            key={step.n}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className={`hiw-step ${i % 2 === 0 ? "hiw-step--left" : "hiw-step--right"}`}
          >
            {/* Dot on the line */}
            <div
              className="hiw-step__dot"
              style={{ backgroundColor: step.color }}
            />

            <div className="glass-card glass-card--flow">
              <div className="hiw-step__number" style={{ color: step.color }}>
                {step.n}
              </div>
              <h3 className="glass-card__title">{step.title}</h3>
              <p className="glass-card__desc">{step.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tech stack badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="hiw-tech"
      >
        <p className="eyebrow" style={{ marginBottom: "1rem" }}>
          Powered by
        </p>
        <div className="hiw-tech__badges">
          {["Make.com", "AiSensy", "Zoho CRM", "Google Calendar", "WhatsApp Business"].map(
            (tech) => (
              <span key={tech} className="tech-badge">
                {tech}
              </span>
            )
          )}
        </div>
      </motion.div>
    </section>
  );
}
