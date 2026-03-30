"use client";

type ResultMode = "ai" | "canvas" | null;

interface RenderPreviewProps {
  originalUrl: string;
  resultUrl: string;
  resultMode: ResultMode;
  onReset: () => void;
  onNewUpload: () => void;
  isMockMode: boolean;
}

export default function RenderPreview({
  originalUrl,
  resultUrl,
  resultMode,
  onReset,
  onNewUpload,
  isMockMode,
}: RenderPreviewProps) {
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `behindcg-ai-photo-${Date.now()}.png`;
    a.click();
  };

  const isAI = resultMode === "ai";

  return (
    <div className="space-y-5">
      {/* AI Generated banner */}
      {isAI && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/8 border border-accent/20">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-bold text-accent uppercase tracking-widest font-mono">
              AI Generated
            </span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <p className="text-xs text-foreground/50 leading-relaxed">
            Real AI image generation via Replicate · Professional studio quality
          </p>
        </div>
      )}

      {/* Demo mode notice */}
      {isMockMode && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-yellow-500/8 border border-yellow-500/18 text-sm text-yellow-400/90">
          <svg
            className="w-4 h-4 mt-0.5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Demo mode — canvas compositing only. Add{" "}
            <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded font-mono">
              REPLICATE_API_TOKEN
            </code>{" "}
            to{" "}
            <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded font-mono">
              .env.local
            </code>{" "}
            for real AI generation.
          </span>
        </div>
      )}

      {/* Canvas fallback notice */}
      {!isMockMode && resultMode === "canvas" && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-500/8 border border-blue-500/15 text-sm text-blue-400/80">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>
            Canvas compositing used — add{" "}
            <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded font-mono">
              REPLICATE_API_TOKEN
            </code>{" "}
            for full AI generation.
          </span>
        </div>
      )}

      {/* Before / After */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-mono text-foreground/30 uppercase tracking-widest mb-2">
            Original
          </p>
          <div className="aspect-square rounded-xl overflow-hidden border border-white/8 bg-white/2 flex items-center justify-center">
            <img
              src={originalUrl}
              alt="Original product"
              className="w-full h-full object-contain p-3"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-mono text-foreground/30 uppercase tracking-widest">
              {isAI ? "AI Photo" : "Enhanced"}
            </p>
            {isAI ? (
              <span className="text-[9px] font-bold font-mono bg-accent text-black px-1.5 py-0.5 rounded uppercase tracking-wide">
                AI
              </span>
            ) : (
              <span className="text-[9px] font-mono bg-white/8 text-foreground/40 border border-white/10 px-1.5 py-0.5 rounded">
                Canvas
              </span>
            )}
          </div>
          <div
            className={`aspect-square rounded-xl overflow-hidden ${
              isAI
                ? "border border-accent/30 shadow-[0_0_36px_rgba(20,184,166,0.18)]"
                : "border border-white/12"
            }`}
          >
            <img
              src={resultUrl}
              alt="Enhanced product"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-[#0d9488] transition-colors shadow-[0_0_24px_rgba(20,184,166,0.2)]"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download PNG
        </button>
        <button
          onClick={onReset}
          className="px-5 py-3.5 rounded-xl border border-white/10 text-sm text-foreground/55 hover:text-foreground hover:border-white/20 transition-colors"
        >
          Try Style
        </button>
        <button
          onClick={onNewUpload}
          className="px-5 py-3.5 rounded-xl border border-white/10 text-sm text-foreground/55 hover:text-foreground hover:border-white/20 transition-colors"
        >
          New Image
        </button>
      </div>
    </div>
  );
}
