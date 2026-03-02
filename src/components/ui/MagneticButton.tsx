"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export default function MagneticButton({
  children,
  className = "",
  onClick,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const btn = buttonRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      setTransform({ x: x * 0.3, y: y * 0.3 });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setTransform({ x: 0, y: 0 });
  }, []);

  return (
    <button
      ref={buttonRef}
      className={cn(
        "relative px-11 py-5 rounded-full font-semibold text-sm",
        "bg-accent text-background hover:bg-accent-muted",
        "active:scale-95",
        className,
      )}
      style={{
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        transition: `transform var(--duration-fast, 200ms) var(--ease-out-quart, ease-out)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      data-cursor-hover
    >
      {children}
    </button>
  );
}
