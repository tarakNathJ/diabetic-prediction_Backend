import { config } from "dotenv";

import { GoogleGenerativeAI } from "@google/generative-ai";
config();

const ApiKey = process.env.GOOGLE_API_KEY;
const Gemini_MOdelName = process.env.GEMINI_MODEL_NAME;

const googleGenerativeAI = new GoogleGenerativeAI(ApiKey);

export const model = googleGenerativeAI.getGenerativeModel({
    model:Gemini_MOdelName,
});

export const generationConfig  = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};