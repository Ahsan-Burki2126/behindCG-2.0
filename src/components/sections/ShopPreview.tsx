"use client";

import { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import AnimatedText from "@/components/ui/AnimatedText";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useContent } from "@/lib/ContentContext";

const InlineModelPreview = dynamic(
  () => import("@/components/three/InlineModelPreview"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square bg-white/[0.02] animate-pulse rounded-xl" />
    ),
  },
);

export default function ShopPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const content = useContent();
  const sp = content?.shopPreview;
  const tagline = sp?.tagline ?? "Digital Atelier";
  const headlineText = sp?.headline ?? "Premium 3D Assets";
  const subheadline =
    sp?.subheadline ??
    "Production-ready models, shaders, and textures for your next project";

  // Use first 3 products from API or defaults
  const products = (content?.products ?? []).slice(0, 3);

  useEffect(() => {
    if (!sectionRef.current) return;

    const items = sectionRef.current.querySelectorAll(".shop-item");

    gsap.fromTo(
      items,
      { y: 80, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.7,
        stagger: 0.12,
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

        {/* Header */}
        <div className="text-center mb-[var(--space-8)]">
          <div className="flex items-center justify-center gap-3 mb-[var(--space-2)]">
            <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-accent-secondary" />
            <p className="font-mono text-xs text-accent-secondary uppercase tracking-[0.3em]">
              {tagline}
            </p>
            <span className="w-8 h-[1px] bg-gradient-to-r from-accent-secondary to-transparent" />
          </div>
          <AnimatedText
            tag="h2"
            className="font-bold mb-[var(--space-3)]"
            splitBy="words"
          >
            {headlineText}
          </AnimatedText>
          <AnimatedText
            tag="p"
            className="text-body-lg text-foreground/50 max-w-xl mx-auto"
            splitBy="words"
          >
            {subheadline}
          </AnimatedText>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-3)] lg:gap-[var(--space-4)]">
          {products.map((product) => (
            <Link key={product.id} href={`/shop/${product.id}`}>
              <GlassCard className="shop-item group p-0 overflow-hidden">
                {/* 3D Product Preview */}
                <div className="aspect-square bg-white/[0.02] relative overflow-hidden">
                  <InlineModelPreview
                    modelFile={(product as any).modelFile}
                    viewerSettings={(product as any).viewerSettings}
                  />
                </div>

                <div className="p-[var(--space-3)] border-t border-white/5">
                  <p className="font-mono text-[10px] text-foreground/30 uppercase tracking-wider mb-[var(--space-1)]">
                    {product.category}
                  </p>
                  <h3 className="text-lg font-semibold mb-[var(--space-2)] group-hover:text-accent transition-colors duration-300">
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-accent-secondary font-bold text-xl">
                      {product.price}
                    </p>
                    <span className="text-xs text-foreground/20 group-hover:text-accent/60 transition-colors font-mono">
                      View &rarr;
                    </span>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-[var(--space-8)] text-center">
          <Link href="/shop">
            <MagneticButton className="bg-accent-secondary text-white hover:bg-accent-secondary-muted">
              Browse All Assets
            </MagneticButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
