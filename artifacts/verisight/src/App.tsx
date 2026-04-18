import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/Home";
import DetectPage from "@/pages/DetectPage";
import SplashScreen from "@/components/SplashScreen";

const queryClient = new QueryClient();

const SLIDE = "transform 1.5s cubic-bezier(0.45, 0, 0.55, 1)";

function App() {
  const [page, setPage] = useState(0); // 0=splash, 1=home, 2=detect

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>

        {/* ── Page 3: Detect — sits below home, slides up on go ── */}
        <div style={{
          position: "absolute", inset: 0,
          overflowY: "auto",
          transform: page >= 2 ? "translateY(0)" : "translateY(100vh)",
          transition: SLIDE,
          willChange: "transform",
        }}>
          <DetectPage />
        </div>

        {/* ── Page 2: Home — slides up from below splash, then slides up to reveal detect ── */}
        <div style={{
          position: "absolute", inset: 0,
          transform: page === 0 ? "translateY(100vh)" : page === 1 ? "translateY(0)" : "translateY(-100vh)",
          transition: SLIDE,
          willChange: "transform",
        }}>
          <Home onLetsGo={() => setPage(2)} />
        </div>

        {/* ── Page 1: Splash — sits on top, slides up on dismiss ── */}
        <SplashScreen onDismiss={() => setPage(1)} />
      </div>
    </QueryClientProvider>
  );
}

export default App;
