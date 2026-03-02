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
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[4/3] bg-white/[0.02] animate-pulse rounded-xl" />
    ),
  },
);

const DEFAULT_PROJECTS = [
  {
    id: 1,
    title: "Crystal Gemstone Collection",
    category: "Product Viz",
    description:
      "Photorealistic gemstone renders with caustic light simulation and precise facet geometry.",
    slug: "crystal-gemstone",
    model: {
      variant: "icosahedron",
      color: "#0a2020",
      wireColor: "#14b8a6",
      distort: true,
    },
  },
  {
    id: 2,
    title: "Abstract Torus Sculpture",
    category: "Motion Design",
    description:
      "Cinematic abstract sculpture animation with dynamic lighting and volumetric fog.",
    slug: "abstract-torus",
    model: { variant: "torus", color: "#1a0a0a", wireColor: "#f97316" },
  },
  {
    id: 3,
    title: "Geometric Pendant Light",
    category: "Product Viz",
    description:
      "Photorealistic pendant lamp render with accurate glass refraction and metal finishes.",
    slug: "geometric-pendant",
    model: { variant: "dodecahedron", color: "#0a1520", wireColor: "#14b8a6" },
  },
  {
    id: 4,
    title: "Sci-Fi Artifact Render",
    category: "Concept Art",
    description:
      "Futuristic artifact concept with procedural textures and holographic material shaders.",
    slug: "scifi-artifact",
    model: {
      variant: "octahedron",
      color: "#150a1a",
      wireColor: "#f97316",
      wobble: true,
    },
  },
  {
    id: 5,
    title: "Twisted Knot Installation",
    category: "Art Installation",
    description:
      "Mathematical torus knot sculpture for a virtual art gallery with iridescent materials.",
    slug: "twisted-knot",
    model: { variant: "torusKnot", color: "#0a1a15", wireColor: "#14b8a6" },
  },
  {
    id: 6,
    title: "Prismatic Cone Array",
    category: "Generative Art",
    description:
      "Generative cone formations with dynamic color shifts and procedural displacement.",
    slug: "prismatic-cone",
    model: {
      variant: "cone",
      color: "#1a1005",
      wireColor: "#f97316",
      wobble: true,
    },
  },
];

const DEFAULT_FILTERS = [
  "All",
  "Product Viz",
  "Motion Design",
  "Concept Art",
  "Generative",
];

export default function ProjectsPage() {
  const gridRef = useRef<HTMLDivElement>(null);
  const content = useContent();
  const pp = content?.projectsPage;
  const tagline = pp?.tagline ?? "Portfolio";
  const headline = pp?.headline ?? "All Projects";
  const subheadline =
    pp?.subheadline ??
    "A curated collection of 3D visualizations, animations, and interactive experiences";
  const filters = pp?.filterCategories ?? DEFAULT_FILTERS;
  const projects = content?.projects ?? DEFAULT_PROJECTS;

  useEffect(() => {
    if (!gridRef.current) return;

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
  }, []);

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

        {/* Filter pills */}
        <div className="flex flex-wrap gap-[var(--space-1)] mb-[var(--space-6)]">
          {filters.map((cat) => (
            <button
              key={cat}
              className="text-sm px-7 py-3 rounded-full glass glass-hover text-foreground/60 hover:text-accent hover:border-accent/30 transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-3)]"
        >
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`}>
              <GlassCard className="project-card group p-0 overflow-hidden h-full">
                {/* 3D Preview */}
                <div className="aspect-[4/3] bg-white/[0.02] relative overflow-hidden">
                  <InlineModelPreview
                    variant={project.model.variant as any}
                    color={project.model.color}
                    wireColor={project.model.wireColor}
                    distort={project.model.distort}
                    wobble={project.model.wobble}
                    modelFile={(project as any).modelFile}
                    viewerSettings={(project as any).viewerSettings}
                    className="!aspect-[4/3]"
                    scale={0.65}
                  />
                  {/* Category badge */}
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
      </div>
    </div>
  );
}
