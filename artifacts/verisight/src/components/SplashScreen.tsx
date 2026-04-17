import { useState, useEffect } from "react";

const TAGLINE = "Because not everything on the internet is real.";
const START_DELAY = 500;
const CHAR_SPEED = 45;

type Props = { onDismiss: () => void };

export default function SplashScreen({ onDismiss }: Props) {
  const [phase, setPhase] = useState<"visible" | "sliding" | "gone">("visible");
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    timeout = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        i++;
        setTyped(TAGLINE.slice(0, i));
        if (i >= TAGLINE.length) {
          clearInterval(interval);
          setTimeout(() => setDone(true), 1200);
        }
      }, CHAR_SPEED);
    }, START_DELAY);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const dismiss = () => {
    if (phase !== "visible") return;
    setPhase("sliding");
    onDismiss();
    setTimeout(() => setPhase("gone"), 1600);
  };

  if (phase === "gone") return null;

  return (
    <div
      className={`vs-splash${phase === "sliding" ? " vs-splash--out" : ""}`}
      onClick={dismiss}
    >
      <div className="vs-splash-glow" />
      <div className="vs-splash-content">
        <div className="vs-splash-title">
          <span className="vs-splash-word">Veri</span>
          <span className="vs-splash-word vs-splash-word--accent">Sight</span>
        </div>
        <p className="vs-splash-sub">AI Powered Deepfake Detection</p>
        <p className="vs-splash-tagline">
          {typed}
          <span className={`vs-splash-cursor${done ? " vs-splash-cursor--done" : ""}`} />
        </p>
      </div>
    </div>
  );
}
