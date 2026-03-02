"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Stats {
  projects: number;
  products: number;
  sections: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    projects: 0,
    products: 0,
    sections: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/projects").then((r) => r.json()),
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/content").then((r) => r.json()),
    ]).then(([projects, products, content]) => {
      setStats({
        projects: Array.isArray(projects) ? projects.length : 0,
        products: Array.isArray(products) ? products.length : 0,
        sections: Object.keys(content).length,
      });
    });
  }, []);

  const cards = [
    {
      label: "Projects",
      value: stats.projects,
      href: "/admin/projects",
      color: "#14b8a6",
    },
    {
      label: "Products",
      value: stats.products,
      href: "/admin/products",
      color: "#f97316",
    },
    {
      label: "Content Sections",
      value: stats.sections,
      href: "/admin/hero",
      color: "#14b8a6",
    },
  ];

  const quickLinks = [
    { label: "Edit Hero Section", href: "/admin/hero", icon: "▲" },
    { label: "Manage Projects", href: "/admin/projects", icon: "■" },
    { label: "Manage Products", href: "/admin/products", icon: "★" },
    { label: "Upload Media", href: "/admin/media", icon: "📁" },
    { label: "Edit About Page", href: "/admin/about", icon: "●" },
    { label: "Edit Contact Info", href: "/admin/contact", icon: "✉" },
    { label: "Site Settings", href: "/admin/settings", icon: "⚙" },
    { label: "View Live Site", href: "/", icon: "↗" },
  ];

  return (
    <div data-admin-page>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-white/30 mb-8">
        Manage your BehindCG website content
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="admin-card hover:border-white/10 transition-colors group">
              <p className="text-xs text-white/30 font-mono uppercase tracking-wider mb-2">
                {card.label}
              </p>
              <p className="text-3xl font-bold" style={{ color: card.color }}>
                {card.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <div className="admin-card hover:border-[#14b8a6]/20 transition-all duration-200 hover:bg-white/[0.03] flex items-center gap-3">
              <span className="text-lg w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.03]">
                {link.icon}
              </span>
              <span className="text-sm text-white/60 group-hover:text-white">
                {link.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
