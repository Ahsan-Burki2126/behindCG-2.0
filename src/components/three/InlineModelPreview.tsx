"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  useGLTF,
  Center,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import type { ViewerSettings } from "@/lib/ContentContext";

type ModelVariant =
  | "icosahedron"
  | "torus"
  | "torusKnot"
  | "sphere"
  | "octahedron"
  | "dodecahedron"
  | "cylinder"
  | "cone";

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
  variant?: ModelVariant;
  color?: string;
  wireColor?: string;
  className?: string;
  autoRotate?: boolean;
  distort?: boolean;
  wobble?: boolean;
  scale?: number;
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
    // Apply user-defined position offset
    groupRef.current.position.x += modelPosition[0];
    groupRef.current.position.y += modelPosition[1];
    groupRef.current.position.z += modelPosition[2];
    // Apply user-defined rotation
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

/* ── Procedural Rotating Model (fallback) ── */
function RotatingModel({
  variant = "icosahedron",
  color = "#0a1520",
  wireColor = "#14b8a6",
  distort = false,
  wobble = false,
  scale = 1,
}: Omit<InlineModelPreviewProps, "className" | "autoRotate" | "modelFile">) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.15;
      meshRef.current.rotation.y = t * 0.25;
    }
    if (wireRef.current) {
      wireRef.current.rotation.x = t * 0.15;
      wireRef.current.rotation.y = t * 0.25;
    }
  });

  const geometryElement = getGeometry(variant);
  const wireGeometry = getGeometry(variant, 1.02);

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group scale={scale}>
        <mesh ref={meshRef}>
          {geometryElement}
          {distort ? (
            <MeshDistortMaterial
              color={color}
              roughness={0.15}
              metalness={0.9}
              envMapIntensity={2}
              distort={0.3}
              speed={2}
            />
          ) : wobble ? (
            <MeshWobbleMaterial
              color={color}
              roughness={0.15}
              metalness={0.9}
              envMapIntensity={2}
              factor={0.3}
              speed={1.5}
            />
          ) : (
            <meshStandardMaterial
              color={color}
              roughness={0.1}
              metalness={0.95}
              envMapIntensity={2}
            />
          )}
        </mesh>
        <mesh ref={wireRef}>
          {wireGeometry}
          <meshBasicMaterial
            color={wireColor}
            wireframe
            transparent
            opacity={0.15}
          />
        </mesh>
      </group>
    </Float>
  );
}

function getGeometry(variant: ModelVariant, scaleFactor = 1) {
  const s = scaleFactor;
  switch (variant) {
    case "torus":
      return <torusGeometry args={[0.8 * s, 0.35 * s, 32, 64]} />;
    case "torusKnot":
      return <torusKnotGeometry args={[0.7 * s, 0.25 * s, 128, 32]} />;
    case "sphere":
      return <sphereGeometry args={[1 * s, 64, 64]} />;
    case "octahedron":
      return <octahedronGeometry args={[1 * s, 0]} />;
    case "dodecahedron":
      return <dodecahedronGeometry args={[1 * s, 0]} />;
    case "cylinder":
      return <cylinderGeometry args={[0.6 * s, 0.8 * s, 1.4 * s, 6]} />;
    case "cone":
      return <coneGeometry args={[0.8 * s, 1.4 * s, 5]} />;
    case "icosahedron":
    default:
      return <icosahedronGeometry args={[1 * s, 1]} />;
  }
}

export default function InlineModelPreview({
  variant = "icosahedron",
  color = "#0a1520",
  wireColor = "#14b8a6",
  className = "",
  distort = false,
  wobble = false,
  scale = 1,
  modelFile,
  viewerSettings: vs,
}: InlineModelPreviewProps) {
  const hasGLB = !!modelFile;

  // Merge user settings with defaults
  const s = { ...VIEWER_DEFAULTS, ...vs };
  // Use prop scale as fallback when no viewerSettings.modelScale provided
  const finalScale = vs?.modelScale ?? scale;

  return (
    <div className={`w-full aspect-square ${className}`}>
      <Canvas
        camera={{
          position: s.cameraPosition as [number, number, number],
          fov: s.cameraFov,
        }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{
          background: s.bgColor === "transparent" ? "transparent" : s.bgColor,
        }}
      >
        <Suspense fallback={null}>
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

          {hasGLB ? (
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
            <RotatingModel
              variant={variant}
              color={color}
              wireColor={wireColor}
              distort={distort}
              wobble={wobble}
              scale={finalScale}
            />
          )}

          {hasGLB && s.showShadows && (
            <ContactShadows
              position={[0, -1.2, 0]}
              opacity={0.3}
              blur={2}
              far={4}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
