import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("visible");

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase("fading"), 2000);
    const goneTimer = setTimeout(() => setPhase("gone"), 2900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(goneTimer);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div className={`vs-splash${phase === "fading" ? " vs-splash--out" : ""}`}>
      <div className="vs-splash-content">
        <span className="vs-splash-word">Veri</span>
        <span className="vs-splash-word vs-splash-word--accent">Sight</span>
      </div>
    </div>
  );
}
