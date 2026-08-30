"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    name: "Trial",
    price: "999",
    period: "/ 1 week",
    description: "See the full automation in action on your own leads",
    features: [
      "Full lead response system for 7 days",
      "WhatsApp auto-response in Hindi",
      "Up to 50 leads processed",
      "Basic follow-up sequence",
      "Google Sheets lead tracking",
      "Setup within 24 hours",
    ],
    cta: "Start Trial — ₹999",
    highlight: false,
    tag: null,
  },
  {
    name: "Starter",
    price: "18,000",
    period: "/ month",
    description: "Perfect for builders with 1–2 active projects",
    features: [
      "Everything in Trial, plus:",
      "Unlimited leads per month",
      "Automated 6-touchpoint follow-up",
      "AI-assisted lead qualification",
      "Zoho CRM integration",
      "Site visit auto-booking",
      "Monthly performance report",
      "Dedicated support on WhatsApp",
    ],
    cta: "Get Started",
    highlight: true,
    tag: "Most Popular",
    setup: "One-time setup: ₹10,000",
  },
  {
    name: "Growth",
    price: "35,000",
    period: "/ month",
    description: "For builders scaling across 3+ projects in Indore",
    features: [
      "Everything in Starter, plus:",
      "Multi-project lead routing",
      "Advanced AI response customisation",
      "Custom automation workflows",
      "Priority support & SLA",
      "Weekly strategy calls",
      "Source performance analytics",
      "Team training & onboarding",
    ],
    cta: "Contact Us",
    highlight: false,
    tag: "Best Value",
  },
];

type PricingProps = {
  onOpenAuth?: (mode?: "signup" | "signin", plan?: string) => void;
};

export default function Pricing({ onOpenAuth }: PricingProps) {
  const { data: session } = useSession();
  const router = useRouter();

  function handlePlanClick(planName: string) {
    if (session?.user) {
      router.push("/automation");
    } else {
      onOpenAuth?.("signup", `${planName} Plan`);
    }
  }
  return (
    <section id="pricing" className="section-pricing">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.7 }}
        className="pricing-header"
      >
        <p className="eyebrow">Pricing</p>
        <h2 className="section-title">
          Start small.{" "}
          <span className="text-brass-bright">See results first.</span>
        </h2>
        <p className="section-subtitle">
          No long contracts. No complicated setup. Try the full system for ₹999
          — cancel anytime after that.
        </p>
      </motion.div>

      <div className="pricing-grid">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, delay: i * 0.12 }}
            className={`pricing-card ${
              plan.highlight ? "pricing-card--highlight" : ""
            }`}
          >
            {plan.tag && <span className="pricing-card__tag">{plan.tag}</span>}
            <h3 className="pricing-card__name">{plan.name}</h3>
            <p className="pricing-card__desc">{plan.description}</p>

            <div className="pricing-card__price">
              <span className="pricing-card__currency">₹</span>
              <span className="pricing-card__amount">{plan.price}</span>
              <span className="pricing-card__period">{plan.period}</span>
            </div>

            {"setup" in plan && plan.setup && (
              <p className="pricing-card__setup">{plan.setup}</p>
            )}

            <ul className="pricing-card__features">
              {plan.features.map((feature) => (
                <li key={feature} className="pricing-card__feature">
                  <svg
                    className="pricing-card__check"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePlanClick(plan.name)}
              className={`pricing-card__cta ${
                plan.highlight
                  ? "pricing-card__cta--primary"
                  : "pricing-card__cta--secondary"
              }`}
            >
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="pricing-note"
      >
        All prices exclusive of GST. Setup includes complete automation
        configuration, CRM integration, and WhatsApp Business API setup.
      </motion.p>
    </section>
  );
}
