"use client";

import dynamic from "next/dynamic";
import AnimatedText from "@/components/ui/AnimatedText";
import MagneticButton from "@/components/ui/MagneticButton";
import Link from "next/link";
import { useContent } from "@/lib/ContentContext";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="hero-canvas bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  ),
});

const DEFAULT_STATS = [
  { value: "50+", label: "Projects" },
  { value: "30+", label: "Clients" },
  { value: "8yr", label: "Experience" },
];

const DEFAULT_SECTIONS = [
  {
    tagLabel: "Philosophy",
    tagColor: "secondary",
    title: "Every Polygon Tells a Story",
    text: "From concept to photorealistic render — we obsess over every detail to deliver visuals that captivate and convert.",
    align: "right",
  },
  {
    tagLabel: "Technology",
    tagColor: "primary",
    title: "Built for the Future",
    text: "Leveraging Blender, Cycles, and EEVEE to create assets that work across film, games, AR, and the web.",
    align: "left",
  },
];

export default function HeroSection() {
  const content = useContent();
  const h = content?.hero;
  const tagline = h?.tagline ?? "3D Artist · Product Visualization · Blender";
  const headline = h?.headline ?? "Crafting Digital Realities";
  const subheadline =
    h?.subheadline ??
    "Immersive 3D product visualizations and animations that push the boundaries of digital storytelling";
  const ctaPrimary = h?.ctaPrimary ?? {
    label: "Explore Projects",
    href: "/projects",
  };
  const ctaSecondary = h?.ctaSecondary ?? {
    label: "Visit Shop",
    href: "/shop",
  };
  const stats = h?.stats ?? DEFAULT_STATS;
  const scrollSections = h?.scrollSections ?? DEFAULT_SECTIONS;

  return (
    <section className="relative min-h-[300vh]">
      {/* 3D Canvas (fixed behind content) */}
      <HeroScene />

      {/* ─── Overlay Content ─── */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container-site w-full py-[var(--space-15)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[45px] items-center">
            <div className="lg:col-span-7">
              {/* Mono tag with gradient dot */}
              <div className="flex items-center gap-3 mb-[var(--space-3)]">
                <span className="w-2 h-2 rounded-full gradient-teal-orange" />
                <p className="font-mono text-xs text-accent uppercase tracking-[0.3em] opacity-80">
                  {tagline}
                </p>
              </div>

              {/* Main headline */}
              <AnimatedText
                tag="h1"
                className="font-bold tracking-tight mb-[var(--space-3)] text-balance"
                splitBy="words"
                scrollTrigger={false}
                delay={0.8}
              >
                {headline}
              </AnimatedText>

              {/* Subheadline */}
              <AnimatedText
                tag="p"
                className="text-body-lg text-foreground/50 prose-width mb-[var(--space-5)]"
                splitBy="words"
                scrollTrigger={false}
                delay={1.4}
              >
                {subheadline}
              </AnimatedText>

              {/* CTA Buttons */}
              <div className="flex gap-[var(--space-2)] flex-wrap mb-[var(--space-10)]">
                <Link href={ctaPrimary.href}>
                  <MagneticButton>{ctaPrimary.label}</MagneticButton>
                </Link>
                <Link href={ctaSecondary.href}>
                  <MagneticButton className="bg-transparent border border-accent/30 text-foreground hover:bg-accent/5 hover:border-accent/60">
                    {ctaSecondary.label}
                  </MagneticButton>
                </Link>
              </div>

              {/* Floating stats bar */}
              <div className="flex gap-[var(--space-8)]">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl md:text-3xl font-bold text-accent">
                      {stat.value}
                    </p>
                    <p className="text-xs text-foreground/30 font-mono uppercase tracking-wider mt-[var(--space-1)]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right space for 3D model (visible through canvas) */}
            <div className="hidden lg:block lg:col-span-5" aria-hidden />
          </div>
        </div>
      </div>

      {/* ─── Scroll Indicator ─── */}
      <div className="absolute bottom-[var(--space-5)] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
        <span className="text-xs font-mono text-foreground/20 tracking-widest uppercase">
          Scroll
        </span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-accent/40 to-transparent animate-pulse" />
      </div>

      {/* ─── Scroll-driven text panels ─── */}
      {scrollSections.map((section, i) => (
        <div key={i} className="relative z-10 min-h-screen flex items-center">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-md" />
          <div className="container-site w-full py-[var(--space-12)] relative z-[1]">
            <div
              className={`max-w-lg ${section.align === "right" ? "ml-auto text-right" : ""}`}
            >
              <div
                className={`flex items-center gap-3 mb-[var(--space-2)] ${section.align === "right" ? "justify-end" : ""}`}
              >
                {section.align === "right" && (
                  <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-accent-secondary" />
                )}
                <span
                  className={`${section.tagColor === "secondary" ? "text-accent-secondary" : "text-accent"} font-mono text-xs uppercase tracking-wider`}
                >
                  {section.tagLabel}
                </span>
                {section.align === "left" && (
                  <span className="w-12 h-[1px] bg-gradient-to-r from-accent to-transparent" />
                )}
              </div>
              <AnimatedText
                tag="h2"
                className="font-bold mb-[var(--space-3)]"
                splitBy="words"
              >
                {section.title}
              </AnimatedText>
              <AnimatedText
                tag="p"
                className="text-body-lg text-foreground/50"
                splitBy="words"
              >
                {section.text}
              </AnimatedText>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
