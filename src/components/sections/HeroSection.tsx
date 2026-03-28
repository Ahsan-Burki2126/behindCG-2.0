"use client";

import AnimatedText from "@/components/ui/AnimatedText";
import MagneticButton from "@/components/ui/MagneticButton";
import Link from "next/link";
import { useContent } from "@/lib/ContentContext";

const DEFAULT_STATS = [
  { value: "50+", label: "Projects" },
  { value: "30+", label: "Clients" },
  { value: "8yr", label: "Experience" },
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

  return (
    <section className="relative min-h-screen">
      {/* ─── Overlay Content ─── */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="container-site w-full py-[var(--space-15)]">
          <div className="max-w-2xl mx-auto text-center">
            <div>
              {/* Mono tag with gradient dot */}
              <div className="flex items-center justify-center gap-3 mb-[var(--space-3)]">
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
              <div className="flex gap-[var(--space-2)] flex-wrap mb-[var(--space-10)] justify-center">
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
              <div className="flex gap-[var(--space-8)] justify-center">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
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
          </div>
        </div>
      </div>
    </section>
  );
}
