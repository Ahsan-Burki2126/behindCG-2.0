"use client";

import { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import AnimatedText from "@/components/ui/AnimatedText";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import Link from "next/link";
import { useContent } from "@/lib/ContentContext";

const DEFAULT_SKILLS = [
  { name: "Blender", level: 95, color: "teal" },
  { name: "Cycles / EEVEE", level: 90, color: "teal" },
  { name: "Substance Painter", level: 85, color: "orange" },
  { name: "Three.js / R3F", level: 80, color: "orange" },
  { name: "After Effects", level: 75, color: "teal" },
  { name: "Unreal Engine", level: 70, color: "teal" },
];

const DEFAULT_TIMELINE = [
  {
    year: "2025",
    title: "Launched Digital Atelier",
    description: "Started selling premium 3D assets and shader packs online.",
    color: "teal",
  },
  {
    year: "2023",
    title: "Studio Partnership",
    description:
      "Collaborated with top advertising studios for photorealistic product campaigns.",
    color: "orange",
  },
  {
    year: "2021",
    title: "Went Freelance",
    description:
      "Transitioned to full-time freelance 3D artist, focusing on product visualization.",
    color: "teal",
  },
  {
    year: "2018",
    title: "First Blender Project",
    description:
      "Discovered Blender and fell in love with the open-source 3D pipeline.",
    color: "orange",
  },
];

export default function AboutPage() {
  const skillsRef = useRef<HTMLDivElement>(null);
  const content = useContent();
  const a = content?.about;
  const tagline = a?.tagline ?? "About";
  const headline = a?.headline ?? "The Story Behind the Pixels";
  const description =
    a?.description ??
    "A passionate 3D artist turning imagination into photorealistic reality. Specializing in product visualization, motion design, and interactive web experiences.";
  const vision = a?.vision ?? {
    title: "Vision",
    text: "Every render should evoke emotion. I believe 3D visualization is not just about accuracy — it's about telling a story that connects the viewer to the product on a deeper level.",
  };
  const approach = a?.approach ?? {
    title: "Approach",
    text: "Meticulous attention to material physics, lighting dynamics, and compositional rhythm. Every project is a collaboration — your vision amplified through technical mastery.",
  };
  const skills = a?.skills ?? DEFAULT_SKILLS;
  const timeline = a?.timeline ?? DEFAULT_TIMELINE;
  const ctaHeadline = a?.ctaHeadline ?? "Let's Create Something Extraordinary";

  useEffect(() => {
    if (!skillsRef.current) return;

    const bars = skillsRef.current.querySelectorAll(".skill-bar-fill");

    gsap.fromTo(
      bars,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: skillsRef.current,
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
      <div
        className="container-site"
        style={{ maxWidth: "var(--content-max)" }}
      >
        {/* Header */}
        <div className="mb-[var(--space-10)]">
          <div className="flex items-center gap-3 mb-[var(--space-2)]">
            <span className="w-2 h-2 rounded-full gradient-teal-orange" />
            <p className="font-mono text-xs text-accent uppercase tracking-[0.3em]">
              {tagline}
            </p>
          </div>
          <AnimatedText
            tag="h1"
            className="font-bold mb-[var(--space-3)]"
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
            delay={0.7}
          >
            {description}
          </AnimatedText>
        </div>

        {/* Philosophy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-4)] mb-[var(--space-12)]">
          <GlassCard className="p-[var(--space-4)] glow-teal">
            <h3 className="font-bold mb-[var(--space-2)] text-accent">
              {vision.title}
            </h3>
            <p className="text-foreground/50 leading-relaxed">{vision.text}</p>
          </GlassCard>
          <GlassCard className="p-[var(--space-4)] glow-orange">
            <h3 className="font-bold mb-[var(--space-2)] text-accent-secondary">
              {approach.title}
            </h3>
            <p className="text-foreground/50 leading-relaxed">
              {approach.text}
            </p>
          </GlassCard>
        </div>

        {/* Skills — two-column layout */}
        <div
          ref={skillsRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-6)] mb-[var(--space-12)]"
        >
          <div className="lg:col-span-4">
            <AnimatedText
              tag="h2"
              className="font-bold mb-[var(--space-2)]"
              splitBy="words"
            >
              Technical Skills
            </AnimatedText>
            <p className="text-sm text-foreground/40">
              Proficiency levels based on real-world project usage.
            </p>
          </div>
          <div className="lg:col-span-8 space-y-[var(--space-3)]">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between mb-[8px]">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <span className="text-sm text-foreground/30 font-mono">
                    {skill.level}%
                  </span>
                </div>
                <div className="w-full h-[6px] bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`skill-bar-fill h-full ${skill.color === "orange" ? "bg-accent-secondary" : "bg-accent"} rounded-full origin-left`}
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-[var(--space-12)]">
          <AnimatedText
            tag="h2"
            className="font-bold mb-[var(--space-6)]"
            splitBy="words"
          >
            Journey
          </AnimatedText>
          <div className="space-y-[var(--space-4)]">
            {timeline.map((item) => (
              <div
                key={item.year}
                className="flex gap-[var(--space-4)] items-start group"
              >
                <div className="flex-shrink-0 w-16">
                  <span
                    className={`${item.color === "orange" ? "text-accent-secondary" : "text-accent"} font-mono text-sm font-bold`}
                  >
                    {item.year}
                  </span>
                </div>
                <div className="flex-1 pb-[var(--space-4)] border-l border-white/10 pl-[var(--space-3)] relative">
                  <div
                    className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${item.color === "orange" ? "bg-accent-secondary" : "bg-accent"}/50`}
                  />
                  <h3 className="text-lg font-semibold mb-[var(--space-1)]">
                    {item.title}
                  </h3>
                  <p className="text-foreground/40 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center glass p-[var(--space-8)] rounded-2xl glow-teal">
          <AnimatedText
            tag="h2"
            className="font-bold mb-[var(--space-4)]"
            splitBy="words"
          >
            {ctaHeadline}
          </AnimatedText>
          <div className="flex gap-[var(--space-2)] justify-center flex-wrap">
            <Link href="/contact">
              <MagneticButton>Get in Touch</MagneticButton>
            </Link>
            <Link href="/projects">
              <MagneticButton className="bg-accent-secondary text-white hover:bg-accent-secondary-muted">
                View Projects
              </MagneticButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
