"use client";

import { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import AnimatedText from "@/components/ui/AnimatedText";
import GlassCard from "@/components/ui/GlassCard";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useContent } from "@/lib/ContentContext";

const InlineModelPreview = dynamic(
  () => import("@/components/three/InlineModelPreview"),
  { ssr: false },
);

export default function ProjectsPage() {
  const gridRef = useRef<HTMLDivElement>(null);
  const content = useContent();
  const pp = content?.projectsPage;
  const tagline = pp?.tagline ?? "Portfolio";
  const headline = pp?.headline ?? "All Projects";
  const subheadline =
    pp?.subheadline ??
    "A curated collection of 3D visualizations, animations, and interactive experiences";

  const projects = content?.projects ?? [];

  useEffect(() => {
    if (!gridRef.current || projects.length === 0) return;

    const cards = gridRef.current.querySelectorAll(".project-card");

    gsap.fromTo(
      cards,
      { y: 80, opacity: 0, scale: 0.96 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 80%",
        },
      },
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [projects.length]);

  return (
    <div className="min-h-screen pt-[var(--space-15)] pb-[var(--space-12)]">
      <div className="container-site">
        {/* Header */}
        <div className="mb-[var(--space-8)]">
          <div className="flex items-center gap-3 mb-[var(--space-2)]">
            <span className="w-2 h-2 rounded-full gradient-teal-orange" />
            <p className="font-mono text-xs text-accent uppercase tracking-[0.3em]">
              {tagline}
            </p>
          </div>
          <AnimatedText
            tag="h1"
            className="font-bold mb-[var(--space-2)]"
            splitBy="words"
            scrollTrigger={false}
            delay={0.3}
          >
            {headline}
          </AnimatedText>
          <AnimatedText
            tag="p"
            className="text-body-lg text-foreground/50 prose-width"
            splitBy="words"
            scrollTrigger={false}
            delay={0.6}
          >
            {subheadline}
          </AnimatedText>
        </div>

        {/* Grid */}
        {projects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-3)]">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-3)]"
          >
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.slug}`}>
                <GlassCard className="project-card group p-0 overflow-hidden h-full">
                  <div className="aspect-[4/3] bg-white/[0.02] relative overflow-hidden">
                    <InlineModelPreview
                      modelFile={(project as any).modelFile}
                      viewerSettings={(project as any).viewerSettings}
                      className="!aspect-[4/3]"
                    />
                    <span className="absolute top-[var(--space-2)] left-[var(--space-2)] text-[10px] font-mono uppercase tracking-wider px-4 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      {project.category}
                    </span>
                  </div>
                  <div className="p-[var(--space-3)] border-t border-white/5">
                    <h3 className="text-lg font-semibold mb-[var(--space-1)] group-hover:text-accent transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="text-sm text-foreground/40 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
