"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("content");
    const STORAGE_KEY = "imagens";
    const imagensJSON = localStorage.getItem(STORAGE_KEY);
    const imagens = imagensJSON ? JSON.parse(imagensJSON) : [];
    imagens.forEach((imagem) => {
        const card = document.createElement("div");
        card.classList.add("card");
        const img = document.createElement("img");
        img.src = imagem.url;
        img.alt = imagem.titulo;
        const h3 = document.createElement("h3");
        h3.title = imagem.titulo;
        h3.textContent = imagem.titulo;
        card.appendChild(img);
        card.appendChild(h3);
        content.appendChild(card);
    });
});
