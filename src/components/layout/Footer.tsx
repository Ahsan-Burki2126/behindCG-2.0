"use client";

import Link from "next/link";
import { useContent } from "@/lib/ContentContext";

const DEFAULT_NAV = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const DEFAULT_SOCIAL = [
  { label: "Instagram", href: "#" },
  { label: "Behance", href: "#" },
  { label: "ArtStation", href: "#" },
  { label: "LinkedIn", href: "#" },
];

export default function Footer() {
  const content = useContent();
  const f = content?.footer;
  const brand = f?.brand ?? "BehindCG";
  const description =
    f?.description ??
    "Crafting immersive 3D product visualizations and animations. Bringing ideas to life through Blender and cutting-edge rendering technology.";
  const navigation = f?.navigation ?? DEFAULT_NAV;
  const social = f?.social ?? DEFAULT_SOCIAL;
  const copyright = f?.copyright ?? "BehindCG. All rights reserved.";
  const techLine = f?.techLine ?? "Crafted with Three.js · Next.js · GSAP";

  return (
    <footer className="relative z-10 bg-background">
      <div className="container-site">
        <div className="divider" />
        <div className="py-[var(--space-10)] lg:py-[var(--space-12)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-[var(--space-6)] lg:gap-[var(--space-8)]">
            {/* Brand */}
            <div className="md:col-span-5">
              <h3 className="text-2xl font-bold mb-[var(--space-2)]">
                {brand}
                <span className="text-accent-secondary">.</span>
              </h3>
              <p className="text-foreground/40 text-sm leading-relaxed max-w-sm">
                {description}
              </p>
            </div>

            {/* Navigation */}
            <div className="md:col-span-3 md:col-start-7">
              <h4 className="text-xs font-semibold text-foreground/25 uppercase tracking-wider mb-[var(--space-2)]">
                Navigate
              </h4>
              <ul className="space-y-[var(--space-1)]">
                {navigation.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-foreground/40 hover:text-foreground transition-colors duration-300"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div className="md:col-span-2">
              <h4 className="text-xs font-semibold text-foreground/25 uppercase tracking-wider mb-[var(--space-2)]">
                Connect
              </h4>
              <ul className="space-y-[var(--space-1)]">
                {social.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground/40 hover:text-foreground transition-colors duration-300"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-[var(--space-10)] pt-[var(--space-4)] border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-[var(--space-2)]">
            <p className="text-xs text-foreground/25">
              &copy; {new Date().getFullYear()} {copyright}
            </p>
            <p className="text-xs text-foreground/25 font-mono">{techLine}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
