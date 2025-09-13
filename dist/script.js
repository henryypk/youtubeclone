"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener("DOMContentLoaded", () => {
    const btnAdicionar = document.getElementById("btnAdicionar");
    const btnLimpar = document.getElementById("btnLimpar");
    const content = document.getElementById("content");
    const inputTitulo = document.getElementById("titulo");
    const inputArquivo = document.getElementById("arquivo");
    const messageElement = document.getElementById("message");
    const STORAGE_KEY = "imagens";
    // ====== Helpers de storage ======
    function getImagensFromStorage() {
        const imagensJSON = localStorage.getItem(STORAGE_KEY);
        const arr = imagensJSON ? JSON.parse(imagensJSON) : [];
        arr.forEach(img => { if (img.id != null)
            img.id = String(img.id); });
        return arr;
    }
    function salvarImagensNoStorage(arr) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    }
    function salvarImagem(imagem) {
        const imagens = getImagensFromStorage();
        imagens.push(imagem);
        try {
            salvarImagensNoStorage(imagens);
        }
        catch (err) {
            console.error("Erro ao salvar:", err);
            showMessage("Erro ao salvar. Verifique o espaço do navegador.", "error");
        }
    }
    // ====== Redimensionamento de imagem ======
    function redimensionarImagem(file_1) {
        return __awaiter(this, arguments, void 0, function* (file, maxWidth = 800) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (!event.target)
                        return reject("Erro no FileReader");
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");
                        if (!ctx)
                            return reject("Canvas não suportado");
                        let width = img.width;
                        let height = img.height;
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL("image/jpeg", 0.7));
                    };
                    img.onerror = reject;
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });
    }
    // ====== Mensagens ======
    function showMessage(text, type) {
        messageElement.textContent = text;
        messageElement.className = `message ${type}`;
        messageElement.style.display = "block";
        setTimeout(() => {
            messageElement.style.display = "none";
        }, 3000);
    }
    // ====== Adicionar imagem ======
    function adicionarImagem() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const titulo = inputTitulo.value.trim();
            const arquivo = (_a = inputArquivo.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!titulo || !arquivo) {
                showMessage("Por favor, preencha o título e selecione um arquivo.", "error");
                return;
            }
            try {
                showMessage("Processando imagem, por favor aguarde...", "success");
                const urlRedimensionada = yield redimensionarImagem(arquivo, 800);
                const imagemData = {
                    id: String(Date.now()),
                    titulo: titulo,
                    url: urlRedimensionada
                };
                salvarImagem(imagemData);
                carregarImagens();
                limparCampos();
                showMessage("Imagem adicionada com sucesso!", "success");
            }
            catch (error) {
                console.error("Erro ao redimensionar a imagem:", error);
                showMessage("Ocorreu um erro ao processar a imagem.", "error");
            }
        });
    }
    // ====== Carregar e renderizar ======
    function carregarImagens() {
        const imagens = getImagensFromStorage();
        content.innerHTML = "";
        imagens.forEach(renderizarImagem);
    }
    function renderizarImagem(imagem) {
        const card = document.createElement("div");
        card.className = "card";
        const imgEl = document.createElement("img");
        imgEl.src = imagem.url;
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
        btnDelete.addEventListener("click", () => {
            if (!confirm("Deseja realmente excluir esta imagem?"))
                return;
            excluirImagem(imagem.id);
        });
        btnEdit.addEventListener("click", () => iniciarEdicao(card, imagem, imgEl, h3));
        content.appendChild(card);
    }
    // ====== Excluir imagem ======
    function excluirImagem(id) {
        const imagens = getImagensFromStorage();
        const filtradas = imagens.filter(img => img.id !== id);
        salvarImagensNoStorage(filtradas);
        carregarImagens();
        showMessage("Imagem excluída com sucesso!", "success");
    }
    // ====== Atualizar imagem ======
    function atualizarImagem(id, novoTitulo, novaUrl) {
        const imagens = getImagensFromStorage();
        const atualizadas = imagens.map(img => {
            if (img.id === id)
                return Object.assign(Object.assign({}, img), { titulo: novoTitulo, url: novaUrl });
            return img;
        });
        salvarImagensNoStorage(atualizadas);
        carregarImagens();
        showMessage("Imagem atualizada com sucesso!", "success");
    }
    // ====== Edição inline ======
    function iniciarEdicao(cardEl, imagem, imgEl, h3El) {
        if (cardEl.querySelector(".edit-mode"))
            return;
        const originalTitle = imagem.titulo;
        const originalUrl = imagem.url;
        const editWrap = document.createElement("div");
        editWrap.className = "edit-mode";
        const inputTitle = document.createElement("input");
        inputTitle.type = "text";
        inputTitle.value = originalTitle;
        inputTitle.className = "edit-title-input";
        inputTitle.style.width = "100%";
        inputTitle.style.marginTop = "8px";
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.gap = "8px";
        row.style.justifyContent = "center";
        row.style.marginTop = "8px";
        const btnTrocarImg = document.createElement("button");
        btnTrocarImg.type = "button";
        btnTrocarImg.className = "btn-change-img";
        btnTrocarImg.textContent = "🔁 Trocar imagem";
        const btnSalvar = document.createElement("button");
        btnSalvar.type = "button";
        btnSalvar.className = "btn-save";
        btnSalvar.textContent = "Salvar";
        const btnCancelar = document.createElement("button");
        btnCancelar.type = "button";
        btnCancelar.className = "btn-cancel";
        btnCancelar.textContent = "Cancelar";
        row.appendChild(btnTrocarImg);
        row.appendChild(btnSalvar);
        row.appendChild(btnCancelar);
        editWrap.appendChild(inputTitle);
        editWrap.appendChild(row);
        const titleWrap = cardEl.querySelector(".card-title-wrap");
        titleWrap.appendChild(editWrap);
        let novaUrlTemp = null;
        btnTrocarImg.addEventListener("click", () => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.style.display = "none";
            fileInput.addEventListener("change", () => __awaiter(this, void 0, void 0, function* () {
                if (fileInput.files && fileInput.files[0]) {
                    try {
                        showMessage("Processando nova imagem...", "success");
                        const newUrl = yield redimensionarImagem(fileInput.files[0], 800);
                        novaUrlTemp = newUrl;
                        imgEl.src = newUrl;
                        showMessage("Nova imagem carregada (preview). Clique em Salvar.", "success");
                    }
                    catch (err) {
                        console.error("Erro ao redimensionar nova imagem:", err);
                        showMessage("Erro ao processar nova imagem.", "error");
                    }
                    finally {
                        fileInput.remove();
                    }
                }
            }));
            document.body.appendChild(fileInput);
            fileInput.click();
        });
        btnSalvar.addEventListener("click", () => {
            const novoTitulo = inputTitle.value.trim();
            if (!novoTitulo) {
                showMessage("Título não pode ficar vazio.", "error");
                return;
            }
            const urlFinal = novaUrlTemp || originalUrl;
            atualizarImagem(imagem.id, novoTitulo, urlFinal);
        });
        btnCancelar.addEventListener("click", () => {
            editWrap.remove();
            imgEl.src = originalUrl;
            h3El.textContent = originalTitle;
        });
    }
    // ====== Limpar campos ======
    function limparCampos() {
        inputTitulo.value = "";
        inputArquivo.value = "";
    }
    function limparTudo() {
        if (!confirm("Tem certeza que deseja apagar todas as imagens?"))
            return;
        localStorage.removeItem(STORAGE_KEY);
        carregarImagens();
        showMessage("Todas as imagens foram removidas.", "success");
    }
    // ====== Event listeners ======
    btnAdicionar.addEventListener("click", adicionarImagem);
    btnLimpar.addEventListener("click", limparTudo);
    carregarImagens();
});
