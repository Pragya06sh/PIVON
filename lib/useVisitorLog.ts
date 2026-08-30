"use client";

import { useEffect, useRef } from "react";

export function useVisitorLog() {
  const maxScroll = useRef(0);
  const start = useRef(Date.now());

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const pct = doc.scrollTop / (doc.scrollHeight - doc.clientHeight || 1);
      maxScroll.current = Math.max(maxScroll.current, pct);
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    fetch("/api/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "session_start" }),
      keepalive: true,
    }).catch(() => {});

    function flush() {
      const payload = JSON.stringify({
        event: "session_end",
        scrollDepth: Math.round(maxScroll.current * 100),
        durationMs: Date.now() - start.current,
      });
      navigator.sendBeacon?.("/api/visitors", payload);
    }

    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, []);
}
