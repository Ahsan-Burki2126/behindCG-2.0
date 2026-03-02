"use client";

import { useEffect, useState, useCallback, useRef } from "react";

function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return <div className={`admin-toast admin-toast-${type}`}>{message}</div>;
}

interface MediaFile {
  name: string;
  path: string;
  size: number;
  modified: string;
}

const FOLDERS = ["images", "models", "fonts"] as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "webp", "avif", "svg"].includes(ext)) return "🖼️";
  if (["glb", "gltf", "fbx", "blend"].includes(ext)) return "🧊";
  if (["mp4", "webm"].includes(ext)) return "🎬";
  if (["hdr", "exr"].includes(ext)) return "🌅";
  if (["ttf", "otf", "woff", "woff2"].includes(ext)) return "🔤";
  return "📄";
}

export default function MediaManager() {
  const [folder, setFolder] = useState<string>("images");
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  const loadFiles = useCallback(() => {
    fetch(`/api/admin/upload?folder=${folder}`)
      .then((r) => r.json())
      .then((data) => setFiles(data.files || []));
  }, [folder]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const uploadFiles = async (fileList: FileList) => {
    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const file of Array.from(fileList)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) successCount++;
      else failCount++;
    }

    setUploading(false);
    loadFiles();

    if (successCount > 0)
      showToast(`${successCount} file${successCount > 1 ? "s" : ""} uploaded!`);
    if (failCount > 0)
      showToast(
        `${failCount} file${failCount > 1 ? "s" : ""} failed to upload`,
        "error",
      );
  };

  const deleteFile = async (filePath: string) => {
    if (!confirm("Delete this file?")) return;
    const res = await fetch(
      `/api/admin/upload?path=${encodeURIComponent(filePath)}`,
      { method: "DELETE" },
    );
    if (res.ok) {
      showToast("File deleted");
      loadFiles();
    } else showToast("Delete failed", "error");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = "";
    }
  };

  const isImage = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    return ["jpg", "jpeg", "png", "webp", "avif", "svg"].includes(ext);
  };

  return (
    <div data-admin-page>
      <div className="sticky top-16 lg:top-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-md -mx-4 px-4 lg:-mx-10 lg:px-10 py-4 mb-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Media Manager</h1>
            <p className="text-sm text-white/30">
              Upload and manage images, 3D models, and other assets
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="admin-btn admin-btn-primary"
          >
            Upload Files
          </button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept=".glb,.gltf,.fbx,.blend,.jpg,.jpeg,.png,.webp,.avif,.svg,.mp4,.webm,.hdr,.exr,.ttf,.otf,.woff,.woff2"
      />

      {/* Folder Tabs */}
      <div className="flex gap-2 mb-6">
        {FOLDERS.map((f) => (
          <button
            key={f}
            onClick={() => setFolder(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${folder === f ? "bg-teal-500/20 text-teal-400" : "text-white/40 hover:text-white/60"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-colors ${
          dragOver
            ? "border-teal-400 bg-teal-400/5"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        {uploading ? (
          <p className="text-white/50">Uploading...</p>
        ) : (
          <>
            <p className="text-white/40 text-lg mb-1">📁 Drop files here</p>
            <p className="text-white/20 text-sm">
              or click &quot;Upload Files&quot; button above
            </p>
          </>
        )}
      </div>

      {/* File Grid */}
      {files.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file) => (
            <div key={file.path} className="admin-card group p-3">
              <div className="aspect-square rounded-lg bg-white/5 flex items-center justify-center mb-2 overflow-hidden">
                {isImage(file.name) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/${file.path}`}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">{getFileIcon(file.name)}</span>
                )}
              </div>
              <p className="text-xs font-medium truncate" title={file.name}>
                {file.name}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-white/30 font-mono">
                  {formatBytes(file.size)}
                </span>
                <button
                  onClick={() => deleteFile(file.path)}
                  className="text-red-400/0 group-hover:text-red-400/60 hover:!text-red-400 transition-colors text-xs"
                >
                  Delete
                </button>
              </div>
              <div className="mt-1">
                <input
                  readOnly
                  value={`/${file.path}`}
                  className="w-full text-[10px] text-white/20 bg-transparent border-none outline-none font-mono cursor-text"
                  onClick={(e) => {
                    (e.target as HTMLInputElement).select();
                    navigator.clipboard.writeText(`/${file.path}`);
                    showToast("Path copied!");
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-card p-12 text-center">
          <p className="text-white/20">
            No files in{" "}
            <span className="font-mono text-white/30">{folder}/</span>
          </p>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
