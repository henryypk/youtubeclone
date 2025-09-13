// src/frontend/index.ts
import { BACKEND_URL } from "./config";

document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content") as HTMLDivElement;
  if (!content) return;

  async function carregarImagens() {
    try {
      const res = await fetch(`${BACKEND_URL}/imagens`);
      const imagens: { id: string; titulo: string; url: string }[] = await res.json();

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
    } catch (err) {
      console.error("Erro ao carregar imagens:", err);
    }
  }

  carregarImagens();
});
