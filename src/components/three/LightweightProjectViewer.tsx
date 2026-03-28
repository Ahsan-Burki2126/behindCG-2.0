"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Center } from "@react-three/drei";
import * as THREE from "three";

type ModelVariant =
  | "icosahedron"
  | "torus"
  | "torusKnot"
  | "sphere"
  | "octahedron"
  | "dodecahedron"
  | "cylinder"
  | "cone";

interface LightweightProjectViewerProps {
  modelFile?: string; // Custom GLB file
  variant?: ModelVariant; // Fallback procedural geometry
  color?: string;
  wireColor?: string;
  autoRotateSpeed?: number;
  scale?: number;
  className?: string;
}

/* ── Lightweight GLB Loader ── */
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

/* ── Lightweight Procedural Model ── */
function RotatingProcedural({
  variant = "icosahedron",
  color = "#0a1520",
  wireColor = "#14b8a6",
  scale = 1,
  autoRotateSpeed = 0.4,
}: Omit<LightweightProjectViewerProps, "modelFile" | "className">) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current || !wireRef.current) return;
    meshRef.current.rotation.x += 0.004;
    meshRef.current.rotation.y += autoRotateSpeed * 0.01;
    wireRef.current.rotation.x = meshRef.current.rotation.x;
    wireRef.current.rotation.y = meshRef.current.rotation.y;
  });

  let geometry =
    variant === "torus"
      ? [1, 0.4, 16, 16]
      : variant === "torusKnot"
        ? [1, 0.4, 32, 8]
        : variant === "sphere"
          ? [1, 16, 16]
          : variant === "octahedron"
            ? [1, 0]
            : variant === "dodecahedron"
              ? [1, 0]
              : variant === "cylinder"
                ? [1, 1, 16]
                : variant === "cone"
                  ? [1, 1.5, 16]
                  : [1.5, 1]; // icosahedron

  const GeometryComponent =
    variant === "torus"
      ? THREE.TorusGeometry
      : variant === "torusKnot"
        ? THREE.TorusKnotGeometry
        : variant === "sphere"
          ? THREE.SphereGeometry
          : variant === "octahedron"
            ? THREE.OctahedronGeometry
            : variant === "dodecahedron"
              ? THREE.DodecahedronGeometry
              : variant === "cylinder"
                ? THREE.CylinderGeometry
                : variant === "cone"
                  ? THREE.ConeGeometry
                  : THREE.IcosahedronGeometry;

  return (
    <group scale={scale}>
      <mesh ref={meshRef}>
        <primitive
          object={new GeometryComponent(...(geometry as any))}
          attach="geometry"
        />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.8}
          envMapIntensity={1.5}
        />
      </mesh>
      <mesh ref={wireRef}>
        <primitive
          object={
            new GeometryComponent(
              ...(geometry as any).map((v: number, i: number) =>
                i === 0 ? v * 1.02 : v,
              ),
            )
          }
          attach="geometry"
        />
        <meshBasicMaterial
          color={wireColor}
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
    </group>
  );
}

/**
 * Lightweight 3D viewer for projects grid.
 * Supports custom GLB files with fallback to procedural geometries.
 * Optimized for performance with reduced detail and draw calls.
 */
export default function LightweightProjectViewer({
  modelFile,
  variant = "icosahedron",
  color = "#0a1520",
  wireColor = "#14b8a6",
  autoRotateSpeed = 0.4,
  scale = 1,
  className = "",
}: LightweightProjectViewerProps) {
  return (
    <div className={`w-full aspect-square ${className}`}>
      <Canvas
        camera={{
          position: [0, 0, 3.5],
          fov: 40,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          precision: "mediump",
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
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
              <RotatingProcedural
                variant={variant}
                color={color}
                wireColor={wireColor}
                scale={scale}
                autoRotateSpeed={autoRotateSpeed}
              />
            )}
          </Center>
        </Suspense>
      </Canvas>
    </div>
  );
}
