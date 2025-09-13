"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/backend/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite3 = sqlite3_1.default.verbose();
// ====== Pastas ======
const dbFolder = path_1.default.resolve(__dirname, "../../db");
if (!fs_1.default.existsSync(dbFolder))
    fs_1.default.mkdirSync(dbFolder, { recursive: true });
const imgFolder = path_1.default.resolve(__dirname, "../../img");
if (!fs_1.default.existsSync(imgFolder))
    fs_1.default.mkdirSync(imgFolder, { recursive: true });
const frontendFolder = path_1.default.resolve(__dirname, "../../dist/frontend");
// ====== Banco ======
const dbPath = path_1.default.join(dbFolder, "database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err)
        console.error("Erro ao abrir banco:", err);
    else
        console.log("Banco SQLite pronto em", dbPath);
});
db.run(`CREATE TABLE IF NOT EXISTS imagens (
  id TEXT PRIMARY KEY,
  titulo TEXT,
  url TEXT
)`);
// ====== Express ======
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/img", express_1.default.static(imgFolder));
app.use(express_1.default.static(frontendFolder));
// ====== Multer ======
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, imgFolder),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = (0, multer_1.default)({ storage });
// ====== Rotas ======
// Listar
app.get("/imagens", (_req, res) => {
    db.all("SELECT * FROM imagens", (_err, rows) => res.json(rows));
});
// Adicionar
app.post("/imagens", upload.single("arquivo"), (req, res) => {
    const { titulo } = req.body;
    const arquivo = req.file;
    if (!titulo || !arquivo)
        return res.status(400).json({ error: "Título ou arquivo ausente" });
    const url = `/img/${arquivo.filename}`;
    const id = Date.now().toString();
    db.run("INSERT INTO imagens (id, titulo, url) VALUES (?, ?, ?)", [id, titulo, url], (err) => {
        if (err)
            return res.status(500).json({ error: err.message });
        res.json({ id, titulo, url });
    });
});
// Atualizar
app.put("/imagens/:id", (req, res) => {
    const { id } = req.params;
    const { titulo } = req.body;
    if (!titulo)
        return res.status(400).json({ error: "Título é obrigatório" });
    db.run("UPDATE imagens SET titulo = ? WHERE id = ?", [titulo, id], function (err) {
        if (err)
            return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
    });
});
// Excluir
app.delete("/imagens/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM imagens WHERE id = ?", [id], function (err) {
        if (err)
            return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});
// Limpar todas
app.delete("/imagens", (_req, res) => {
    db.run("DELETE FROM imagens", function (err) {
        if (err)
            return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});
// Servir frontend
app.get("*", (_req, res) => {
    res.sendFile(path_1.default.join(frontendFolder, "index.html"));
});
// ====== Start ======
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
