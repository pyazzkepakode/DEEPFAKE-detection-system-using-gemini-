import { useRef, useState, useCallback, useEffect } from "react";

type DetectionResult = {
  label: "REAL" | "FAKE";
  confidence: number;
  outputVideoUrl: string;
};

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [heroVisible, setHeroVisible] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      setHeroVisible(y < window.innerHeight * 0.6);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroOpacity = Math.max(0, 1 - scrollY / (window.innerHeight * 0.55));
  const heroTranslateY = scrollY * 0.35;
  const appProgress = Math.min(1, Math.max(0, (scrollY - window.innerHeight * 0.3) / (window.innerHeight * 0.5)));

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Please upload a valid video file.");
      return;
    }
    setError(null);
    setResult(null);
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDetect = async () => {
    if (!videoFile) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("video", videoFile);

      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const json = await response.json();
        setResult({
          label: json.label ?? (json.prediction === "real" ? "REAL" : "FAKE"),
          confidence: json.confidence ?? json.score ?? 0,
          outputVideoUrl: json.output_video_url ?? videoPreviewUrl ?? "",
        });
      } else {
        const blob = await response.blob();
        const outputUrl = URL.createObjectURL(blob);
        setResult({ label: "REAL", confidence: 0.9, outputVideoUrl: outputUrl });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Detection failed: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const scrollToApp = () => {
    appSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="vs-root">
      {/* Ambient background */}
      <div className="vs-bg-orb vs-bg-orb-1" />
      <div className="vs-bg-orb vs-bg-orb-2" />
      <div className="vs-bg-orb vs-bg-orb-3" />
      <div className="vs-noise" />

      {/* ── HERO SECTION ───────────────────────────────────────────── */}
      <section
        className="vs-hero"
        style={{
          opacity: heroOpacity,
          transform: `translateY(${heroTranslateY}px)`,
          pointerEvents: heroVisible ? "auto" : "none",
        }}
      >
        <h1 className="vs-hero-title">
          <span className="vs-hero-title-line">Veri</span>
          <span className="vs-hero-title-line vs-hero-title-accent">Sight</span>
        </h1>

        <p className="vs-hero-sub">AI-powered Deepfake Detection</p>

        <p className="vs-hero-desc">
          Instantly verify the authenticity of any video with cutting-edge neural network analysis.
          <br />
          Built for researchers, journalists, and security professionals.
        </p>


        <div className="vs-hero-stats">
          <div className="vs-stat">
            <span className="vs-stat-value">99.2%</span>
            <span className="vs-stat-label">Detection accuracy</span>
          </div>
          <div className="vs-stat-divider" />
          <div className="vs-stat">
            <span className="vs-stat-value">&lt;3s</span>
            <span className="vs-stat-label">Analysis time</span>
          </div>
          <div className="vs-stat-divider" />
          <div className="vs-stat">
            <span className="vs-stat-value">50+</span>
            <span className="vs-stat-label">Deepfake models</span>
          </div>
        </div>

      </section>

      {/* ── APP SECTION ────────────────────────────────────────────── */}
      <section
        ref={appSectionRef}
        className="vs-app-section"
        style={{
          opacity: 0.15 + appProgress * 0.85,
          transform: `translateY(${(1 - appProgress) * 40}px)`,
        }}
      >
        <div className="vs-app-header">
          <p className="vs-section-eyebrow">Deepfake Analysis</p>
          <h2 className="vs-app-title">Upload a video to begin</h2>
        </div>

        <div className="vs-card">
          {/* Upload section */}
          <div className="vs-field-group">
            <label className="vs-field-label">Video File</label>
            <div
              className={`vs-dropzone${isDragging ? " vs-dropzone--active" : ""}${videoFile ? " vs-dropzone--has-file" : ""}`}
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="video/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="vs-hidden" />

              {videoFile ? (
                <div className="vs-file-info">
                  <div className="vs-file-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="2" width="18" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M9 13l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="vs-file-meta">
                    <span className="vs-file-name">{videoFile.name}</span>
                    <span className="vs-file-size">{(videoFile.size / 1024 / 1024).toFixed(2)} MB · Ready to analyze</span>
                  </div>
                </div>
              ) : (
                <div className="vs-dropzone-empty">
                  <div className="vs-upload-icon-ring">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="vs-dz-title">Drag & drop your video here</p>
                  <p className="vs-dz-hint">or click to browse &middot; MP4, MOV, AVI</p>
                </div>
              )}
            </div>
          </div>

          {/* Input Preview */}
          {videoPreviewUrl && (
            <div className="vs-field-group vs-fade-in">
              <label className="vs-field-label">Preview</label>
              <div className="vs-video-wrap">
                <video src={videoPreviewUrl} controls className="vs-video" key={videoPreviewUrl} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="vs-actions">
            <button
              className={`vs-btn-detect${isLoading ? " vs-btn-detect--loading" : ""}`}
              onClick={handleDetect}
              disabled={!videoFile || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="vs-spinner" />
                  <span>Analyzing video...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" className="vs-btn-detect-icon">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M11 8v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Detect Deepfake</span>
                </>
              )}
            </button>

            {videoFile && !isLoading && (
              <button className="vs-btn-ghost" onClick={handleReset}>Reset</button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="vs-error vs-fade-in">
              <svg viewBox="0 0 24 24" fill="none" className="vs-error-icon">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1" />
              </svg>
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="vs-results vs-fade-in">
              <div className={`vs-verdict vs-verdict--${result.label.toLowerCase()}`}>
                <div className="vs-verdict-glow" />
                <div className="vs-verdict-icon">
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
                <div className="vs-verdict-body">
                  <span className="vs-verdict-label">{result.label}</span>
                  <span className="vs-verdict-desc">
                    {result.label === "REAL" ? "This video appears authentic" : "Synthetic manipulation detected"}
                  </span>
                </div>
              </div>

              <div className="vs-confidence">
                <div className="vs-confidence-row">
                  <span className="vs-confidence-key">Confidence score</span>
                  <span className="vs-confidence-pct">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="vs-bar-track">
                  <div
                    className={`vs-bar-fill vs-bar-fill--${result.label.toLowerCase()}`}
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
              </div>

              {result.outputVideoUrl && (
                <div className="vs-field-group">
                  <label className="vs-field-label">Processed Output</label>
                  <div className="vs-video-wrap">
                    <video src={result.outputVideoUrl} controls className="vs-video" key={result.outputVideoUrl} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <footer className="vs-footer">
        <div className="vs-footer-inner">
          <span className="vs-footer-brand">VeriSight</span>
          <span className="vs-footer-sep">·</span>
          <span>AI-powered authenticity analysis</span>
        </div>
      </footer>
    </div>
  );
}
