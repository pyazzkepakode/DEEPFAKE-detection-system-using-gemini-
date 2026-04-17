export default function Home() {
  return (
    <div className="vs-root vs-root--home">
      <div className="vs-noise" />

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
