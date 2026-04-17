import { useState } from "react";

type Props = { onDismiss: () => void };

export default function SplashScreen({ onDismiss }: Props) {
  const [phase, setPhase] = useState<"visible" | "sliding" | "gone">("visible");

  const dismiss = () => {
    if (phase !== "visible") return;
    setPhase("sliding");
    onDismiss(); // fires simultaneously — both panels move together
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
        <p className="vs-splash-sub">AI Model Powered Deepfake Detection</p>
        <p className="vs-splash-tagline">Because not everything on the internet is real.</p>
      </div>
    </div>
  );
}
