"use client";

import { useState } from "react";
import ScrollVideo from "@/components/canvas/ScrollVideo";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import ProblemSolution from "@/components/sections/ProblemSolution";
import HowItWorks from "@/components/sections/HowItWorks";
import Results from "@/components/sections/Results";
import Pricing from "@/components/sections/Pricing";
import DemoCTA from "@/components/sections/DemoCTA";
import About from "@/components/sections/About";
import Footer from "@/components/sections/Footer";
import AuthModal from "@/components/ui/AuthModal";
import { useVisitorLog } from "@/lib/useVisitorLog";

export default function HomePage() {
  useVisitorLog();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [authPlan, setAuthPlan] = useState("");

  function handleOpenAuth(mode: "signup" | "signin" = "signup", plan: string = "") {
    setAuthMode(mode);
    setAuthPlan(plan);
    setAuthOpen(true);
  }

  return (
    <>
      {/* Scroll-driven video background */}
      <ScrollVideo />

      {/* Fixed navbar */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        initialPlan={authPlan}
      />

      {/* Scrollable content — this is the anchor for ScrollTrigger */}
      <main id="scroll-spine" className="main-content">
        <Hero onOpenAuth={handleOpenAuth} />
        <ProblemSolution />
        <HowItWorks />
        <Results />
        <Pricing onOpenAuth={handleOpenAuth} />
        <DemoCTA onOpenAuth={handleOpenAuth} />
        <About />
      </main>

      <Footer />
    </>
  );
}
