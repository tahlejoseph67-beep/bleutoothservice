import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY || ''; 
  if (!apiKey) {
      console.warn("API Key not found");
      return null;
  }
  return new GoogleGenAI({ apiKey });
}

export const analyzeTransactionRisk = async (transaction: Transaction): Promise<string> => {
  const ai = createClient();
  if (!ai) return "Analyse IA non disponible (Clé API manquante).";

  try {
    const prompt = `
      Agis comme un expert en sécurité financière et analyse cette transaction.
      Donne une évaluation courte (max 2 phrases) sur le risque potentiel (Fraude, Blanchiment, ou Sûr).
      
      Détails de la transaction:
      - Type: ${transaction.type}
      - Montant: ${transaction.amount} FCFA
      - Méthode: ${transaction.method}
      - Bénéficiaire: ${transaction.recipient || 'N/A'}
      - Utilisateur: ${transaction.userName}
      - Date: ${transaction.date}

      Réponds en Français. Sois professionnel.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Pas d'analyse disponible.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erreur lors de l'analyse IA.";
  }
};
