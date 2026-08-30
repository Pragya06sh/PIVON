"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LeadForm from "@/components/ui/LeadForm";

type DemoCTAProps = {
  onOpenAuth?: (mode?: "signup" | "signin", plan?: string) => void;
};

export default function DemoCTA({ onOpenAuth }: DemoCTAProps) {
  const { data: session } = useSession();
  const router = useRouter();

  function handleTrialClick() {
    if (session?.user) {
      router.push("/automation");
    } else {
      onOpenAuth?.("signup", "Trial Plan (₹999)");
    }
  }
  return (
    <section id="demo" className="section-demo">
      <div className="demo-grid">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7 }}
          className="demo-content"
        >
          <p className="eyebrow eyebrow--green">Live demo</p>
          <h2 className="section-title">
            See the automation{" "}
            <span className="text-signal-bright">in action</span>
          </h2>
          <p className="demo-text">
            Enter a sample lead below — a name, company, and phone number — and
            watch PIVON process it through the exact same qualification
            pipeline that runs on every client account. In real-time.
          </p>

          <div className="demo-features">
            <div className="demo-feature">
              <span className="demo-feature__icon">⚡</span>
              <span>Response in &lt;60 seconds</span>
            </div>
            <div className="demo-feature">
              <span className="demo-feature__icon">🇮🇳</span>
              <span>WhatsApp message in Hindi</span>
            </div>
            <div className="demo-feature">
              <span className="demo-feature__icon">🔄</span>
              <span>6 automated follow-ups</span>
            </div>
            <div className="demo-feature">
              <span className="demo-feature__icon">📅</span>
              <span>Auto site visit booking</span>
            </div>
          </div>

          <p className="demo-note">
            Want to try it on your own leads?{" "}
            <button
              onClick={handleTrialClick}
              className="demo-note__link underline cursor-pointer bg-transparent border-none p-0 inline font-inherit text-brass-bright hover:text-brass"
            >
              Start your ₹999 trial →
            </button>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <LeadForm />
        </motion.div>
      </div>
    </section>
  );
}
