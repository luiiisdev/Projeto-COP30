import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import bookRouter from "./routes/book.js";
import { authMiddleware } from "./middlewares/auth.js"; 
import * as orderController from "./controllers/orderController.js"; 
import conversationRouter from "./routes/conversationRoutes.js";

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;
const JWT_SECRET = "chave-secreta-supersegura";

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `avatar_${req.user.id}${ext}`);
    },
});
const upload = multer({ storage });

// Rotas básicas
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

// Pedidos
app.post("/orders", authMiddleware, orderController.createOrder);
app.get("/orders/my", authMiddleware, orderController.getMyOrders);
app.put("/orders/:orderId", authMiddleware, orderController.updateOrderStatus); // ✅ PUT atualizado

// Rotas de livros
app.use("/books", bookRouter);

// Rotas de conversas
app.use("/conversations", conversationRouter);

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
