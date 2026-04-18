import { useRef, useEffect, useState } from "react";

interface HomeProps {
  onLetsGo: () => void;
}

export default function Home({ onLetsGo }: HomeProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="vs-root vs-root--home">
      <div className="vs-noise" />

      <div
        ref={timelineRef}
        className={`vs-timeline-section${isVisible ? " is-visible" : ""}`}
      >
        <div className="vs-timeline-vertical-wrapper">
          <div className="vs-timeline-circle" />
        </div>

        <div className="vs-timeline-content">
          <div className="vs-timeline-item">
            <div className="vs-timeline-text-wrapper">
              <span className="vs-timeline-text">Trained on 6,000+ videos</span>
            </div>
            <div className="vs-timeline-horizontal" />
          </div>

          <div className="vs-timeline-item">
            <div className="vs-timeline-text-wrapper">
              <span className="vs-timeline-text">CNN + LSTM architecture</span>
            </div>
            <div className="vs-timeline-horizontal" />
          </div>

          <div className="vs-timeline-item">
            <div className="vs-timeline-text-wrapper">
              <span className="vs-timeline-text">Frame-by-frame analysis</span>
            </div>
            <div className="vs-timeline-horizontal" />
          </div>

          <div className="vs-timeline-item">
            <div className="vs-timeline-text-wrapper">
              <span className="vs-timeline-text">Temporal pattern detection</span>
            </div>
            <div className="vs-timeline-horizontal" />
          </div>
        </div>
      </div>

      <div className="vs-page-headline-wrap">
        <p className="vs-page-headline">
          <span className="vs-headline-line1">VeriSight is a deep learning&ndash;based deepfake detection system</span>
          <span className="vs-headline-line2">that analyzes video frames and motion patterns to identify manipulated content.</span>
        </p>
      </div>

      <div className="vs-find-out-wrap">
        <button className="vs-find-out-btn" onClick={onLetsGo}>Let's Find Out 👀</button>
      </div>
    </div>
  );
}
