export interface Template {
  id: string;
  name: string;
  description: string;
  bg: [string, string, string];
  accent: string;
  shadow: string;
  vignette: string | null;
  lightPos: { x: number; y: number };
  lightColor: string;
  lightSize: number;
}

export const TEMPLATES: Template[] = [
  {
    id: "luxury-studio",
    name: "Luxury Studio",
    description: "Warm gold lighting, rich dark gradient",
    bg: ["#1a1208", "#2d1f0a", "#0a0806"],
    accent: "#d4a843",
    shadow: "rgba(212, 168, 67, 0.45)",
    vignette: "rgba(8, 6, 4, 0.72)",
    lightPos: { x: 0.32, y: 0.05 },
    lightColor: "rgba(255, 196, 80, 0.18)",
    lightSize: 0.65,
  },
  {
    id: "minimal-white",
    name: "Minimal White",
    description: "Clean e-commerce studio look",
    bg: ["#f8f8f8", "#ffffff", "#efefef"],
    accent: "#333333",
    shadow: "rgba(0, 0, 0, 0.13)",
    vignette: null,
    lightPos: { x: 0.5, y: 0.0 },
    lightColor: "rgba(255, 255, 255, 0.4)",
    lightSize: 0.7,
  },
  {
    id: "dark-spotlight",
    name: "Dark Spotlight",
    description: "Dramatic cinematic lighting",
    bg: ["#060606", "#0d0d0d", "#030303"],
    accent: "#14b8a6",
    shadow: "rgba(20, 184, 166, 0.42)",
    vignette: "rgba(0, 0, 0, 0.84)",
    lightPos: { x: 0.5, y: 0.15 },
    lightColor: "rgba(20, 184, 166, 0.22)",
    lightSize: 0.52,
  },
  {
    id: "deep-blue",
    name: "Deep Blue",
    description: "Premium navy with soft ambient light",
    bg: ["#0d1b2a", "#1b2838", "#07121d"],
    accent: "#60a5fa",
    shadow: "rgba(96, 165, 250, 0.38)",
    vignette: "rgba(5, 10, 18, 0.65)",
    lightPos: { x: 0.68, y: 0.08 },
    lightColor: "rgba(96, 165, 250, 0.16)",
    lightSize: 0.62,
  },
  {
    id: "outdoor-lifestyle",
    name: "Outdoor Lifestyle",
    description: "Natural ambient light, organic feel",
    bg: ["#0a1a0a", "#0f2210", "#071408"],
    accent: "#4ade80",
    shadow: "rgba(74, 222, 128, 0.38)",
    vignette: "rgba(5, 12, 5, 0.58)",
    lightPos: { x: 0.82, y: 0.02 },
    lightColor: "rgba(120, 230, 100, 0.13)",
    lightSize: 0.7,
  },
  {
    id: "neon-cyberpunk",
    name: "Neon Cyberpunk",
    description: "Vibrant neon glow on dark surface",
    bg: ["#08000f", "#120020", "#050008"],
    accent: "#f97316",
    shadow: "rgba(249, 115, 22, 0.48)",
    vignette: "rgba(4, 0, 8, 0.72)",
    lightPos: { x: 0.25, y: 0.28 },
    lightColor: "rgba(249, 115, 22, 0.22)",
    lightSize: 0.58,
  },
];
