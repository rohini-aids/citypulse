import { GoogleGenAI } from "@google/genai";
import { CityUpdate, CATEGORY_LABELS } from "../types";

const SYSTEM_INSTRUCTION = `
You are CityPulse AI, a helpful urban assistant. 
Your goal is to summarize a list of real-time city updates into a concise, actionable "Pulse Check" for a user.
- Focus on safety, major delays, and interesting events.
- Be brief (max 2-3 sentences).
- If there is high traffic or hazard, prioritize that.
- Tone: Professional, slightly informal, and urgent if necessary.
`;

export const getCityPulseSummary = async (updates: CityUpdate[], userLocation?: { lat: number, lng: number }): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key missing for Gemini");
    return "AI Pulse Check is unavailable (Missing API Key).";
  }

  if (updates.length === 0) {
    return "It's quiet out there! No updates reported in your area recently.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare data for the model
  const updatesSummary = updates.map(u => 
    `- [${CATEGORY_LABELS[u.category]}] ${u.description} (reported ${Math.floor((Date.now() - u.timestamp) / 60000)} mins ago)`
  ).join('\n');

  const locationContext = userLocation 
    ? `User is currently at Lat: ${userLocation.lat}, Lng: ${userLocation.lng}.` 
    : "User location is approximate.";

  const prompt = `
    ${locationContext}
    
    Current nearby updates:
    ${updatesSummary}

    Provide a "City Pulse" summary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 0 } // Fast response needed
      }
    });

    return response.text || "Unable to analyze the current pulse.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Temporary error contacting CityPulse AI.";
  }
};
