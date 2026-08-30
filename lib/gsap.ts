"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export function getGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    // Lenis drives the scroll value; tell ScrollTrigger to trust rAF timing
    // instead of native scroll events, which Lenis intercepts.
    ScrollTrigger.defaults({ scrub: 1 });
    registered = true;
  }
  return { gsap, ScrollTrigger };
}
