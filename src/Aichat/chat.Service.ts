// src/services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function generateReply(
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  newMessage: string
) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(newMessage);
  const response = result.response;

  return response.text();
}