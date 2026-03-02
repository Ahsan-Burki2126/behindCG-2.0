"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Center,
} from "@react-three/drei";

interface ProductViewerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable 3D product previewer with orbit controls.
 * Wrap a 3D model component as children.
 */
export default function ProductViewer({
  children,
  className = "",
}: ProductViewerProps) {
  return (
    <div
      className={`w-full aspect-square rounded-2xl overflow-hidden ${className}`}
    >
      <Canvas
        camera={{ position: [0, 1.5, 3], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Environment preset="studio" />
          <Center>{children}</Center>
          <ContactShadows
            position={[0, -1, 0]}
            opacity={0.4}
            blur={2}
            far={4}
          />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
