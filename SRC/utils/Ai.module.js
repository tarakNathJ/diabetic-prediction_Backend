
import {GoogleGenerativeAI,HarmCategory ,HarmBlockThreshold} from '@google/generative-ai'
import {config} from 'dotenv'

config();

const apiKey = process.env.MODULE_ACCESS_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({
  model: process.env.MODULE_VERSION ,
});


export const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};