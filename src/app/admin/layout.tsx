"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "◆" },
  { label: "Hero Section", href: "/admin/hero", icon: "▲" },
  { label: "About", href: "/admin/about", icon: "●" },
  { label: "Projects", href: "/admin/projects", icon: "■" },
  { label: "Products", href: "/admin/products", icon: "★" },
  { label: "Contact", href: "/admin/contact", icon: "✉" },
  { label: "Settings", href: "/admin/settings", icon: "⚙" },
  { label: "Media", href: "/admin/media", icon: "📁" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((d) => {
        if (!d.authenticated && pathname !== "/admin/login") {
          router.replace("/admin/login");
        } else {
          setAuthed(d.authenticated);
        }
      });
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return (
      <div data-admin-page>
        {children}
        <style jsx global>{`
          .admin-input {
            width: 100%;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            padding: 10px 14px;
            color: #f0f0f5;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
          }
          .admin-input:focus {
            border-color: rgba(20, 184, 166, 0.5);
          }
          .admin-input::placeholder {
            color: rgba(255, 255, 255, 0.15);
          }
          .admin-label {
            display: block;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.35);
            margin-bottom: 6px;
            font-family: monospace;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .admin-btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
          }
          .admin-btn-primary {
            background: #14b8a6;
            color: #0a0a0f;
          }
          .admin-btn-primary:hover {
            background: #0d9488;
          }
          .admin-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 14px;
            padding: 24px;
          }
        `}</style>
      </div>
    );
  }

  if (authed === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#14b8a6]/30 border-t-[#14b8a6] rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.replace("/admin/login");
  };

  return (
    <div
      data-admin-page
      className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] flex"
    >
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white/60 hover:text-white p-1"
        >
          <span className="text-xl">☰</span>
        </button>
        <span className="text-sm font-semibold tracking-wider">
          BehindCG Admin
        </span>
        <button
          onClick={handleLogout}
          className="text-xs text-white/40 hover:text-red-400"
        >
          Logout
        </button>
      </div>

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#0d0d14] border-r border-white/5 flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-white/5">
          <Link href="/admin" className="text-lg font-bold tracking-tight">
            BehindCG<span className="text-[#f97316]">.</span>
            <span className="text-xs font-normal text-white/30 ml-2">
              Admin
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-all duration-200 ${
                  isActive
                    ? "text-[#14b8a6] bg-[#14b8a6]/5 border-r-2 border-[#14b8a6]"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.02]"
                }`}
              >
                <span className="text-xs w-4 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <Link
            href="/"
            className="block text-xs text-white/25 hover:text-[#14b8a6] mb-3 transition-colors"
          >
            ← View Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-white/25 hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen lg:ml-0 pt-16 lg:pt-0">
        <div className="p-4 pt-2 lg:p-10 max-w-6xl">{children}</div>
      </main>

      <style jsx global>{`
        .admin-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 10px 14px;
          color: #f0f0f5;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .admin-input:focus {
          border-color: rgba(20, 184, 166, 0.5);
        }
        .admin-input::placeholder {
          color: rgba(255, 255, 255, 0.15);
        }
        textarea.admin-input {
          min-height: 80px;
          resize: vertical;
        }
        select.admin-input {
          cursor: pointer;
        }
        .admin-label {
          display: block;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.35);
          margin-bottom: 6px;
          font-family: monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .admin-btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .admin-btn-primary {
          background: #14b8a6;
          color: #0a0a0f;
        }
        .admin-btn-primary:hover {
          background: #0d9488;
        }
        .admin-btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: #f0f0f5;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .admin-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        .admin-btn-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .admin-btn-danger:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        .admin-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 24px;
        }
        .admin-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 13px;
          z-index: 9999;
          animation: slideInUp 0.3s ease-out;
        }
        .admin-toast-success {
          background: rgba(20, 184, 166, 0.15);
          border: 1px solid rgba(20, 184, 166, 0.3);
          color: #14b8a6;
        }
        .admin-toast-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        /* Override cursor: none from globals.css in admin pages */
        [data-admin-page] * {
          cursor: auto !important;
        }
      `}</style>
    </div>
  );
}
