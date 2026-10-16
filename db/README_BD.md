# Banco de dados: `f1_pilotos`

Banco do Projeto 1 (Programação Web Back-End), feito para o front do
[Mini-projeto-front](https://github.com/Caioestevao1000/Mini-projeto-front).

- **Banco:** Caio Estevão
- **API (Flask):** Rafael Okano

## Como o banco é criado

O `docker-compose.yml` coloca o `banco_f1.sql` na pasta `/docker-entrypoint-initdb.d/` do
container do MySQL. Na **primeira** vez que o container sobe, o MySQL roda esse script sozinho.

Os dados ficam guardados no volume `dados_mysql`. Para apagar tudo e recriar a partir do
`.sql` (por exemplo, depois de mudar o script): `docker compose down -v` e `docker compose up`.

## Modelo

```
equipes 1 ──── N pilotos N ──── N usuarios
                       └─ favoritos ─┘
```

| Tabela | O que guarda | Requisito do projeto que atende |
|---|---|---|
| `equipes` | Nome e país da equipe | Normalização: o nome não se repete em cada piloto |
| `pilotos` | Dados, estatísticas e foto de cada piloto | Rota de busca de conteúdo com paginação e parâmetros String |
| `usuarios` | Perfis públicos, sem senha (o `username` vai na URL) | Rota de busca de usuários |
| `favoritos` | Quais pilotos cada usuário favoritou (N:N) | "Conjunto de itens associados ao usuário" na página de perfil |
| `vw_pilotos` (view) | Piloto já com o nome da equipe | Evita repetir o JOIN em toda consulta |

Regras que o próprio banco garante:
- O mesmo usuário não favorita o mesmo piloto duas vezes (chave primária composta).
- Não dá para favoritar um piloto ou usuário que não existe (chave estrangeira).
- Apagar um usuário ou piloto apaga os favoritos ligados a ele (`ON DELETE CASCADE`).
- Apagar uma equipe deixa os pilotos dela sem equipe (`ON DELETE SET NULL`).
- Vitórias nunca passam de pódios (`CHECK`).
- Dois perfis não podem ter o mesmo `username` (`UNIQUE`).
- A busca ignora maiúsculas e acentos: `raikkonen` encontra "Kimi Räikkönen".

## Sem login

O site não tem login nem senha. Cada usuário é só um **perfil público**: quem acessa
escolhe um perfil (por exemplo, `caio`) e o front passa esse perfil nas rotas de
favoritos. O PDF continua atendido, porque ele pede a busca de usuários e a página
de perfil com os pilotos de cada um, não autenticação.

## Dados de teste

- **16 pilotos** e 8 equipes. Os 3 da página inicial (Schumacher, Senna, Hamilton) têm
  `destaque = TRUE`, a foto da pasta `static/img/` e o crédito da imagem. Os outros ficam com
  `foto_url` nulo, e o front mostra `static/img/pilot-logo.png` no lugar.
- **3 perfis:** `caio` e `rafael` com 3 favoritos cada, e `teste` sem nenhum (para testar
  o perfil vazio).

## Rotas da API

As rotas que usam este banco, com exemplos, estão no [README principal](../README.md#rotas-da-api).
Os SQL ficam nos models (`models/piloto.py`, `models/usuario.py`, `models/favorito.py`).
