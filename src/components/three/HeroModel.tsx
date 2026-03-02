"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

interface HeroModelConfig {
  modelFile?: string;
  solidColor?: string;
  wireColor?: string;
  particleColor?: string;
  particleCount?: number;
  viewerSettings?: {
    modelScale?: number;
    modelPosition?: [number, number, number];
    modelRotation?: [number, number, number];
    autoRotateSpeed?: number;
    cameraPosition?: [number, number, number];
    cameraFov?: number;
    environmentPreset?: string;
    ambientIntensity?: number;
    directionalIntensity?: number;
  };
}

interface HeroModelProps {
  scrollProgress: React.MutableRefObject<number>;
  mousePosition: React.MutableRefObject<{ x: number; y: number }>;
  config?: HeroModelConfig;
}

/* ── GLB Hero Model sub-component ── */
function GLBHeroMesh({
  url,
  scrollProgress,
  mousePosition,
  baseScale = 3,
}: {
  url: string;
  scrollProgress: React.MutableRefObject<number>;
  mousePosition: React.MutableRefObject<{ x: number; y: number }>;
  baseScale?: number;
}) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const s = baseScale / maxDim;
      groupRef.current.scale.setScalar(s);
    }
    const center = box.getCenter(new THREE.Vector3());
    groupRef.current.position.sub(
      center.multiplyScalar(groupRef.current.scale.x),
    );
  }, [url]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const scroll = scrollProgress.current;
    const mouse = mousePosition.current;

    groupRef.current.rotation.x = t * 0.1 + scroll * Math.PI * 2;
    groupRef.current.rotation.y = t * 0.15 + scroll * Math.PI;

    const targetRotZ = mouse.x * 0.2;
    groupRef.current.rotation.z +=
      (targetRotZ - groupRef.current.rotation.z) * 0.05;

    const scaleBase = 1 + Math.sin(scroll * Math.PI) * 0.3;
    const targetScale = Math.max(0.6, scaleBase - scroll * 0.4);
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.05,
    );

    groupRef.current.position.y = -scroll * 3;
    groupRef.current.position.x = Math.sin(scroll * Math.PI * 2) * 1.5;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene.clone(true)} />
    </group>
  );
}

/**
 * Hero 3D model — supports both procedural icosahedron and uploaded .glb.
 * Colors, particles, and model file are configurable from admin.
 */
export default function HeroModel({
  scrollProgress,
  mousePosition,
  config,
}: HeroModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const solidColor = config?.solidColor || "#0a1520";
  const wireColor = config?.wireColor || "#14b8a6";
  const particleColor = config?.particleColor || "#f97316";
  const particleCount = config?.particleCount ?? 500;
  const modelFile = config?.modelFile || "";
  const heroBaseScale = config?.viewerSettings?.modelScale ?? 3;

  // Generate floating particles
  const particlePositions = useMemo(() => {
    const count = Math.max(0, Math.min(particleCount, 2000));
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, [particleCount]);

  useFrame((state, delta) => {
    if (modelFile) {
      // GLB mode — only animate particles
      if (particlesRef.current) {
        const t = state.clock.elapsedTime;
        const scroll = scrollProgress.current;
        particlesRef.current.rotation.y = t * 0.02;
        particlesRef.current.rotation.x = t * 0.01;
        particlesRef.current.position.y = -scroll * 2;
      }
      return;
    }

    if (!meshRef.current || !wireRef.current) return;

    const t = state.clock.elapsedTime;
    const scroll = scrollProgress.current;
    const mouse = mousePosition.current;

    // ─── Base rotation ───
    meshRef.current.rotation.x = t * 0.1 + scroll * Math.PI * 2;
    meshRef.current.rotation.y = t * 0.15 + scroll * Math.PI;
    wireRef.current.rotation.x = meshRef.current.rotation.x;
    wireRef.current.rotation.y = meshRef.current.rotation.y;

    // ─── Mouse-driven tilt ───
    const targetRotZ = mouse.x * 0.2;
    meshRef.current.rotation.z +=
      (targetRotZ - meshRef.current.rotation.z) * 0.05;
    wireRef.current.rotation.z = meshRef.current.rotation.z;

    // ─── Scroll-driven scale (explode/collapse) ───
    const scaleBase = 1 + Math.sin(scroll * Math.PI) * 0.3;
    const targetScale = Math.max(0.6, scaleBase - scroll * 0.4);
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.05,
    );
    wireRef.current.scale.copy(meshRef.current.scale);

    // ─── Scroll-driven position (camera fly-through feel) ───
    meshRef.current.position.y = -scroll * 3;
    meshRef.current.position.x = Math.sin(scroll * Math.PI * 2) * 1.5;
    wireRef.current.position.copy(meshRef.current.position);

    // ─── Particles ───
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.02;
      particlesRef.current.rotation.x = t * 0.01;
      particlesRef.current.position.y = -scroll * 2;
    }
  });

  return (
    <group>
      {modelFile ? (
        /* Custom GLB model */
        <GLBHeroMesh
          url={modelFile}
          scrollProgress={scrollProgress}
          mousePosition={mousePosition}
          baseScale={heroBaseScale}
        />
      ) : (
        <>
          {/* Default procedural icosahedron */}
          <mesh ref={meshRef}>
            <icosahedronGeometry args={[1.5, 1]} />
            <meshStandardMaterial
              color={solidColor}
              roughness={0.1}
              metalness={0.95}
              envMapIntensity={2.5}
            />
          </mesh>

          {/* Wireframe overlay */}
          <mesh ref={wireRef}>
            <icosahedronGeometry args={[1.52, 1]} />
            <meshBasicMaterial
              color={wireColor}
              wireframe
              transparent
              opacity={0.12}
            />
          </mesh>
        </>
      )}

      {/* Floating particles */}
      {particleCount > 0 && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particlePositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color={particleColor}
            size={0.025}
            transparent
            opacity={0.5}
            sizeAttenuation
          />
        </points>
      )}
    </group>
  );
}
