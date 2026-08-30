"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

type CountUpProps = {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
};

export default function CountUp({ to, suffix = "", prefix = "", duration = 1.6 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();

    function tick(now: number) {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * to));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <motion.span ref={ref} className="font-display text-6xl text-brass-bright md:text-7xl">
      {prefix}
      {value}
      {suffix}
    </motion.span>
  );
}
