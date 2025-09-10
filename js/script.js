document.addEventListener("DOMContentLoaded", () => {
    const btnAdicionar = document.getElementById("btnAdicionar");
    const btnLimpar = document.getElementById("btnLimpar");
    const content = document.getElementById("content");

    carregarImagens();

    btnAdicionar.addEventListener("click", () => {
        const titulo = document.getElementById("titulo").value;
        const arquivo = document.getElementById("arquivo").files[0];

        if (!titulo || !arquivo) return alert("Preencha todos os campos");

        const reader = new FileReader();
        reader.onload = function (e) {
            const imagem = { titulo, url: e.target.result };
            salvarImagem(imagem);
            renderizarImagem(imagem);

            document.getElementById("titulo").value = "";
            document.getElementById("arquivo").value = "";
        };
        reader.readAsDataURL(arquivo);
    });

    btnLimpar.addEventListener("click", () => {
        if (confirm("Apagar todas as imagens?")) {
            localStorage.removeItem("imagens");
            content.innerHTML = "";
        }
    });

    function salvarImagem(imagem) {
        let imagens = JSON.parse(localStorage.getItem("imagens")) || [];
        imagens.push(imagem);
        localStorage.setItem("imagens", JSON.stringify(imagens));
    }

    function renderizarImagem(imagem) {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <img src="${imagem.url}" alt="${imagem.titulo}">
            <h3 title="${imagem.titulo}">${imagem.titulo}</h3>
        `;
        content.appendChild(card);
    }

    function carregarImagens() {
        let imagens = JSON.parse(localStorage.getItem("imagens")) || [];
        imagens.forEach(renderizarImagem);
    }
});
