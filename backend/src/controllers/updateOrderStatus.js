import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });
    if (!orderId) return res.status(400).json({ error: "ID do pedido é obrigatório" });
    if (!status) return res.status(400).json({ error: "Status é obrigatório" });
    if (!["PENDING", "DELIVERED"].includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const order = await prisma.order.findUnique({ where: { id: parseInt(orderId) } });
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });

    // Garante que só o dono do pedido possa atualizar
    if (order.userId !== userId)
      return res.status(403).json({ error: "Você não tem permissão para alterar este pedido" });

    const updated = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status },
    });

    res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar status do pedido:", err);
    res.status(500).json({ error: "Erro ao atualizar status do pedido" });
  }
};

export default { updateOrderStatus };
