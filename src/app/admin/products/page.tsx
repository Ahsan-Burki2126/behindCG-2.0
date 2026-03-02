"use client";

import { useEffect, useState, useCallback } from "react";
import { useRefreshContent } from "@/lib/ContentContext";
import {
  VIEWER_DEFAULTS,
  ENVIRONMENT_PRESETS,
} from "@/components/three/InlineModelPreview";

function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return <div className={`admin-toast admin-toast-${type}`}>{message}</div>;
}

interface ProductModel {
  variant: string;
  color: string;
  wireColor: string;
  distort: boolean;
}

interface ViewerSettingsData {
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

interface Product {
  id: string;
  title: string;
  price: string;
  priceValue: number;
  category: string;
  format: string;
  polycount: string;
  description: string;
  modelFile?: string;
  viewerSettings?: Partial<ViewerSettingsData>;
  model: ProductModel;
  specs: [string, string][];
}

const VARIANTS = [
  "sphere",
  "torus",
  "torusKnot",
  "icosahedron",
  "octahedron",
  "dodecahedron",
  "cone",
  "cylinder",
];

const emptyProduct: Product = {
  id: "",
  title: "",
  price: "$0",
  priceValue: 0,
  category: "3D Model",
  format: "GLB / FBX / BLEND",
  polycount: "",
  description: "",
  modelFile: "",
  viewerSettings: {},
  model: {
    variant: "sphere",
    color: "#0a1a1a",
    wireColor: "#14b8a6",
    distort: true,
  },
  specs: [],
};

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const refreshContent = useRefreshContent();
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [modelUploading, setModelUploading] = useState(false);
  const [showViewerSettings, setShowViewerSettings] = useState(false);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  const load = useCallback(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing({ ...emptyProduct, specs: [] });
    setIsNew(true);
  };

  const openEdit = (p: Product) => {
    setEditing({ ...p, specs: [...(p.specs || [])] });
    setIsNew(false);
  };

  const saveProduct = async () => {
    if (!editing) return;
    const method = isNew ? "POST" : "PUT";
    const res = await fetch("/api/admin/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      showToast(isNew ? "Product created!" : "Product updated!");
      refreshContent();
      setEditing(null);
      load();
    } else {
      const err = await res.json();
      showToast(err.error || "Save failed", "error");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/admin/products?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      showToast("Product deleted");
      load();
    } else showToast("Delete failed", "error");
  };

  const updateEditing = (key: keyof Product, value: unknown) => {
    if (!editing) return;
    if (key === "priceValue") {
      const numVal = value as number;
      setEditing({ ...editing, priceValue: numVal, price: `$${numVal}` });
    } else {
      setEditing({ ...editing, [key]: value });
    }
  };

  const updateModel = (key: keyof ProductModel, value: unknown) => {
    if (!editing) return;
    setEditing({ ...editing, model: { ...editing.model, [key]: value } });
  };

  const updateSpec = (index: number, col: 0 | 1, value: string) => {
    if (!editing) return;
    const newSpecs = [...editing.specs];
    newSpecs[index] = [...newSpecs[index]] as [string, string];
    newSpecs[index][col] = value;
    setEditing({ ...editing, specs: newSpecs });
  };

