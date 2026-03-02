"use client";

import { useRef, useEffect, useState, use } from "react";
import { gsap } from "@/lib/gsap";
import AnimatedText from "@/components/ui/AnimatedText";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useContent, type ProjectData } from "@/lib/ContentContext";

const InlineModelPreview = dynamic(
  () => import("@/components/three/InlineModelPreview"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-video bg-white/[0.02] animate-pulse rounded-2xl" />
    ),
  },
);

// Fallback project
const FALLBACK: ProjectData = {
  id: 0,
  title: "Project",
  category: "Product Viz",
  year: "2025",
  client: "Client",
  description: "Project description.",
  slug: "project",
  longDescription: "",
  tools: ["Blender"],
  breakdown: ["Modeling"],
  model: {
    variant: "icosahedron",
    color: "#0a2020",
    wireColor: "#14b8a6",
    distort: true,
  },
};

export default function ProjectCaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { slug } = use(params);
  const content = useContent();

  // Find project by slug from context
  const project = content?.projects?.find((p) => p.slug === slug) ?? FALLBACK;

  useEffect(() => {
    if (!contentRef.current) return;
    const elements = contentRef.current.querySelectorAll(".fade-in");
    gsap.fromTo(
      elements,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.3,
      },
    );
  }, []);

  return (
    <div
      ref={contentRef}
      className="min-h-screen pt-[var(--space-15)] pb-[var(--space-12)]"
    >
      <div
        className="container-site"
        style={{ maxWidth: "var(--content-max)" }}
      >
        {/* Back link */}
        <Link
          href="/projects"
          className="fade-in inline-flex items-center gap-2 text-sm text-foreground/40 hover:text-accent transition-colors mb-[var(--space-6)] group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">
            &larr;
          </span>{" "}
          Back to Projects
        </Link>

        {/* Header */}
        <div className="fade-in mb-[var(--space-2)]">
          <div className="flex items-center gap-3 mb-[var(--space-2)]">
            <span className="w-2 h-2 rounded-full gradient-teal-orange" />
            <p className="font-mono text-xs text-accent uppercase tracking-[0.3em]">
              {project.category} &middot; {project.year}
            </p>
          </div>
        </div>
        <AnimatedText
          tag="h1"
          className="font-bold mb-[var(--space-4)]"
          splitBy="words"
          scrollTrigger={false}
          delay={0.4}
        >
          {project.title}
        </AnimatedText>

        {/* 3D Hero Preview */}
        <div className="fade-in aspect-video rounded-2xl mb-[var(--space-8)] overflow-hidden border border-white/5 glow-teal">
          <InlineModelPreview
            variant={project.model.variant as any}
            color={project.model.color}
            wireColor={project.model.wireColor}
            distort={project.model.distort}
            wobble={project.model.wobble}
            modelFile={project.modelFile}
            viewerSettings={(project as any).viewerSettings}
            className="!aspect-video"
            scale={1.2}
          />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-3)] mb-[var(--space-8)]">
          <GlassCard className="fade-in p-[var(--space-3)]">
            <p className="text-xs text-foreground/30 font-mono uppercase tracking-wider mb-[var(--space-1)]">
              Client
            </p>
            <p className="text-lg font-semibold">{project.client}</p>
          </GlassCard>
          <GlassCard className="fade-in p-[var(--space-3)]">
            <p className="text-xs text-foreground/30 font-mono uppercase tracking-wider mb-[var(--space-1)]">
              Tools
            </p>
            <div className="flex flex-wrap gap-[8px]">
              {project.tools.map((tool) => (
                <span
                  key={tool}
                  className="text-xs px-4 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20"
                >
                  {tool}
                </span>
              ))}
            </div>
          </GlassCard>
          <GlassCard className="fade-in p-[var(--space-3)]">
            <p className="text-xs text-foreground/30 font-mono uppercase tracking-wider mb-[var(--space-1)]">
              Process
            </p>
            <div className="flex flex-wrap gap-[8px]">
              {project.breakdown.map((step) => (
                <span
                  key={step}
                  className="text-xs px-4 py-1.5 rounded-full bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20"
                >
                  {step}
                </span>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Description */}
        <div className="fade-in max-w-3xl mb-[var(--space-8)]">
          <AnimatedText
            tag="h2"
            className="font-bold mb-[var(--space-3)]"
            splitBy="words"
          >
            Project Overview
          </AnimatedText>
          <p className="text-body-lg text-foreground/50 leading-relaxed">
            {project.longDescription || project.description}
          </p>
        </div>

        {/* Gallery — 3D Model Variants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-3)] mb-[var(--space-8)]">
          {[
            {
              variant: "sphere" as const,
              label: "Alternate View A",
              color: "#0a1a18",
              wireColor: "#14b8a6",
            },
            {
              variant: "octahedron" as const,
              label: "Alternate View B",
              color: "#150f0a",
              wireColor: "#f97316",
            },
            {
              variant: "torusKnot" as const,
              label: "Detail Study",
              color: "#0a0f15",
              wireColor: "#14b8a6",
            },
            {
              variant: "dodecahedron" as const,
              label: "Material Exploration",
              color: "#1a0a10",
              wireColor: "#f97316",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="fade-in aspect-[4/3] bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden relative"
            >
              <InlineModelPreview
                variant={item.variant}
                color={item.color}
                wireColor={item.wireColor}
                className="!aspect-[4/3]"
                scale={0.6}
              />
              <span className="absolute bottom-[var(--space-2)] left-[var(--space-2)] text-xs font-mono text-foreground/30">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="fade-in text-center">
          <Link href="/contact">
            <MagneticButton>Start a Project Like This</MagneticButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
