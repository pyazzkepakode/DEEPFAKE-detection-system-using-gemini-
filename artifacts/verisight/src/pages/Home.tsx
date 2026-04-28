import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FlowChart from "@/components/FlowChart";
import { Shield, Zap, Database, Lock } from "lucide-react";
interface HomeProps {
  onLetsGo: () => void;
}
export default function Home({ onLetsGo }: HomeProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  const features = [
    { icon: <Shield size={18} />, text: "Gemini 2.5 Flash", desc: "Powered by advanced multimodal forensic reasoning." },
    { icon: <Zap size={18} />, text: "Sub-Second Analysis", desc: "High-speed frame-level artifact detection via cloud API." },
    { icon: <Database size={18} />, text: "Multimodal Logic", desc: "Analyzing lip-sync, luma, and temporal stability." },
    { icon: <Lock size={18} />, text: "State-of-the-Art Detection", desc: "Continuous updates to combat emerging GAN/Diffusion threats." },
  ];
  return (
    <div className="vs-root vs-root--home">
      <div className="vs-noise" />
      <AnimatePresence>
        {isLoaded && (
          <motion.div 
            className="vs-home-scroll-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <header className="vs-home-hero">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 1 }}
              >
                <div className="vs-page-headline-wrap">
                  <p className="vs-page-headline vs-page-headline--forensic-glow">
                    <span className="vs-headline-line1">VeriSight is a Gemini-powered forensic auditing system</span>
                    <span className="vs-headline-line2">that utilizes multimodal intelligence to identify deepfake artifacts and manipulations.</span>
                  </p>
                </div>
              </motion.div>
            </header>
            <section className="vs-tech-section">
              <FlowChart />
            </section>
            <section className="vs-features-grid-container">
              <div className="vs-features-grid">
                {features.map((f, i) => (
                  <div key={i} className="vs-feature-wrapper">
                    <motion.div 
                      className="vs-feature-card"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * i }}
                    >
                      <div className="vs-feature-icon">{f.icon}</div>
                      <div className="vs-feature-info">
                        <h4>{f.text}</h4>
                        <p>{f.desc}</p>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </section>
            <footer className="vs-home-footer">
              <motion.div 
                className="vs-find-out-wrap vs-cta-bottom"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
              >
                <button className="vs-find-out-btn" onClick={onLetsGo}>
                  Initialize Detector <span className="btn-arrow">→</span>
                </button>
              </motion.div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
