import { useState, useRef, useCallback } from "react";

export default function DetectPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) return;
    setVideoFile(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="vs-root vs-root--detect">
      <div className="vs-noise" />

      <div className="vs-detect-panel">
        <div className="vs-detect-panel-blur" />

        <div className="vs-detect-panel-inner">
          <p className="vs-detect-eyebrow">Deepfake Analysis</p>
          <h2 className="vs-detect-title">Upload your video</h2>

          <div
            className={`vs-detect-dropzone${isDragging ? " vs-detect-dropzone--active" : ""}${videoFile ? " vs-detect-dropzone--filled" : ""}`}
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="vs-hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />

            {videoFile ? (
              <div className="vs-detect-file-info">
                <div className="vs-detect-file-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="2" width="18" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M9 13l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="vs-detect-file-name">{videoFile.name}</span>
                <span className="vs-detect-file-size">{(videoFile.size / 1024 / 1024).toFixed(2)} MB · Ready</span>
              </div>
            ) : (
              <div className="vs-detect-empty">
                <div className="vs-detect-upload-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="vs-detect-dz-title">Drag &amp; drop your video here</p>
                <p className="vs-detect-dz-hint">or click to browse &middot; MP4, MOV, AVI</p>
              </div>
            )}
          </div>

          {videoFile && (
            <button className="vs-detect-btn">
              <svg viewBox="0 0 24 24" fill="none" className="vs-detect-btn-icon">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Detect Deepfake
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
