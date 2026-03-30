"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Environment,
  Center,
  ContactShadows,
  Float,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import type { ViewerSettings } from "@/lib/ContentContext";
import { VIEWER_DEFAULTS } from "./InlineModelPreview";

interface GLBModelProps {
  url: string;
  autoRotate?: boolean;
  rotateSpeed?: number;
  wireColor?: string;
  showWireframe?: boolean;
  showFloat?: boolean;
  modelPosition?: [number, number, number];
  modelRotation?: [number, number, number];
}

function GLBModel({
  url,
  autoRotate = true,
  rotateSpeed = 0.3,
  wireColor = "#14b8a6",
  showWireframe = true,
  showFloat = true,
  modelPosition = [0, 0, 0],
  modelRotation = [0, 0, 0],
}: GLBModelProps) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  const clonedScene = scene.clone(true);

  useEffect(() => {
    if (!groupRef.current) return;

    const box = new THREE.Box3().setFromObject(groupRef.current);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    if (maxDim > 0) {
      const scale = 2 / maxDim;
      groupRef.current.scale.setScalar(scale);
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
  }, [url, modelPosition, modelRotation]);

  useFrame((state) => {
    if (!groupRef.current || !autoRotate) return;
    groupRef.current.rotation.y += rotateSpeed * 0.01;
  });

  const inner = (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );

  if (!showFloat) return inner;

  return (
    <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.3}>
      {inner}
    </Float>
  );
}

interface GLBModelViewerProps {
  url: string;
  className?: string;
  autoRotate?: boolean;
  wireColor?: string;
  interactive?: boolean;
  scale?: number;
  viewerSettings?: Partial<ViewerSettings>;
}

export default function GLBModelViewer({
  url,
  className = "",
  autoRotate = true,
  wireColor = "#14b8a6",
  interactive = false,
  scale = 1,
  viewerSettings: vs,
}: GLBModelViewerProps) {
  const s = { ...VIEWER_DEFAULTS, ...vs };
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

          <Center>
            <group scale={finalScale}>
              <GLBModel
                url={url}
                autoRotate={s.autoRotate}
                rotateSpeed={s.autoRotateSpeed}
                wireColor={wireColor}
                showFloat={s.showFloat}
                modelPosition={s.modelPosition as [number, number, number]}
                modelRotation={s.modelRotation as [number, number, number]}
              />
            </group>
          </Center>

          {s.showShadows && (
            <ContactShadows
              position={[0, -1.2, 0]}
              opacity={0.3}
              blur={2}
              far={4}
            />
          )}

          {interactive && (
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              autoRotate={false}
              maxDistance={8}
              minDistance={2}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
