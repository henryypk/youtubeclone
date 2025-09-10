document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("content");
    const imagens = JSON.parse(localStorage.getItem("imagens")) || [];

    imagens.forEach(imagem => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <img src="${imagem.url}" alt="${imagem.titulo}">
            <h3 title="${imagem.titulo}">${imagem.titulo}</h3>
        `;
        content.appendChild(card);
    });
});
