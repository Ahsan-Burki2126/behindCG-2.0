"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/* ─── Types ─── */
export interface ViewerSettings {
  cameraPosition: [number, number, number];
  cameraFov: number;
  modelScale: number;
  modelPosition: [number, number, number];
  modelRotation: [number, number, number];
  autoRotate: boolean;
  autoRotateSpeed: number;
  environmentPreset: string;
  ambientIntensity: number;
  directionalIntensity: number;
  directionalColor: string;
  bgColor: string;
  showShadows: boolean;
  showFloat: boolean;
}

export interface HeroModelConfig {
  modelFile?: string;
  solidColor: string;
  wireColor: string;
  particleColor: string;
  particleCount: number;
  viewerSettings?: Partial<ViewerSettings>;
}

export interface HeroContent {
  tagline: string;
  headline: string;
  subheadline: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  stats: { value: string; label: string }[];
  scrollSections: {
    tagLabel: string;
    tagColor: string;
    title: string;
    text: string;
    align: string;
  }[];
  heroModel?: HeroModelConfig;
}

export interface AboutPreviewContent {
  tagline: string;
  headline: string;
  description: string;
  ctaLabel: string;
  stats: { value: string; label: string; color: string }[];
}

export interface AboutContent {
  tagline: string;
  headline: string;
  description: string;
  vision: { title: string; text: string };
  approach: { title: string; text: string };
  skills: { name: string; level: number; color: string }[];
  timeline: {
    year: string;
    title: string;
    description: string;
    color: string;
  }[];
  ctaHeadline: string;
}

export interface ContactContent {
  tagline: string;
  headline: string;
  subheadline: string;
  successTitle: string;
  successMessage: string;
  infoCards: { label: string; value: string; icon: string; glow: string }[];
}

export interface NavbarContent {
  brand: string;
  links: { label: string; href: string }[];
  ctaLabel: string;
  ctaHref: string;
}

export interface FooterContent {
  brand: string;
  description: string;
  navigation: { label: string; href: string }[];
  social: { label: string; href: string }[];
  copyright: string;
  techLine: string;
}

export interface ShopPageContent {
  tagline: string;
  headline: string;
  subheadline: string;
  filterCategories: string[];
}

export interface ProjectsPageContent {
  tagline: string;
  headline: string;
  subheadline: string;
  filterCategories: string[];
}

export interface ShopPreviewContent {
  tagline: string;
  headline: string;
  subheadline: string;
}

export interface ProjectsPreviewContent {
  tagline: string;
  headline: string;
}

export interface ProjectData {
  id: number;
  title: string;
  category: string;
  description: string;
  slug: string;
  year: string;
  client: string;
  longDescription: string;
  tools: string[];
  breakdown: string[];
  modelFile?: string;
  viewerSettings?: Partial<ViewerSettings>;
  model: {
    variant: string;
    color: string;
    wireColor: string;
    distort?: boolean;
    wobble?: boolean;
  };
}

export interface ProductData {
  id: string;
  title: string;
  price: string;
  priceValue: number;
  category: string;
  format: string;
  polycount: string;
  description: string;
  modelFile?: string;
  viewerSettings?: Partial<ViewerSettings>;
  model: {
    variant: string;
    color: string;
    wireColor: string;
    distort?: boolean;
    wobble?: boolean;
  };
  specs: [string, string][];
}

export interface SiteData {
  hero: HeroContent;
  aboutPreview: AboutPreviewContent;
  about: AboutContent;
  contact: ContactContent;
  navbar: NavbarContent;
  footer: FooterContent;
  shopPage: ShopPageContent;
  projectsPage: ProjectsPageContent;
  shopPreview: ShopPreviewContent;
  projectsPreview: ProjectsPreviewContent;
  projects: ProjectData[];
  products: ProductData[];
}

/* ─── Context ─── */
const ContentContext = createContext<SiteData | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/content", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/projects", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/products", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([content, projects, products]) => {
        setData({ ...content, projects, products });
      })
      .catch(() => {
        // Silently fail — components use fallback defaults
      });
  }, [refreshKey]);

  // Listen for visibility changes (user switches tabs from admin → site)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setRefreshKey((k) => k + 1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Expose a refresh function via context for admin pages to trigger on save
  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <ContentContext.Provider value={data}>
      <RefreshContext.Provider value={refresh}>
        {children}
      </RefreshContext.Provider>
    </ContentContext.Provider>
  );
}

const RefreshContext = createContext<() => void>(() => {});

export function useContent(): SiteData | null {
  return useContext(ContentContext);
}

export function useRefreshContent(): () => void {
  return useContext(RefreshContext);
}
