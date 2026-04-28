import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Loader2, Eye, AlertTriangle, ShieldCheck } from "lucide-react";
import { analyzeVideo, type ForensicArtifact } from "../lib/gemini";
import "../styles/verisight.css";

interface DetectResult {
  label: string;
  confidence: number;
  filename: string;
  frames?: string[];
  faces?: string[];
  summary?: string;
  artifacts?: ForensicArtifact[];
}

const artifactContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const artifactCardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function DetectPage() {
  const [file, setFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DetectResult | null>(null);
  const [frameCount, setFrameCount] = useState(70);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const captureFrames = (src: string, count: number): Promise<{ frames: string[], faces: string[] }> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = src; video.crossOrigin = "anonymous"; video.muted = true;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const frames: string[] = [];
      const faces: string[] = [];
      let i = 0;
      video.addEventListener("loadedmetadata", () => {
        canvas.width = 480; canvas.height = 480;
        const step = () => {
          if (i >= count) { resolve({ frames, faces }); return; }
          video.currentTime = (video.duration / count) * i + 0.5;
          i++;
        };
        video.addEventListener("seeked", function onSeeked() {
          const size = Math.min(video.videoWidth, video.videoHeight);
          const sx = (video.videoWidth - size) / 2;
          const sy = (video.videoHeight - size) / 2;


          ctx.drawImage(video, sx, sy, size, size, 0, 0, 480, 480);
          frames.push(canvas.toDataURL("image/jpeg", 0.6));


          const faceSize = size * 0.55;
          const fsx = (video.videoWidth - faceSize) / 2;
          const fsy = (video.videoHeight - faceSize) / 3.5;
          ctx.drawImage(video, fsx, fsy, faceSize, faceSize, 0, 0, 480, 480);
          faces.push(canvas.toDataURL("image/jpeg", 0.6));

          if (frames.length < count) step();
          else { video.removeEventListener("seeked", onSeeked); resolve({ frames, faces }); }
        });
        step();
      });
      video.load();
    });
  };

  const handleFile = (f: File) => {
    setFile(f);
    setVideoPreview(URL.createObjectURL(f));
    setResult(null);
    setProgress(0);
    setError(null);
  };

  const runAnalysis = async () => {
    if (!file || !videoPreview) return;
    console.log("UI: Initializing Forensic Scan...");
    setIsAnalyzing(true);
    const interval = setInterval(() => setProgress(p => Math.min(p + 5, 95)), 150);

    try {
      console.log("UI: Capturing", frameCount, "frames...");
      const { frames, faces } = await captureFrames(videoPreview, frameCount);
      console.log("UI: Sending to Gemini for Live Analysis...");

      const geminiResult = await analyzeVideo(file);
      console.log("UI: Gemini analysis complete", geminiResult);

      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        setResult({
          label: geminiResult.label,
          confidence: geminiResult.confidence,
          filename: file.name,
          frames: frames,
          faces: faces,
          summary: geminiResult.summary,
          artifacts: geminiResult.artifacts ?? [],
        });
        setIsAnalyzing(false);
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setIsAnalyzing(false);
      setError(err.message || "Forensic scan failed. Please check your connection or API key.");
    }
  };

  return (
    <div className="vs-root vs-root--detect">
      <div className="vs-noise" />

      <div className="vs-detect-scroll">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="portal"
              className="vs-portal-wrap"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="vs-portal-header">
                <h1 className="vs-portal-title">Media Ingestion Portal</h1>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="vs-portal-error-banner"
                  >
                    <div className="vs-error-content">
                      <AlertTriangle size={14} className="vs-error-icon" />
                      <span>{error}</span>
                      <button className="vs-error-close" onClick={() => setError(null)}>×</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="vs-portal-main">
                <div className="vs-portal-scanner" />
                <motion.div
                  className="vs-portal-dropzone"
                  onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files[0];
                    if (f) handleFile(f);
                  }}
                  whileHover={!isAnalyzing ? { scale: 1.02 } : {}}
                  whileTap={!isAnalyzing ? { scale: 0.98 } : {}}
                >
                  {videoPreview ? (
                    <video
                      key={videoPreview}
                      ref={previewVideoRef}
                      src={videoPreview}
                      className="vs-portal-preview"
                      playsInline
                      autoPlay
                      muted
                      loop
                    />
                  ) : (
                    <div className="vs-portal-dz-text">
                      <p className="vs-portal-dz-title">Target Media Drop</p>
                      <p className="vs-portal-dz-hint">MP4, WEBM, MOV up to 50MB</p>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="mb-6"
                      >
                        <Shield className="w-12 h-12 text-indigo-400 opacity-50" />
                      </motion.div>
                      <div className="vs-analyzing-label font-mono tracking-widest text-indigo-300">
                        <Loader2 className="animate-spin" size={16} /> multimodal forensic scan...
                      </div>
                      <div className="vs-progress-track mt-4 max-w-[200px]">
                        <div className="vs-progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-[10px] text-indigo-400/60 mt-4 uppercase tracking-[0.2em]">Gemini 2.5 Flash: Neural Audit</p>
                    </div>
                  )}
                </motion.div>
              </div>



              {file && !isAnalyzing && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
                  <button className="vs-detect-btn px-12 py-4 text-lg" onClick={runAnalysis}>
                    <Shield className="w-5 h-5" /> Initialize Forensic Scan
                  </button>
                  <button className="vs-detect-ghost-btn" onClick={() => { setFile(null); setVideoPreview(null); }}>Eject media</button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              className="vs-report-container"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="vs-report-main vs-report-card">
                <div className="vs-verdict-hero">
                  <p className="vs-detect-section-label">Final forensic audit verdict</p>
                  <h2 className={`vs-verdict-badge vs-verdict-badge--${result.label.toLowerCase()}`}>
                    {result.label}
                  </h2>
                  <p className="vs-portal-desc max-w-md mx-auto">
                    {result.summary ||
                      `Audit completed using Gemini 2.5 Flash multimodal intelligence. Evaluated ${frameCount} frames for spatiotemporal consistency and facial artifact detection.`}
                  </p>
                </div>

                <div className="vs-meter-wrap">
                  <div className="vs-meter-label">
                    <span>Audit Confidence</span>
                    <span>{result.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="vs-meter-bar">
                    <motion.div
                      className={`vs-meter-fill vs-meter-fill--${result.label.toLowerCase()}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                  </div>
                </div>

              </div>

              <div className="vs-report-side">
                <button
                  className="vs-detect-btn w-full justify-center py-4"
                  onClick={() => { setFile(null); setVideoPreview(null); setResult(null); }}
                >
                  Start New Audit
                </button>
              </div>

              <div className="vs-frame-inspector vs-report-card">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="vs-detect-section-label">Full Frame Analysis</p>
                    <h3 className="text-xl font-medium mt-1">Spatio-Temporal Sequence</h3>
                  </div>
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    Original Captures
                  </div>
                </div>

                <div className="vs-inspector-grid">
                  {result.frames?.map((f, i) => (
                    <motion.div
                      key={i}
                      className="vs-inspector-frame"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * i }}
                    >
                      <img src={f} className="vs-inspector-img" />
                      <div className="vs-inspector-tag">FRAME_{i + 1}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-12">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="vs-detect-section-label">Face Analysis</p>
                      <h3 className="text-xl font-medium mt-1">Neural Consistency Audit</h3>
                    </div>
                    <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                      Detected Regions
                    </div>
                  </div>

                  <div className="vs-inspector-grid">
                    {result.faces?.length ? result.faces.map((f, i) => (
                      <motion.div
                        key={i}
                        className="vs-inspector-frame"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 * i }}
                      >
                        <img src={f} className="vs-inspector-img" />
                        <div className="vs-inspector-tag">FACE_{i + 1}</div>
                        <div className={`absolute bottom-0 inset-x-0 h-1 ${result.label === 'REAL' ? 'bg-emerald-500/50' : 'bg-red-500/50'}`} />
                      </motion.div>
                    )) : (
                      <div className="py-8 text-white/20 font-mono text-sm uppercase tracking-widest">No facial regions detected in sequence</div>
                    )}
                  </div>

                  <div className="vs-artifact-section">
                    <div className="vs-artifact-title">
                      <Eye size={14} /> Artifact Categorization
                    </div>

                    <motion.div
                      variants={artifactContainerVariants}
                      initial="hidden"
                      animate="visible"
                      className="vs-artifact-grid"
                    >
                      {(result.artifacts ?? []).map((artifact, i) => (
                        <motion.div
                          key={`${artifact.label}-${i}`}
                          variants={artifactCardVariants}
                          className="forensic-card vs-artifact-card"
                        >
                          <div className="vs-artifact-card-glow" />

                          <div className="vs-artifact-card-inner">
                            <div className="vs-artifact-card-head">
                              <span className="vs-artifact-label">{artifact.label}</span>

                              <span
                                className={`vs-artifact-severity ${artifact.severity === "HIGH"
                                    ? "vs-artifact-severity--high"
                                    : artifact.severity === "MEDIUM"
                                      ? "vs-artifact-severity--medium"
                                      : artifact.severity === "LOW"
                                        ? "vs-artifact-severity--low"
                                        : "vs-artifact-severity--none"
                                  }`}
                              >
                                {artifact.severity}
                              </span>
                            </div>

                            <p className="vs-artifact-description">
                              {artifact.description}
                            </p>

                            <div className="vs-artifact-footer">
                              {artifact.detected ? (
                                <div className="vs-artifact-status vs-artifact-status--detected">
                                  <AlertTriangle size={11} strokeWidth={2.5} />
                                  Neural Artifact Found
                                </div>
                              ) : (
                                <div className="vs-artifact-status vs-artifact-status--safe">
                                  <ShieldCheck size={11} strokeWidth={2.5} />
                                  Pattern Verified
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {(!result.artifacts || result.artifacts.length === 0) && (
                        <div className="vs-artifact-empty">
                          Artifact details were not returned for this scan.
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) handleFile(f);
      }} />
    </div>
  );
}
