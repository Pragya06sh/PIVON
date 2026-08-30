"use client";

import { useEffect, useRef, useState } from "react";
import { getGsap } from "@/lib/gsap";

export default function ScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const rafIdRef = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Initialize GSAP ScrollTrigger (automatically binds to native scroll)
    getGsap();

    function onLoadedMetadata() {
      setIsLoaded(true);
      video?.play().catch(() => {}); // Start normal playback
    }

    if (video.readyState >= 1) {
      onLoadedMetadata();
    } else {
      video.addEventListener("loadedmetadata", onLoadedMetadata);
    }

    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    function smoothUpdate() {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      // Smooth out the scroll velocity for a fluid fast-forward effect
      scrollVelocity += (Math.abs(scrollDelta) - scrollVelocity) * 0.1;

      if (video && isLoaded) {
        // Base rate is 1 (normal playback).
        // Add velocity multiplier when scrolling to move video forward faster.
        let rate = 1 + (scrollVelocity * 0.15);
        
        // Clamp to browser maximum playback rate (usually 16x is safe)
        rate = Math.max(1, Math.min(rate, 16));
        
        video.playbackRate = rate;
      }

      rafIdRef.current = requestAnimationFrame(smoothUpdate);
    }

    rafIdRef.current = requestAnimationFrame(smoothUpdate);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [isLoaded]);

  return (
    <div className="scroll-video-container" aria-hidden>
      <video
        ref={videoRef}
        src="/video/background.mp4"
        muted
        playsInline
        loop
        preload="auto"
        className={`scroll-video ${isLoaded ? "scroll-video--loaded" : ""}`}
      />
      {/* Gradient overlay for text readability */}
      <div className="scroll-video-overlay" />
      {/* Loading shimmer */}
      {!isLoaded && <div className="scroll-video-loader" />}
    </div>
  );
}
