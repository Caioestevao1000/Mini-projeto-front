-- =====================================================================
--  Projeto 1 - Programação Web Back-End
--  Tema: pilotos de Fórmula 1 (continuação do Mini-projeto-front)
--  Equipe: Caio Estevão e Rafael Okano
--
--  Banco: f1_pilotos
--  Roda sozinho na primeira vez que o MySQL do docker-compose sobe
--  (o arquivo é montado em /docker-entrypoint-initdb.d/).
--
--  ATENÇÃO: o script apaga e recria o banco do zero. Para voltar aos
--  dados de teste: docker compose down -v  e depois  docker compose up
-- =====================================================================

-- Garante que os acentos deste arquivo sejam lidos em UTF-8.
SET NAMES utf8mb4;

DROP DATABASE IF EXISTS f1_pilotos;

-- utf8mb4 aceita qualquer acento. O collation *_unicode_ci faz a busca
-- ignorar maiúsculas e acentos: "raikkonen" encontra "Räikkönen".
CREATE DATABASE f1_pilotos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE f1_pilotos;


-- ---------------------------------------------------------------------
-- 1) EQUIPES
--    O resultado da busca no front mostra a equipe do piloto.
--    A equipe fica numa tabela separada para o nome não se repetir em
--    cada piloto (normalização). Um piloto tem uma equipe (N:1).
-- ---------------------------------------------------------------------
CREATE TABLE equipes (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  nome  VARCHAR(60) NOT NULL UNIQUE,
  pais  VARCHAR(60) NOT NULL
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- 2) PILOTOS
--    É o "conteúdo" da API: o que a busca procura e pagina.
-- ---------------------------------------------------------------------
CREATE TABLE pilotos (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  nome             VARCHAR(100) NOT NULL,
  nacionalidade    VARCHAR(60)  NOT NULL,
  data_nascimento  DATE         NULL,
  numero           TINYINT UNSIGNED NULL,     -- número fixo do carro (existe desde 2014)
  equipe_id        INT          NULL,         -- equipe mais marcante da carreira
  titulos          TINYINT UNSIGNED  NOT NULL DEFAULT 0,
  vitorias         SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  poles            SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  podios           SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  ativo            BOOLEAN      NOT NULL DEFAULT FALSE,  -- ainda corre?
  destaque         BOOLEAN      NOT NULL DEFAULT FALSE,  -- aparece nos cards da página inicial
  foto_url         VARCHAR(255) NULL,         -- caminho da imagem no front (ex.: /static/img/ayrton-senna.jpg)
  foto_credito     VARCHAR(255) NULL,         -- autoria e licença da foto (vai no rodapé)
  biografia        TEXT         NULL,
  criado_em        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Se a equipe for apagada, o piloto continua existindo, só fica sem equipe.
  CONSTRAINT fk_pilotos_equipe
    FOREIGN KEY (equipe_id) REFERENCES equipes(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  -- Regra de consistência: todo piloto que venceu uma corrida subiu ao
  -- pódio, então vitórias nunca passam de pódios.
  CONSTRAINT chk_vitorias_podios CHECK (vitorias <= podios)
) ENGINE=InnoDB;

-- Índices para as buscas. Observação: o índice ajuda em LIKE 'sen%'
-- (começa com), mas não em LIKE '%sen%' (contém), que percorre a tabela.
CREATE INDEX idx_pilotos_nome          ON pilotos (nome);
CREATE INDEX idx_pilotos_nacionalidade ON pilotos (nacionalidade);


-- ---------------------------------------------------------------------
-- 3) USUÁRIOS
--    O projeto exige uma rota de busca de usuários com página de perfil.
--    Não existe login: cada usuário é só um perfil público, sem senha.
--    Quem acessa o site escolhe um perfil e favorita pilotos por ele.
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(100) NOT NULL,
  username    VARCHAR(30)  NOT NULL UNIQUE,  -- vai na URL: /usuarios/<username>
  bio         VARCHAR(255) NULL,
  criado_em   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- 4) FAVORITOS  (ligação N:N entre usuários e pilotos)
