import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getOrCreateConversation = async (buyerId, sellerId) => {
  let conversation = await prisma.conversation.findFirst({
    where: {
      buyerId,
      sellerId,
    },
    include: { messages: true },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        buyerId,
        sellerId,
      },
      include: { messages: true },
    });
  }

  return conversation;
};

// Cria mensagem
export const sendMessage = async (conversationId, senderId, content) => {
  return await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
    },
  });
};
