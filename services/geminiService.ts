import { GoogleGenAI } from "@google/genai";
import { SummaryResult } from "../types";

// Initialize the client with the environment API key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const sendMessageToGemini = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  newMessage: string
): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      return "PingAI: API Key is missing. Please configure the environment.";
    }

    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        ...history, 
        { role: 'user', parts: [{ text: newMessage }] }
      ] as any, 
      config: {
        systemInstruction: "You are PingAI, a helpful, futuristic AI assistant inside the PingSpace app. Keep responses concise, friendly, and formatted for a mobile chat interface.",
      }
    });

    return response.text || "PingAI: I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "PingAI: Connection error. Please try again later.";
  }
};

export const generateChatSummary = async (messages: { sender: string; text: string }[]): Promise<SummaryResult | null> => {
  try {
    if (!process.env.API_KEY) return null;

    const transcript = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    const prompt = `Analyze the following chat transcript. Extract a brief summary, key decisions made, and a list of action items/next steps. 
    
    Transcript:
    ${transcript}
    
    Return ONLY valid JSON in this format:
    {
      "summary": "...",
      "decisions": ["..."],
      "actionItems": ["..."]
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }] as any,
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as SummaryResult;
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return null;
  }
};