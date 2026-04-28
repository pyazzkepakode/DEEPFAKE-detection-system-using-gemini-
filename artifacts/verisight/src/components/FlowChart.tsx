import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, UserCheck, BrainCircuit, Activity, ShieldCheck } from "lucide-react";

const steps = [
  {
    id: "input",
    title: "Input Stream",
    desc: "Video frames extraction",
    details: "The system breaks your video down into many separate pictures called frames. This allows the AI to look at every single moment of the video very carefully to find any hidden errors.",
    icon: <PlayCircle className="w-6 h-6" />,
    color: "#a5b4fc"
  },
  {
    id: "detect",
    title: "Face Detection",
    desc: "face_recognition engine",
    details: "The AI automatically finds and zooms in on any faces in the video. It locks onto the face so it can watch for even the smallest changes in expressions or skin detail.",
    icon: <UserCheck className="w-6 h-6" />,
    color: "#c4b5fd"
  },
  {
    id: "resnext",
    title: "Neural Perception",
    desc: "Gemini Vision Tokenization",
    details: "Utilizes advanced visual tokenization to analyze skin texture, lighting consistency, and edge stability at a sub-pixel level.",
    icon: <BrainCircuit className="w-6 h-6" />,
    color: "#8b5cf6"
  },
  {
    id: "lstm",
    title: "Forensic Reasoning",
    desc: "Multimodal Logic Engine",
    details: "Cross-references temporal motion patterns with synthetic artifact signatures to identify deep-level manipulations.",
    icon: <Activity className="w-6 h-6" />,
    color: "#d8b4fe"
  },
  {
    id: "verdict",
    title: "Verdict",
    desc: "Final Authenticity Score",
    details: "Finally, the AI combines everything it saw into one simple score. It gives you a clear and honest answer on whether the video is REAL or a deepfake FAKE.",
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "#34d399"
  }
];

export default function FlowChart() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="vs-flow-container">
      <div className="vs-flow-wrapper" style={{ position: 'relative' }}>
        <motion.div
          className="vs-flow-master-pulse"
          animate={{
            left: ["0%", "100%"],
            opacity: [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
          }}
        />
        {steps.map((step, index) => (
          <div key={step.id} className="vs-flow-step-wrapper">
            <motion.div
              layout
              className="vs-flow-node"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                layout: { type: "spring", stiffness: 200, damping: 25 },
                opacity: { duration: 0.6 },
                scale: { duration: 0.6 }
              }}
              onHoverStart={() => setHoveredId(step.id)}
              onHoverEnd={() => setHoveredId(null)}
            >
              <div className="vs-flow-icon" style={{ color: step.color }}>
                {step.icon}
              </div>
              <div className="vs-flow-text">
                <h3>{step.title}</h3>
                <p className="vs-flow-short-desc">{step.desc}</p>

                <AnimatePresence>
                  {hoveredId === step.id && (
                    <motion.p
                      className="vs-flow-details"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {step.details}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="vs-flow-glow" style={{ backgroundColor: step.color }} />
            </motion.div>

            {index < steps.length - 1 && (
              <div className="vs-flow-connector-wrapper">
                <motion.div
                  className="vs-flow-connector"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index * 0.2) + 0.3, duration: 0.8 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
