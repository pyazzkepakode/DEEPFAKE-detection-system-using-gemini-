const FEATURES = [
  "Trained on 6,000+ videos",
  "CNN + LSTM architecture",
  "Frame-by-frame analysis",
  "Temporal pattern detection",
];

export default function Home() {
  return (
    <div className="vs-root vs-root--home">
      <div className="vs-noise" />

      {/* Left sidebar timeline */}
      <div className="vs-sidebar">
        <div className="vs-sidebar-vline" />
        <div className="vs-sidebar-top-dot" />
        <div className="vs-sidebar-items">
          {FEATURES.map((label, i) => (
            <div
              className="vs-sidebar-item"
              key={i}
              style={{ animationDelay: `${0.15 + i * 0.18}s` }}
            >
              <div className="vs-sidebar-hline" />
              <div className="vs-sidebar-dot" />
              <span className="vs-sidebar-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="vs-page-headline-wrap">
        <p className="vs-page-headline">
          <span className="vs-headline-line1">VeriSight is a deep learning&ndash;based deepfake detection system</span>
          <span className="vs-headline-line2">that analyzes video frames and motion patterns to identify manipulated content.</span>
        </p>
      </div>

      <div className="vs-find-out-wrap">
        <button className="vs-find-out-btn">Let's Find Out 👀</button>
      </div>
    </div>
  );
}
