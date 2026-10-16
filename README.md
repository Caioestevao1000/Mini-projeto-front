# API de Pilotos de F1

Projeto 1 de Programação Web Back-End: uma API JSON em **Flask + MySQL** sobre pilotos de
Fórmula 1, com uma página de front-end simples que consome as rotas.

## Estrutura (MVC)

```
├── app.py                  # cria o Flask, registra os Blueprints e entrega o front em /
├── config.py               # dados de conexão com o banco (o MySQL do Docker)
├── requirements.txt        # bibliotecas Python que o container instala
├── docker-compose.yml      # sobe 2 containers: db (MySQL) e app (Flask)
├── controllers/            # C: recebem a requisição HTTP, chamam o model e devolvem JSON
│   ├── piloto_controller.py    (Blueprint /api/pilotos)
│   └── usuario_controller.py   (Blueprint /api/usuarios)
├── models/                 # M: classes que recebem o cursor e executam o SQL
│   ├── conexao.py              (get_connection() com g + teardown)
│   ├── piloto.py               (class Pilotos)
│   ├── usuario.py              (class Usuarios)
│   └── favorito.py             (class Favoritos)
├── static/                 # V: front-end servido pelo Flask
│   ├── index.html
│   ├── css/style.css
│   ├── javascript/script.js
│   └── img/
└── db/
    ├── banco_f1.sql            (cria o banco f1_pilotos e insere os dados de teste)
    └── README_BD.md            (explicação do modelo do banco)
```

## Como rodar

Precisa só do **Docker Desktop** aberto. Na pasta do projeto:

```bash
docker compose up
```

Espere aparecer `Running on http://0.0.0.0:5000` e abra **http://localhost:5000**.

- Desligar: `Ctrl+C` (ou `docker compose down`)
- Zerar o banco e voltar aos dados de teste: `docker compose down -v`

## Rotas da API

| Método | Rota | O que faz |
|---|---|---|
| GET | `/api/pilotos/destaques` | Os 3 pilotos da página inicial |
| GET | `/api/pilotos/busca/<termo>?pagina=1` | Busca no nome, nacionalidade ou equipe, 4 por página |
| GET | `/api/usuarios/` | Lista os usuários |
| GET | `/api/usuarios/busca/<termo>` | Busca usuários pelo nome ou username |
| GET | `/api/usuarios/<username>` | Perfil: dados do usuário + pilotos favoritos |
| POST | `/api/usuarios/<username>/favoritos/<piloto_id>` | Favorita um piloto |
| DELETE | `/api/usuarios/<username>/favoritos/<piloto_id>` | Remove dos favoritos |

Exemplo da busca paginada (`/api/pilotos/busca/brasil?pagina=1`):

```json
{ "pagina": 1, "total_paginas": 2, "resultados": [ { "id": 2, "nome": "Ayrton Senna", ... } ] }
```

## Autores

- Caio Estevão — [github.com/Caioestevao1000](https://github.com/Caioestevao1000)
- Rafael Okano — [github.com/RafaelOkano](https://github.com/RafaelOkano)
