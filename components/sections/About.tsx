"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="section-about">
      <div className="about-grid">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7 }}
          className="about-content"
        >
          <p className="eyebrow">About PIVON</p>
          <h2 className="section-title">
            Built for Indore builders,{" "}
            <span className="text-brass-bright">by someone who understands the market</span>
          </h2>

          <p className="about-text">
            PIVON was founded with one clear mission: to ensure that no Indore
            real estate builder ever loses a sale because of slow follow-up. We
            are a relationship-first agency — we don&apos;t just sell software,
            we build and manage complete lead response systems that work.
          </p>

          <p className="about-text">
            We position ourselves as your local implementation partner. We set
            up the automation, train your team, and continuously optimise until
            the system works like clockwork. In-person demos, Hindi-first
            communication, and hands-on support — that&apos;s the PIVON way.
          </p>

          <div className="about-values">
            <div className="about-value">
              <span className="about-value__icon">🏗️</span>
              <div>
                <h4 className="about-value__title">Built for Real Estate</h4>
                <p className="about-value__desc">
                  Not a generic SaaS tool. Purpose-built workflows for property enquiries,
                  site visits, and builder sales pipelines.
                </p>
              </div>
            </div>
            <div className="about-value">
              <span className="about-value__icon">🤝</span>
              <div>
                <h4 className="about-value__title">Relationship First</h4>
                <p className="about-value__desc">
                  We show results on your phone, in your office. 3–5x higher
                  conversion because we do in-person demos, not cold emails.
                </p>
              </div>
            </div>
            <div className="about-value">
              <span className="about-value__icon">🇮🇳</span>
              <div>
                <h4 className="about-value__title">Hindi-First Approach</h4>
                <p className="about-value__desc">
                  Primary scripts in Hindi, English as backup. Because your buyers
                  speak Hindi, and your system should too.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="about-founder"
        >
          <div className="founder-card">
            <div className="founder-card__avatar">
              <span className="founder-card__initials">PS</span>
            </div>
            <h3 className="founder-card__name">Pragya Shree</h3>
            <p className="founder-card__role">Founder & Lead Strategist</p>
            <div className="founder-card__divider" />
            <div className="founder-card__contacts">
              <a href="tel:+917992484007" className="founder-card__contact">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="founder-card__icon">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                +91 7992484007
              </a>
              <a href="mailto:pivon.agency@gmail.com" className="founder-card__contact">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="founder-card__icon">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                pivon.agency@gmail.com
              </a>
              <span className="founder-card__contact">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="founder-card__icon">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Indore, Madhya Pradesh
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
