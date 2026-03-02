"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";
import AnimatedText from "@/components/ui/AnimatedText";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import { useContent } from "@/lib/ContentContext";

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);
  const content = useContent();
  const c = content?.contact;
  const tagline = c?.tagline ?? "Get in Touch";
  const headline = c?.headline ?? "Let's Talk";
  const subheadline =
    c?.subheadline ??
    "Have a project in mind? Drop a message and let's create something amazing together.";
  const successTitle = c?.successTitle ?? "Message Sent!";
  const successMessage =
    c?.successMessage ??
    "Thanks for reaching out. I'll get back to you within 24 hours.";
  const infoCards = c?.infoCards ?? [
    { label: "Email", value: "hello@behindcg.com", icon: "📧", glow: "teal" },
    {
      label: "Location",
      value: "Remote / Worldwide",
      icon: "🌍",
      glow: "orange",
    },
    {
      label: "Response Time",
      value: "Within 24 hours",
      icon: "⚡",
      glow: "teal",
    },
  ];

  useEffect(() => {
    if (!formRef.current) return;
    const fields = formRef.current.querySelectorAll(".form-field");
    gsap.fromTo(
      fields,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.4,
      },
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (envelopeRef.current) {
      gsap.to(envelopeRef.current, {
        y: -200,
        scale: 0,
        opacity: 0,
        rotateX: 180,
        duration: 1,
        ease: "power3.in",
        onComplete: () => setSent(true),
      });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen pt-[var(--space-15)] pb-[var(--space-12)]">
      <div
        className="container-site"
        style={{ maxWidth: "var(--content-max)" }}
      >
        {/* Header */}
        <div className="text-center mb-[var(--space-8)]">
          <div className="flex items-center justify-center gap-3 mb-[var(--space-2)]">
            <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-accent" />
            <p className="font-mono text-xs text-accent uppercase tracking-[0.3em]">
              {tagline}
            </p>
            <span className="w-8 h-[1px] bg-gradient-to-r from-accent to-transparent" />
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
            className="text-body-lg text-foreground/50"
            splitBy="words"
            scrollTrigger={false}
            delay={0.6}
          >
            {subheadline}
          </AnimatedText>
        </div>

        {/* Animated Envelope */}
        <div
          ref={envelopeRef}
          className="w-20 h-16 mx-auto mb-[var(--space-6)] relative"
          style={{ perspective: "600px" }}
        >
          <div className="w-full h-full rounded-lg border flex items-center justify-center gradient-teal-orange">
            <span className="text-white text-2xl">✉</span>
          </div>
        </div>

        {sent ? (
          <div className="text-center">
            <GlassCard className="p-[var(--space-6)] max-w-lg mx-auto glow-teal">
              <div className="text-5xl mb-[var(--space-2)]">🚀</div>
              <h2 className="font-bold mb-[var(--space-1)]">{successTitle}</h2>
              <p className="text-foreground/50">{successMessage}</p>
            </GlassCard>
          </div>
        ) : (
          <GlassCard
            className="p-[var(--space-4)] md:p-[var(--space-6)] mx-auto"
            style={{ maxWidth: "720px" }}
          >
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-[var(--space-3)]"
            >
              <div className="form-field grid grid-cols-1 md:grid-cols-2 gap-[var(--space-3)]">
                <div>
                  <label className="block text-sm text-foreground/40 font-mono mb-[var(--space-1)]">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-[var(--space-2)] py-[17px] text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-accent/50 transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground/40 font-mono mb-[var(--space-1)]">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-[var(--space-2)] py-[17px] text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-accent/50 transition-colors"
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="block text-sm text-foreground/40 font-mono mb-[var(--space-1)]">
                  Project Type
                </label>
                <select className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-[var(--space-2)] py-[17px] text-foreground focus:outline-none focus:border-accent/50 transition-colors">
                  <option value="">Select a service</option>
                  <option value="product-viz">Product Visualization</option>
                  <option value="animation">3D Animation</option>
                  <option value="interactive">Interactive 3D / WebGL</option>
                  <option value="archviz">Architectural Visualization</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-field">
                <label className="block text-sm text-foreground/40 font-mono mb-[var(--space-1)]">
                  Budget Range
                </label>
                <select className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-[var(--space-2)] py-[17px] text-foreground focus:outline-none focus:border-accent/50 transition-colors">
                  <option value="">Select a range</option>
                  <option value="1k-5k">$1,000 – $5,000</option>
                  <option value="5k-15k">$5,000 – $15,000</option>
                  <option value="15k+">$15,000+</option>
                </select>
              </div>

              <div className="form-field">
                <label className="block text-sm text-foreground/40 font-mono mb-[var(--space-1)]">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-[var(--space-2)] py-[17px] text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-accent/50 transition-colors resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>

              <div className="form-field pt-[var(--space-1)]">
                <MagneticButton className="w-full text-center">
                  Send Message
                </MagneticButton>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Contact Info Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-3)] mt-[var(--space-8)]"
          style={{ maxWidth: "720px", margin: "var(--space-8) auto 0" }}
        >
          {infoCards.map((info) => (
            <GlassCard
              key={info.label}
              className={`p-[var(--space-3)] text-center ${info.glow === "orange" ? "glow-orange" : "glow-teal"}`}
            >
              <span className="text-xl mb-[var(--space-1)] block">
                {info.icon}
              </span>
              <p className="text-xs text-foreground/30 font-mono uppercase tracking-wider mb-[6px]">
                {info.label}
              </p>
              <p className="text-sm text-foreground/60">{info.value}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
