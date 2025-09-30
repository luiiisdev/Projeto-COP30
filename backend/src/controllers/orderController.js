import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Criar pedido
export const createOrder = async (req, res) => {
  try {
    const { bookIds, address } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });
    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0)
      return res.status(400).json({ error: "Nenhum livro selecionado" });
    if (!address) return res.status(400).json({ error: "Endereço não fornecido" });

    // Buscar livros
    const booksFound = await prisma.book.findMany({ where: { id: { in: bookIds } } });
    if (booksFound.length !== bookIds.length)
      return res.status(400).json({ error: "Um ou mais livros não foram encontrados" });

    // Checar se algum livro pertence ao próprio usuário
    const ownsBook = booksFound.some(b => b.ownerId === userId);
    if (ownsBook) {
      return res.status(400).json({ error: "Você não pode comprar seus próprios livros" });
    }

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        userId,
        shippingAddress: address,
        totalAmount: booksFound.reduce((sum, b) => sum + (b.price || 0), 0),
        estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
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
      include: {
        items: true
      }
    });

    res.json(order);
  } catch (err) {
    console.error("Erro ao criar pedido:", err);
    res.status(400).json({ error: "Erro ao finalizar compra" });
  }
};

// Pegar todas as compras do usuário
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true
      },
      orderBy: { orderDate: "desc" }
    });

    res.json(orders);
  } catch (err) {
    console.error("Erro ao buscar pedidos:", err);
    res.status(500).json({ error: "Erro ao buscar compras" });
  }
};
