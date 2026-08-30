"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

type GlassPanelProps = {
  position: [number, number, number];
  scrollProgress: React.MutableRefObject<number>;
  /** Scroll progress range [start, end] over which this panel's bars grow */
  activeRange: [number, number];
};

const BAR_COUNT = 7;

export default function GlassPanel({ position, scrollProgress, activeRange }: GlassPanelProps) {
  const barsRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Fixed random-ish target heights per bar, seeded so it reads as "real data"
  const targetHeights = useMemo(
    () => Array.from({ length: BAR_COUNT }, (_, i) => 0.3 + ((i * 37) % 100) / 100),
    []
  );

  useFrame(() => {
    const mesh = barsRef.current;
    if (!mesh) return;

    const [start, end] = activeRange;
    const local = THREE.MathUtils.clamp(
      (scrollProgress.current - start) / Math.max(0.001, end - start),
      0,
      1
    );
    const eased = 1 - Math.pow(1 - local, 3);

    for (let i = 0; i < BAR_COUNT; i++) {
      const h = 0.15 + targetHeights[i] * eased * 1.6;
      dummy.position.set((i - BAR_COUNT / 2) * 0.26, h / 2 - 0.7, 0);
      dummy.scale.set(0.16, h, 0.16);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
      <group position={position}>
        {/* The glass panel itself — real transmission/refraction, not a fake shader */}
        <RoundedBox args={[2.4, 1.6, 0.12]} radius={0.06} smoothness={2}>
          <meshPhysicalMaterial
            color="#E8C77E"
            transparent
            opacity={0.18}
            roughness={0.15}
            metalness={0.1}
            emissive="#8A6F3E"
            emissiveIntensity={0.4}
          />
        </RoundedBox>

        {/* Data bars growing inside the glass as the visitor scrolls into range */}
        <instancedMesh ref={barsRef} args={[undefined, undefined, BAR_COUNT]} position={[0, 0, 0.15]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial emissive="#4FA98A" emissiveIntensity={2} color="#0A0A0C" />
        </instancedMesh>
      </group>
    </Float>
  );
}
