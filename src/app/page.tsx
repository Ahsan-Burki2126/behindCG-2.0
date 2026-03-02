"use client";

import HeroSection from "@/components/sections/HeroSection";
import ProjectsPreview from "@/components/sections/ProjectsPreview";
import ShopPreview from "@/components/sections/ShopPreview";
import AboutPreview from "@/components/sections/AboutPreview";

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="relative z-10 bg-background">
        <ProjectsPreview />
        <ShopPreview />
        <AboutPreview />
      </div>
    </>
  );
}
