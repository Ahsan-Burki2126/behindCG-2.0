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

interface Skill {
  name: string;
  level: number;
  color: string;
}

interface TimelineItem {
  year: string;
  title: string;
  description: string;
  color: string;
}

interface Stat {
  value: string;
  label: string;
  color: string;
}

export default function AboutEditor() {
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const refreshContent = useRefreshContent();
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [tab, setTab] = useState<"preview" | "full">("preview");

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
        setPreview(c.aboutPreview || {});
        setContent(c.about || {});
      });
  }, []);

  const save = async () => {
    const allContent = await fetch("/api/admin/content").then((r) => r.json());
    allContent.aboutPreview = preview;
    allContent.about = content;
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(allContent),
    });
    if (res.ok) {
      showToast("About section saved!");
      refreshContent();
    } else showToast("Save failed", "error");
  };

  if (!content || !preview)
    return <div className="text-white/30">Loading...</div>;

  const about = content;
  const vision = (about.vision as { title: string; text: string }) || {
    title: "",
    text: "",
  };
  const approach = (about.approach as { title: string; text: string }) || {
    title: "",
    text: "",
  };
  const skills = (about.skills as Skill[]) || [];
  const timeline = (about.timeline as TimelineItem[]) || [];
  const previewStats = (preview.stats as Stat[]) || [];

  const updateAbout = (key: string, value: unknown) =>
    setContent({ ...about, [key]: value });
  const updatePreview = (key: string, value: unknown) =>
    setPreview({ ...preview, [key]: value });

  return (
    <div data-admin-page>
      <div className="sticky top-16 lg:top-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-md -mx-4 px-4 lg:-mx-10 lg:px-10 py-4 mb-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">About Section</h1>
            <p className="text-sm text-white/30">
              Edit the about preview and full about page
            </p>
          </div>
          <button onClick={save} className="admin-btn admin-btn-primary">
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["preview", "full"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-teal-500/20 text-teal-400" : "text-white/40 hover:text-white/60"}`}
          >
            {t === "preview" ? "Homepage Preview" : "Full About Page"}
          </button>
        ))}
      </div>

      {tab === "preview" ? (
        <div className="space-y-6">
          <div className="admin-card">
            <h3 className="text-sm font-semibold text-white/50 mb-4">
              Preview Content
            </h3>
            <div className="space-y-4">
              <div>
                <label className="admin-label">Tagline</label>
                <input
                  className="admin-input"
                  value={(preview.tagline as string) || ""}
                  onChange={(e) => updatePreview("tagline", e.target.value)}
                />
              </div>
              <div>
                <label className="admin-label">Headline</label>
                <input
                  className="admin-input"
                  value={(preview.headline as string) || ""}
                  onChange={(e) => updatePreview("headline", e.target.value)}
                />
              </div>
              <div>
                <label className="admin-label">Description</label>
                <textarea
                  className="admin-input"
                  rows={3}
                  value={(preview.description as string) || ""}
                  onChange={(e) => updatePreview("description", e.target.value)}
                />
              </div>
              <div>
                <label className="admin-label">CTA Label</label>
                <input
                  className="admin-input"
                  value={(preview.ctaLabel as string) || ""}
                  onChange={(e) => updatePreview("ctaLabel", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="text-sm font-semibold text-white/50 mb-4">Stats</h3>
            <div className="space-y-3">
              {previewStats.map((stat, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="admin-label">Value</label>
                    <input
                      className="admin-input"
                      value={stat.value}
                      onChange={(e) => {
                        const s = [...previewStats];
                        s[i] = { ...stat, value: e.target.value };
                        updatePreview("stats", s);
                      }}
                    />
                  </div>
                  <div>
                    <label className="admin-label">Label</label>
                    <input
                      className="admin-input"
                      value={stat.label}
                      onChange={(e) => {
                        const s = [...previewStats];
                        s[i] = { ...stat, label: e.target.value };
                        updatePreview("stats", s);
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="admin-input flex-1"
                      value={stat.color}
                      onChange={(e) => {
                        const s = [...previewStats];
                        s[i] = { ...stat, color: e.target.value };
                        updatePreview("stats", s);
                      }}
                    >
                      <option value="teal">Teal</option>
                      <option value="orange">Orange</option>
                    </select>
                    <button
                      onClick={() =>
                        updatePreview(
                          "stats",
                          previewStats.filter((_, idx) => idx !== i),
                        )
                      }
                      className="admin-btn admin-btn-danger"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() =>
                  updatePreview("stats", [
                    ...previewStats,
                    { value: "", label: "", color: "teal" },
                  ])
                }
                className="admin-btn admin-btn-secondary"
              >
                + Add Stat
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="admin-card">
            <h3 className="text-sm font-semibold text-white/50 mb-4">
              Page Header
            </h3>
            <div className="space-y-4">
              <div>
                <label className="admin-label">Tagline</label>
                <input
                  className="admin-input"
                  value={(about.tagline as string) || ""}
                  onChange={(e) => updateAbout("tagline", e.target.value)}
                />
              </div>
              <div>
                <label className="admin-label">Headline</label>
                <input
                  className="admin-input"
                  value={(about.headline as string) || ""}
                  onChange={(e) => updateAbout("headline", e.target.value)}
                />
              </div>
              <div>
                <label className="admin-label">Description</label>
                <textarea
                  className="admin-input"
                  rows={3}
                  value={(about.description as string) || ""}
                  onChange={(e) => updateAbout("description", e.target.value)}
                />
              </div>
              <div>
                <label className="admin-label">
                  CTA Headline (bottom of page)
                </label>
                <input
                  className="admin-input"
                  value={(about.ctaHeadline as string) || ""}
                  onChange={(e) => updateAbout("ctaHeadline", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="text-sm font-semibold text-white/50 mb-4">
              Vision & Approach
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="admin-label">Vision Title</label>
                  <input
                    className="admin-input"
                    value={vision.title}
                    onChange={(e) =>
                      updateAbout("vision", {
                        ...vision,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="admin-label">Vision Text</label>
                  <textarea
                    className="admin-input"
                    rows={4}
                    value={vision.text}
                    onChange={(e) =>
                      updateAbout("vision", { ...vision, text: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="admin-label">Approach Title</label>
                  <input
                    className="admin-input"
                    value={approach.title}
                    onChange={(e) =>
                      updateAbout("approach", {
                        ...approach,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="admin-label">Approach Text</label>
                  <textarea
                    className="admin-input"
                    rows={4}
                    value={approach.text}
                    onChange={(e) =>
                      updateAbout("approach", {
                        ...approach,
                        text: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="text-sm font-semibold text-white/50 mb-4">Skills</h3>
            <div className="space-y-3">
              {skills.map((skill, i) => (
                <div key={i} className="grid grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="admin-label">Name</label>
                    <input
                      className="admin-input"
                      value={skill.name}
                      onChange={(e) => {
                        const s = [...skills];
                        s[i] = { ...skill, name: e.target.value };
                        updateAbout("skills", s);
                      }}
                    />
                  </div>
                  <div>
                    <label className="admin-label">Level (%)</label>
                    <input
                      className="admin-input"
                      type="number"
                      min="0"
                      max="100"
                      value={skill.level}
                      onChange={(e) => {
                        const s = [...skills];
                        s[i] = {
                          ...skill,
                          level: parseInt(e.target.value) || 0,
                        };
                        updateAbout("skills", s);
                      }}
                    />
                  </div>
                  <div>
                    <label className="admin-label">Color</label>
                    <select
                      className="admin-input"
                      value={skill.color}
                      onChange={(e) => {
                        const s = [...skills];
                        s[i] = { ...skill, color: e.target.value };
                        updateAbout("skills", s);
                      }}
                    >
                      <option value="teal">Teal</option>
                      <option value="orange">Orange</option>
                    </select>
                  </div>
                  <button
                    onClick={() =>
                      updateAbout(
                        "skills",
                        skills.filter((_, idx) => idx !== i),
                      )
                    }
                    className="admin-btn admin-btn-danger"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  updateAbout("skills", [
                    ...skills,
                    { name: "", level: 50, color: "teal" },
                  ])
                }
                className="admin-btn admin-btn-secondary"
              >
                + Add Skill
              </button>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="text-sm font-semibold text-white/50 mb-4">
              Timeline
            </h3>
            <div className="space-y-4">
              {timeline.map((item, i) => (
                <div
                  key={i}
                  className="p-4 border border-white/5 rounded-lg space-y-3"
                >
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="admin-label">Year</label>
                      <input
                        className="admin-input"
                        value={item.year}
                        onChange={(e) => {
                          const t = [...timeline];
                          t[i] = { ...item, year: e.target.value };
                          updateAbout("timeline", t);
                        }}
                      />
                    </div>
                    <div>
                      <label className="admin-label">Title</label>
                      <input
                        className="admin-input"
                        value={item.title}
                        onChange={(e) => {
                          const t = [...timeline];
                          t[i] = { ...item, title: e.target.value };
                          updateAbout("timeline", t);
                        }}
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      <select
                        className="admin-input flex-1"
                        value={item.color}
                        onChange={(e) => {
                          const t = [...timeline];
                          t[i] = { ...item, color: e.target.value };
                          updateAbout("timeline", t);
                        }}
                      >
                        <option value="teal">Teal</option>
                        <option value="orange">Orange</option>
                      </select>
                      <button
                        onClick={() =>
                          updateAbout(
                            "timeline",
                            timeline.filter((_, idx) => idx !== i),
                          )
                        }
                        className="admin-btn admin-btn-danger"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="admin-label">Description</label>
                    <textarea
                      className="admin-input"
                      value={item.description}
                      onChange={(e) => {
                        const t = [...timeline];
                        t[i] = { ...item, description: e.target.value };
                        updateAbout("timeline", t);
                      }}
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() =>
                  updateAbout("timeline", [
                    ...timeline,
                    { year: "", title: "", description: "", color: "teal" },
                  ])
                }
                className="admin-btn admin-btn-secondary"
              >
                + Add Timeline Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
