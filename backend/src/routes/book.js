import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.post("/", authMiddleware, async (req, res) => {
  const { title, author, type, price } = req.body;

  if (!title || !author || !type) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatórios" });
  }

  try {
    const book = await prisma.book.create({
      data: {
        title,
        author,
        type,
        price: type === "venda" ? price : null,
        ownerId: req.user.id,
      },
    });

    res.json({ message: "Livro cadastrado com sucesso", book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar livro" });
  }
});

router.get("/", async (req, res) => {
  const books = await prisma.book.findMany({
    include: { owner: { select: { id: true, name: true, email: true } } },
  });
  res.json(books);
});

router.get("/me", authMiddleware, async (req, res) => {
  const books = await prisma.book.findMany({
    where: { ownerId: req.user.id },
  });
  res.json(books);
});

export default router;
