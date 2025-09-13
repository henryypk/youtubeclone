import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import sqlite3Pkg from "sqlite3";

const sqlite3 = sqlite3Pkg.verbose();

const dbFolder = path.resolve(__dirname, "../../db");
if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder, { recursive: true });

const dbPath = path.join(dbFolder, "database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Erro ao abrir banco:", err);
  else console.log("Banco SQLite pronto em", dbPath);
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const imgFolder = path.resolve(__dirname, "../../img");
if (!fs.existsSync(imgFolder)) fs.mkdirSync(imgFolder, { recursive: true });
app.use("/img", express.static(imgFolder));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, imgFolder),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

db.run(`CREATE TABLE IF NOT EXISTS imagens (
  id TEXT PRIMARY KEY,
  titulo TEXT,
  url TEXT
)`);

app.get("/imagens", (_req: Request, res: Response) => {
  db.all("SELECT * FROM imagens", (_err, rows) => res.json(rows));
});

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

app.put("/imagens/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { titulo } = req.body;
  if (!titulo) return res.status(400).json({ error: "Título é obrigatório" });

  db.run("UPDATE imagens SET titulo = ? WHERE id = ?", [titulo, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

app.delete("/imagens/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  db.run("DELETE FROM imagens WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.delete("/imagens", (_req: Request, res: Response) => {
  db.run("DELETE FROM imagens", function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Serve frontend compilado
const frontendFolder = path.resolve(__dirname, "../../dist/frontend");
app.use(express.static(frontendFolder));

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
