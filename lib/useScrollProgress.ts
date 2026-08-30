"use client";

import { useEffect, useRef } from "react";
import { getGsap } from "@/lib/gsap";

export function useScrollProgress() {
  const progressRef = useRef(0);

  useEffect(() => {
    const { ScrollTrigger } = getGsap();

    const trigger = ScrollTrigger.create({
      trigger: "#flythrough-spine",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    return () => trigger.kill();
  }, []);

  return progressRef;
}
