"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Only mounts children (a WebGL Canvas) once the element scrolls into view.
 * Once mounted it stays mounted to avoid re-loading the model.
 * This prevents opening too many simultaneous WebGL contexts on grid pages.
 */
export default function InViewCanvas({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "150px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`w-full h-full ${className}`}>
      {mounted ? (
        children
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border border-white/10 border-t-[#14b8a6] animate-spin" />
        </div>
      )}
    </div>
  );
}
