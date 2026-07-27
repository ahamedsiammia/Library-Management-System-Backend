// src/services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config";
import { ChactRole } from "../../generated/prisma/enums";

const genAI = new GoogleGenerativeAI(config.gemini_api_key as string);

export async function generateReply(
  history: { role: ChactRole; parts: { text: string }[] }[],
  newMessage: string
) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(newMessage);
  const response = result.response;

  return response.text();
}