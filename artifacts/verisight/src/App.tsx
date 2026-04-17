import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import SplashScreen from "@/components/SplashScreen";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [dismissed, setDismissed] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ position: "relative", overflow: dismissed ? "visible" : "hidden", height: dismissed ? "auto" : "100vh" }}>
        {/* Main content sits one viewport below the splash, slides up together */}
        <div
          style={{
            transform: dismissed ? "translateY(0)" : "translateY(100vh)",
            transition: "transform 1.5s cubic-bezier(0.45, 0, 0.55, 1)",
            willChange: "transform",
          }}
        >
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </div>

        {/* Splash sits on top, slides up simultaneously */}
        <SplashScreen onDismiss={() => setDismissed(true)} />
      </div>
    </QueryClientProvider>
  );
}

export default App;
