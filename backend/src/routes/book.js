import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middlewares/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();
const prisma = new PrismaClient();

// 📂 Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// 🟢 Criar livro com imagem e contato
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  const { title, author, type, price, contact } = req.body;

  if (!title || !author || !type || !contact) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatórios" });
  }

  try {
    const book = await prisma.book.create({
      data: {
        title,
        author,
        type,
        contact, // ✅ salva o contato
        price: type === "venda" ? Number(price) : null,
        ownerId: req.user.id,
        image: req.file ? `/uploads/${req.file.filename}` : null,
      },
    });
    res.json({ message: "Livro cadastrado com sucesso", book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao cadastrar livro" });
  }
});

// 📗 Listar todos os livros
router.get("/", async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      include: { owner: { select: { id: true, name: true, avatar: true } } },
    });
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar livros" });
  }
});

// 📘 Listar livros do usuário logado
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      where: { ownerId: req.user.id },
    });
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar seus livros" });
  }
});

// 📙 Detalhes de um livro
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(id) },
      include: { owner: { select: { id: true, name: true, avatar: true } } },
    });
    if (!book) return res.status(404).json({ error: "Livro não encontrado" });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar livro" });
  }
});

// 🗑️ Deletar livro
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const book = await prisma.book.findUnique({ where: { id: parseInt(id) } });
    if (!book) return res.status(404).json({ error: "Livro não encontrado" });
    if (book.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Você não tem permissão para deletar este livro" });
    }

    if (book.image) {
      const filePath = path.join("uploads", book.image.replace("/uploads/", ""));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.book.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Livro deletado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar livro" });
  }
});

export default router;
