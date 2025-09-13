interface Imagem {
    id: string;
    titulo: string;
    url: string;
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("content") as HTMLElement;
    const STORAGE_KEY = "imagens";
  
    const imagensJSON = localStorage.getItem(STORAGE_KEY);
    const imagens: Imagem[] = imagensJSON ? JSON.parse(imagensJSON) : [];
  
    imagens.forEach((imagem: Imagem) => {
      const card = document.createElement("div") as HTMLDivElement;
      card.classList.add("card");
  
      const img = document.createElement("img") as HTMLImageElement;
      img.src = imagem.url;
      img.alt = imagem.titulo;
  
      const h3 = document.createElement("h3") as HTMLHeadingElement;
      h3.title = imagem.titulo;
      h3.textContent = imagem.titulo;
  
      card.appendChild(img);
      card.appendChild(h3);
  
      content.appendChild(card);
    });
  });
  