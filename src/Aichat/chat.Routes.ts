// src/routes/chatRoutes.ts
import { Router } from "express";
import { handleChat } from "./chat.Controller";

const router = Router();
router.post("/chat", handleChat);

export const chatRoutes =router ;