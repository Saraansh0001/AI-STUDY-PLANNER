import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let _genAI = null;

const getGenAI = () => {
  if (!_genAI) {
    if (!apiKey || apiKey === 'INSERT_YOUR_GEMINI_API_KEY_HERE') {
      throw new Error("Missing or invalid VITE_GEMINI_API_KEY in .env file.");
    }
    _genAI = new GoogleGenerativeAI(apiKey);
  }
  return _genAI;
};

export const generateText = async (prompt, systemInstruction = null) => {
  try {
    const genAI = getGenAI();
    // Defaulting to gemini-2.5-flash for speed and reliability in general text tasks
    const modelOptions = { model: "gemini-2.5-flash" };
    if (systemInstruction) {
        modelOptions.systemInstruction = systemInstruction;
    }
    const model = genAI.getGenerativeModel(modelOptions);
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error (generateText):", error);
    throw error;
  }
};

export const generateJSON = async (prompt, systemInstruction = null, responseSchema = null) => {
  try {
    const genAI = getGenAI();
    const modelOptions = { 
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json"
        }
    };
    if (systemInstruction) {
        modelOptions.systemInstruction = systemInstruction;
    }
    if (responseSchema) {
        modelOptions.generationConfig.responseSchema = responseSchema;
    }
    
    const model = genAI.getGenerativeModel(modelOptions);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error (generateJSON):", error);
    throw error;
  }
};
