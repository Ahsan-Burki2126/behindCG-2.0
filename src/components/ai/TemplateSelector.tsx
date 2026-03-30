"use client";

import { TEMPLATES, type Template } from "@/lib/aiTemplates";

interface TemplateSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: Template;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl overflow-hidden border-2 text-left transition-all duration-200 ${
        selected
          ? "border-accent shadow-[0_0_18px_rgba(20,184,166,0.22)] scale-[1.02]"
          : "border-white/10 hover:border-white/22 hover:scale-[1.01]"
      }`}
    >
      {/* CSS thumbnail — no image files needed */}
      <div
        className="w-full aspect-square relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${template.bg[0]}, ${template.bg[1]}, ${template.bg[2]})`,
        }}
      >
        {/* Light burst */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${template.lightPos.x * 100}% ${Math.min(template.lightPos.y * 100 + 5, 45)}%, ${template.lightColor}, transparent 65%)`,
          }}
        />

        {/* Vignette */}
        {template.vignette && (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 50% 45%, transparent 18%, ${template.vignette} 88%)`,
            }}
          />
        )}

        {/* Ground shadow ellipse */}
        <div
          className="absolute"
          style={{
            bottom: "19%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "44%",
            height: "9px",
            borderRadius: "50%",
            background: template.shadow,
            filter: "blur(6px)",
          }}
        />

        {/* Product silhouette */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ paddingBottom: "7%" }}
        >
          <div
            style={{
              width: "36%",
              height: "50%",
              borderRadius: "5px",
              background:
                template.id === "minimal-white"
                  ? "linear-gradient(160deg, #ffffff, #d4d4d4)"
                  : "linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))",
              border: `1px solid ${template.accent}55`,
              boxShadow: `0 8px 24px ${template.shadow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}
          />
        </div>

        {/* Selected checkmark */}
        {selected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center shadow-lg">
            <svg
              className="w-3 h-3 text-black"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info row */}
      <div
        className={`px-3 py-2.5 border-t border-white/5 transition-colors ${
          selected ? "bg-accent/[0.06]" : "bg-white/[0.02]"
        }`}
      >
        <p
          className={`text-xs font-semibold transition-colors ${
            selected ? "text-accent" : "text-foreground/80"
          }`}
        >
          {template.name}
        </p>
        <p className="text-[10px] text-foreground/35 mt-0.5 leading-tight">
          {template.description}
        </p>
      </div>
    </button>
  );
}

export default function TemplateSelector({
  selectedId,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {TEMPLATES.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          selected={selectedId === template.id}
          onSelect={() => onSelect(template.id)}
        />
      ))}
    </div>
  );
}
