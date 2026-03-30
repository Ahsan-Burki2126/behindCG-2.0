"use client";

import { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import AnimatedText from "@/components/ui/AnimatedText";
import GlassCard from "@/components/ui/GlassCard";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useContent } from "@/lib/ContentContext";

const LightweightProjectViewer = dynamic(
  () => import("@/components/three/LightweightProjectViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square bg-white/[0.02] animate-pulse rounded-xl" />
    ),
  },
);

export default function ProjectsPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const content = useContent();
  const previewContent = content?.projectsPreview;
  const tagline = previewContent?.tagline ?? "Selected Work";
  const headlineText = previewContent?.headline ?? "Featured Projects";

  // Use first 4 projects from API or defaults
  const projects = (content?.projects ?? []).slice(0, 4);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll(".project-card");

    gsap.fromTo(
      cards,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
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
        {/* Section Header */}
        <div className="flex items-end justify-between mb-[var(--space-8)]">
          <div>
            <div className="flex items-center gap-3 mb-[var(--space-2)]">
              <span className="w-2 h-2 rounded-full gradient-teal-orange" />
              <p className="font-mono text-xs text-accent uppercase tracking-[0.3em]">
                {tagline}
              </p>
            </div>
            <AnimatedText tag="h2" className="font-bold" splitBy="words">
              {headlineText}
            </AnimatedText>
          </div>
          <Link
            href="/projects"
            className="hidden md:flex items-center gap-2 text-sm text-foreground/50 hover:text-accent transition-colors border-b border-foreground/20 hover:border-accent/60 pb-1"
          >
            View All Projects
            <span className="text-accent-secondary">&rarr;</span>
          </Link>
        </div>

        {/* Projects Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-4)] lg:gap-[var(--space-4)]"
        >
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`}>
              <GlassCard className="project-card group p-0 overflow-hidden">
                {/* 3D Model Preview — 65% */}
                <div className="aspect-[16/10] bg-white/[0.02] overflow-hidden relative">
                  <LightweightProjectViewer
                    modelFile={(project as any).modelFile}
                    autoRotateSpeed={0.4}
                    className="!aspect-[16/10]"
                  />
                  {/* Category badge */}
                  <span className="absolute top-[var(--space-2)] left-[var(--space-2)] text-[10px] font-mono uppercase tracking-wider px-4 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                    {project.category}
                  </span>
                </div>

                {/* Info — 35% */}
                <div className="p-[var(--space-3)] border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg md:text-xl font-semibold group-hover:text-accent transition-colors duration-300">
                      {project.title}
                    </h3>
                    <span className="text-accent-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-lg">
                      &rarr;
                    </span>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-[var(--space-4)] md:hidden text-center">
          <Link
            href="/projects"
            className="text-sm text-foreground/50 hover:text-accent transition-colors border-b border-foreground/20 pb-1"
          >
            View All Projects &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
