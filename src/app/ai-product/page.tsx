"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";

const ProductUpload = dynamic(() => import("@/components/ai/ProductUpload"), {
  ssr: false,
});
const RenderPreview = dynamic(() => import("@/components/ai/RenderPreview"), {
  ssr: false,
});

type ResultMode = "ai" | "canvas" | null;

const LOADING_STAGES = [
  "Uploading image...",
  "Removing background...",
  "Generating AI scene...",
  "Finalizing...",
];

const STAGE_DURATIONS = [800, 4000, 12000, 3000];

export default function AIProductPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultMode, setResultMode] = useState<ResultMode>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stageIdx, setStageIdx] = useState(0);

  const hasFile = !!file;
  const hasResult = !!resultUrl;

  useEffect(() => {
    if (!isGenerating) { setStageIdx(0); return; }
    let idx = 0;
    const advance = () => {
      idx = Math.min(idx + 1, LOADING_STAGES.length - 1);
      setStageIdx(idx);
      if (idx < LOADING_STAGES.length - 1) {
        timer = setTimeout(advance, STAGE_DURATIONS[idx]);
      }
    };
    let timer = setTimeout(advance, STAGE_DURATIONS[0]);
    return () => clearTimeout(timer);
  }, [isGenerating]);

  const handleFileChange = useCallback((f: File, url: string) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(url);
    setResultUrl(null);
    setResultMode(null);
    setError(null);
    setIsMockMode(false);
  }, [previewUrl]);

  const handleClear = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setResultMode(null);
    setError(null);
    setIsMockMode(false);
  }, [previewUrl]);

  const handleReset = () => {
    setResultUrl(null);
    setResultMode(null);
    setError(null);
    setIsMockMode(false);
  };

  const handleGenerate = async () => {
    if (!file || !previewUrl) return;
    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/render-product", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setIsMockMode(data.mock ?? false);

      if (data.mode === "ai" && data.imageData) {
        setResultUrl(data.imageData);
        setResultMode("ai");
      } else if (data.imageData) {
        // Canvas fallback with transparent PNG
        const { compositeProductOnTemplate } = await import("@/lib/canvasComposite");
        const { TEMPLATES } = await import("@/lib/aiTemplates");
        const composited = await compositeProductOnTemplate(data.imageData, TEMPLATES[1]); // minimal-white
        setResultUrl(composited);
        setResultMode("canvas");
      } else {
        throw new Error(data.message ?? "Generation failed");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const step = hasResult ? 3 : hasFile ? 2 : 1;

  return (
    <div className="min-h-screen pt-[var(--space-15)] pb-[var(--space-12)]">
      <div className="container-site">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-mono uppercase tracking-[0.2em] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            AI Product Studio
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Product Photography
            <br />
            <span className="text-accent">Reimagined</span>
          </h1>
          <p className="text-foreground/45 text-lg max-w-lg mx-auto leading-relaxed">
            Upload a product photo and let AI generate professional studio-quality
            marketing visuals in seconds.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[{ n: 1, label: "Upload" }, { n: 2, label: "Generate" }, { n: 3, label: "Result" }].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${step >= s.n ? "bg-accent text-black" : "bg-white/[0.04] text-foreground/25 border border-white/8"}`}>
                  {step > s.n ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : s.n}
                </div>
                <span className={`text-sm transition-colors ${step >= s.n ? "text-foreground/65" : "text-foreground/22"}`}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className={`w-10 h-px mx-1 transition-colors duration-300 ${step > s.n ? "bg-accent/35" : "bg-white/8"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Main panel */}
        <div className="max-w-2xl mx-auto">
          {hasResult && resultUrl ? (
            <RenderPreview
              originalUrl={previewUrl!}
              resultUrl={resultUrl}
              resultMode={resultMode}
              onReset={handleReset}
              onNewUpload={handleClear}
              isMockMode={isMockMode}
            />
          ) : (
            <div className="space-y-4">
              {/* Upload */}
              <div className="glass rounded-2xl p-5">
                <p className="text-[10px] font-mono text-foreground/25 uppercase tracking-[0.2em] mb-4">
                  01 &nbsp;/&nbsp; Upload Product Image
                </p>
                <ProductUpload
                  file={file}
                  previewUrl={previewUrl}
                  onFileChange={handleFileChange}
                  onClear={handleClear}
                />
              </div>

              {/* Generate */}
              {hasFile && (
                <div className="space-y-3">
                  {error && (
                    <div className="px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/18 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full py-4 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-55 disabled:cursor-not-allowed bg-accent text-black hover:bg-[#0d9488] shadow-[0_0_32px_rgba(20,184,166,0.18)] hover:shadow-[0_0_44px_rgba(20,184,166,0.3)]"
                  >
                    {isGenerating ? (
                      <div className="flex flex-col items-center gap-2.5 w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                          <span>{LOADING_STAGES[stageIdx]}</span>
                        </div>
                        <div className="w-full max-w-xs h-0.5 bg-black/15 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-black/40 rounded-full transition-all duration-1000"
                            style={{ width: `${((stageIdx + 1) / LOADING_STAGES.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate AI Photo
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-foreground/18 font-mono">
                    Powered by Replicate AI · Background removal by remove.bg
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* How it works */}
        {!hasFile && (
          <div className="max-w-2xl mx-auto mt-16">
            <p className="text-center text-xs font-mono text-foreground/20 uppercase tracking-[0.25em] mb-8">
              How it works
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: "📤", title: "Upload", text: "Drop any product photo — any background, any lighting" },
                { icon: "🤖", title: "AI Generates", text: "AI removes bg and creates a professional studio scene" },
                { icon: "⚡", title: "Download", text: "Get a high-res PNG ready for marketing instantly" },
              ].map((item) => (
                <div key={item.title} className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <p className="text-sm font-semibold text-foreground/70 mb-1.5">{item.title}</p>
                  <p className="text-xs text-foreground/30 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-white/5" />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.025] border border-white/8">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-mono text-foreground/30 uppercase tracking-widest">
                  Real AI generation · Not filters
                </span>
              </div>
              <div className="h-px flex-1 bg-white/5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