  const uploadModelFile = async (file: File) => {
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
        if (!editing) return;
        setEditing({ ...editing, modelFile: path });
        showToast("3D model uploaded!");
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

  const getVS = (): ViewerSettingsData =>
    ({
      ...VIEWER_DEFAULTS,
      ...(editing?.viewerSettings || {}),
    }) as ViewerSettingsData;

  const updateVS = <K extends keyof ViewerSettingsData>(
    key: K,
    value: ViewerSettingsData[K],
  ) => {
    if (!editing) return;
    setEditing({
      ...editing,
      viewerSettings: { ...(editing.viewerSettings || {}), [key]: value },
    });
  };

  const resetViewerSettings = () => {
    if (!editing) return;
    setEditing({ ...editing, viewerSettings: {} });
    showToast("Viewer settings reset to defaults");
  };

  return (
    <div data-admin-page>
      <div className="sticky top-16 lg:top-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-md -mx-4 px-4 lg:-mx-10 lg:px-10 py-4 mb-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-sm text-white/30">
              {products.length} products in shop
            </p>
          </div>
          <button onClick={openNew} className="admin-btn admin-btn-primary">
            + New Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-white/40">
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Format</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-white/50">{p.category}</td>
                <td className="p-3 text-teal-400 font-mono">{p.price}</td>
                <td className="p-3 text-white/50 text-xs">{p.format}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => openEdit(p)}
                    className="text-teal-400 hover:text-teal-300 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-white/20">
                  No products yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          />
          <div className="relative bg-[#0f0f18] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">
                {isNew ? "New Product" : "Edit Product"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="text-white/40 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="admin-label">Title</label>
                <input
                  className="admin-input"
                  value={editing.title}
                  onChange={(e) => updateEditing("title", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="admin-label">Price ($)</label>
                  <input
                    className="admin-input"
                    type="number"
                    min="0"
                    value={editing.priceValue}
                    onChange={(e) =>
                      updateEditing(
                        "priceValue",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="admin-label">Category</label>
                  <input
                    className="admin-input"
                    value={editing.category}
                    onChange={(e) => updateEditing("category", e.target.value)}
                  />
                </div>
                <div>
                  <label className="admin-label">Polycount</label>
                  <input
                    className="admin-input"
                    value={editing.polycount}
                    onChange={(e) => updateEditing("polycount", e.target.value)}
                    placeholder="e.g. 12,400 tris"
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">File Formats</label>
                <input
                  className="admin-input"
                  value={editing.format}
                  onChange={(e) => updateEditing("format", e.target.value)}
                  placeholder="GLB / FBX / BLEND"
                />
              </div>

              <div>
                <label className="admin-label">Description</label>
                <textarea
                  className="admin-input"
                  rows={3}
                  value={editing.description}
                  onChange={(e) => updateEditing("description", e.target.value)}
                />
              </div>

              {/* Specs */}
              <div>
                <label className="admin-label">Specifications</label>
                <div className="space-y-2 mb-2">
                  {editing.specs.map((spec, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-5 gap-2 items-center"
                    >
                      <input
                        className="admin-input col-span-2"
                        value={spec[0]}
                        onChange={(e) => updateSpec(i, 0, e.target.value)}
                        placeholder="Label"
                      />
                      <input
                        className="admin-input col-span-2"
                        value={spec[1]}
                        onChange={(e) => updateSpec(i, 1, e.target.value)}
                        placeholder="Value"
                      />
                      <button
                        onClick={() =>
                          updateEditing(
                            "specs",
                            editing.specs.filter((_, idx) => idx !== i),
                          )
                        }
                        className="admin-btn admin-btn-danger"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() =>
                    updateEditing("specs", [...editing.specs, ["", ""]])
                  }
                  className="admin-btn admin-btn-secondary"
                >
                  + Add Spec
                </button>
              </div>

              {/* 3D Model File Upload */}
              <div className="p-4 border border-white/5 rounded-lg">
                <h3 className="text-sm font-semibold text-white/50 mb-3">
                  3D Model File (.glb)
                </h3>

                {editing.modelFile ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                      <span className="text-teal-400 text-lg">📦</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-teal-400 font-mono truncate">
                          {editing.modelFile}
                        </p>
                        <p className="text-xs text-white/30">
                          3D model uploaded
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (!editing) return;
                          setEditing({ ...editing, modelFile: "" });
                        }}
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
                          if (file) uploadModelFile(file);
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label
                      className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-teal-500/40 transition-colors ${modelUploading ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <span className="text-3xl mb-2">📦</span>
                      <span className="text-sm text-white/50">
                        {modelUploading
                          ? "Uploading..."
                          : "Click to upload .glb / .gltf file"}
                      </span>
                      <span className="text-xs text-white/20 mt-1">
                        Max 100MB
                      </span>
                      <input
                        type="file"
                        accept=".glb,.gltf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadModelFile(file);
                        }}
                      />
                    </label>
                    <p className="text-xs text-white/20">
                      No file uploaded — a fallback procedural shape will be
                      shown
                    </p>
                  </div>
                )}
              </div>

              {/* Fallback 3D Preview Model */}
              {!editing.modelFile && (
                <div className="p-4 border border-white/5 rounded-lg">
                  <h3 className="text-sm font-semibold text-white/50 mb-3">
                    Fallback 3D Preview (used if no .glb uploaded)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="admin-label">Geometry</label>
                      <select
                        className="admin-input"
                        value={editing.model.variant}
                        onChange={(e) => updateModel("variant", e.target.value)}
                      >
                        {VARIANTS.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">Distort</label>
                      <select
                        className="admin-input"
                        value={editing.model.distort ? "yes" : "no"}
                        onChange={(e) =>
                          updateModel("distort", e.target.value === "yes")
                        }
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">Base Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={editing.model.color}
                          onChange={(e) => updateModel("color", e.target.value)}
                          className="w-10 h-10 rounded border border-white/10 bg-transparent"
                        />
                        <input
                          className="admin-input flex-1"
                          value={editing.model.color}
                          onChange={(e) => updateModel("color", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="admin-label">Wire Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={editing.model.wireColor}
                          onChange={(e) =>
                            updateModel("wireColor", e.target.value)
                          }
                          className="w-10 h-10 rounded border border-white/10 bg-transparent"
                        />
                        <input
                          className="admin-input flex-1"
                          value={editing.model.wireColor}
                          onChange={(e) =>
                            updateModel("wireColor", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── 3D Viewer Settings ─── */}
              <div className="p-4 border border-white/5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setShowViewerSettings((v) => !v)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-semibold text-white/50">
                    🎥 3D Viewer Settings
                  </h3>
                  <span className="text-white/30 text-xs">
                    {showViewerSettings ? "▲ Collapse" : "▼ Expand"}
                  </span>
                </button>

                {showViewerSettings &&
                  (() => {
                    const vs = getVS();
                    return (
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
                                value={vs.cameraPosition[i]}
                                onChange={(e) => {
                                  const pos = [...vs.cameraPosition] as [
                                    number,
                                    number,
                                    number,
                                  ];
                                  pos[i] = parseFloat(e.target.value) || 0;
                                  updateVS("cameraPosition", pos);
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="admin-label">
                              FOV ({vs.cameraFov}°)
                            </label>
                            <input
                              type="range"
                              min="10"
                              max="120"
                              step="1"
                              className="w-full accent-teal-500"
                              value={vs.cameraFov}
                              onChange={(e) =>
                                updateVS("cameraFov", parseInt(e.target.value))
                              }
                            />
                          </div>
                          <div>
                            <label className="admin-label">Environment</label>
                            <select
                              className="admin-input"
                              value={vs.environmentPreset}
                              onChange={(e) =>
                                updateVS("environmentPreset", e.target.value)
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
                              Model Scale ({vs.modelScale.toFixed(1)})
                            </label>
                            <input
                              type="range"
                              min="0.1"
                              max="5"
                              step="0.1"
                              className="w-full accent-teal-500"
                              value={vs.modelScale}
                              onChange={(e) =>
                                updateVS(
                                  "modelScale",
                                  parseFloat(e.target.value),
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="admin-label">
                              Rotate Speed ({vs.autoRotateSpeed.toFixed(1)})
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="3"
                              step="0.1"
                              className="w-full accent-teal-500"
                              value={vs.autoRotateSpeed}
                              onChange={(e) =>
                                updateVS(
                                  "autoRotateSpeed",
                                  parseFloat(e.target.value),
                                )
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label className="admin-label">
                            Model Position Offset (X / Y / Z)
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[0, 1, 2].map((i) => (
                              <input
                                key={i}
                                type="number"
                                step="0.1"
                                className="admin-input"
                                value={vs.modelPosition[i]}
                                onChange={(e) => {
                                  const pos = [...vs.modelPosition] as [
                                    number,
                                    number,
                                    number,
                                  ];
                                  pos[i] = parseFloat(e.target.value) || 0;
                                  updateVS("modelPosition", pos);
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="admin-label">
                            Model Rotation (X / Y / Z in degrees)
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[0, 1, 2].map((i) => (
                              <input
                                key={i}
                                type="number"
                                step="5"
                                className="admin-input"
                                value={vs.modelRotation[i]}
                                onChange={(e) => {
                                  const rot = [...vs.modelRotation] as [
                                    number,
                                    number,
                                    number,
                                  ];
                                  rot[i] = parseFloat(e.target.value) || 0;
                                  updateVS("modelRotation", rot);
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="admin-label">
                              Ambient Light ({vs.ambientIntensity.toFixed(2)})
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="2"
                              step="0.05"
                              className="w-full accent-teal-500"
                              value={vs.ambientIntensity}
                              onChange={(e) =>
                                updateVS(
                                  "ambientIntensity",
                                  parseFloat(e.target.value),
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="admin-label">
                              Directional Light (
                              {vs.directionalIntensity.toFixed(1)})
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="5"
                              step="0.1"
                              className="w-full accent-teal-500"
                              value={vs.directionalIntensity}
                              onChange={(e) =>
                                updateVS(
                                  "directionalIntensity",
                                  parseFloat(e.target.value),
                                )
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label className="admin-label">
                            Directional Light Color
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={vs.directionalColor}
                              onChange={(e) =>
                                updateVS("directionalColor", e.target.value)
                              }
                              className="w-10 h-10 rounded border border-white/10 bg-transparent"
                            />
                            <input
                              className="admin-input flex-1"
                              value={vs.directionalColor}
                              onChange={(e) =>
                                updateVS("directionalColor", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={vs.autoRotate}
                              onChange={(e) =>
                                updateVS("autoRotate", e.target.checked)
                              }
                              className="accent-teal-500"
                            />
                            <span className="text-sm text-white/60">
                              Auto-Rotate
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={vs.showShadows}
                              onChange={(e) =>
                                updateVS("showShadows", e.target.checked)
                              }
                              className="accent-teal-500"
                            />
                            <span className="text-sm text-white/60">
                              Shadows
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={vs.showFloat}
                              onChange={(e) =>
                                updateVS("showFloat", e.target.checked)
                              }
                              className="accent-teal-500"
                            />
                            <span className="text-sm text-white/60">Float</span>
                          </label>
                        </div>

                        <button
                          type="button"
                          onClick={resetViewerSettings}
                          className="admin-btn admin-btn-secondary text-xs"
                        >
                          Reset to Defaults
                        </button>
                      </div>
                    );
                  })()}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
              <button
                onClick={() => setEditing(null)}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={saveProduct}
                className="admin-btn admin-btn-primary"
              >
                {isNew ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
