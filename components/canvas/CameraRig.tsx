"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type CameraRigProps = {
  scrollProgress: React.MutableRefObject<number>;
};

// Hand-authored key camera positions/targets for each section of the flythrough.
// Index maps loosely to sections: hero -> problem -> how-it-works -> results -> cta
const KEYFRAMES: { pos: THREE.Vector3; look: THREE.Vector3 }[] = [
  { pos: new THREE.Vector3(0, 4, 22), look: new THREE.Vector3(0, 2, 0) },
  { pos: new THREE.Vector3(8, 6, 14), look: new THREE.Vector3(2, 3, 0) },
  { pos: new THREE.Vector3(-6, 8, 9), look: new THREE.Vector3(-1, 4, 0) },
  { pos: new THREE.Vector3(0, 12, 5), look: new THREE.Vector3(0, 5, -2) },
  { pos: new THREE.Vector3(0, 3, 3), look: new THREE.Vector3(0, 2, -4) },
];

function catmullRomVec3(points: THREE.Vector3[], t: number) {
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
  return curve.getPoint(t);
}

export default function CameraRig({ scrollProgress }: CameraRigProps) {
  const { camera } = useThree();
  const targetLook = useRef(new THREE.Vector3());
  const smoothedProgress = useRef(0);

  const positions = KEYFRAMES.map((k) => k.pos);
  const looks = KEYFRAMES.map((k) => k.look);

  useFrame((_, delta) => {
    // Critically-damped smoothing so the camera glides rather than snapping
    // to the scrub value on fast scroll flicks.
    smoothedProgress.current += (scrollProgress.current - smoothedProgress.current) * Math.min(1, delta * 4);

    const t = smoothedProgress.current;
    const pos = catmullRomVec3(positions, t);
    const look = catmullRomVec3(looks, t);

    camera.position.lerp(pos, 0.15);
    targetLook.current.lerp(look, 0.15);
    camera.lookAt(targetLook.current);
  });

  return null;
}
