document.addEventListener("DOMContentLoaded", () => {
    const btnAdicionar = document.getElementById("btnAdicionar");
    const btnLimpar = document.getElementById("btnLimpar");
    const content = document.getElementById("content");
    const inputTitulo = document.getElementById("titulo");
    const inputArquivo = document.getElementById("arquivo");
    const messageElement = document.getElementById("message");

    const STORAGE_KEY = "imagens";

    // ====== Redimensionamento (mantive sua função) ======
    function redimensionarImagem(file, maxWidth = 800) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    }

    // ====== Storage helpers ======
    function getImagensFromStorage() {
        const imagensJSON = localStorage.getItem(STORAGE_KEY);
        const arr = imagensJSON ? JSON.parse(imagensJSON) : [];
        // garante que todos os ids sejam strings (evita mismatches)
        arr.forEach(img => { if (img.id != null) img.id = String(img.id); });
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
        } catch (err) {
            console.error("Erro ao salvar:", err);
            showMessage("Erro ao salvar. Verifique o espaço do navegador.", "error");
        }
    }

    // ====== Adicionar imagem ======
    async function adicionarImagem() {
        const titulo = inputTitulo.value.trim();
        const arquivo = inputArquivo.files[0];

        if (!titulo || !arquivo) {
            showMessage("Por favor, preencha o título e selecione um arquivo.", "error");
            return;
        }

        try {
            showMessage("Processando imagem, por favor aguarde...", "success");
            const urlRedimensionada = await redimensionarImagem(arquivo, 800);

            const imagemData = {
                id: String(Date.now()), // id como string
                titulo: titulo,
                url: urlRedimensionada
            };

            salvarImagem(imagemData);
            carregarImagens();
            limparCampos();
            showMessage("Imagem adicionada com sucesso!", "success");
        } catch (error) {
            console.error("Erro ao redimensionar a imagem:", error);
            showMessage("Ocorreu um erro ao processar a imagem.", "error");
        }
    }

    // ====== Carregar / renderizar ======
    function carregarImagens() {
        const imagens = getImagensFromStorage();
        content.innerHTML = "";
        imagens.forEach(renderizarImagem);
    }

    function renderizarImagem(imagem) {
        // card
        const card = document.createElement("div");
        card.className = "card";

        // imagem
        const imgEl = document.createElement("img");
        imgEl.src = imagem.url;
        imgEl.alt = imagem.titulo;
        card.appendChild(imgEl);

        // titulo (container pra facilitar trocar por input na edição)
        const titleWrap = document.createElement("div");
        titleWrap.className = "card-title-wrap";
        const h3 = document.createElement("h3");
        h3.title = imagem.titulo;
        h3.textContent = imagem.titulo;
        titleWrap.appendChild(h3);
        card.appendChild(titleWrap);

        // ações
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

        // excluir (uso id como string)
        btnDelete.addEventListener("click", () => {
            if (!confirm("Deseja realmente excluir esta imagem?")) return;
            excluirImagem(imagem.id);
        });

        // editar: cria UI inline (título editável + opção trocar imagem)
        btnEdit.addEventListener("click", () => iniciarEdicao(card, imagem, imgEl, h3));

        content.appendChild(card);
    }

    // ====== Excluir imagem ======
    function excluirImagem(id) {
        const imagens = getImagensFromStorage();
        const filtradas = imagens.filter(img => String(img.id) !== String(id));
        salvarImagensNoStorage(filtradas);
        carregarImagens();
        showMessage("Imagem excluída com sucesso!", "success");
    }

    // ====== Atualizar imagem ======
    function atualizarImagem(id, novoTitulo, novaUrl) {
        const imagens = getImagensFromStorage();
        const atualizadas = imagens.map(img => {
            if (String(img.id) === String(id)) {
                return { ...img, titulo: novoTitulo, url: novaUrl };
            }
            return img;
        });
        salvarImagensNoStorage(atualizadas);
        carregarImagens();
        showMessage("Imagem atualizada com sucesso!", "success");
    }

    // ====== Iniciar edição inline ======
    function iniciarEdicao(cardEl, imagem, imgEl, h3El) {
        // evita abrir várias edições ao mesmo tempo
        if (cardEl.querySelector(".edit-mode")) return;

        const originalTitle = imagem.titulo;
        const originalUrl = imagem.url;

        // UI de edição
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

        // adiciona edição abaixo do título
        const titleWrap = cardEl.querySelector(".card-title-wrap");
        titleWrap.appendChild(editWrap);

        let novaUrlTemp = null;

        // trocar imagem: usamos um input file dinâmico para evitar sobrescrever o input global
        btnTrocarImg.addEventListener("click", () => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.style.display = "none";

            fileInput.addEventListener("change", async () => {
                if (fileInput.files && fileInput.files[0]) {
                    try {
                        showMessage("Processando nova imagem...", "success");
                        const newUrl = await redimensionarImagem(fileInput.files[0], 800);
                        novaUrlTemp = newUrl;
                        imgEl.src = newUrl; // preview imediato
                        showMessage("Nova imagem carregada (preview). Clique em Salvar.", "success");
                    } catch (err) {
                        console.error("Erro ao redimensionar nova imagem:", err);
                        showMessage("Erro ao processar nova imagem.", "error");
                    } finally {
                        fileInput.remove();
                    }
                }
            });

            document.body.appendChild(fileInput);
            fileInput.click();
        });

        // salvar
        btnSalvar.addEventListener("click", () => {
            const novoTitulo = inputTitle.value.trim();
            if (!novoTitulo) {
                showMessage("Título não pode ficar vazio.", "error");
                return;
            }
            const urlFinal = novaUrlTemp || originalUrl;
            atualizarImagem(imagem.id, novoTitulo, urlFinal);
        });

        // cancelar: restaura tudo
        btnCancelar.addEventListener("click", () => {
            // remove UI de edição e restaura preview/título original
            editWrap.remove();
            imgEl.src = originalUrl;
            h3El.textContent = originalTitle;
        });
    }

    // ====== Limpar campos e tudo ======
    function limparCampos() {
        inputTitulo.value = "";
        inputArquivo.value = "";
    }

    function limparTudo() {
        if (!confirm("Tem certeza que deseja apagar todas as imagens?")) return;
        localStorage.removeItem(STORAGE_KEY);
        carregarImagens();
        showMessage("Todas as imagens foram removidas.", "success");
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

    // ====== Event listeners init ======
    btnAdicionar.addEventListener("click", adicionarImagem);
    btnLimpar.addEventListener("click", limparTudo);

    // carrega ao abrir
    carregarImagens();
});

