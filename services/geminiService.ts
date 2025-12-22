
import { GoogleGenAI, Type } from "@google/genai";
import { SummaryResult } from "../types";

export const sendMessageToGemini = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  newMessage: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

export const getQuickSuggestions = async (lastMessage: string): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Based on the following message, provide 3 short (1-4 words each), friendly, and futuristic quick reply suggestions. Return as a JSON array of strings.
    
    Message: "${lastMessage}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return ["Got it!", "On it!", "Ping me later"];
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return ["Understood", "Thanks!", "Will do"];
  }
};

export const generateChatSummary = async (messages: { sender: string; text: string }[]): Promise<SummaryResult | null> => {
  try {
    const transcript = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    const prompt = `Analyze the following chat transcript. Extract a brief summary, key decisions made, and a list of action items/next steps. 
    
    Transcript:
    ${transcript}`;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            decisions: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionItems: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "decisions", "actionItems"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text.trim()) as SummaryResult;
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return null;
  }
};

export interface CurrencyConversion {
  rate: number;
  result: number;
  note: string;
}

export const getCurrencyConversion = async (amount: number, from: string, to: string): Promise<CurrencyConversion | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as a real-time financial data service. Provide the current estimated conversion rate from ${from} to ${to} and calculate the result for ${amount} ${from}. Return a structured JSON object.
    
    Amount: ${amount}
    From: ${from}
    To: ${to}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rate: { type: Type.NUMBER, description: 'The current exchange rate.' },
            result: { type: Type.NUMBER, description: 'The converted amount.' },
            note: { type: Type.STRING, description: 'A short note about the market status or volatility.' }
          },
          required: ["rate", "result", "note"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text.trim()) as CurrencyConversion;
  } catch (error) {
    console.error("Gemini Currency Error:", error);
    return null;
  }
};
