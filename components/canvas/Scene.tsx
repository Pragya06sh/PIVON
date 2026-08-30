"use client";

import { Suspense, useMemo, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import Skyline from "./Skyline";
import ParticleField from "./ParticleField";
import CameraRig from "./CameraRig";
import GlassPanel from "./GlassPanel";
import { useScrollProgress } from "@/lib/useScrollProgress";

type SceneProps = {
  /** Called once if performance stays critically low even at the lowest
   *  tier — ExperienceRoot uses this to tear the whole Canvas down and
   *  fall back to the zero-GPU CSS background instead of limping along. */
  onCriticalPerformance: () => void;
};

export default function Scene({ onCriticalPerformance }: SceneProps) {
  const scrollProgress = useScrollProgress();

  // Start at the CHEAP tier and only spend more budget once
  // PerformanceMonitor confirms the device can actually afford it —
  // previously this started at the expensive tier and stepped down,
  // which meant the very first impression on a mid/low-end machine was
  // always the slowest possible frame.
  const [dpr, setDpr] = useState(1);
  const [particleCount, setParticleCount] = useState(250);

  const handleIncline = useCallback(() => {
    setDpr(1.5);
    setParticleCount(500);
  }, []);
  const handleDecline = useCallback(() => {
    setDpr(1);
    setParticleCount(150);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        dpr={dpr}
        camera={{ fov: 45, position: [0, 4, 22] }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#0A0A0C"]} />
        <fog attach="fog" args={["#0A0A0C", 20, 60]} />

        {/* No shadow maps, no HDRI environment fetch/convolution — both were
            pure cost with little payoff at this camera distance. */}
        <ambientLight intensity={0.22} />
        <directionalLight position={[10, 20, 10]} intensity={1.1} color="#E8C77E" />
        <pointLight position={[-8, 6, 4]} intensity={0.5} color="#4FA98A" />

        <Suspense fallback={null}>
          <Skyline scrollProgress={scrollProgress} />
          <ParticleField count={particleCount} />
          <GlassPanel position={[3.2, 5.4, -1]} scrollProgress={scrollProgress} activeRange={[0.35, 0.55]} />
          <GlassPanel position={[-2.6, 9.2, -3]} scrollProgress={scrollProgress} activeRange={[0.6, 0.8]} />
        </Suspense>

        <CameraRig scrollProgress={scrollProgress} />

        <PerformanceMonitor
          onIncline={handleIncline}
          onDecline={handleDecline}
          onFallback={onCriticalPerformance}
          flipflops={3}
        >
          <EffectComposer multisampling={0}>
            <Bloom intensity={0.55} luminanceThreshold={0.3} luminanceSmoothing={0.9} mipmapBlur />
            <Vignette eskil={false} offset={0.25} darkness={0.75} />
          </EffectComposer>
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
}
