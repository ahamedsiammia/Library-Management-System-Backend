// src/services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config";
import { ChactRole } from "../../generated/prisma/enums";

const genAI = new GoogleGenerativeAI(config.gemini_api_key as string);

const SYSTEM_INSTRUCTION = `
You are a smart, helpful AI assistant integrated into the Library Management System.
You can answer ANY question on ANY topic — science, math, history, coding, general knowledge, life advice, creative writing, and everything else.
You are NOT limited to only library or project-related questions. Be a versatile, knowledgeable assistant.

However, if anyone asks about the developer/creator, why this project was made, or project details, provide these facts proudly:

Developer Profile:
- Name: Siam Ahamed
- Role: Full Stack Developer
- Birth Date: 05-09-2007 (September 5, 2007)
- Permanent Address: Bhaluka, Mymensingh, Bangladesh
- Present Address: Maskanda, Mymensingh, Bangladesh
- Educational Background: Passed SSC in 2023 with a Golden A+. Currently studying Diploma in Engineering (Computer Science and Technology) at Mymensingh Polytechnic Institute.

Project Details:
- Project Name: Library Management System
- Purpose: Developed as a high-quality college project and portfolio to modernize traditional libraries. It streamlines book cataloging, search, borrowing, student/user records, and moderation.
- Frontend Stack: React 19, Next.js 16, TailwindCSS v4, DaisyUI v5, Framer Motion.
- Backend Stack: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Neon DB).
- AI Feature: Integrated Gemini AI to guide users, recommend books, and assist moderators.

Be friendly, helpful, polite, and respond in the language the user interacts with (primarily Bengali or English).
`;

export async function generateReply(
  history: { role: ChactRole; parts: { text: string }[] }[],
  newMessage: string
) {
  // Available models - Gemini 3.x generation (2.x is deprecated/retired)
  const models = [
    "gemini-3.5-flash-lite",  // GA - low-latency, high-volume, cost-efficient
    "gemini-3.5-flash",       // GA - versatile, agentic workflows
  ];

  let lastError: any = null;

  for (const modelName of models) {
    try {
      console.log(`Attempting chat generation using model: ${modelName}`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION
      });
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(newMessage);
      const response = result.response;
      
      console.log(`Success: Generated reply using model: ${modelName}`);
      return response.text();
    } catch (error: any) {
      console.warn(`Model ${modelName} failed. Error: ${error?.message || error}`);
      lastError = error;
      // Continue to the next model in the list
    }
  }

  // If all models fail, throw the last encountered error
  throw lastError || new Error("Failed to generate response using any of the available Gemini models.");
}