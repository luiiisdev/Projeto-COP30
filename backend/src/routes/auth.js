import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "MinhaChaveSuperSecretaAleatoria123!";

// Registro
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    res.json({ message: "Usuário criado!", userId: user.id, name: user.name });
  } catch (err) {
    res.status(400).json({ error: "Email já existe" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ error: "Senha incorreta" });

  // Cria token com id e name
  const token = jwt.sign(
    { id: user.id, name: user.name },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

export default router;
