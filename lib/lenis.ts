"use client";

import Lenis from "lenis";
import gsap from "gsap";

let lenis: Lenis | null = null;

/**
 * Creates (once) a Lenis instance and binds it to GSAP's ticker so that
 * every ScrollTrigger-driven animation (including the R3F camera flythrough)
 * reads from the same smoothed scroll value — no drift between DOM and canvas.
 */
export function getLenis() {
  if (lenis) return lenis;

  lenis = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: true,
  });

  function raf(time: number) {
    lenis?.raf(time);
  }

  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function destroyLenis() {
  if (!lenis) return;
  lenis.destroy();
  lenis = null;
}