--    Hoje o front guarda os favoritos no localStorage, que só existe no
--    navegador de quem clicou. Aqui eles ficam salvos por usuário e
--    formam o "conjunto de itens associados ao usuário" do perfil.
-- ---------------------------------------------------------------------
CREATE TABLE favoritos (
  usuario_id  INT NOT NULL,
  piloto_id   INT NOT NULL,
  criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Chave primária composta: o mesmo usuário não favorita o mesmo piloto 2x.
  PRIMARY KEY (usuario_id, piloto_id),

  -- Apagou o usuário ou o piloto? Os favoritos ligados a ele somem junto.
  CONSTRAINT fk_fav_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_piloto  FOREIGN KEY (piloto_id)
    REFERENCES pilotos(id)  ON DELETE CASCADE
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- 5) VIEW: piloto já com o nome da equipe
--    Evita repetir o mesmo JOIN em todas as consultas da API.
-- ---------------------------------------------------------------------
CREATE VIEW vw_pilotos AS
SELECT
  p.id, p.nome, p.nacionalidade, p.data_nascimento, p.numero,
  e.nome AS equipe, e.pais AS equipe_pais,
  p.titulos, p.vitorias, p.poles, p.podios,
  p.ativo, p.destaque, p.foto_url, p.foto_credito, p.biografia
FROM pilotos p
LEFT JOIN equipes e ON e.id = p.equipe_id;


-- =====================================================================
--  DADOS DE TESTE
-- =====================================================================

INSERT INTO equipes (id, nome, pais) VALUES
  (1, 'Ferrari',  'Itália'),
  (2, 'McLaren',  'Reino Unido'),
  (3, 'Mercedes', 'Alemanha'),
  (4, 'Red Bull', 'Áustria'),
  (5, 'Williams', 'Reino Unido'),
  (6, 'Lotus',    'Reino Unido'),
  (7, 'Brabham',  'Reino Unido'),
  (8, 'Tyrrell',  'Reino Unido');

-- Os 3 primeiros são os da página inicial (destaque = TRUE), com as
-- mesmas imagens da pasta img/ e os créditos que estão no rodapé.
-- Os outros ficam sem foto: o front usa /static/img/pilot-logo.png no lugar.
-- Estatísticas de carreira na F1. Hamilton ainda corre, então os números
-- dele vão até o fim de 2024: confira antes da apresentação.
INSERT INTO pilotos
  (id, nome, nacionalidade, data_nascimento, numero, equipe_id,
   titulos, vitorias, poles, podios, ativo, destaque,
   foto_url, foto_credito, biografia)
