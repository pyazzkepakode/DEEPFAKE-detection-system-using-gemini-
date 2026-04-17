import { useState } from "react";

export default function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "sliding" | "gone">("visible");

  const dismiss = () => {
    if (phase !== "visible") return;
    setPhase("sliding");
    setTimeout(() => setPhase("gone"), 900);
  };

  if (phase === "gone") return null;

  return (
    <div
      className={`vs-splash${phase === "sliding" ? " vs-splash--out" : ""}`}
      onClick={dismiss}
    >
      <div className="vs-splash-glow" />
      <div className="vs-splash-content">
        <span className="vs-splash-word">Veri</span>
        <span className="vs-splash-word vs-splash-word--accent">Sight</span>
      </div>
    </div>
  );
}
