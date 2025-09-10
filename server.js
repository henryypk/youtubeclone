const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

app.get("/imagens", (req, res) => {
    const pastaImg = path.join(__dirname, "img");
    fs.readdir(pastaImg, (err, files) => {
        if (err) return res.status(500).send("Erro ao ler pasta img");
        const imagens = files
            .filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file))
            .map(file => "img/" + file);
        res.json(imagens);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
