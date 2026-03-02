"use client";

import { useRef, useEffect, useCallback } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Custom hook for GSAP + ScrollTrigger animations.
 * Returns a ref and a contextSafe function.
 */
export function useGSAP() {
  const scope = useRef<HTMLDivElement>(null);
  const ctx = useRef<gsap.Context | null>(null);

  useEffect(() => {
    ctx.current = gsap.context(() => {}, scope);
    return () => {
      ctx.current?.revert();
    };
  }, []);

  const contextSafe = useCallback((fn: () => void) => {
    if (ctx.current) {
      ctx.current.add(fn);
    }
  }, []);

  return { scope, contextSafe, gsap, ScrollTrigger };
}
