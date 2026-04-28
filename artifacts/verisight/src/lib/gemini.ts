import { GoogleGenAI } from "@google/genai";

export type ArtifactSeverity = "LOW" | "MEDIUM" | "HIGH" | "NONE";

export interface ForensicArtifact {
  label: string;
  description: string;
  detected: boolean;
  severity: ArtifactSeverity;
}

export interface GeminiForensicResult {
  label: "REAL" | "FAKE";
  confidence: number;
  summary: string;
  artifacts: ForensicArtifact[];
}

export interface DeepfakePrediction {
  label: "REAL" | "FAKE";
  confidence: number;
  reasoning: string;
  artifacts: ForensicArtifact[];
}

export async function predictDeepfake(videoFile: File): Promise<DeepfakePrediction> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY. Add it in artifacts/verisight/.env");
  }

  const ai = new GoogleGenAI({ apiKey });
  const base64Data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(videoFile);
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
  });

  const prompt = `
Conduct a frame-level forensic audit of this video.
Act as a digital forensics expert and analyze for deepfake artifacts.
Return ONLY JSON:
{
  "label": "REAL" or "FAKE",
  "confidence": 0.0 to 1.0,
  "reasoning": "Quick explanation",
  "artifacts": [
    {
      "label": "Lip Sync Accuracy",
      "description": "1 sentence technical finding",
      "detected": true or false,
      "severity": "LOW" | "MEDIUM" | "HIGH" | "NONE"
    },
    {
      "label": "Global Luma Consistency",
      "description": "1 sentence technical finding",
      "detected": true or false,
      "severity": "LOW" | "MEDIUM" | "HIGH" | "NONE"
    },
    {
      "label": "Skin Texture Detail",
      "description": "1 sentence technical finding",
      "detected": true or false,
      "severity": "LOW" | "MEDIUM" | "HIGH" | "NONE"
    },
    {
      "label": "Temporal Edge Stability",
      "description": "1 sentence technical finding",
      "detected": true or false,
      "severity": "LOW" | "MEDIUM" | "HIGH" | "NONE"
    }
  ]
}
Identify exactly 4 artifacts using those exact labels.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: videoFile.type || "video/mp4",
              data: base64Data,
            },
          },
        ],
      },
    ],
  });

  const text = response.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Invalid response from Gemini.");
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    label?: string;
    confidence?: number;
    reasoning?: string;
    artifacts?: Array<{
      label?: string;
      description?: string;
      detected?: boolean;
      severity?: string;
    }>;
  };

  const label = parsed.label === "FAKE" ? "FAKE" : "REAL";
  const confidence = Math.min(1, Math.max(0, parsed.confidence ?? 0));
  const allowedSeverities: ArtifactSeverity[] = ["LOW", "MEDIUM", "HIGH", "NONE"];
  const requiredLabels = [
    "Lip Sync Accuracy",
    "Global Luma Consistency",
    "Skin Texture Detail",
    "Temporal Edge Stability",
  ];

  const parsedArtifacts = Array.isArray(parsed.artifacts) ? parsed.artifacts : [];
  const artifacts: ForensicArtifact[] = requiredLabels.map((requiredLabel) => {
    const artifact = parsedArtifacts.find((item) => item?.label === requiredLabel);
    const severity = allowedSeverities.includes((artifact?.severity as ArtifactSeverity) ?? "NONE")
      ? (artifact?.severity as ArtifactSeverity)
      : "NONE";

    return {
      label: requiredLabel,
      description: artifact?.description?.trim() || "No anomaly detected in this category.",
      detected: Boolean(artifact?.detected),
      severity,
    };
  });

  return {
    label,
    confidence,
    reasoning: parsed.reasoning ?? "No forensic reasoning provided.",
    artifacts,
  };
}

export const analyzeVideo = async (videoFile: File): Promise<GeminiForensicResult> => {
  const prediction = await predictDeepfake(videoFile);
  return {
    label: prediction.label,
    confidence: prediction.confidence * 100,
    summary: prediction.reasoning,
    artifacts: prediction.artifacts,
  };
};




