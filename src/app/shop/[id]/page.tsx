"use client";

import { useRef, useEffect, use } from "react";
import { gsap } from "@/lib/gsap";
import AnimatedText from "@/components/ui/AnimatedText";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useContent, type ProductData } from "@/lib/ContentContext";

const InlineModelPreview = dynamic(
  () => import("@/components/three/InlineModelPreview"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square bg-white/[0.02] animate-pulse rounded-2xl" />
    ),
  },
);

const FALLBACK_PRODUCT: ProductData = {
  id: "1",
  title: "Crystal Sphere Pack",
  price: "29",
  priceValue: 29,
  category: "Environment",
  format: "GLB / FBX",
  polycount: "12.4k tris",
  description:
    "A collection of beautifully crafted crystal sphere 3D models with procedural materials, subsurface scattering, and caustic-ready geometry.",
  model: {
    variant: "sphere",
    color: "#0a1a1a",
    wireColor: "#14b8a6",
    distort: true,
  },
  specs: [
    ["Polycount", "12,400 tris"],
    ["Formats", "GLB / FBX / BLEND"],
    ["Textures", "4K PBR (5 maps)"],
    ["UV Mapped", "Yes"],
    ["Rigged", "No"],
    ["License", "Commercial"],
  ],
};

export default function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const content = useContent();
  const product =
    content?.products?.find((p) => p.id === id) ?? FALLBACK_PRODUCT;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const els = contentRef.current.querySelectorAll(".fade-in");
    gsap.fromTo(
      els,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2,
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
        <Link
          href="/shop"
          className="fade-in inline-flex items-center gap-2 text-sm text-foreground/40 hover:text-accent transition-colors mb-[var(--space-6)] group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">
            &larr;
          </span>{" "}
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-6)] lg:gap-[var(--space-8)] items-start">
          {/* 3D Previewer */}
          <div className="fade-in aspect-square rounded-2xl border border-white/5 overflow-hidden glow-teal">
            <InlineModelPreview
              variant={(product.model?.variant as any) ?? "sphere"}
              color={product.model?.color ?? "#0a1a1a"}
              wireColor={product.model?.wireColor ?? "#14b8a6"}
              distort={product.model?.distort ?? false}
              modelFile={product.modelFile}
              viewerSettings={(product as any).viewerSettings}
              scale={0.9}
            />
          </div>

          {/* Product Info */}
          <div>
            <div className="fade-in">
              <div className="flex items-center gap-3 mb-[var(--space-2)]">
                <span className="w-2 h-2 rounded-full gradient-teal-orange" />
                <p className="font-mono text-xs text-accent uppercase tracking-[0.3em]">
                  {product.category}
                </p>
              </div>
              <AnimatedText
                tag="h1"
                className="font-bold mb-[var(--space-2)]"
                splitBy="words"
                scrollTrigger={false}
                delay={0.3}
              >
                {product.title}
              </AnimatedText>
              <p className="text-4xl font-bold text-accent-secondary mb-[var(--space-4)]">
                ${product.price}
              </p>
            </div>

            <div className="fade-in space-y-[var(--space-2)] mb-[var(--space-4)]">
              <p className="text-foreground/50 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specs */}
            <GlassCard className="fade-in p-[var(--space-3)] mb-[var(--space-4)]">
              <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-[var(--space-3)]">
                Specifications
              </h3>
              <div className="grid grid-cols-2 gap-[var(--space-3)] text-sm">
                {(
                  product.specs ?? [
                    ["Polycount", product.polycount],
                    ["Formats", product.format],
                    ["License", "Commercial"],
                  ]
                ).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-foreground/30 font-mono text-xs mb-[6px]">
                      {label}
                    </p>
                    <p className="text-foreground/70">{value}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Purchase */}
            <div className="fade-in flex gap-[var(--space-2)]">
              <MagneticButton className="flex-1 text-center">
                Buy Now — ${product.price}
              </MagneticButton>
              <MagneticButton className="bg-accent-secondary text-white hover:bg-accent-secondary-muted">
                Add to Cart
              </MagneticButton>
            </div>

            <p className="fade-in text-xs text-foreground/20 mt-[var(--space-2)] font-mono">
              Secure payment via Stripe &middot; Instant digital download
            </p>
          </div>
        </div>

        {/* Related Model views */}
        <div className="mt-[var(--space-12)]">
          <h2 className="font-bold mb-[var(--space-4)]">More Views</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--space-2)]">
            {[
              { variant: "sphere" as const, wireColor: "#f97316" },
              { variant: "icosahedron" as const, wireColor: "#14b8a6" },
              { variant: "octahedron" as const, wireColor: "#f97316" },
              { variant: "dodecahedron" as const, wireColor: "#14b8a6" },
            ].map((item, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl border border-white/5 overflow-hidden bg-white/[0.02]"
              >
                <InlineModelPreview
                  variant={item.variant}
                  color="#0a1520"
                  wireColor={item.wireColor}
                  scale={0.55}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
