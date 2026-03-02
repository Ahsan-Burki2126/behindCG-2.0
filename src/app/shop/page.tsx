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
      <div className="w-full aspect-square bg-white/[0.02] animate-pulse rounded-xl" />
    ),
  },
);

const DEFAULT_PRODUCTS = [
  {
    id: "1",
    title: "Crystal Sphere Pack",
    price: "$29",
    category: "3D Model",
    format: "GLB / FBX / BLEND",
    polycount: "12,400 tris",
    model: {
      variant: "sphere",
      color: "#0a1a1a",
      wireColor: "#14b8a6",
      distort: true,
    },
  },
  {
    id: "2",
    title: "Geometric Shape Kit",
    price: "$19",
    category: "3D Models",
    format: "GLB / FBX / BLEND",
    polycount: "8,200 tris",
    model: { variant: "dodecahedron", color: "#1a0f05", wireColor: "#f97316" },
  },
  {
    id: "3",
    title: "Abstract Torus Pack",
    price: "$15",
    category: "3D Model",
    format: "GLB / FBX / BLEND",
    polycount: "15,600 tris",
    model: { variant: "torusKnot", color: "#0a0f1a", wireColor: "#14b8a6" },
  },
  {
    id: "4",
    title: "Faceted Gem Collection",
    price: "$49",
    category: "3D Model",
    format: "GLB / FBX / BLEND",
    polycount: "45,000 tris",
    model: {
      variant: "octahedron",
      color: "#150a1a",
      wireColor: "#f97316",
      wobble: true,
    },
  },
  {
    id: "5",
    title: "Low-Poly Landscape Set",
    price: "$12",
    category: "3D Model",
    format: "GLB / BLEND",
    polycount: "6,800 tris",
    model: { variant: "cone", color: "#0a1510", wireColor: "#14b8a6" },
  },
  {
    id: "6",
    title: "Sci-Fi Cylinder Array",
    price: "$22",
    category: "3D Model",
    format: "GLB / FBX / BLEND",
    polycount: "18,400 tris",
    model: {
      variant: "cylinder",
      color: "#101520",
      wireColor: "#f97316",
      wobble: true,
    },
  },
];

const DEFAULT_FILTERS = ["All", "3D Models", "Shaders", "Textures", "HDRIs"];

export default function ShopPage() {
  const gridRef = useRef<HTMLDivElement>(null);
  const content = useContent();
  const sp = content?.shopPage;
  const tagline = sp?.tagline ?? "Digital Atelier";
  const headline = sp?.headline ?? "The Shop";
  const subheadline =
    sp?.subheadline ??
    "Premium 3D assets — ready for production use in your projects";
  const filters = sp?.filterCategories ?? DEFAULT_FILTERS;
  const products = content?.products ?? DEFAULT_PRODUCTS;

  useEffect(() => {
    if (!gridRef.current) return;
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
  }, []);

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

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-[var(--space-1)] justify-center mb-[var(--space-6)]">
          {filters.map((cat) => (
            <button
              key={cat}
              className="text-sm px-7 py-3 rounded-full glass glass-hover text-foreground/60 hover:text-accent hover:border-accent/30 transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-3)]"
        >
          {products.map((product) => (
            <Link key={product.id} href={`/shop/${product.id}`}>
              <GlassCard className="shop-item group p-0 overflow-hidden h-full">
                <div className="aspect-square bg-white/[0.02] relative overflow-hidden">
                  {/* 3D Model Preview */}
                  <InlineModelPreview
                    variant={product.model.variant as any}
                    color={product.model.color}
                    wireColor={product.model.wireColor}
                    distort={product.model.distort}
                    wobble={product.model.wobble}
                    modelFile={(product as any).modelFile}
                    viewerSettings={(product as any).viewerSettings}
                    scale={0.65}
                  />
                  {/* Format badge */}
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
      </div>
    </div>
  );
}
