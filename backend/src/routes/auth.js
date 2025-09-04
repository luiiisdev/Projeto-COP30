import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "MinhaChaveSuperSecretaAleatoria123!";

// Configura multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // pasta uploads precisa existir
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `avatar-${req.user.id}.${ext}`);
  },
});
const upload = multer({ storage });

// Middleware pra autenticar token e setar req.user
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // id, name, avatar
    next();
  });
}

// Atualiza avatar
router.put("/users/avatar", authenticateToken, upload.single("avatar"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Arquivo não enviado" });

  const avatarPath = `/uploads/${req.file.filename}`;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { avatar: avatarPath },
  });

  res.json({ avatar: updatedUser.avatar });
});

export default router;
