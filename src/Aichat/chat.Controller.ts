// src/controllers/chatController.ts
import { PrismaClient } from "@prisma/client/extension";
import { Request, Response } from "express";
import { generateReply } from "./chat.Service";
import { ChactRole } from "../../generated/prisma/enums";

const prisma = new PrismaClient()

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
    const aiReply = await generateReply(history, message);

    // দুইটা message ই DB তে save করো
    await prisma.message.createMany({
      data: [
        { conversationId: convoId, role: "user", content: message },
        { conversationId: convoId, role: "model", content: aiReply },
      ],
    });

    return res.status(200).json({
      conversationId: convoId,
      reply: aiReply,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}