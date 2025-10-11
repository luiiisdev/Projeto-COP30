import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Pegar todas as conversas do usuário
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { buyerId: userId },
        { sellerId: userId }
      ]
    },
    include: { messages: { orderBy: { createdAt: "asc" } }, buyer: true, seller: true }
  });
  res.json(conversations);
});

// Enviar mensagem
router.post("/:conversationId", authMiddleware, async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;
  const senderId = req.user.id;

  const message = await prisma.message.create({
    data: {
      conversationId: parseInt(conversationId),
      senderId,
      content,
    }
  });
  res.json(message);
});

export default router;
