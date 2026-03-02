"use client";

import { Environment } from "@react-three/drei";

interface SceneEnvironmentProps {
  preset?: string;
  ambientIntensity?: number;
  directionalIntensity?: number;
}

export default function SceneEnvironment({
  preset = "city",
  ambientIntensity = 0.15,
  directionalIntensity = 1.5,
}: SceneEnvironmentProps) {
  return (
    <>
      {/* Ambient fill */}
      <ambientLight intensity={ambientIntensity} />

      {/* Key light — teal accent */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={directionalIntensity}
        color="#14b8a6"
        castShadow={false}
      />

      {/* Rim light — warm orange back-light */}
      <directionalLight
        position={[-5, 3, -5]}
        intensity={directionalIntensity * 0.53}
        color="#f97316"
      />

      {/* Bottom fill — deep teal */}
      <pointLight position={[0, -5, 0]} intensity={0.3} color="#0d9488" />

      {/* HDR environment for realistic reflections */}
      <Environment preset={preset as any} />
    </>
  );
}
