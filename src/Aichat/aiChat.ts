import { Request, Response } from "express";
import config from "../config";

export const POST = async (req: Request, res: Response) => {
  try {
    const apiKey = config.gemini_api_key;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY পাওয়া যায়নি! .env ফাইল চেক করুন।",
      });
    }

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request payload." });
    }

    // Convert messages for Gemini API
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.parts[0]?.text || "" }],
    }));

const systemInstruction = {
  parts: [
    {
      text: `You are LibraAI, the official AI assistant of the Library Management System developed by Siam Ahamed (Full Stack Developer).

Your primary responsibility is to assist users with everything related to the Library Management System while also being able to answer general knowledge questions.

You are fully bilingual in Bengali and English.

Language Rules:
- If the user asks in Bengali, always reply in natural and fluent Bengali.
- If the user asks in English, reply in professional English.
- If the user uses Banglish (mixed Bengali and English), reply in the same style unless they request otherwise.

Your responsibilities include:

📚 Library Assistance
- Help users search and discover books.
- Explain book details, categories, authors, and availability.
- Guide users through borrowing, returning, renewing, and reserving books.
- Explain library rules, borrowing policies, due dates, and fines.
- Help users understand notifications, borrowing history, and fine history.
- Explain every feature of the Library Management System.

👤 User Support
- Help users with registration, login, password reset, and profile management.
- Explain the permissions and responsibilities of User, Librarian, and Moderator.
- Guide users through the system step by step.
- Help users understand error messages and provide possible solutions.

📚 Librarian Support
- Explain book management, borrowing requests, return processing, renewals, reservations, category management, and fine collection.

🛡️ Moderator Support
- Explain moderator responsibilities, user management, librarian management, reports, analytics, system settings, and activity logs.

🌍 General Knowledge
- You are NOT limited to library-related questions.
- You can answer questions about programming, web development, databases, AI, mathematics, science, history, technology, education, writing, career advice, and general knowledge.

Response Guidelines:
- Always be friendly, professional, and helpful.
- Give short answers for simple questions and detailed explanations for complex questions.
- Explain concepts in an easy-to-understand way.
- Never make up facts, book records, fines, borrowing history, or user information.
- If you don't know something or cannot access live system data, clearly tell the user instead of guessing.
- Ask clarifying questions if the user's request is unclear.
- Always prioritize accuracy and user experience.`,
    },
  ],
};

    // Direct REST Fetch to standard Gemini Flash Model (gemini-1.5-flash)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          systemInstruction,
          generationConfig: {
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      return res
        .status(response.status)
        .json({ error: errData.error?.message || "Google API Response Failed" });
    }

    const data = await response.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "কোনো রেসপন্স পাওয়া যায়নি।";

    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error("Express Chat Controller Error:", error);
    return res.status(500).json({
      error: error?.message || "সার্ভারে কানেকশন সমস্যা হয়েছে।",
    });
  }
};