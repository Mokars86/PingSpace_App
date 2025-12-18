import { GoogleGenAI } from "@google/genai";
import { SummaryResult } from "../types";

// Initialize the client with the environment API key
// Fixed: Use only process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  newMessage: string
): Promise<string> => {
  try {
    // Fixed: Use recommended model 'gemini-3-flash-preview' for basic text tasks
    const model = 'gemini-3-flash-preview';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        ...history, 
        { role: 'user', parts: [{ text: newMessage }] }
      ], 
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

    // Fixed: Use recommended model 'gemini-3-flash-preview' for summarization
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text.trim()) as SummaryResult;
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return null;
  }
};