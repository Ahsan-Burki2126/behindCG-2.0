"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  useGLTF,
  Center,
  ContactShadows,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import type { ViewerSettings } from "@/lib/ContentContext";
import InViewCanvas from "./InViewCanvas";

export const VIEWER_DEFAULTS: ViewerSettings = {
  cameraPosition: [0, 0, 3.5],
  cameraFov: 40,
  modelScale: 1,
  modelPosition: [0, 0, 0],
  modelRotation: [0, 0, 0],
  autoRotate: true,
  autoRotateSpeed: 0.4,
  environmentPreset: "city",
  ambientIntensity: 0.3,
  directionalIntensity: 1.2,
  directionalColor: "#14b8a6",
  bgColor: "transparent",
  showShadows: true,
  showFloat: true,
};

export const ENVIRONMENT_PRESETS = [
  "apartment",
  "city",
  "dawn",
  "forest",
  "lobby",
  "night",
  "park",
  "studio",
  "sunset",
  "warehouse",
] as const;

interface InlineModelPreviewProps {
  className?: string;
  modelFile?: string;
  viewerSettings?: Partial<ViewerSettings>;
}

/* ── GLB Model Loader ── */
function GLBInlineModel({
  url,
  scale = 1,
  autoRotate = true,
  autoRotateSpeed = 0.4,
  modelPosition = [0, 0, 0] as [number, number, number],
  modelRotation = [0, 0, 0] as [number, number, number],
  showFloat = true,
}: {
  url: string;
  scale?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  modelPosition?: [number, number, number];
  modelRotation?: [number, number, number];
  showFloat?: boolean;
}) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const s = (2 * scale) / maxDim;
      groupRef.current.scale.setScalar(s);
    }
    const center = box.getCenter(new THREE.Vector3());
    groupRef.current.position.sub(
      center.multiplyScalar(groupRef.current.scale.x),
    );
    groupRef.current.position.x += modelPosition[0];
    groupRef.current.position.y += modelPosition[1];
    groupRef.current.position.z += modelPosition[2];
    groupRef.current.rotation.x = THREE.MathUtils.degToRad(modelRotation[0]);
    groupRef.current.rotation.y = THREE.MathUtils.degToRad(modelRotation[1]);
    groupRef.current.rotation.z = THREE.MathUtils.degToRad(modelRotation[2]);
  }, [url, scale, modelPosition, modelRotation]);

  useFrame(() => {
    if (!groupRef.current || !autoRotate) return;
    groupRef.current.rotation.y += autoRotateSpeed * 0.01;
  });

  const inner = (
    <group ref={groupRef}>
      <primitive object={scene.clone(true)} />
    </group>
  );

  if (!showFloat) return inner;

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
      {inner}
    </Float>
  );
}

export default function InlineModelPreview({
  className = "",
  modelFile,
  viewerSettings: vs,
}: InlineModelPreviewProps) {
  const s = { ...VIEWER_DEFAULTS, ...vs };
  const finalScale = vs?.modelScale ?? s.modelScale;

  return (
    <div className={`w-full aspect-square ${className}`}>
      <InViewCanvas>
        <Canvas
          camera={{
            position: s.cameraPosition as [number, number, number],
            fov: s.cameraFov,
          }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{
            background:
              s.bgColor === "transparent" ? "transparent" : s.bgColor,
          }}
        >
          <Suspense
            fallback={
              <Html center>
                <div className="w-6 h-6 rounded-full border border-white/10 border-t-[#14b8a6] animate-spin" />
              </Html>
            }
          >
            <ambientLight intensity={s.ambientIntensity} />
            <directionalLight
              position={[3, 3, 5]}
              intensity={s.directionalIntensity}
              color={s.directionalColor}
            />
            <directionalLight
              position={[-3, 2, -3]}
              intensity={s.directionalIntensity * 0.4}
              color="#f97316"
            />
            <Environment preset={s.environmentPreset as any} />

            {modelFile ? (
              <Center>
                <GLBInlineModel
                  url={modelFile}
                  scale={finalScale}
                  autoRotate={s.autoRotate}
                  autoRotateSpeed={s.autoRotateSpeed}
                  modelPosition={s.modelPosition as [number, number, number]}
                  modelRotation={s.modelRotation as [number, number, number]}
                  showFloat={s.showFloat}
                />
              </Center>
            ) : (
              <Html center>
                <div className="flex flex-col items-center gap-2 text-white/20 select-none pointer-events-none">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                  <span className="text-[10px] tracking-widest uppercase whitespace-nowrap">
                    Upload a .glb
                  </span>
                </div>
              </Html>
            )}

            {modelFile && s.showShadows && (
              <ContactShadows
                position={[0, -1.2, 0]}
                opacity={0.3}
                blur={2}
                far={4}
              />
            )}
          </Suspense>
        </Canvas>
      </InViewCanvas>
    </div>
  );
}
