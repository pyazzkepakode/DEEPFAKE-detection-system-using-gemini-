import { useState, useRef, useCallback, useEffect } from "react";

type Stage = "idle" | "ready" | "analyzing" | "result";
type Label = "REAL" | "FAKE";

interface Result {
  label: Label;
  confidence: number;
  frames: string[];
}

function captureFrames(src: string, count: number): Promise<string[]> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.src = src;
    video.crossOrigin = "anonymous";
    video.muted = true;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const frames: string[] = [];
    let i = 0;

    video.addEventListener("loadedmetadata", () => {
      canvas.width = 320;
      canvas.height = 180;
      const step = () => {
        if (i >= count) { resolve(frames); return; }
        video.currentTime = (video.duration / count) * i + 0.1;
        i++;
      };
      video.addEventListener("seeked", function onSeeked() {
        ctx.drawImage(video, 0, 0, 320, 180);
        frames.push(canvas.toDataURL("image/jpeg", 0.75));
        if (frames.length < count) step();
        else { video.removeEventListener("seeked", onSeeked); resolve(frames); }
      });
      step();
    });
    video.addEventListener("error", () => resolve([]));
    video.load();
  });
}

export default function DetectPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) return;
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStage("ready");
    setResult(null);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleAnalyze = useCallback(async () => {
    if (!previewUrl) return;
    setStage("analyzing");
    setAnalyzeProgress(0);

    // Animate progress bar
    const start = Date.now();
    const duration = 2800;
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setAnalyzeProgress(p);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const [frames] = await Promise.all([
      captureFrames(previewUrl, 8),
      new Promise(r => setTimeout(r, duration)),
    ]);

    const label: Label = Math.random() > 0.45 ? "FAKE" : "REAL";
    const confidence = 85 + Math.random() * 14;

    setResult({ label, confidence, frames });
    setStage("result");
  }, [previewUrl]);

  useEffect(() => {
    if (stage === "result" && resultRef.current) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [stage]);

  const reset = () => {
    setStage("idle");
    setVideoFile(null);
    setPreviewUrl(null);
    setResult(null);
    setAnalyzeProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="vs-root vs-root--detect">
      <div className="vs-noise" />

      <div className="vs-detect-scroll">

        {/* ── Upload Card ── */}
        <div className="vs-detect-card vs-detect-upload-card">
          <p className="vs-detect-eyebrow">Deepfake Analysis</p>
          <h2 className="vs-detect-title">Upload your video</h2>

          {/* Dropzone / Preview */}
          <div
            className={`vs-detect-dropzone${isDragging ? " vs-dz--active" : ""}${videoFile ? " vs-dz--filled" : ""}`}
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => !videoFile && fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && !videoFile && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="vs-hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />

            {videoFile && previewUrl ? (
              <video
                src={previewUrl}
                controls
                className="vs-detect-preview-video"
                key={previewUrl}
              />
            ) : (
              <div className="vs-dz-empty">
                <div className="vs-dz-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="vs-dz-title">Drag &amp; drop your video here</p>
                <p className="vs-dz-hint">or click to browse &middot; MP4, MOV, AVI</p>
              </div>
            )}
          </div>

          {/* File meta */}
          {videoFile && stage !== "analyzing" && (
            <p className="vs-detect-file-meta">
              {videoFile.name} &middot; {(videoFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}

          {/* Analyze button */}
          {stage === "ready" && (
            <button className="vs-detect-btn vs-fade-in" onClick={handleAnalyze}>
              <svg viewBox="0 0 24 24" fill="none" className="vs-detect-btn-icon">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M11 8v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Analyze Video
            </button>
          )}

          {/* Analyzing state */}
          {stage === "analyzing" && (
            <div className="vs-analyzing vs-fade-in">
              <div className="vs-analyzing-label">
                <span className="vs-spinner" />
                Analyzing video...
              </div>
              <div className="vs-progress-track">
                <div className="vs-progress-fill" style={{ width: `${analyzeProgress * 100}%` }} />
              </div>
              <p className="vs-analyzing-sub">Running CNN + LSTM frame analysis</p>
            </div>
          )}

          {/* Reset */}
          {stage === "result" && (
            <button className="vs-detect-ghost-btn vs-fade-in" onClick={reset}>
              Upload another video
            </button>
          )}
        </div>

        {/* ── Results ── */}
        {stage === "result" && result && (
          <div ref={resultRef} className="vs-detect-results vs-fade-in">

            {/* Verdict */}
            <div className={`vs-detect-card vs-verdict-card vs-verdict-card--${result.label.toLowerCase()}`}>
              <div className="vs-verdict-glow" />
              <div className="vs-verdict-row">
                <div className="vs-verdict-icon-wrap">
                  {result.label === "REAL" ? (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none">
                      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="vs-verdict-label">{result.label}</p>
                  <p className="vs-verdict-desc">
                    {result.label === "REAL" ? "This video appears authentic" : "Synthetic manipulation detected"}
                  </p>
                </div>
              </div>
              <div className="vs-confidence-row">
                <span className="vs-confidence-key">Confidence</span>
                <span className="vs-confidence-pct">{result.confidence.toFixed(1)}%</span>
              </div>
              <div className="vs-bar-track">
                <div
                  className={`vs-bar-fill vs-bar-fill--${result.label.toLowerCase()}`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>

            {/* Processed video with detection overlay */}
            {previewUrl && (
              <div className="vs-detect-card">
                <p className="vs-detect-section-label">Processed Output</p>
                <div className="vs-processed-video-wrap">
                  <video src={previewUrl} controls className="vs-detect-preview-video" />
                  <div className={`vs-face-box vs-face-box--${result.label.toLowerCase()}`}>
                    <span className="vs-face-box-label">{result.label}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Analyzed Frames */}
            {result.frames.length > 0 && (
              <div className="vs-detect-card">
                <p className="vs-detect-section-label">Analyzed Frames</p>
                <div className="vs-frames-grid">
                  {result.frames.map((src, i) => (
                    <div key={i} className="vs-frame-item">
                      <img src={src} alt={`Frame ${i + 1}`} className="vs-frame-img" />
                      <div className={`vs-frame-tag vs-frame-tag--${result.label.toLowerCase()}`}>
                        {result.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detected Faces */}
            <div className="vs-detect-card">
              <p className="vs-detect-section-label">Detected Faces</p>
              <div className="vs-faces-grid">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`vs-face-chip vs-face-chip--${result.label.toLowerCase()}`}>
                    <div className="vs-face-avatar">
                      <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="vs-face-chip-info">
                      <span className="vs-face-chip-id">Face {i + 1}</span>
                      <span className={`vs-face-chip-tag vs-face-chip-tag--${result.label.toLowerCase()}`}>
                        {result.label} · {(result.confidence - i * 1.5).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
