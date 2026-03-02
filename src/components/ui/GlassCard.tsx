"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  tilt?: boolean;
  style?: React.CSSProperties;
}

export default function GlassCard({
  children,
  className = "",
  hover = true,
  tilt = true,
  style: externalStyle,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tilt || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 8; // max 4deg
      const rotateY = (x - 0.5) * 8;
      setTiltStyle({
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`,
        transition: "transform 0.15s ease-out",
      });
    },
    [tilt],
  );

  const handleMouseLeave = useCallback(() => {
    setTiltStyle({
      transform:
        "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)",
      transition:
        "transform 0.4s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1))",
    });
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn("glass card-elevated", hover && "glass-hover", className)}
      style={tilt ? { ...externalStyle, ...tiltStyle } : externalStyle}
      onMouseMove={tilt ? handleMouseMove : undefined}
      onMouseLeave={tilt ? handleMouseLeave : undefined}
    >
      {children}
    </div>
  );
}
