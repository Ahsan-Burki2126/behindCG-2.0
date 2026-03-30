"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Center, Html } from "@react-three/drei";
import * as THREE from "three";
import InViewCanvas from "./InViewCanvas";

interface LightweightProjectViewerProps {
  modelFile?: string;
  autoRotateSpeed?: number;
  className?: string;
}

/* ── GLB Loader ── */
function GLBProjectModel({
  url,
  autoRotateSpeed = 0.4,
}: {
  url: string;
  autoRotateSpeed?: number;
}) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const s = 2 / maxDim;
      groupRef.current.scale.setScalar(s);
    }
    const center = box.getCenter(new THREE.Vector3());
    groupRef.current.position.sub(
      center.multiplyScalar(groupRef.current.scale.x),
    );
  }, [url]);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += autoRotateSpeed * 0.01;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene.clone(true)} />
    </group>
  );
}

/* ── No-model placeholder rendered inside the Canvas ── */
function EmptyModelPlaceholder() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-white/20 select-none pointer-events-none">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
        <span className="text-[10px] tracking-widest uppercase">
          No model
        </span>
      </div>
    </Html>
  );
}

/**
 * Lightweight 3D viewer for project grid cards.
 * Loads .glb files on demand (only when scrolled into view).
 * Shows a placeholder when no model file is assigned.
 */
export default function LightweightProjectViewer({
  modelFile,
  autoRotateSpeed = 0.4,
  className = "",
}: LightweightProjectViewerProps) {
  return (
    <div className={`w-full aspect-square ${className}`}>
      <InViewCanvas>
        <Canvas
          camera={{ position: [0, 0, 3.5], fov: 40 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, precision: "mediump" }}
          style={{ background: "transparent" }}
        >
          <Suspense
            fallback={
              <Html center>
                <div className="w-6 h-6 rounded-full border border-white/10 border-t-[#14b8a6] animate-spin" />
              </Html>
            }
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[3, 3, 5]} intensity={0.8} />
            <Environment preset="studio" />

            <Center>
              {modelFile ? (
                <GLBProjectModel
                  url={modelFile}
                  autoRotateSpeed={autoRotateSpeed}
                />
              ) : (
                <EmptyModelPlaceholder />
              )}
            </Center>
          </Suspense>
        </Canvas>
      </InViewCanvas>
    </div>
  );
}
