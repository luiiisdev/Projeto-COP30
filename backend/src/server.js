import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Backend da COP30 funcionando!" });
});

app.get("/api/events", async (req, res) => {
  const events = await prisma.event.findMany();
  res.json(events);
});

app.post("/api/events", async (req, res) => {
  const { title, date, description } = req.body;
  const newEvent = await prisma.event.create({
    data: { title, date: new Date(date), description },
  });
  res.json(newEvent);
});

app.get("/api/news", async (req, res) => {
  const news = await prisma.news.findMany();
  res.json(news);
});

app.post("/api/news", async (req, res) => {
  const { title, content, publishedAt } = req.body;
  const n = await prisma.news.create({
    data: { title, content, publishedAt: publishedAt ? new Date(publishedAt) : undefined },
  });
  res.json(n);
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
