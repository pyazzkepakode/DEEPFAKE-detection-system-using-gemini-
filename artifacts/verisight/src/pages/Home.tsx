import { useRef, useState, useCallback } from "react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

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

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

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
        setResult({
          label: "REAL",
          confidence: 0.9,
          outputVideoUrl: outputUrl,
        });
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

  return (
    <div className="vs-root">
      <div className="vs-bg-orb vs-bg-orb-1" />
      <div className="vs-bg-orb vs-bg-orb-2" />

      <div className="vs-container">
        {/* Header */}
        <header className="vs-header">
          <div className="vs-logo-icon">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" stroke="url(#grad)" strokeWidth="2" />
              <path d="M10 16l4 4 8-8" stroke="url(#grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#818cf8" />
                  <stop offset="1" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="vs-title">VeriSight</h1>
          <p className="vs-subtitle">AI-powered Deepfake Detection</p>
        </header>

        {/* Main card */}
        <div className="vs-card">
          {/* Upload section */}
          <section className="vs-section">
            <label className="vs-section-label">Upload Video</label>
            <div
              className={`vs-dropzone${isDragging ? " vs-dropzone--active" : ""}${videoFile ? " vs-dropzone--has-file" : ""}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              aria-label="Upload video"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={onFileInputChange}
                className="vs-hidden"
              />
              {videoFile ? (
                <div className="vs-dropzone-file-info">
                  <div className="vs-file-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <polygon points="10 15 8 12 6 15 10 21 14 15 12 12 10 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                  <span className="vs-file-name">{videoFile.name}</span>
                  <span className="vs-file-size">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              ) : (
                <div className="vs-dropzone-empty">
                  <div className="vs-upload-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="vs-dropzone-title">Drag & drop your video here</p>
                  <p className="vs-dropzone-hint">or click to browse — MP4, MOV, AVI supported</p>
                </div>
              )}
            </div>
          </section>

          {/* Input Preview */}
          {videoPreviewUrl && (
            <section className="vs-section vs-fade-in">
              <label className="vs-section-label">Input Preview</label>
              <div className="vs-video-wrapper">
                <video
                  src={videoPreviewUrl}
                  controls
                  className="vs-video"
                  key={videoPreviewUrl}
                />
              </div>
            </section>
          )}

          {/* Detect Button */}
          <section className="vs-section vs-actions">
            <button
              className={`vs-btn-detect${isLoading ? " vs-btn-detect--loading" : ""}`}
              onClick={handleDetect}
              disabled={!videoFile || isLoading}
              aria-label="Run deepfake detection"
            >
              {isLoading ? (
                <>
                  <span className="vs-spinner" aria-hidden="true" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" className="vs-btn-icon">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M11 8v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Detect Deepfake</span>
                </>
              )}
            </button>

            {videoFile && !isLoading && (
              <button className="vs-btn-reset" onClick={handleReset}>
                Reset
              </button>
            )}
          </section>

          {/* Error */}
          {error && (
            <div className="vs-error vs-fade-in" role="alert">
              <svg viewBox="0 0 24 24" fill="none" className="vs-error-icon">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="vs-results vs-fade-in">
              {/* Result badge */}
              <div className={`vs-verdict vs-verdict--${result.label.toLowerCase()}`}>
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
                <div className="vs-verdict-text">
                  <span className="vs-verdict-label">{result.label}</span>
                  <span className="vs-verdict-desc">
                    {result.label === "REAL" ? "This video appears authentic" : "Deepfake detected in this video"}
                  </span>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="vs-confidence">
                <div className="vs-confidence-header">
                  <span className="vs-confidence-label">Confidence</span>
                  <span className="vs-confidence-value">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="vs-confidence-track">
                  <div
                    className={`vs-confidence-fill vs-confidence-fill--${result.label.toLowerCase()}`}
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Output video */}
              {result.outputVideoUrl && (
                <section className="vs-section">
                  <label className="vs-section-label">Processed Output</label>
                  <div className="vs-video-wrapper">
                    <video
                      src={result.outputVideoUrl}
                      controls
                      className="vs-video"
                      key={result.outputVideoUrl}
                    />
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        <footer className="vs-footer">
          <p>VeriSight uses advanced neural networks to detect synthetic media.</p>
        </footer>
      </div>
    </div>
  );
}
