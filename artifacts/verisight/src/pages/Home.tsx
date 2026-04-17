import { useState, useEffect } from "react";

const HEADLINE =
  "VeriSight is a deep learning\u2013based deepfake detection system that analyzes video frames and motion patterns to identify manipulated content.";

const START_DELAY = 400;
const CHAR_SPEED  = 38;

export default function Home() {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    timeout = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setDisplayed(HEADLINE.slice(0, i));
        if (i >= HEADLINE.length) clearInterval(interval);
      }, CHAR_SPEED);
    }, START_DELAY);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="vs-root">
      <div className="vs-bg-orb vs-bg-orb-1" />
      <div className="vs-bg-orb vs-bg-orb-2" />
      <div className="vs-bg-orb vs-bg-orb-3" />
      <div className="vs-noise" />

      <div className="vs-page-headline-wrap">
        <p className="vs-page-headline">{displayed}</p>
      </div>
    </div>
  );
}
