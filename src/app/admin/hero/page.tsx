"use client";

import { useEffect, useState, useCallback } from "react";
import { useRefreshContent } from "@/lib/ContentContext";
import { ENVIRONMENT_PRESETS } from "@/components/three/InlineModelPreview";

type ContentSection = Record<string, unknown>;

function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return <div className={`admin-toast admin-toast-${type}`}>{message}</div>;
}

export default function HeroEditor() {
  const [data, setData] = useState<ContentSection | null>(null);
  const refreshContent = useRefreshContent();
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [modelUploading, setModelUploading] = useState(false);
  const [showHeroViewerSettings, setShowHeroViewerSettings] = useState(false);

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
      .then((content) => setData(content.hero || {}));
  }, []);

  const save = async () => {
    const content = await fetch("/api/admin/content").then((r) => r.json());
    content.hero = data;
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    if (res.ok) {
      showToast("Hero section saved!");
      refreshContent();
    } else showToast("Save failed", "error");
  };

  if (!data) return <div className="text-white/30">Loading...</div>;

  const hero = data as Record<string, unknown>;
  const stats = (hero.stats as Array<{ value: string; label: string }>) || [];
  const ctaPrimary = (hero.ctaPrimary as { label: string; href: string }) || {
    label: "",
    href: "",
  };
  const ctaSecondary = (hero.ctaSecondary as {
    label: string;
    href: string;
  }) || { label: "", href: "" };
  const scrollSections =
    (hero.scrollSections as Array<{
      tagLabel: string;
      title: string;
      text: string;
      align: string;
      tagColor: string;
    }>) || [];

  const heroModel = (hero.heroModel as {
    modelFile?: string;
    solidColor: string;
    wireColor: string;
    particleColor: string;
    particleCount: number;
    viewerSettings?: Record<string, unknown>;
  }) || {
    modelFile: "",
    solidColor: "#0a1520",
    wireColor: "#14b8a6",
    particleColor: "#f97316",
    particleCount: 500,
    viewerSettings: {},
  };

  const heroVS = {
    cameraPosition: [0, 0, 5] as [number, number, number],
    cameraFov: 45,
    modelScale: 3,
    environmentPreset: "city",
    ambientIntensity: 0.15,
    directionalIntensity: 1.5,
    ...(heroModel.viewerSettings || {}),
  };

  const update = (key: string, value: unknown) =>
    setData({ ...hero, [key]: value });

  const updateHeroModel = (key: string, value: unknown) =>
    update("heroModel", { ...heroModel, [key]: value });

  const uploadHeroModel = async (file: File) => {
    setModelUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "models");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const { path } = await res.json();
        updateHeroModel("modelFile", path);
        showToast("Hero 3D model uploaded!");
      } else {
        const err = await res.json();
        showToast(err.error || "Upload failed", "error");
      }
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setModelUploading(false);
    }
  };

  return (
    <div data-admin-page>
      <div className="sticky top-16 lg:top-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-md -mx-4 px-4 lg:-mx-10 lg:px-10 py-4 mb-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hero Section</h1>
            <p className="text-sm text-white/30">
              Edit the main landing section
            </p>
          </div>
          <button onClick={save} className="admin-btn admin-btn-primary">
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Content */}
        <div className="admin-card">
          <h3 className="text-sm font-semibold text-white/50 mb-4">
            Main Content
          </h3>
          <div className="space-y-4">
            <div>
              <label className="admin-label">Tagline</label>
              <input
                className="admin-input"
                value={(hero.tagline as string) || ""}
                onChange={(e) => update("tagline", e.target.value)}
              />
            </div>
            <div>
              <label className="admin-label">Headline</label>
              <input
                className="admin-input"
                value={(hero.headline as string) || ""}
                onChange={(e) => update("headline", e.target.value)}
              />
            </div>
            <div>
              <label className="admin-label">Subheadline</label>
              <textarea
                className="admin-input"
                value={(hero.subheadline as string) || ""}
                onChange={(e) => update("subheadline", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="admin-card">
          <h3 className="text-sm font-semibold text-white/50 mb-4">
            CTA Buttons
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Primary CTA Label</label>
              <input
                className="admin-input"
                value={ctaPrimary.label}
                onChange={(e) =>
                  update("ctaPrimary", { ...ctaPrimary, label: e.target.value })
                }
              />
            </div>
            <div>
              <label className="admin-label">Primary CTA Link</label>
              <input
                className="admin-input"
                value={ctaPrimary.href}
                onChange={(e) =>
                  update("ctaPrimary", { ...ctaPrimary, href: e.target.value })
                }
              />
            </div>
            <div>
              <label className="admin-label">Secondary CTA Label</label>
              <input
                className="admin-input"
                value={ctaSecondary.label}
                onChange={(e) =>
                  update("ctaSecondary", {
                    ...ctaSecondary,
                    label: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="admin-label">Secondary CTA Link</label>
              <input
                className="admin-input"
                value={ctaSecondary.href}
                onChange={(e) =>
                  update("ctaSecondary", {
                    ...ctaSecondary,
                    href: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-card">
          <h3 className="text-sm font-semibold text-white/50 mb-4">
            Stats Bar
          </h3>
          <div className="space-y-3">
            {stats.map((stat, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Value</label>
                  <input
                    className="admin-input"
                    value={stat.value}
                    onChange={(e) => {
                      const newStats = [...stats];
                      newStats[i] = { ...stat, value: e.target.value };
                      update("stats", newStats);
                    }}
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="admin-label">Label</label>
                    <input
                      className="admin-input"
                      value={stat.label}
                      onChange={(e) => {
                        const newStats = [...stats];
                        newStats[i] = { ...stat, label: e.target.value };
                        update("stats", newStats);
                      }}
                    />
                  </div>
                  <button
                    onClick={() =>
                      update(
                        "stats",
                        stats.filter((_, idx) => idx !== i),
                      )
                    }
                    className="admin-btn admin-btn-danger self-end"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                update("stats", [...stats, { value: "", label: "" }])
              }
              className="admin-btn admin-btn-secondary"
            >
              + Add Stat
            </button>
          </div>
        </div>

        {/* Scroll Sections */}
        <div className="admin-card">
          <h3 className="text-sm font-semibold text-white/50 mb-4">
            Scroll Sections
          </h3>
          <div className="space-y-4">
            {scrollSections.map((section, i) => (
              <div
                key={i}
                className="p-4 border border-white/5 rounded-lg space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="admin-label">Tag Label</label>
                    <input
                      className="admin-input"
                      value={section.tagLabel}
                      onChange={(e) => {
                        const s = [...scrollSections];
                        s[i] = { ...section, tagLabel: e.target.value };
                        update("scrollSections", s);
                      }}
                    />
                  </div>
                  <div>
                    <label className="admin-label">Alignment</label>
                    <select
                      className="admin-input"
                      value={section.align}
                      onChange={(e) => {
                        const s = [...scrollSections];
                        s[i] = { ...section, align: e.target.value };
                        update("scrollSections", s);
                      }}
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="admin-label">Title</label>
                  <input
                    className="admin-input"
                    value={section.title}
                    onChange={(e) => {
                      const s = [...scrollSections];
                      s[i] = { ...section, title: e.target.value };
                      update("scrollSections", s);
                    }}
                  />
                </div>
                <div>
                  <label className="admin-label">Text</label>
                  <textarea
                    className="admin-input"
                    value={section.text}
                    onChange={(e) => {
                      const s = [...scrollSections];
                      s[i] = { ...section, text: e.target.value };
                      update("scrollSections", s);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3D Hero Model Configuration */}
        <div className="admin-card">
          <h3 className="text-sm font-semibold text-white/50 mb-4">
            3D Hero Model (Scrollable Ball)
          </h3>

          {/* GLB Upload */}
          <div className="mb-4">
            <label className="admin-label">Custom .glb Model (optional)</label>
            {heroModel.modelFile ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                  <span className="text-teal-400 text-lg">📦</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-teal-400 font-mono truncate">
                      {heroModel.modelFile}
                    </p>
                    <p className="text-xs text-white/30">
                      Custom model — replaces default icosahedron
                    </p>
                  </div>
                  <button
                    onClick={() => updateHeroModel("modelFile", "")}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <label className="admin-btn admin-btn-secondary inline-flex items-center gap-2 cursor-pointer">
                  Replace File
                  <input
                    type="file"
                    accept=".glb,.gltf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadHeroModel(file);
                    }}
                  />
                </label>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-teal-500/40 transition-colors ${modelUploading ? "opacity-50 pointer-events-none" : ""}`}
              >
                <span className="text-3xl mb-2">📦</span>
                <span className="text-sm text-white/50">
                  {modelUploading
                    ? "Uploading..."
                    : "Upload .glb to replace default ball"}
                </span>
                <span className="text-xs text-white/20 mt-1">
                  Leave empty for default icosahedron
                </span>
                <input
                  type="file"
                  accept=".glb,.gltf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadHeroModel(file);
                  }}
                />
              </label>
            )}
          </div>

          {/* Colors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="admin-label">Solid Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={heroModel.solidColor}
                  onChange={(e) =>
                    updateHeroModel("solidColor", e.target.value)
                  }
                  className="w-10 h-10 rounded border border-white/10 bg-transparent"
                />
                <input
                  className="admin-input flex-1"
                  value={heroModel.solidColor}
                  onChange={(e) =>
                    updateHeroModel("solidColor", e.target.value)
                  }
                />
              </div>
            </div>
            <div>
              <label className="admin-label">Wire Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={heroModel.wireColor}
                  onChange={(e) => updateHeroModel("wireColor", e.target.value)}
                  className="w-10 h-10 rounded border border-white/10 bg-transparent"
                />
                <input
                  className="admin-input flex-1"
                  value={heroModel.wireColor}
                  onChange={(e) => updateHeroModel("wireColor", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="admin-label">Particle Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={heroModel.particleColor}
                  onChange={(e) =>
                    updateHeroModel("particleColor", e.target.value)
                  }
                  className="w-10 h-10 rounded border border-white/10 bg-transparent"
                />
                <input
                  className="admin-input flex-1"
                  value={heroModel.particleColor}
                  onChange={(e) =>
                    updateHeroModel("particleColor", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="admin-label">Particle Count</label>
            <input
              type="number"
              className="admin-input w-32"
              min="0"
              max="2000"
              value={heroModel.particleCount}
              onChange={(e) =>
                updateHeroModel("particleCount", parseInt(e.target.value) || 0)
              }
            />
            <p className="text-xs text-white/20 mt-1">
              0–2000 floating particles around the model
            </p>
          </div>

          {/* ─── Hero Viewer Settings ─── */}
          <div className="mt-6 p-4 border border-white/5 rounded-lg">
            <button
              type="button"
              onClick={() => setShowHeroViewerSettings((v) => !v)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-sm font-semibold text-white/50">
                🎥 Scene & Camera Settings
              </h3>
              <span className="text-white/30 text-xs">
                {showHeroViewerSettings ? "▲ Collapse" : "▼ Expand"}
              </span>
            </button>

            {showHeroViewerSettings && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="admin-label">
                    Camera Position (X / Y / Z)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((i) => (
                      <input
                        key={i}
                        type="number"
                        step="0.1"
                        className="admin-input"
                        value={(heroVS.cameraPosition as number[])[i]}
                        onChange={(e) => {
                          const pos = [
                            ...(heroVS.cameraPosition as number[]),
                          ] as [number, number, number];
                          pos[i] = parseFloat(e.target.value) || 0;
                          updateHeroModel("viewerSettings", {
                            ...(heroModel.viewerSettings || {}),
                            cameraPosition: pos,
                          });
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="admin-label">
                      FOV ({heroVS.cameraFov}°)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      step="1"
                      className="w-full accent-teal-500"
                      value={heroVS.cameraFov}
                      onChange={(e) =>
                        updateHeroModel("viewerSettings", {
                          ...(heroModel.viewerSettings || {}),
                          cameraFov: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="admin-label">Environment</label>
                    <select
                      className="admin-input"
                      value={heroVS.environmentPreset as string}
                      onChange={(e) =>
                        updateHeroModel("viewerSettings", {
                          ...(heroModel.viewerSettings || {}),
                          environmentPreset: e.target.value,
                        })
                      }
                    >
                      {ENVIRONMENT_PRESETS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="admin-label">
                      Model Scale (
                      {typeof heroVS.modelScale === "number"
                        ? heroVS.modelScale.toFixed(1)
                        : heroVS.modelScale}
                      )
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="8"
                      step="0.1"
                      className="w-full accent-teal-500"
                      value={heroVS.modelScale as number}
                      onChange={(e) =>
                        updateHeroModel("viewerSettings", {
                          ...(heroModel.viewerSettings || {}),
                          modelScale: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="admin-label">
                      Ambient (
                      {typeof heroVS.ambientIntensity === "number"
                        ? heroVS.ambientIntensity.toFixed(2)
                        : heroVS.ambientIntensity}
                      )
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.05"
                      className="w-full accent-teal-500"
                      value={heroVS.ambientIntensity as number}
                      onChange={(e) =>
                        updateHeroModel("viewerSettings", {
                          ...(heroModel.viewerSettings || {}),
                          ambientIntensity: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-label">
                    Directional Light (
                    {typeof heroVS.directionalIntensity === "number"
                      ? heroVS.directionalIntensity.toFixed(1)
                      : heroVS.directionalIntensity}
                    )
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full accent-teal-500"
                    value={heroVS.directionalIntensity as number}
                    onChange={(e) =>
                      updateHeroModel("viewerSettings", {
                        ...(heroModel.viewerSettings || {}),
                        directionalIntensity: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateHeroModel("viewerSettings", {});
                    showToast("Hero viewer settings reset to defaults");
                  }}
                  className="admin-btn admin-btn-secondary text-xs"
                >
                  Reset to Defaults
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
