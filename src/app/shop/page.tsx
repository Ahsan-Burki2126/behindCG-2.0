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

export default function ShopPage() {
  const gridRef = useRef<HTMLDivElement>(null);
  const content = useContent();
  const sp = content?.shopPage;
  const tagline = sp?.tagline ?? "Digital Atelier";
  const headline = sp?.headline ?? "The Shop";
  const subheadline =
    sp?.subheadline ??
    "Premium 3D assets — ready for production use in your projects";

  const products = content?.products ?? [];

  useEffect(() => {
    if (!gridRef.current || products.length === 0) return;
    const items = gridRef.current.querySelectorAll(".shop-item");

    gsap.fromTo(
      items,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
        },
      },
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [products.length]);

  return (
    <div className="min-h-screen pt-[var(--space-15)] pb-[var(--space-12)]">
      <div className="container-site">
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
            className="text-body-lg text-foreground/50 max-w-xl mx-auto"
            splitBy="words"
            scrollTrigger={false}
            delay={0.6}
          >
            {subheadline}
          </AnimatedText>
        </div>

        {/* Products */}
        {products.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-3)]">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-3)]"
          >
            {products.map((product) => (
              <Link key={product.id} href={`/shop/${product.id}`}>
                <GlassCard className="shop-item group p-0 overflow-hidden h-full">
                  <div className="aspect-square bg-white/[0.02] relative overflow-hidden">
                    <InlineModelPreview
                      modelFile={(product as any).modelFile}
                      viewerSettings={(product as any).viewerSettings}
                    />
                    <span className="absolute top-[var(--space-2)] right-[var(--space-2)] text-[10px] font-mono text-foreground/30 bg-white/5 px-3 py-1.5 rounded border border-white/10">
                      {product.format}
                    </span>
                  </div>
                  <div className="p-[var(--space-3)] border-t border-white/5">
                    <p className="font-mono text-[10px] text-foreground/30 uppercase tracking-wider mb-[var(--space-1)]">
                      {product.category} &middot; {product.polycount}
                    </p>
                    <h3 className="text-lg font-semibold mb-[var(--space-2)] group-hover:text-accent transition-colors duration-300">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-accent-secondary font-bold text-xl">
                        {product.price}
                      </p>
                      <span className="text-xs text-foreground/30 group-hover:text-accent/60 transition-colors font-mono">
                        View Details &rarr;
                      </span>
                    </div>
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
