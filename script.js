const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("pilot-search");
const inputError = document.getElementById("input-error");
const pilotDialog = document.getElementById("pilot-dialog")
const pilotContent = document.getElementById("pilot-status")

// Pesquisa de pilotos
async function searchFunction(inputValue) {
  const response = await fetch("https://api.openf1.org/v1/drivers?&session_key=latest");
  const pilots = await response.json();
  const pilot = pilots.find(p => p.full_name.toLowerCase().includes(inputValue.toLowerCase()));
  inputError.textContent = "";
  if (!pilot) { inputError.textContent = "Piloto não encontrado."; return; }
  showSearchResult(pilot);
}

//click event -> validation -> dialog opening
searchButton.addEventListener("click", async function(){
    const inputValue = searchInput.value;

    if (inputValue.length < 3){
        inputError.textContent = "Digite pelo menos 3 caracteres";
        return;
    }

    inputError.textContent = "Buscando..";
    const pilotData = await searchFunction(inputValue);

    if (!pilotData) {
        inputError.textContent = "Piloto não encontrado";
        return;
    }

    console.log(pilotData);

    renderDialog(pilotData);

    openDialog();
})
//rendering dialog in HTML
function renderDialog(pilotData){
    pilotContent.innerHTML = `
    <img src="${pilotData.headshot_url}" alt="${pilotData.full_name}"/>
    <h2>${pilotData.full_name}</h2>
    <p>${pilotData.team_name}</p>
    <button onclick="closeDialog()">Fechar</button>
    `;
}

// function to open the dialog
function openDialog(){
    pilotDialog.showModal();
}

// function to close the dialog
function closeDialog(){
    pilotDialog.close();
}
// Favoritos
const btnFavoritos = document.getElementById("btn-favoritos");
const modalFavoritos = document.getElementById("modal-favoritos");
const fecharModal = document.getElementById("fechar-modal");
const listaFavoritos = document.getElementById("lista-favoritos");
const modalBusca = document.getElementById("modal-busca");
const fecharModalBusca = document.getElementById("fechar-modal-busca");
const resultadoBusca = document.getElementById("resultado-busca");

function showSearchResult(pilot) {
  const img = pilot.headshot_url || "img/pilot-logo.png";
  const alt = `Foto de ${pilot.full_name}`;
  const isFav = getFavoritos().some(f => f.name === pilot.full_name);
  resultadoBusca.innerHTML = `
    <div class="card-favorito">
      <img src="${img}" alt="${alt}" />
      <p>${pilot.full_name}</p>
      ${pilot.team_name ? `<p style="font-size:12px;color:#666;font-weight:400">${pilot.team_name}</p>` : ""}
      <button class="btn-favoritar ${isFav ? "favoritado" : ""}" data-name="${pilot.full_name}" data-img="${img}" data-alt="${alt}">
        ${isFav ? "♥ Favoritado" : "♡ Favoritar"}
      </button>
    </div>
  `;
  resultadoBusca.querySelector(".btn-favoritar").addEventListener("click", function () {
    toggleFavorito(this.dataset.name, this.dataset.img, this.dataset.alt);
    const isFav = getFavoritos().some(f => f.name === this.dataset.name);
    this.classList.toggle("favoritado", isFav);
    this.textContent = isFav ? "♥ Favoritado" : "♡ Favoritar";
  });
  modalBusca.classList.remove("hidden");
}

function getFavoritos() {
  return JSON.parse(localStorage.getItem("favoritos") || "[]");
}

function saveFavoritos(favs) {
  localStorage.setItem("favoritos", JSON.stringify(favs));
}

function toggleFavorito(name, img, alt) {
  const favs = getFavoritos();
  const idx = favs.findIndex(f => f.name === name);
  if (idx >= 0) {
    favs.splice(idx, 1);
  } else {
    favs.push({ name, img, alt });
  }
  saveFavoritos(favs);
  updateBtnsFavoritar();
}

function updateBtnsFavoritar() {
  const favs = getFavoritos();
  document.querySelectorAll(".btn-favoritar").forEach(btn => {
    const isFav = favs.some(f => f.name === btn.dataset.name);
    btn.classList.toggle("favoritado", isFav);
    btn.textContent = isFav ? "♥ Favoritado" : "♡ Favoritar";
  });
}

function renderFavoritos() {
  const favs = getFavoritos();
  if (favs.length === 0) {
    listaFavoritos.innerHTML = '<p class="sem-favoritos">Nenhum piloto favoritado ainda.</p>';
    return;
  }
  listaFavoritos.innerHTML = favs.map(f => `
    <div class="card-favorito">
      <img src="${f.img}" alt="${f.alt}" />
      <p>${f.name}</p>
      <button class="btn-remover-favorito" data-name="${f.name}">✕ Remover</button>
    </div>
  `).join("");
  listaFavoritos.querySelectorAll(".btn-remover-favorito").forEach(btn => {
    btn.addEventListener("click", () => {
      const favs = getFavoritos();
      favs.splice(favs.findIndex(f => f.name === btn.dataset.name), 1);
      saveFavoritos(favs);
      updateBtnsFavoritar();
      renderFavoritos();
    });
  });
}

btnFavoritos.addEventListener("click", () => {
  renderFavoritos();
  modalFavoritos.classList.remove("hidden");
});

fecharModal.addEventListener("click", () => {
  modalFavoritos.classList.add("hidden");
});

modalFavoritos.addEventListener("click", (e) => {
  if (e.target === modalFavoritos) {
    modalFavoritos.classList.add("hidden");
  }
});

fecharModalBusca.addEventListener("click", () => modalBusca.classList.add("hidden"));
modalBusca.addEventListener("click", (e) => { if (e.target === modalBusca) modalBusca.classList.add("hidden"); });

document.querySelectorAll(".btn-favoritar").forEach(btn => {
  btn.addEventListener("click", () => {
    toggleFavorito(btn.dataset.name, btn.dataset.img, btn.dataset.alt);
  });
});

updateBtnsFavoritar();
