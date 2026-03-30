"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useContent } from "@/lib/ContentContext";

const DEFAULT_LINKS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "AI Studio", href: "/ai-product" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const content = useContent();

  const navLinks = content?.navbar?.links ?? DEFAULT_LINKS;
  const brand = content?.navbar?.brand ?? "BehindCG";
  const ctaLabel = content?.navbar?.ctaLabel ?? "Shop Now";
  const ctaHref = content?.navbar?.ctaHref ?? "/shop";

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Animate navbar in on load
    gsap.fromTo(
      nav,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.5 },
    );
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 w-full z-50 py-[var(--space-2)] md:py-[var(--space-3)] bg-background/80 backdrop-blur-xl border-b border-white/[0.04]"
      style={{ opacity: 0 }}
    >
      <div className="container-site">
        <div className="glass glass-hover flex items-center justify-between px-[var(--space-3)] py-[var(--space-1)] md:px-[var(--space-4)] md:py-[17px]">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold tracking-tight text-foreground hover:text-accent transition-colors duration-300"
          >
            BehindCG
            <span className="text-accent-secondary">.</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-[var(--space-4)]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-foreground/60 hover:text-foreground transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            <Link
              href={ctaHref}
              className="text-sm font-semibold px-7 py-3 rounded-full bg-accent-secondary text-white hover:bg-accent-secondary-muted transition-colors duration-300"
            >
              {ctaLabel}
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden flex flex-col gap-2 p-3"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`w-6 h-[2px] bg-foreground transition-transform duration-300 ${
                isOpen ? "rotate-45 translate-y-[5px]" : ""
              }`}
            />
            <span
              className={`w-6 h-[2px] bg-foreground transition-opacity duration-300 ${
                isOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-6 h-[2px] bg-foreground transition-transform duration-300 ${
                isOpen ? "-rotate-45 -translate-y-[5px]" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-3 glass p-[var(--space-3)] flex flex-col gap-[var(--space-2)]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-medium text-foreground/70 hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
