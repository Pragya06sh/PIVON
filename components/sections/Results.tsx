"use client";

import { motion } from "framer-motion";
import CountUp from "@/components/ui/CountUp";

const METRICS = [
  {
    to: 60,
    suffix: "s",
    prefix: "<",
    label: "Average response time to every enquiry",
    description: "While your competitors call back in 2 days — if at all",
  },
  {
    to: 6,
    suffix: "x",
    prefix: "",
    label: "More touchpoints per lead with zero effort",
    description: "Automated follow-ups on Day 1, 3, 7, 14, and 30",
  },
  {
    to: 200,
    suffix: "+",
    prefix: "",
    label: "Leads captured and responded to per month",
    description: "Every channel — WhatsApp, call, web form — all in one place",
  },
  {
    to: 72,
    suffix: "%",
    prefix: "",
    label: "Lower cost vs traditional chatbot solutions",
    description: "AiSensy is India-native with better Hindi support",
  },
];

const COMPARISON = [
  {
    label: "Lead comes in at 8 PM Sunday",
    without: "No one sees it until Monday. Lead is cold.",
    with: "WhatsApp response in 60 seconds. Lead is warm.",
  },
  {
    label: "200 leads from Facebook ads",
    without: "40 get called back. 3 convert. ₹47,000 wasted.",
    with: "All 200 contacted. 15+ site visits booked.",
  },
  {
    label: "Lead asks about pricing",
    without: "Salesperson is busy. Lead calls a competitor.",
    with: "AI answers instantly. Warm lead handed to closer.",
  },
  {
    label: "Follow-up needed after Day 1",
    without: "'I'll call tomorrow.' Tomorrow never comes.",
    with: "6 automated touchpoints. Zero manual work.",
  },
];

export default function Results() {
  return (
    <section id="results" className="section-results">
      {/* Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.7 }}
        className="results-header"
      >
        <p className="eyebrow">By the numbers</p>
        <h2 className="section-title">
          What changes when PIVON runs your{" "}
          <span className="text-brass-bright">lead pipeline</span>
        </h2>
      </motion.div>

      <div className="metrics-grid">
        {METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, delay: i * 0.1 }}
            className="glass-card glass-card--metric"
          >
            <CountUp to={m.to} suffix={m.suffix} prefix={m.prefix} />
            <p className="metric-label">{m.label}</p>
            <p className="metric-detail">{m.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Before/After comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.7 }}
        className="comparison-header"
      >
        <p className="eyebrow" style={{ marginTop: "4rem" }}>Without vs With PIVON</p>
      </motion.div>

      <div className="comparison-table">
        <div className="comparison-table__header">
          <div className="comparison-table__col">Scenario</div>
          <div className="comparison-table__col comparison-table__col--bad">
            Without PIVON
          </div>
          <div className="comparison-table__col comparison-table__col--good">
            With PIVON
          </div>
        </div>
        {COMPARISON.map((row, i) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="comparison-table__row"
          >
            <div className="comparison-table__col comparison-table__scenario">
              {row.label}
            </div>
            <div className="comparison-table__col comparison-table__col--bad">
              {row.without}
            </div>
            <div className="comparison-table__col comparison-table__col--good">
              {row.with}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
