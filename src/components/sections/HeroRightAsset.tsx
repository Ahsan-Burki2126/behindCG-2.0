"use client";

import { useRef, useEffect, useState } from "react";

export default function HeroRightAsset() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      // Update rotation based on mouse
      rotationRef.current.x +=
        (mouseRef.current.y * 0.5 - rotationRef.current.x) * 0.05;
      rotationRef.current.y +=
        (mouseRef.current.x * 0.5 - rotationRef.current.y) * 0.05;

      // Clear canvas
      ctx.fillStyle = "rgba(10, 10, 15, 0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save context
      ctx.save();

      // Translate to center
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Draw animated geometric shape
      const time = Date.now() * 0.0005;
      const scale = Math.sin(time) * 0.2 + 1;

      // Outer rotating ring with teal
      ctx.strokeStyle = "#14b8a6";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.rotate(time);
      ctx.beginPath();
      ctx.arc(0, 0, 80 * scale, 0, Math.PI * 2);
      ctx.stroke();

      // Inner rotating ring with orange (opposite direction)
      ctx.strokeStyle = "#f97316";
      ctx.globalAlpha = 0.5;
      ctx.rotate(-time * 1.5);
      ctx.beginPath();
      ctx.arc(0, 0, 60, 0, Math.PI * 2);
      ctx.stroke();

      // Animated dots arranged in a circle
      ctx.globalAlpha = 0.7;
      const dotCount = 12;
      for (let i = 0; i < dotCount; i++) {
        const angle = (i / dotCount) * Math.PI * 2 + time;
        const radius = 90;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        // Alternate colors
        ctx.fillStyle = i % 2 === 0 ? "#14b8a6" : "#f97316";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw connecting lines
        ctx.strokeStyle = i % 2 === 0 ? "#14b8a6" : "#f97316";
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 0.7;
      }

      // Center pulsing circle
      ctx.globalAlpha = 0.8;
      const centerPulse = Math.sin(time * 2) * 0.3 + 0.7;
      ctx.fillStyle = "#14b8a6";
      ctx.beginPath();
      ctx.arc(0, 0, 8 * centerPulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-96 h-96 flex items-center justify-center">
        {/* Glow effect background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent-secondary/10 rounded-full blur-3xl" />

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="relative w-full h-full cursor-pointer"
          style={{
            filter: "drop-shadow(0 0 30px rgba(20, 184, 166, 0.3))",
          }}
        />
      </div>
    </div>
  );
}
