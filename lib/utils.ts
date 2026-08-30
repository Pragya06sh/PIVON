import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Detects low-power devices / no-WebGL2 so we can serve the 2D fallback experience. */
export function shouldUseLiteMode(): boolean {
  if (typeof window === "undefined") return false;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) return true;

  const isNarrow = window.innerWidth < 820;

  let hasWebGL2 = false;
  try {
    const canvas = document.createElement("canvas");
    hasWebGL2 = !!canvas.getContext("webgl2");
  } catch {
    hasWebGL2 = false;
  }

  const cores = navigator.hardwareConcurrency ?? 4;
  const isLowPower = cores <= 4;

  return !hasWebGL2 || (isNarrow && isLowPower);
}
