"use client";

import { useEffect, useState, useCallback } from "react";
import { useRefreshContent } from "@/lib/ContentContext";

function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return <div className={`admin-toast admin-toast-${type}`}>{message}</div>;
}

interface NavLink {
  label: string;
  href: string;
}

interface SocialLink {
  label: string;
  href: string;
}

export default function SettingsEditor() {
  const [navbar, setNavbar] = useState<Record<string, unknown> | null>(null);
  const refreshContent = useRefreshContent();
  const [footer, setFooter] = useState<Record<string, unknown> | null>(null);
  const [shopPage, setShopPage] = useState<Record<string, unknown> | null>(
    null,
  );
  const [projectsPage, setProjectsPage] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [tab, setTab] = useState<"navbar" | "footer" | "pages">("navbar");

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((c) => {
        setNavbar(c.navbar || {});
        setFooter(c.footer || {});
        setShopPage(c.shopPage || {});
        setProjectsPage(c.projectsPage || {});
      });
  }, []);

  const save = async () => {
    const allContent = await fetch("/api/admin/content").then((r) => r.json());
    allContent.navbar = navbar;
    allContent.footer = footer;
    allContent.shopPage = shopPage;
    allContent.projectsPage = projectsPage;
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(allContent),
    });
    if (res.ok) {
      showToast("Settings saved!");
      refreshContent();
    } else showToast("Save failed", "error");
  };

  if (!navbar || !footer || !shopPage || !projectsPage)
    return <div className="text-white/30">Loading...</div>;

  const navLinks = (navbar.links as NavLink[]) || [];
  const footerNav = (footer.navigation as NavLink[]) || [];
  const socialLinks = (footer.social as SocialLink[]) || [];
  const shopFilters = (shopPage.filterCategories as string[]) || [];
  const projectsFilters = (projectsPage.filterCategories as string[]) || [];

  return (
    <div data-admin-page>
      <div className="sticky top-16 lg:top-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-md -mx-4 px-4 lg:-mx-10 lg:px-10 py-4 mb-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Site Settings</h1>
            <p className="text-sm text-white/30">
              Configure navbar, footer, and page settings
            </p>
          </div>
          <button onClick={save} className="admin-btn admin-btn-primary">
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["navbar", "footer", "pages"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-teal-500/20 text-teal-400" : "text-white/40 hover:text-white/60"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "navbar" && (
        <div className="space-y-6">
          <div className="admin-card">
            <h3 className="text-sm font-semibold text-white/50 mb-4">Brand</h3>
            <div>
              <label className="admin-label">Brand Name</label>
              <input
                className="admin-input"
                value={(navbar.brand as string) || ""}
                onChange={(e) =>
                  setNavbar({ ...navbar, brand: e.target.value })
                }
              />
            </div>
          </div>

          <div className="admin-card">
            <h3 className="text-sm font-semibold text-white/50 mb-4">
              Navigation Links
            </h3>
            <div className="space-y-3">
              {navLinks.map((link, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="admin-label">Label</label>
                    <input
                      className="admin-input"
                      value={link.label}
                      onChange={(e) => {
                        const l = [...navLinks];
                        l[i] = { ...link, label: e.target.value };
                        setNavbar({ ...navbar, links: l });
                      }}
                    />
                  </div>
                  <div>
                    <label className="admin-label">URL</label>
                    <input
                      className="admin-input"
                      value={link.href}
                      onChange={(e) => {
                        const l = [...navLinks];
                        l[i] = { ...link, href: e.target.value };
                        setNavbar({ ...navbar, links: l });
                      }}
                    />
                  </div>
                  <button
                    onClick={() =>
                      setNavbar({
                        ...navbar,
                        links: navLinks.filter((_, idx) => idx !== i),
                      })
                    }
                    className="admin-btn admin-btn-danger"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setNavbar({
                    ...navbar,
                    links: [...navLinks, { label: "", href: "" }],
                  })
                }
                className="admin-btn admin-btn-secondary"
              >
                + Add Link
              </button>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="text-sm font-semibold text-white/50 mb-4">
              CTA Button
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Label</label>
                <input
                  className="admin-input"
                  value={(navbar.ctaLabel as string) || ""}
                  onChange={(e) =>
                    setNavbar({ ...navbar, ctaLabel: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="admin-label">URL</label>
                <input
                  className="admin-input"
                  value={(navbar.ctaHref as string) || ""}
                  onChange={(e) =>
                    setNavbar({ ...navbar, ctaHref: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "footer" && (
        <div className="space-y-6">
          <div className="admin-card">
            <h3 className="text-sm font-semibold text-white/50 mb-4">Brand</h3>
            <div className="space-y-4">
              <div>
                <label className="admin-label">Brand Name</label>
                <input
                  className="admin-input"
                  value={(footer.brand as string) || ""}
                  onChange={(e) =>
                    setFooter({ ...footer, brand: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="admin-label">Description</label>
                <textarea
                  className="admin-input"
                  rows={3}
                  value={(footer.description as string) || ""}
                  onChange={(e) =>
                    setFooter({ ...footer, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="admin-label">Copyright Text</label>
                <input
                  className="admin-input"
                  value={(footer.copyright as string) || ""}
                  onChange={(e) =>
                    setFooter({ ...footer, copyright: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="admin-label">Tech Line</label>
                <input
                  className="admin-input"
                  value={(footer.techLine as string) || ""}
                  onChange={(e) =>
                    setFooter({ ...footer, techLine: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="text-sm font-semibold text-white/50 mb-4">
              Footer Navigation
            </h3>
            <div className="space-y-3">
              {footerNav.map((link, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="admin-label">Label</label>
                    <input
                      className="admin-input"
                      value={link.label}
                      onChange={(e) => {
                        const l = [...footerNav];
                        l[i] = { ...link, label: e.target.value };
                        setFooter({ ...footer, navigation: l });
                      }}
                    />
                  </div>
                  <div>
                    <label className="admin-label">URL</label>
                    <input
                      className="admin-input"
                      value={link.href}
                      onChange={(e) => {
                        const l = [...footerNav];
                        l[i] = { ...link, href: e.target.value };
                        setFooter({ ...footer, navigation: l });
                      }}
                    />
                  </div>
                  <button
                    onClick={() =>
                      setFooter({
                        ...footer,
                        navigation: footerNav.filter((_, idx) => idx !== i),
                      })
                    }
                    className="admin-btn admin-btn-danger"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setFooter({
                    ...footer,
                    navigation: [...footerNav, { label: "", href: "" }],
                  })
                }
                className="admin-btn admin-btn-secondary"
              >
                + Add Link
              </button>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="text-sm font-semibold text-white/50 mb-4">
              Social Links
            </h3>
            <div className="space-y-3">
              {socialLinks.map((link, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="admin-label">Platform</label>
                    <input
                      className="admin-input"
                      value={link.label}
                      onChange={(e) => {
                        const l = [...socialLinks];
                        l[i] = { ...link, label: e.target.value };
                        setFooter({ ...footer, social: l });
                      }}
                    />
                  </div>
                  <div>
                    <label className="admin-label">URL</label>
                    <input
                      className="admin-input"
                      value={link.href}
                      onChange={(e) => {
                        const l = [...socialLinks];
                        l[i] = { ...link, href: e.target.value };
                        setFooter({ ...footer, social: l });
                      }}
                    />
                  </div>
                  <button
                    onClick={() =>
                      setFooter({
                        ...footer,
                        social: socialLinks.filter((_, idx) => idx !== i),
                      })
                    }
                    className="admin-btn admin-btn-danger"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setFooter({
                    ...footer,
                    social: [...socialLinks, { label: "", href: "" }],
                  })
                }
                className="admin-btn admin-btn-secondary"
              >
                + Add Social Link
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "pages" && (
        <div className="space-y-6">
          <div className="admin-card">
            <h3 className="text-sm font-semibold text-white/50 mb-4">
              Shop Page
            </h3>
            <div className="space-y-4">
              <div>
                <label className="admin-label">Tagline</label>
                <input
                  className="admin-input"
                  value={(shopPage.tagline as string) || ""}
                  onChange={(e) =>
                    setShopPage({ ...shopPage, tagline: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="admin-label">Headline</label>
                <input
                  className="admin-input"
                  value={(shopPage.headline as string) || ""}
                  onChange={(e) =>
                    setShopPage({ ...shopPage, headline: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="admin-label">Subheadline</label>
                <textarea
                  className="admin-input"
                  rows={2}
                  value={(shopPage.subheadline as string) || ""}
                  onChange={(e) =>
                    setShopPage({ ...shopPage, subheadline: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="admin-label">
                  Filter Categories (comma-separated)
                </label>
                <input
                  className="admin-input"
                  value={shopFilters.join(", ")}
                  onChange={(e) =>
                    setShopPage({
                      ...shopPage,
                      filterCategories: e.target.value
                        .split(",")
                        .map((s: string) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="text-sm font-semibold text-white/50 mb-4">
              Projects Page
            </h3>
            <div className="space-y-4">
              <div>
                <label className="admin-label">Tagline</label>
                <input
                  className="admin-input"
                  value={(projectsPage.tagline as string) || ""}
                  onChange={(e) =>
                    setProjectsPage({
                      ...projectsPage,
                      tagline: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="admin-label">Headline</label>
                <input
                  className="admin-input"
                  value={(projectsPage.headline as string) || ""}
                  onChange={(e) =>
                    setProjectsPage({
                      ...projectsPage,
                      headline: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="admin-label">Subheadline</label>
                <textarea
                  className="admin-input"
                  rows={2}
                  value={(projectsPage.subheadline as string) || ""}
                  onChange={(e) =>
                    setProjectsPage({
                      ...projectsPage,
                      subheadline: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="admin-label">
                  Filter Categories (comma-separated)
                </label>
                <input
                  className="admin-input"
                  value={projectsFilters.join(", ")}
                  onChange={(e) =>
                    setProjectsPage({
                      ...projectsPage,
                      filterCategories: e.target.value
                        .split(",")
                        .map((s: string) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
