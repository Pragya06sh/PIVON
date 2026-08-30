"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type HeroProps = {
  onOpenAuth?: (mode?: "signup" | "signin", plan?: string) => void;
};

export default function Hero({ onOpenAuth }: HeroProps) {
  const { data: session } = useSession();
  const router = useRouter();

  function scrollTo(id: string) {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  function handleTryNow() {
    if (session?.user) {
      router.push("/automation");
    } else {
      onOpenAuth?.("signup", "Trial Plan (₹999)");
    }
  }

  return (
    <section id="hero" className="hero-section">
      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="hero-eyebrow"
        >
          <span className="hero-eyebrow__dot" />
          Lead Response System for Real Estate — Indore
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="hero-title"
        >
          Stop Losing Leads.
          <br />
          <span className="hero-title__accent">Start Closing Deals.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="hero-subtitle"
        >
          Your builder runs Facebook ads for ₹50,000/month — gets 200 leads,
          responds to 40, converts 3. The rest? Wasted money.{" "}
          <strong className="text-ink">PIVON answers every enquiry in 60 seconds, 24/7.</strong>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="hero-ctas"
        >
          <button onClick={() => scrollTo("#how-it-works")} className="btn-primary">
            See How It Works
            <svg className="btn-primary__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={handleTryNow}
            className="btn-secondary"
          >
            Try Now — ₹999
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          className="hero-stats"
        >
          <div className="hero-stat">
            <span className="hero-stat__number">&lt;60s</span>
            <span className="hero-stat__label">Response Time</span>
          </div>
          <div className="hero-stat__divider" />
          <div className="hero-stat">
            <span className="hero-stat__number">24/7</span>
            <span className="hero-stat__label">Always Active</span>
          </div>
          <div className="hero-stat__divider" />
          <div className="hero-stat">
            <span className="hero-stat__number">6x</span>
            <span className="hero-stat__label">More Touchpoints</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6 }}
        className="hero-scroll-indicator"
      >
        <span className="eyebrow">Scroll to explore</span>
        <span className="hero-scroll-indicator__line" />
      </motion.div>
    </section>
  );
}
