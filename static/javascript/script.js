const FOTO_PADRAO = "/static/img/pilot-logo.png";

let perfilAtivo = null;        // username escolhido no <select>
let favoritos = [];            // ids dos pilotos favoritados pelo perfil ativo
let buscaAtual = null;         // { termo, pagina } da última busca

const selectPerfil = document.getElementById("perfil-ativo");
const destaques = document.getElementById("destaques");
const searchInput = document.getElementById("pilot-search");
const inputError = document.getElementById("input-error");
const modalBusca = document.getElementById("modal-busca");
const resultadoBusca = document.getElementById("resultado-busca");
const paginacaoBusca = document.getElementById("paginacao-busca");
const modalPerfil = document.getElementById("modal-perfil");


// Card de um piloto (usado na busca e no perfil)
function cardPiloto(piloto) {
  const fav = favoritos.includes(piloto.id);
  return `
    <div class="card-favorito">
      <img src="${piloto.foto_url || FOTO_PADRAO}" alt="Foto de ${piloto.nome}" />
      <p>${piloto.nome}</p>
      <p class="card-detalhe">${piloto.equipe} · ${piloto.nacionalidade}</p>
      <button class="btn-favoritar ${fav ? "favoritado" : ""}" onclick="favoritar(${piloto.id})">
        ${fav ? "♥ Favoritado" : "♡ Favoritar"}
      </button>
    </div>`;
}

// Destaques da página inicial: GET /api/pilotos/destaques
async function carregarDestaques() {
  const resposta = await fetch("/api/pilotos/destaques");
  const pilotos = await resposta.json();
  destaques.innerHTML = pilotos.map(cardPiloto).join("");
}

// Perfis no <select>: GET /api/usuarios/
async function carregarPerfis() {
  const resposta = await fetch("/api/usuarios/");
  const usuarios = await resposta.json();
  selectPerfil.innerHTML = usuarios
    .map(u => `<option value="${u.username}">${u.nome}</option>`)
    .join("");
  perfilAtivo = selectPerfil.value;
}

// Perfil com os favoritos: GET /api/usuarios/<username>
async function carregarPerfil() {
  const resposta = await fetch(`/api/usuarios/${perfilAtivo}`);
  const perfil = await resposta.json();
  favoritos = perfil.favoritos.map(p => p.id);

  document.getElementById("perfil-titulo").textContent = perfil.nome;
  document.getElementById("perfil-bio").textContent = perfil.bio || "";
  document.getElementById("perfil-favoritos").innerHTML = perfil.favoritos.length
    ? perfil.favoritos.map(cardPiloto).join("")
    : '<p class="sem-favoritos">Nenhum piloto favoritado ainda.</p>';
}

// Busca com paginação: GET /api/pilotos/busca/<termo>?pagina=N
async function buscar(termo, pagina) {
  buscaAtual = { termo, pagina };
  const resposta = await fetch(`/api/pilotos/busca/${encodeURIComponent(termo)}?pagina=${pagina}`);
  const dados = await resposta.json();

  resultadoBusca.innerHTML = dados.resultados.length
    ? dados.resultados.map(cardPiloto).join("")
    : '<p class="sem-favoritos">Nenhum piloto encontrado.</p>';

  paginacaoBusca.innerHTML = "";
  if (dados.total_paginas > 1) {
    paginacaoBusca.innerHTML = `
      <button ${pagina <= 1 ? "disabled" : ""} onclick="buscar('${termo}', ${pagina - 1})">‹ Anterior</button>
      <span>Página ${pagina} de ${dados.total_paginas}</span>
      <button ${pagina >= dados.total_paginas ? "disabled" : ""} onclick="buscar('${termo}', ${pagina + 1})">Próxima ›</button>`;
  }
  modalBusca.classList.remove("hidden");
}

// Favoritar / desfavoritar: POST ou DELETE /api/usuarios/<username>/favoritos/<id>
async function favoritar(pilotoId) {
  const metodo = favoritos.includes(pilotoId) ? "DELETE" : "POST";
  await fetch(`/api/usuarios/${perfilAtivo}/favoritos/${pilotoId}`, { method: metodo });
  await atualizarTela();
}

// Recarrega os favoritos e redesenha os botões
async function atualizarTela() {
  await carregarPerfil();
  await carregarDestaques();
  if (!modalBusca.classList.contains("hidden")) {
    await buscar(buscaAtual.termo, buscaAtual.pagina);
  }
}

// Eventos
document.getElementById("search-button").addEventListener("click", () => {
  const termo = searchInput.value.trim();
  if (termo.length < 3) {
    inputError.textContent = "Digite pelo menos 3 caracteres";
    return;
  }
  inputError.textContent = "";
  buscar(termo, 1);
});

selectPerfil.addEventListener("change", () => {
  perfilAtivo = selectPerfil.value;
  atualizarTela();
});

document.getElementById("btn-favoritos").addEventListener("click", () => {
  modalPerfil.classList.remove("hidden");
});

document.querySelectorAll("[data-fechar]").forEach(botao => {
  botao.addEventListener("click", () => {
    document.getElementById(botao.dataset.fechar).classList.add("hidden");
  });
});


// Início
async function iniciar() {
  await carregarPerfis();
  await atualizarTela();
}

iniciar();
