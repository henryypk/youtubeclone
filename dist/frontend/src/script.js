var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// src/frontend/script.ts
import { BACKEND_URL } from "./config";
document.addEventListener("DOMContentLoaded", () => {
    const btnAdicionar = document.getElementById("btnAdicionar");
    const btnLimpar = document.getElementById("btnLimpar");
    const content = document.getElementById("content");
    const inputTitulo = document.getElementById("titulo");
    const inputArquivo = document.getElementById("arquivo");
    const messageElement = document.getElementById("message");
    if (!content || !btnAdicionar || !btnLimpar || !inputTitulo || !inputArquivo || !messageElement)
        return;
    function showMessage(text, type) {
        return __awaiter(this, void 0, void 0, function* () {
            messageElement.textContent = text;
            messageElement.className = `message ${type}`;
            messageElement.style.display = "block";
            setTimeout(() => (messageElement.style.display = "none"), 3000);
        });
    }
    function carregarImagens() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield fetch(`${BACKEND_URL}/imagens`);
                const imagens = yield res.json();
                content.innerHTML = "";
                imagens.forEach(renderizarImagem);
            }
            catch (err) {
                console.error(err);
                showMessage("Erro ao carregar imagens.", "error");
            }
        });
    }
    function renderizarImagem(imagem) {
        const card = document.createElement("div");
        card.className = "card";
        const imgEl = document.createElement("img");
        imgEl.src = `${BACKEND_URL}${imagem.url}`;
        imgEl.alt = imagem.titulo;
        card.appendChild(imgEl);
        const titleWrap = document.createElement("div");
        titleWrap.className = "card-title-wrap";
        const h3 = document.createElement("h3");
        h3.title = imagem.titulo;
        h3.textContent = imagem.titulo;
        titleWrap.appendChild(h3);
        card.appendChild(titleWrap);
        const actions = document.createElement("div");
        actions.className = "card-actions";
        const btnEdit = document.createElement("button");
        btnEdit.className = "btn-edit";
        btnEdit.type = "button";
        btnEdit.innerHTML = "✏️ Editar";
        const btnDelete = document.createElement("button");
        btnDelete.className = "btn-delete";
        btnDelete.type = "button";
        btnDelete.innerHTML = "🗑️ Excluir";
        actions.appendChild(btnEdit);
        actions.appendChild(btnDelete);
        card.appendChild(actions);
        btnDelete.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            if (!confirm("Deseja realmente excluir esta imagem?"))
                return;
            try {
                yield fetch(`${BACKEND_URL}/imagens/${imagem.id}`, { method: "DELETE" });
                showMessage("Imagem excluída com sucesso!", "success");
                carregarImagens();
            }
            catch (err) {
                console.error(err);
                showMessage("Erro ao excluir imagem.", "error");
            }
        }));
        btnEdit.addEventListener("click", () => iniciarEdicao(card, imagem, imgEl, h3));
        content.appendChild(card);
    }
    btnAdicionar.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const titulo = inputTitulo.value.trim();
        const arquivo = (_a = inputArquivo.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!titulo || !arquivo) {
            showMessage("Preencha título e selecione uma imagem.", "error");
            return;
        }
        const formData = new FormData();
        formData.append("titulo", titulo);
        formData.append("arquivo", arquivo);
        try {
            showMessage("Enviando imagem...", "success");
            yield fetch(`${BACKEND_URL}/imagens`, { method: "POST", body: formData });
            showMessage("Imagem adicionada com sucesso!", "success");
            inputTitulo.value = "";
            inputArquivo.value = "";
            carregarImagens();
        }
        catch (err) {
            console.error(err);
            showMessage("Erro ao adicionar imagem.", "error");
        }
    }));
    btnLimpar.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        if (!confirm("Tem certeza que deseja apagar todas as imagens?"))
            return;
        try {
            yield fetch(`${BACKEND_URL}/imagens`, { method: "DELETE" });
            showMessage("Todas as imagens foram removidas.", "success");
            carregarImagens();
        }
        catch (err) {
            console.error(err);
            showMessage("Erro ao limpar imagens.", "error");
        }
    }));
    function iniciarEdicao(cardEl, imagem, imgEl, h3El) {
        if (cardEl.querySelector(".edit-mode"))
            return;
        const editWrap = document.createElement("div");
        editWrap.className = "edit-mode";
        const inputTitle = document.createElement("input");
        inputTitle.type = "text";
        inputTitle.value = imagem.titulo;
        inputTitle.className = "edit-title-input";
        inputTitle.style.width = "100%";
        inputTitle.style.marginTop = "8px";
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.gap = "8px";
        row.style.justifyContent = "center";
        row.style.marginTop = "8px";
        const btnSalvar = document.createElement("button");
        btnSalvar.type = "button";
        btnSalvar.className = "btn-save";
        btnSalvar.textContent = "Salvar";
        const btnCancelar = document.createElement("button");
        btnCancelar.type = "button";
        btnCancelar.className = "btn-cancel";
        btnCancelar.textContent = "Cancelar";
        row.appendChild(btnSalvar);
        row.appendChild(btnCancelar);
        editWrap.appendChild(inputTitle);
        editWrap.appendChild(row);
        const titleWrap = cardEl.querySelector(".card-title-wrap");
        titleWrap.appendChild(editWrap);
        btnSalvar.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            const novoTitulo = inputTitle.value.trim();
            if (!novoTitulo) {
                showMessage("Título não pode ficar vazio.", "error");
                return;
            }
            try {
                yield fetch(`${BACKEND_URL}/imagens/${imagem.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ titulo: novoTitulo })
                });
                showMessage("Imagem atualizada com sucesso!", "success");
                carregarImagens();
            }
            catch (err) {
                console.error(err);
                showMessage("Erro ao atualizar imagem.", "error");
            }
        }));
        btnCancelar.addEventListener("click", () => {
            editWrap.remove();
            imgEl.src = `${BACKEND_URL}${imagem.url}`;
            h3El.textContent = imagem.titulo;
        });
    }
    carregarImagens();
});
