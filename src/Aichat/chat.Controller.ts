// src/controllers/chatController.ts
import { Request, Response } from "express";
import { generateReply } from "./chat.Service";
import { ChactRole } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";

export async function handleChat(req: Request, res: Response) {
  try {
    const { conversationId, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    let convoId = conversationId;

    // নতুন conversation না থাকলে create করো
    if (!convoId) {
      const newConvo = await prisma.conversation.create({ data: {} });
      convoId = newConvo.id;
    }

    // আগের messages নিয়ে আসো (history হিসেবে পাঠানোর জন্য)
    const previousMessages = await prisma.message.findMany({
      where: { conversationId: convoId },
      orderBy: { createdAt: "asc" },
    });

    const history = previousMessages.map((m : any) => ({
      role: m.role as ChactRole,
      parts: [{ text: m.content }],
    }));

    // Gemini থেকে reply নাও
    const aiReply = await generateReply(history as any, message);

    // দুইটা message ই DB তে save করো
    await prisma.message.createMany({
      data: [
        { conversationId: convoId, role: "USER", content: message },
        { conversationId: convoId, role: "MODEL", content: aiReply },
      ],
    });

    return res.status(200).json({
      conversationId: convoId,
      reply: aiReply,
    });
  } catch (error: any) {
    console.error("Chat error:", error);

    // Gemini API quota exceeded error handling
    if (error?.status === 429 || error?.message?.includes("429")) {
      return res.status(429).json({
        error: "AI সার্ভিস এই মুহূর্তে ব্যস্ত। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
        code: "QUOTA_EXCEEDED",
      });
    }

    return res.status(500).json({ error: "কিছু একটা সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" });
  }
}