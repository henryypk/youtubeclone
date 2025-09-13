// src/server.ts

import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import sqlite3Pkg from "sqlite3";

const sqlite3 = sqlite3Pkg.verbose(); // corrige problema de tipagem
const db = new sqlite3.Database("db/database.sqlite");

const app = express();
const PORT = process.env.PORT || 3000;

// ====== Middlewares ======
app.use(cors());
app.use(express.json());

// Serve imagens da pasta img
app.use("/img", express.static(path.join(__dirname, "../img")));

// Config Multer para uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "img/"),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// ====== Criar tabela ======
db.run(`CREATE TABLE IF NOT EXISTS imagens (
  id TEXT PRIMARY KEY,
  titulo TEXT,
  url TEXT
)`);

// ====== Rotas ======

// Listar todas imagens
app.get("/imagens", (_req: Request, res: Response) => {
  db.all("SELECT * FROM imagens", (_err, rows) => {
    res.json(rows);
  });
});

// Adicionar imagem
app.post("/imagens", upload.single("arquivo"), (req: Request, res: Response) => {
  const { titulo } = req.body;
  const arquivo = req.file;
  if (!titulo || !arquivo) return res.status(400).json({ error: "Título ou arquivo ausente" });

  const url = `/img/${arquivo.filename}`;
  const id = Date.now().toString();

  db.run("INSERT INTO imagens (id, titulo, url) VALUES (?, ?, ?)", [id, titulo, url], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, titulo, url });
  });
});

// Atualizar título
app.put("/imagens/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { titulo } = req.body;
  if (!titulo) return res.status(400).json({ error: "Título é obrigatório" });

  db.run("UPDATE imagens SET titulo = ? WHERE id = ?", [titulo, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// Excluir imagem individual
app.delete("/imagens/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  db.run("DELETE FROM imagens WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Limpar todas imagens
app.delete("/imagens", (_req: Request, res: Response) => {
  db.run("DELETE FROM imagens", function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// ====== Start server ======
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
