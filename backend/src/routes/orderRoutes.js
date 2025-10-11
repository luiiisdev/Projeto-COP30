import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Criar pedido
export const createOrder = async (req, res) => {
  try {
    const { bookIds, address } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });
    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0)
      return res.status(400).json({ error: "Nenhum livro selecionado" });
    if (!address) return res.status(400).json({ error: "Endereço não fornecido" });

    const booksFound = await prisma.book.findMany({ where: { id: { in: bookIds } } });
    if (booksFound.length !== bookIds.length)
      return res.status(400).json({ error: "Um ou mais livros não foram encontrados" });

    const order = await prisma.order.create({
      data: {
        userId,
        shippingAddress: address,
        totalAmount: booksFound.reduce((sum, b) => sum + (b.price || 0), 0),
        items: {
          create: booksFound.map(b => ({
            bookId: b.id,
            bookName: b.title,
            bookAuthor: b.author || null,
            bookImage: b.image || null,
            quantity: 1,
            price: b.price || 0
          }))
        }
      },
      include: { items: true }
    });

    res.json(order);
  } catch (err) {
    console.error("Erro ao criar pedido:", err);
    res.status(400).json({ error: "Erro ao finalizar compra" });
  }
};

// Pegar compras do usuário
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });

    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { orderDate: "desc" }
    });

    res.json(orders);
  } catch (err) {
    console.error("Erro ao buscar pedidos:", err);
    res.status(500).json({ error: "Erro ao buscar compras" });
  }
};

// Atualizar status do pedido
export const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { orderId } = req.params;
    const { status } = req.body;

    if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });
    if (!["PENDING", "DELIVERED"].includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const order = await prisma.order.findUnique({ where: { id: Number(orderId) } });
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });

    // Só o dono do pedido pode atualizar
    if (order.userId !== userId) {
      return res.status(403).json({ error: "Você não tem permissão para alterar este pedido" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { status },
      include: { items: true }
    });

    res.json(updatedOrder);
  } catch (err) {
    console.error("Erro ao atualizar pedido:", err);
    res.status(500).json({ error: "Erro ao atualizar pedido" });
  }
};

// Rotas
router.post("/", authMiddleware, createOrder);
router.get("/my", authMiddleware, getMyOrders);
router.put("/:orderId", authMiddleware, updateOrderStatus);

export default router;
