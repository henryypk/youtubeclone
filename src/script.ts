// src/script.ts

interface Imagem {
    id: string;
    titulo: string;
    url: string;
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const btnAdicionar = document.getElementById("btnAdicionar") as HTMLButtonElement;
    const btnLimpar = document.getElementById("btnLimpar") as HTMLButtonElement;
    const content = document.getElementById("content") as HTMLElement;
    const inputTitulo = document.getElementById("titulo") as HTMLInputElement;
    const inputArquivo = document.getElementById("arquivo") as HTMLInputElement;
    const messageElement = document.getElementById("message") as HTMLElement;
  
    const BACKEND_URL = "http://localhost:3000"; // trocar para URL online quando hospedar
  
    // ====== Mensagens ======
    function showMessage(text: string, type: "success" | "error"): void {
      messageElement.textContent = text;
      messageElement.className = `message ${type}`;
      messageElement.style.display = "block";
      setTimeout(() => {
        messageElement.style.display = "none";
      }, 3000);
    }
  
    // ====== Carregar imagens ======
    async function carregarImagens(): Promise<void> {
      try {
        const res = await fetch(`${BACKEND_URL}/imagens`);
        const imagens: Imagem[] = await res.json();
        content.innerHTML = "";
        imagens.forEach(renderizarImagem);
      } catch (err) {
        console.error(err);
        showMessage("Erro ao carregar imagens", "error");
      }
    }
  
    // ====== Renderizar card ======
    function renderizarImagem(imagem: Imagem): void {
      const card = document.createElement("div") as HTMLDivElement;
      card.className = "card";
  
      const imgEl = document.createElement("img") as HTMLImageElement;
      imgEl.src = imagem.url;
      imgEl.alt = imagem.titulo;
      card.appendChild(imgEl);
  
      const titleWrap = document.createElement("div") as HTMLDivElement;
      titleWrap.className = "card-title-wrap";
      const h3 = document.createElement("h3") as HTMLHeadingElement;
      h3.title = imagem.titulo;
      h3.textContent = imagem.titulo;
      titleWrap.appendChild(h3);
      card.appendChild(titleWrap);
  
      const actions = document.createElement("div") as HTMLDivElement;
      actions.className = "card-actions";
  
      const btnEdit = document.createElement("button") as HTMLButtonElement;
      btnEdit.className = "btn-edit";
      btnEdit.type = "button";
      btnEdit.innerHTML = "✏️ Editar";
  
      const btnDelete = document.createElement("button") as HTMLButtonElement;
      btnDelete.className = "btn-delete";
      btnDelete.type = "button";
      btnDelete.innerHTML = "🗑️ Excluir";
  
      actions.appendChild(btnEdit);
      actions.appendChild(btnDelete);
      card.appendChild(actions);
  
      btnDelete.addEventListener("click", () => {
        if (!confirm("Deseja realmente excluir esta imagem?")) return;
        excluirImagem(imagem.id);
      });
  
      btnEdit.addEventListener("click", () => iniciarEdicao(card, imagem, imgEl, h3));
  
      content.appendChild(card);
    }
  
    // ====== Adicionar imagem ======
    async function adicionarImagem(): Promise<void> {
      const titulo = inputTitulo.value.trim();
      const arquivo = inputArquivo.files?.[0];
      if (!titulo || !arquivo) {
        showMessage("Preencha título e selecione arquivo", "error");
        return;
      }
  
      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("arquivo", arquivo);
  
      try {
        await fetch(`${BACKEND_URL}/imagens`, {
          method: "POST",
          body: formData
        });
        showMessage("Imagem adicionada com sucesso!", "success");
        carregarImagens();
        limparCampos();
      } catch (err) {
        console.error(err);
        showMessage("Erro ao adicionar imagem", "error");
      }
    }
  
    // ====== Excluir imagem ======
    async function excluirImagem(id: string): Promise<void> {
      try {
        await fetch(`${BACKEND_URL}/imagens/${id}`, { method: "DELETE" });
        showMessage("Imagem excluída com sucesso!", "success");
        carregarImagens();
      } catch (err) {
        console.error(err);
        showMessage("Erro ao excluir imagem", "error");
      }
    }
  
    // ====== Limpar todas imagens ======
    async function limparTudo(): Promise<void> {
      if (!confirm("Tem certeza que deseja apagar todas as imagens?")) return;
  
      try {
        await fetch(`${BACKEND_URL}/imagens`, { method: "DELETE" });
        showMessage("Todas as imagens foram removidas.", "success");
        carregarImagens();
      } catch (err) {
        console.error(err);
        showMessage("Erro ao limpar imagens", "error");
      }
    }
  
    // ====== Limpar campos ======
    function limparCampos(): void {
      inputTitulo.value = "";
      inputArquivo.value = "";
    }
  
    // ====== Edição inline ======
    function iniciarEdicao(cardEl: HTMLDivElement, imagem: Imagem, imgEl: HTMLImageElement, h3El: HTMLHeadingElement): void {
      if (cardEl.querySelector(".edit-mode")) return;
  
      const originalTitle = imagem.titulo;
      const originalUrl = imagem.url;
  
      const editWrap = document.createElement("div") as HTMLDivElement;
      editWrap.className = "edit-mode";
  
      const inputTitle = document.createElement("input") as HTMLInputElement;
      inputTitle.type = "text";
      inputTitle.value = originalTitle;
      inputTitle.className = "edit-title-input";
      inputTitle.style.width = "100%";
      inputTitle.style.marginTop = "8px";
  
      const row = document.createElement("div") as HTMLDivElement;
      row.style.display = "flex";
      row.style.gap = "8px";
      row.style.justifyContent = "center";
      row.style.marginTop = "8px";
  
      const btnSalvar = document.createElement("button") as HTMLButtonElement;
      btnSalvar.type = "button";
      btnSalvar.className = "btn-save";
      btnSalvar.textContent = "Salvar";
  
      const btnCancelar = document.createElement("button") as HTMLButtonElement;
      btnCancelar.type = "button";
      btnCancelar.className = "btn-cancel";
      btnCancelar.textContent = "Cancelar";
  
      row.appendChild(btnSalvar);
      row.appendChild(btnCancelar);
      editWrap.appendChild(inputTitle);
      editWrap.appendChild(row);
  
      const titleWrap = cardEl.querySelector(".card-title-wrap") as HTMLDivElement;
      titleWrap.appendChild(editWrap);
  
      // Salvar edição no backend
      btnSalvar.addEventListener("click", async () => {
        const novoTitulo = inputTitle.value.trim();
        if (!novoTitulo) {
          showMessage("Título não pode ficar vazio.", "error");
          return;
        }
  
        try {
          await fetch(`${BACKEND_URL}/imagens/${imagem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ titulo: novoTitulo })
          });
          showMessage("Título atualizado com sucesso!", "success");
          carregarImagens();
        } catch (err) {
          console.error(err);
          showMessage("Erro ao atualizar título", "error");
        }
      });
  
      btnCancelar.addEventListener("click", () => {
        editWrap.remove();
        imgEl.src = originalUrl;
        h3El.textContent = originalTitle;
      });
    }
  
    // ====== Event listeners ======
    btnAdicionar.addEventListener("click", adicionarImagem);
    btnLimpar.addEventListener("click", limparTudo);
  
    carregarImagens();
  });
  