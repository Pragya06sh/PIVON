"use client";

import { motion } from "framer-motion";

const PAIN_POINTS = [
  {
    icon: "📱",
    title: "Leads go to personal WhatsApp",
    description:
      "Three projects running. Leads come to personal WhatsApp. No one knows which project the lead wanted. No tracking.",
  },
  {
    icon: "⏰",
    title: "Follow-up means 'I'll call tomorrow'",
    description:
      "Salesperson misses a call at 8pm on Sunday. Lead goes cold. Builder never knows it happened. Tomorrow never comes.",
  },
  {
    icon: "💸",
    title: "₹50,000/month on ads, 3 conversions",
    description:
      "Builder pays ₹50,000/month on Facebook ads. Gets 200 leads. Responds to 40. Converts 3. The rest are wasted money.",
  },
  {
    icon: "📊",
    title: "CRM set up once, never used again",
    description:
      "Builder's CRM was set up once. Team stopped using it. Back to Excel. No pipeline visibility. No accountability.",
  },
];

const SERVICES = [
  {
    icon: "⚡",
    title: "Instant WhatsApp Response",
    description:
      "Every lead gets a personalised WhatsApp message in Hindi within 60–90 seconds. 24 hours a day, 7 days a week. No salesperson needed.",
    tag: "AiSensy Powered",
  },
  {
    icon: "🔄",
    title: "Automated Follow-up Sequence",
    description:
      "If the lead doesn't reply in 24 hours — automated follow-up goes out. Day 3, Day 7, Day 14, Day 30. Total: 6 touchpoints with zero manual effort.",
    tag: "Zero Manual Work",
  },
  {
    icon: "🤖",
    title: "AI Lead Qualification",
    description:
      "AI-assisted responses handle basic questions — pricing, location, configuration — and escalate to your salesperson only for warm leads.",
    tag: "GPT Powered",
  },
  {
    icon: "📋",
    title: "CRM & Lead Tracking",
    description:
      "Every lead stored and categorised by project, source, and timestamp. Google Sheets for pilot clients, Zoho CRM from Client 2 onwards.",
    tag: "Organised Pipeline",
  },
  {
    icon: "📅",
    title: "Site Visit Booking",
    description:
      "When a lead shows interest in a site visit, Google Calendar sends a booking confirmation with date, time, and project address. Automatic.",
    tag: "Auto-Booked",
  },
  {
    icon: "📊",
    title: "Source Performance Reports",
    description:
      "See exactly which leads converted and which enquiry source — 99acres, MagicBricks, Facebook, JustDial — is actually working.",
    tag: "Data-Driven",
  },
];

export default function ProblemSolution() {
  return (
    <section id="services" className="section-services">
      {/* Pain Points */}
      <div className="services-pain">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow eyebrow--red">The problem</p>
          <h2 className="section-title">
            Where your builder clients are
            <span className="text-red-400"> bleeding money</span>
          </h2>
        </motion.div>

        <div className="pain-grid">
          {PAIN_POINTS.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass-card glass-card--pain"
            >
              <span className="glass-card__icon">{point.icon}</span>
              <h3 className="glass-card__title">{point.title}</h3>
              <p className="glass-card__desc">{point.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="services-solutions">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow eyebrow--green">The solution</p>
          <h2 className="section-title">
            What PIVON builds for your
            <span className="text-signal-bright"> real estate business</span>
          </h2>
        </motion.div>

        <div className="services-grid">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="glass-card glass-card--service"
            >
              <div className="glass-card__header">
                <span className="glass-card__icon">{service.icon}</span>
                <span className="glass-card__tag">{service.tag}</span>
              </div>
              <h3 className="glass-card__title">{service.title}</h3>
              <p className="glass-card__desc">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
