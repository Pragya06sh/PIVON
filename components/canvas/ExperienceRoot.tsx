"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getGsap } from "@/lib/gsap";
import { shouldUseLiteMode } from "@/lib/utils";
import LiteBackground from "./LiteBackground";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function ExperienceRoot() {
  const [lite, setLite] = useState<boolean | null>(null);
  const [criticalFallback, setCriticalFallback] = useState(false);

  useEffect(() => {
    setLite(shouldUseLiteMode());
    // Ensure GSAP ScrollTrigger is initialized
    getGsap();
  }, []);

  if (lite === null) return null;
  if (lite || criticalFallback) return <LiteBackground />;
  return <Scene onCriticalPerformance={() => setCriticalFallback(true)} />;
}