VALUES
  (1, 'Michael Schumacher', 'Alemanha', '1969-01-03', NULL, 1,
   7, 91, 68, 155, FALSE, TRUE,
   '/static/img/michael-schumacher.jpg',
   'Foto: Nicolas Bachmann/F1fans via Wikimedia Commons (CC BY-SA 4.0)',
   'Heptacampeão mundial, com cinco títulos seguidos pela Ferrari entre 2000 e 2004.'),

  (2, 'Ayrton Senna', 'Brasil', '1960-03-21', NULL, 2,
   3, 41, 65, 80, FALSE, TRUE,
   '/static/img/ayrton-senna.jpg',
   'Foto: Instituto Ayrton Senna via Wikimedia Commons (CC BY 2.0)',
   'Tricampeão mundial (1988, 1990 e 1991) pela McLaren, famoso pelo desempenho na chuva.'),

  (3, 'Lewis Hamilton', 'Reino Unido', '1985-01-07', 44, 3,
   7, 105, 104, 202, TRUE, TRUE,
   '/static/img/lewis-hamilton.jpg',
   'Foto: Gerardo Lazzari via Wikimedia Commons (CC BY 2.0)',
   'Heptacampeão mundial, seis títulos pela Mercedes. Foi para a Ferrari em 2025.'),

  (4, 'Alain Prost', 'França', '1955-02-24', NULL, 2,
   4, 51, 33, 106, FALSE, FALSE, NULL, NULL,
   'Tetracampeão, conhecido como "O Professor" e grande rival de Senna.'),

  (5, 'Nelson Piquet', 'Brasil', '1952-08-17', NULL, 7,
   3, 23, 24, 60, FALSE, FALSE, NULL, NULL,
   'Tricampeão mundial (1981, 1983 e 1987), por Brabham e Williams.'),

  (6, 'Emerson Fittipaldi', 'Brasil', '1946-12-12', NULL, 6,
   2, 14, 6, 35, FALSE, FALSE, NULL, NULL,
   'Primeiro brasileiro campeão da F1, em 1972 pela Lotus.'),

  (7, 'Niki Lauda', 'Áustria', '1949-02-22', NULL, 1,
   3, 25, 24, 54, FALSE, FALSE, NULL, NULL,
   'Tricampeão; voltou a correr semanas depois de um grave acidente em 1976.'),

  (8, 'Sebastian Vettel', 'Alemanha', '1987-07-03', 5, 4,
   4, 53, 57, 122, FALSE, FALSE, NULL, NULL,
   'Tetracampeão consecutivo pela Red Bull, de 2010 a 2013.'),

  (9, 'Kimi Räikkönen', 'Finlândia', '1979-10-17', 7, 1,
   1, 21, 18, 103, FALSE, FALSE, NULL, NULL,
   'Campeão em 2007 pela Ferrari, apelidado de "Homem de Gelo".'),

  (10, 'Rubens Barrichello', 'Brasil', '1972-05-23', NULL, 1,
   0, 11, 14, 68, FALSE, FALSE, NULL, NULL,
   'Vice-campeão em 2002 e 2004 pela Ferrari.'),

  (11, 'Felipe Massa', 'Brasil', '1981-04-25', 19, 1,
   0, 11, 16, 41, FALSE, FALSE, NULL, NULL,
   'Vice-campeão em 2008, decidido na última volta do GP do Brasil.'),

  (12, 'Mika Häkkinen', 'Finlândia', '1968-09-28', NULL, 2,
   2, 20, 26, 51, FALSE, FALSE, NULL, NULL,
   'Bicampeão (1998 e 1999) pela McLaren.'),

  (13, 'Nico Rosberg', 'Alemanha', '1985-06-27', 6, 3,
   1, 23, 30, 57, FALSE, FALSE, NULL, NULL,
   'Campeão de 2016 pela Mercedes; aposentou-se logo depois do título.'),

  (14, 'Juan Manuel Fangio', 'Argentina', '1911-06-24', NULL, 3,
   5, 24, 29, 35, FALSE, FALSE, NULL, NULL,
   'Pentacampeão nos anos 1950, por quatro equipes diferentes.'),

  (15, 'Jackie Stewart', 'Reino Unido', '1939-06-11', NULL, 8,
   3, 27, 17, 43, FALSE, FALSE, NULL, NULL,
   'Tricampeão e um dos maiores defensores da segurança na F1.'),

  (16, 'Jim Clark', 'Reino Unido', '1936-03-04', NULL, 6,
   2, 25, 33, 32, FALSE, FALSE, NULL, NULL,
   'Bicampeão (1963 e 1965) pela Lotus.');

INSERT INTO usuarios (id, nome, username, bio) VALUES
  (1, 'Caio Estevão',  'caio',   'Fã da era Senna x Prost.'),
  (2, 'Rafael Okano',  'rafael', 'Torcedor da Ferrari desde o Schumacher.'),
  (3, 'Usuário Teste', 'teste',  NULL);   -- sem favoritos: serve para testar o perfil vazio

INSERT INTO favoritos (usuario_id, piloto_id) VALUES
  (1, 2), (1, 4), (1, 5),     -- caio:   Senna, Prost, Piquet
  (2, 1), (2, 7), (2, 9);     -- rafael: Schumacher, Lauda, Räikkönen
