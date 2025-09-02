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
  try {
    const books = await prisma.book.findMany({
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar livros" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      where: { ownerId: req.user.id },
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar seus livros" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(id) },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
    if (!book) return res.status(404).json({ error: "Livro não encontrado" });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar livro" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const book = await prisma.book.findUnique({ where: { id: parseInt(id) } });
    if (!book) return res.status(404).json({ error: "Livro não encontrado" });

    if (book.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Você não tem permissão para deletar este livro" });
    }

    await prisma.book.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Livro deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar livro" });
  }
});

export default router;
