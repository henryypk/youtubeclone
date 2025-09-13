// src/frontend/script.ts
import { BACKEND_URL } from "./config";

document.addEventListener("DOMContentLoaded", () => {
  const btnAdicionar = document.getElementById("btnAdicionar") as HTMLButtonElement;
  const btnLimpar = document.getElementById("btnLimpar") as HTMLButtonElement;
  const content = document.getElementById("content") as HTMLDivElement;
  const inputTitulo = document.getElementById("titulo") as HTMLInputElement;
  const inputArquivo = document.getElementById("arquivo") as HTMLInputElement;
  const messageElement = document.getElementById("message") as HTMLDivElement;

  if (!content || !btnAdicionar || !btnLimpar || !inputTitulo || !inputArquivo || !messageElement) return;

  function showMessage(text: string, type: "success" | "error") {
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
    messageElement.style.display = "block";
    setTimeout(() => (messageElement.style.display = "none"), 3000);
  }

  async function carregarImagens() {
    try {
      const res = await fetch(`${BACKEND_URL}/imagens`);
      const imagens: { id: string; titulo: string; url: string }[] = await res.json();
      content.innerHTML = "";
      imagens.forEach(renderizarImagem);
    } catch (err) {
      console.error(err);
      showMessage("Erro ao carregar imagens.", "error");
    }
  }

  function renderizarImagem(imagem: { id: string; titulo: string; url: string }) {
    const card = document.createElement("div");
    card.className = "card";

    const imgEl = document.createElement("img");
    imgEl.src = `${BACKEND_URL}${imagem.url}`;
    imgEl.alt = imagem.titulo;
    card.appendChild(imgEl);

    const h3 = document.createElement("h3");
    h3.title = imagem.titulo;
    h3.textContent = imagem.titulo;
    card.appendChild(h3);

    // Botões editar/excluir podem ser adicionados aqui se quiser
    content.appendChild(card);
  }

  btnAdicionar.addEventListener("click", async () => {
    const titulo = inputTitulo.value.trim();
    const arquivo = inputArquivo.files?.[0];
    if (!titulo || !arquivo) {
      showMessage("Preencha título e selecione uma imagem.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("arquivo", arquivo);

    try {
      showMessage("Enviando imagem...", "success");
      await fetch(`${BACKEND_URL}/imagens`, { method: "POST", body: formData });
      showMessage("Imagem adicionada com sucesso!", "success");
      inputTitulo.value = "";
      inputArquivo.value = "";
      carregarImagens();
    } catch (err) {
      console.error(err);
      showMessage("Erro ao adicionar imagem.", "error");
    }
  });

  btnLimpar.addEventListener("click", async () => {
    if (!confirm("Tem certeza que deseja apagar todas as imagens?")) return;
    try {
      await fetch(`${BACKEND_URL}/imagens`, { method: "DELETE" });
      showMessage("Todas as imagens foram removidas.", "success");
      carregarImagens();
    } catch (err) {
      console.error(err);
      showMessage("Erro ao limpar imagens.", "error");
    }
  });

  carregarImagens();
});
