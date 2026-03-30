"use client";

import { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import AnimatedText from "@/components/ui/AnimatedText";
import MagneticButton from "@/components/ui/MagneticButton";
import Link from "next/link";
import { useContent } from "@/lib/ContentContext";

const DEFAULT_STATS = [
  { value: "50+", label: "Projects Delivered", color: "teal" },
  { value: "8+", label: "Years Experience", color: "orange" },
  { value: "30+", label: "Happy Clients", color: "teal" },
  { value: "4K+", label: "Renders Created", color: "orange" },
];

export default function AboutPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const content = useContent();
  const ap = content?.aboutPreview;
  const tagline = ap?.tagline ?? "About the Artist";
  const headline = ap?.headline ?? "Where Art Meets Technology";
  const description =
    ap?.description ??
    "Specializing in photorealistic product visualization and cinematic animation using Blender. Every project is a meticulous blend of artistic vision and technical precision.";
  const ctaLabel = ap?.ctaLabel ?? "Read Full Story";
  const stats = ap?.stats ?? DEFAULT_STATS;

  useEffect(() => {
    if (!sectionRef.current) return;

    const stats = sectionRef.current.querySelectorAll(".stat-item");

    gsap.fromTo(
      stats,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      },
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === sectionRef.current) st.kill();
      });
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 section-padding">
      <div className="container-site">
        {/* Divider */}
        <div className="divider mb-[var(--space-15)]" />
 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-8)] lg:gap-[var(--space-12)] items-center">
          {/* Left — Text */}
          <div>
            <div className="flex items-center gap-3 mb-[var(--space-2)]">
              <span className="w-2 h-2 rounded-full gradient-teal-orange" />
              <p className="font-mono text-xs text-accent uppercase tracking-[0.3em]">
                {tagline}
              </p>
            </div>
            <AnimatedText
              tag="h2"
              className="font-bold mb-[var(--space-3)]"
              splitBy="words"
            >
              {headline}
            </AnimatedText>
            <AnimatedText
              tag="p"
              className="text-body-lg text-foreground/50 prose-width mb-[var(--space-4)]"
              splitBy="words"
            >
              {description}
            </AnimatedText>
            <Link href="/about">
              <MagneticButton className="bg-transparent border border-accent/30 text-foreground hover:bg-accent/5 hover:border-accent/60">
                {ctaLabel} &rarr;
              </MagneticButton>
            </Link>
          </div>

          {/* Right — Stats */}
          <div className="grid grid-cols-2 gap-[var(--space-2)]">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="stat-item glass p-[var(--space-3)] text-center glow-teal"
              >
                <p
                  className={`text-3xl md:text-4xl font-bold ${stat.color === "orange" ? "text-accent-secondary" : "text-accent"} mb-[var(--space-1)]`}
                >
                  {stat.value}
                </p>
                <p className="text-sm text-foreground/40 font-mono">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
