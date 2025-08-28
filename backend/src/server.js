import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;
const JWT_SECRET = "chave-secreta-supersegura";

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware de autenticação
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user;
    next();
  });
}

// Rota raiz
app.get("/", (req, res) => res.send("Servidor COP30 funcionando! 🚀"));

// Registrar usuário
app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email já cadastrado" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    res.json({ message: "Usuário registrado com sucesso", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Senha inválida" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login bem-sucedido", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Informações do usuário logado
app.get("/me", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json(user);
});

// Cadastrar livro
app.post("/books", authMiddleware, async (req, res) => {
  const { title, author, type, price } = req.body;

  if (!title || !author || !type)
    return res.status(400).json({ error: "Campos obrigatórios faltando" });

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

// Listar todos os livros
app.get("/books", async (req, res) => {
  const books = await prisma.book.findMany({
    include: { owner: { select: { id: true, name: true, email: true } } },
  });
  res.json(books);
});

// Listar livros do usuário logado
app.get("/books/me", authMiddleware, async (req, res) => {
  const books = await prisma.book.findMany({ where: { ownerId: req.user.id } });
  res.json(books);
});

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
