var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// src/frontend/index.ts
import { BACKEND_URL } from "./config";
document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("content");
    if (!content)
        return;
    function carregarImagens() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield fetch(`${BACKEND_URL}/imagens`);
                const imagens = yield res.json();
                content.innerHTML = "";
                imagens.forEach(imagem => {
                    const card = document.createElement("div");
                    card.className = "card";
                    const img = document.createElement("img");
                    img.src = `${BACKEND_URL}${imagem.url}`;
                    img.alt = imagem.titulo;
                    const h3 = document.createElement("h3");
                    h3.title = imagem.titulo;
                    h3.textContent = imagem.titulo;
                    card.appendChild(img);
                    card.appendChild(h3);
                    content.appendChild(card);
                });
            }
            catch (err) {
                console.error("Erro ao carregar imagens:", err);
            }
        });
    }
    carregarImagens();
});
