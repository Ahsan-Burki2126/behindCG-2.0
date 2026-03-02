"use client";

import { useRef, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import HeroModel from "./HeroModel";
import SceneEnvironment from "./SceneEnvironment";
import { useContent } from "@/lib/ContentContext";

export default function HeroScene() {
  const scrollProgress = useRef(0);
  const mousePosition = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const content = useContent();

  // Extract hero model config from content
  const heroModelConfig = (content?.hero as any)?.heroModel || undefined;
  const vs = heroModelConfig?.viewerSettings || {};

  const cameraPos = vs.cameraPosition || [0, 0, 5];
  const cameraFov = vs.cameraFov ?? 45;
  const envPreset = vs.environmentPreset || "city";
  const ambientInt = vs.ambientIntensity ?? 0.15;
  const directionalInt = vs.directionalIntensity ?? 1.5;

  // Track scroll progress (0 → 1 over the hero section)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.current = Math.min(scrollY / Math.max(docHeight, 1), 1);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track mouse for parallax
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePosition.current = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
    };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div ref={containerRef} className="hero-canvas interactive">
      <Canvas
        camera={{
          position: cameraPos as [number, number, number],
          fov: cameraFov,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <SceneEnvironment
          preset={envPreset}
          ambientIntensity={ambientInt}
          directionalIntensity={directionalInt}
        />
        <HeroModel
          scrollProgress={scrollProgress}
          mousePosition={mousePosition}
          config={heroModelConfig}
        />
        <Preload all />
      </Canvas>
    </div>
  );
}
