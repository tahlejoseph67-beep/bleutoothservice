
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY || ''; 
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export const analyzeTransactionRisk = async (transaction: Transaction): Promise<string> => {
  const ai = createClient();
  if (!ai) return "Analyse IA non disponible.";

  try {
    const prompt = `Analyse cette transaction pour risque de fraude: ${transaction.type}, ${transaction.amount} FCFA par ${transaction.userName} via ${transaction.method}. Réponds brièvement en français.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Pas d'analyse.";
  } catch (error) {
    return "Erreur d'analyse.";
  }
};

export const verifyFaceMatch = async (referenceBase64: string, captureBase64: string): Promise<boolean> => {
  const ai = createClient();
  if (!ai) return true; // Fallback simulation if no API key

  try {
    const prompt = "Compare ces deux images. Est-ce qu'il s'agit de la même personne ? Réponds uniquement par 'OUI' ou 'NON'.";
    
    // Removing data:image/jpeg;base64, prefix if present
    const refData = referenceBase64.split(',')[1] || referenceBase64;
    const capData = captureBase64.split(',')[1] || captureBase64;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: refData } },
          { inlineData: { mimeType: 'image/jpeg', data: capData } },
          { text: prompt }
        ]
      },
    });

    const result = response.text?.toUpperCase() || "";
    return result.includes("OUI");
  } catch (error) {
    console.error("Facial Verification Error:", error);
    return true; // Demat simulation: trust user on API error for this mockup
  }
};
