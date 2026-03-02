"use client";

import { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface AnimatedTextProps {
  children: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  splitBy?: "chars" | "words" | "lines";
  delay?: number;
  scrollTrigger?: boolean;
}

export default function AnimatedText({
  children,
  tag: Tag = "h2",
  className = "",
  splitBy = "words",
  delay = 0,
  scrollTrigger = true,
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const text = children;
    let elements: string[] = [];

    if (splitBy === "chars") {
      elements = text.split("");
    } else if (splitBy === "words") {
      elements = text.split(" ");
    } else {
      elements = [text];
    }

    // Build HTML with spans
    container.innerHTML = elements
      .map(
        (el, i) =>
          `<span class="inline-block overflow-hidden"><span class="animated-text-inner inline-block" style="transform: translateY(100%); opacity: 0">${el}${
            splitBy === "words" && i < elements.length - 1 ? "&nbsp;" : ""
          }</span></span>`,
      )
      .join("");

    const inners = container.querySelectorAll(".animated-text-inner");

    const animConfig: gsap.TweenVars = {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: splitBy === "chars" ? 0.02 : 0.06,
      ease: "power3.out",
      delay,
    };

    if (scrollTrigger) {
      gsap.to(inners, {
        ...animConfig,
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    } else {
      gsap.to(inners, animConfig);
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === container) st.kill();
      });
    };
  }, [children, splitBy, delay, scrollTrigger]);

  return <Tag ref={containerRef as any} className={className} />;
}
