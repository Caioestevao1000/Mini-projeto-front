const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("pilot-search");
const inputError = document.getElementById("input-error");

// Pesquisa de pilotos
async function searchFunction(inputValue) {
  const response = await fetch("https://api.openf1.org/v1/drivers?&session_key=latest");
  const pilots = await response.json();
  const pilot = pilots.find(p => p.full_name.toLowerCase().includes(inputValue.toLowerCase()));
  console.log(pilot);
}

searchButton.addEventListener("click", function () {
  const inputValue = searchInput.value;

  if (inputValue.length < 3) {
    inputError.textContent = "Digite pelo menos 3 caracteres";
    return;
  }

  inputError.textContent = "Buscando..";
  searchFunction(inputValue);
});


// Favoritos
const btnFavoritos = document.getElementById("btn-favoritos");
const modalFavoritos = document.getElementById("modal-favoritos");
const fecharModal = document.getElementById("fechar-modal");
const listaFavoritos = document.getElementById("lista-favoritos");

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
    </div>
  `).join("");
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

document.querySelectorAll(".btn-favoritar").forEach(btn => {
  btn.addEventListener("click", () => {
    toggleFavorito(btn.dataset.name, btn.dataset.img, btn.dataset.alt);
  });
});

updateBtnsFavoritar();
