// Conteúdo completo e ATUALIZADO para o arquivo js/index.js

document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("content");
    const STORAGE_KEY = "imagens";

    const imagensJSON = localStorage.getItem(STORAGE_KEY);
    const imagens = imagensJSON ? JSON.parse(imagensJSON) : [];

    // A MUDANÇA ESTÁ AQUI DENTRO DO LOOP
    imagens.forEach(imagem => {
        // Cria os elementos individualmente
        const card = document.createElement("div");
        card.classList.add("card");

        const img = document.createElement("img");
        img.src = imagem.url; // Define a URL da imagem
        img.alt = imagem.titulo;

        const h3 = document.createElement("h3");
        h3.title = imagem.titulo;
        h3.textContent = imagem.titulo; // Define o texto do título

        // Adiciona a imagem e o título ao card
        card.appendChild(img);
        card.appendChild(h3);

        // Adiciona o card completo à página
        content.appendChild(card);
    });
});