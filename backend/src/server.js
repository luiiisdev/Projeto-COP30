import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;
const JWT_SECRET = "chave-secreta-supersegura";

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Auth middleware
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

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.user.id}${ext}`);
  },
});
const upload = multer({ storage });

// Rotas
app.get("/", (req, res) => res.send("Servidor COP30 funcionando! 🚀"));

// Registro
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

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ message: "Login bem-sucedido", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Dados do usuário logado
app.get("/me", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json(user);
});

// Atualizar avatar
app.put("/users/avatar", authMiddleware, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });

    const avatarPath = `/uploads/${req.file.filename}`;
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: avatarPath },
    });

    const newToken = jwt.sign(
      { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, avatar: updatedUser.avatar },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ avatar: updatedUser.avatar, token: newToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar avatar" });
  }
});

// Criar livro
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

// Listar livros
app.get("/books", async (req, res) => {
  const books = await prisma.book.findMany({
    include: { owner: { select: { id: true, name: true, email: true, avatar: true } } },
  });
  res.json(books);
});

// Livros do usuário logado
app.get("/books/me", authMiddleware, async (req, res) => {
  const books = await prisma.book.findMany({ where: { ownerId: req.user.id } });
  res.json(books);
});

// Inicia servidor
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));