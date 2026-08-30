"use client";

import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import brassVert from "./shaders/brassBloom.vert";
import brassFrag from "./shaders/brassBloom.frag";

type SkylineProps = {
  scrollProgress: React.MutableRefObject<number>;
};

function seededRandom(seed: number) {
  return (n: number) => {
    const x = Math.sin(seed * 999 + n * 37.13) * 43758.5453;
    return x - Math.floor(x);
  };
}

/** Procedurally builds a lit-window emissive texture — a cheap way to make
 *  boxes read as buildings instead of flat glowing rectangles. */
function buildWindowTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#0A0A0C";
  ctx.fillRect(0, 0, size, size);

  const cols = 6;
  const rows = 10;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > 0.45) continue; // most windows dark, some lit
      const lit = Math.random() > 0.3 ? "#E8C77E" : "#4FA98A";
      ctx.fillStyle = lit;
      ctx.globalAlpha = 0.5 + Math.random() * 0.5;
      ctx.fillRect(
        (c / cols) * size + 1,
        (r / rows) * size + 1,
        size / cols - 2,
        size / rows - 2
      );
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

const TOWER_COUNT = 90;
const SIGNATURE_COUNT = 6;

export default function Skyline({ scrollProgress }: SkylineProps) {
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const signatureMaterialRefs = useRef<(THREE.ShaderMaterial | null)[]>([]);

  const windowTexture = useMemo(() => buildWindowTexture(), []);

  const { instanceLayout, signatureLayout } = useMemo(() => {
    const rng = seededRandom(7);
    const instanceLayout: { position: THREE.Vector3; scale: THREE.Vector3 }[] = [];
    const signatureLayout: { position: THREE.Vector3; scale: THREE.Vector3 }[] = [];

    for (let i = 0; i < TOWER_COUNT; i++) {
      const angle = rng(i) * Math.PI * 2;
      const radius = 8 + rng(i + 50) * 30;
      const height = 2 + rng(i + 100) * 16;
      const width = 0.7 + rng(i + 150) * 1.6;
      instanceLayout.push({
        position: new THREE.Vector3(Math.cos(angle) * radius, height / 2 - 3, Math.sin(angle) * radius),
        scale: new THREE.Vector3(width, height, width),
      });
    }

    for (let i = 0; i < SIGNATURE_COUNT; i++) {
      const angle = (i / SIGNATURE_COUNT) * Math.PI * 2 + 0.4;
      const radius = 5 + rng(i + 300) * 4;
      const height = 8 + rng(i + 350) * 8;
      const width = 1.1 + rng(i + 400) * 0.6;
      signatureLayout.push({
        position: new THREE.Vector3(Math.cos(angle) * radius, height / 2 - 3, Math.sin(angle) * radius),
        scale: new THREE.Vector3(width, height, width),
      });
    }

    return { instanceLayout, signatureLayout };
  }, []);

  // Instance matrices are set once — this is a static skyline, so we pay
  // the matrix-composition cost a single time instead of every frame.
  useEffect(() => {
    const mesh = instancedRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    instanceLayout.forEach((t, i) => {
      dummy.position.copy(t.position);
      dummy.scale.copy(t.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [instanceLayout]);

  const signatureUniforms = useMemo(
    () =>
      signatureLayout.map(() => ({
        uTime: { value: 0 },
        uScrollProgress: { value: 0 },
        uColorDim: { value: new THREE.Color("#8A6F3E") },
        uColorBright: { value: new THREE.Color("#E8C77E") },
        uIntensity: { value: 1.0 },
      })),
    [signatureLayout]
  );

  useFrame((_, delta) => {
    signatureMaterialRefs.current.forEach((mat) => {
      if (!mat) return;
      mat.uniforms.uTime.value += delta;
      mat.uniforms.uScrollProgress.value = scrollProgress.current;
    });
    if (groupRef.current) {
      // Slow ambient rotation gives the flythrough a sense of a living skyline
      groupRef.current.rotation.y = scrollProgress.current * 0.6;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Background field: one draw call for the whole skyline silhouette */}
      <instancedMesh ref={instancedRef} args={[undefined, undefined, TOWER_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          map={windowTexture}
          emissiveMap={windowTexture}
          emissive="#C9A15A"
          emissiveIntensity={1.4}
          color="#141414"
          roughness={0.6}
          metalness={0.2}
        />
      </instancedMesh>

      {/* Foreground signature towers: the expensive fresnel-bloom shader,
          reserved for the handful of buildings actually close to camera */}
      {signatureLayout.map((t, i) => (
        <mesh key={i} position={t.position} scale={t.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <shaderMaterial
            ref={(el) => {
              signatureMaterialRefs.current[i] = el;
            }}
            vertexShader={brassVert}
            fragmentShader={brassFrag}
            uniforms={signatureUniforms[i]}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}
