"use client";

import { useRef, useState, useCallback } from "react";

interface ProductUploadProps {
  file: File | null;
  previewUrl: string | null;
  onFileChange: (file: File, previewUrl: string) => void;
  onClear: () => void;
}

export default function ProductUpload({
  file,
  previewUrl,
  onFileChange,
  onClear,
}: ProductUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    (f: File) => {
      if (!f.type.startsWith("image/")) return;
      if (f.size > 10 * 1024 * 1024) return;
      onFileChange(f, URL.createObjectURL(f));
    },
    [onFileChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) processFile(f);
    },
    [processFile],
  );

  if (previewUrl) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]">
        <img
          src={previewUrl}
          alt="Product preview"
          className="w-full max-h-64 object-contain py-4"
        />
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {file && (
            <span className="text-[10px] font-mono text-white/30 bg-black/50 px-2 py-1 rounded backdrop-blur-sm truncate max-w-[140px]">
              {file.name}
            </span>
          )}
          <button
            onClick={onClear}
            className="w-7 h-7 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-black/80 transition-colors backdrop-blur-sm text-sm"
            aria-label="Remove image"
          >
            ✕
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-accent/40" />
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 select-none ${
        isDragging
          ? "border-accent bg-accent/5 scale-[1.01]"
          : "border-white/10 hover:border-white/20 hover:bg-white/[0.015]"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) processFile(f);
          e.target.value = "";
        }}
      />

      <div className="flex flex-col items-center gap-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            isDragging ? "bg-accent/15" : "bg-white/[0.04]"
          }`}
        >
          <svg
            className={`w-7 h-7 transition-colors ${isDragging ? "text-accent" : "text-white/25"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground/75 mb-1">
            Drop your product image here
          </p>
          <p className="text-sm text-foreground/35">
            or{" "}
            <span className="text-accent underline underline-offset-2">
              browse files
            </span>
          </p>
        </div>

        <p className="text-xs font-mono text-foreground/20 tracking-wide">
          PNG · JPG · WebP &nbsp;·&nbsp; Max 10 MB
        </p>
      </div>
    </div>
  );
}
