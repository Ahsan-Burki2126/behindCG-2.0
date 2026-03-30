import type { Metadata } from "next";
import { fontSans, fontMono } from "@/styles/fonts";
import "./globals.css";

import ClientProviders from "@/components/layout/ClientProviders";

export const metadata: Metadata = {
  title: "BehindCG — Immersive 3D Portfolio & Digital Atelier",
  description:
    "High-end 3D product visualizations and animations. Explore the portfolio, browse premium assets, and experience immersive digital storytelling.",
  keywords: [
    "3D Artist",
    "Blender",
    "Product Visualization",
    "3D Animation",
    "Digital Assets",
    "Portfolio",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
