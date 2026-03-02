import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Three.js WASM support & optimize 3D assets
  transpilePackages: ["three"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Turbopack config (Next.js 16+ default bundler)
  turbopack: {},
  webpack(config) {
    config.module.rules.push({
      test: /\.(glb|gltf|hdr)$/,
      type: "asset/resource",
    });
    return config;
  },
};

export default nextConfig;
