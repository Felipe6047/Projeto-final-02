-- FRIK - Sistema de Fidelização com Gamificação
-- MySQL 8+
--
-- LEGADO: use `npm run db:migrate` e `src/entities/` + `src/database/migrations/` (TypeORM).
-- Este arquivo permanece apenas como referência.

CREATE DATABASE IF NOT EXISTS frik
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE frik;

-- ---------------------------------------------------------------------------
-- Níveis de fidelidade (Bronze → Diamante)
-- ---------------------------------------------------------------------------
CREATE TABLE nivel_fidelidade (
  id              TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome            VARCHAR(30)      NOT NULL,
  slug            VARCHAR(30)      NOT NULL,
  ordem           TINYINT UNSIGNED NOT NULL,
  trocas_mes      SMALLINT UNSIGNED NULL COMMENT 'NULL = ilimitado',
  mesmo_rank_apenas TINYINT(1)     NOT NULL DEFAULT 0,
  pode_presentear_cupom TINYINT(1) NOT NULL DEFAULT 0,
  pode_presentear_produto TINYINT(1) NOT NULL DEFAULT 0,
  valor_max_presente DECIMAL(10,2) NULL COMMENT 'NULL = sem limite',
  pode_criar_sala_troca TINYINT(1) NOT NULL DEFAULT 0,
  pontos_minimos  INT UNSIGNED     NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_nivel_slug (slug),
  UNIQUE KEY uk_nivel_ordem (ordem)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Usuários
-- ---------------------------------------------------------------------------
CREATE TABLE usuario (
  id              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  nome            VARCHAR(120)     NOT NULL,
  email           VARCHAR(180)     NOT NULL,
  telefone        VARCHAR(20)      NULL,
  cpf             CHAR(11)         NULL,
  senha_hash      VARCHAR(255)     NOT NULL,
  nivel_id        TINYINT UNSIGNED NOT NULL DEFAULT 1,
  pontos          INT UNSIGNED     NOT NULL DEFAULT 0,
  avatar_url      VARCHAR(500)     NULL,
  ativo           TINYINT(1)       NOT NULL DEFAULT 1,
  papel           ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
  criado_em       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuario_email (email),
  UNIQUE KEY uk_usuario_cpf (cpf),
  KEY idx_usuario_nivel (nivel_id),
  CONSTRAINT fk_usuario_nivel FOREIGN KEY (nivel_id) REFERENCES nivel_fidelidade (id)
) ENGINE=InnoDB;

CREATE TABLE endereco (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id      INT UNSIGNED NOT NULL,
  apelido         VARCHAR(60)  NULL,
  cep             CHAR(8)      NOT NULL,
  logradouro      VARCHAR(200) NOT NULL,
  numero          VARCHAR(20)  NOT NULL,
  complemento     VARCHAR(100) NULL,
  bairro          VARCHAR(100) NOT NULL,
  cidade          VARCHAR(100) NOT NULL,
  uf              CHAR(2)      NOT NULL,
  principal       TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_endereco_usuario (usuario_id),
  CONSTRAINT fk_endereco_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Pontos e compras
-- ---------------------------------------------------------------------------
CREATE TABLE historico_pontos (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id      INT UNSIGNED    NOT NULL,
  valor           INT             NOT NULL COMMENT 'positivo = crédito, negativo = débito',
  saldo_apos      INT UNSIGNED    NOT NULL,
  tipo            ENUM(
                    'compra', 'resgate', 'troca_taxa', 'missao',
                    'campanha', 'presente', 'ajuste_admin'
                  ) NOT NULL,
  referencia_tipo VARCHAR(40)     NULL,
  referencia_id   BIGINT UNSIGNED NULL,
  descricao       VARCHAR(255)    NULL,
  criado_em       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_historico_usuario (usuario_id, criado_em),
  CONSTRAINT fk_historico_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
) ENGINE=InnoDB;

CREATE TABLE compra (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id      INT UNSIGNED    NOT NULL,
  valor_total     DECIMAL(10,2)   NOT NULL,
  pontos_gerados  INT UNSIGNED    NOT NULL DEFAULT 0,
  criado_em       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_compra_usuario (usuario_id),
  CONSTRAINT fk_compra_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Cupons
-- ---------------------------------------------------------------------------
CREATE TABLE cupom_template (
  id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo              VARCHAR(120) NOT NULL,
  descricao           TEXT         NULL,
  categoria           VARCHAR(60)  NOT NULL,
  desconto_percentual DECIMAL(5,2) NULL,
  desconto_valor      DECIMAL(10,2) NULL,
  valor_minimo_compra DECIMAL(10,2) NULL,
  imagem_url          VARCHAR(500) NULL,
  dias_validade       SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  ativo               TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE cupom_usuario (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id      INT UNSIGNED    NOT NULL,
  template_id     INT UNSIGNED    NOT NULL,
  codigo          VARCHAR(40)     NOT NULL,
  status          ENUM(
                    'disponivel', 'oferecido_troca', 'em_troca',
                    'resgatado', 'presenteado', 'expirado'
                  ) NOT NULL DEFAULT 'disponivel',
  validade_ate    DATE            NOT NULL,
  origem          ENUM('compra', 'missao', 'campanha', 'presente', 'troca') NOT NULL DEFAULT 'compra',
  criado_em       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_cupom_codigo (codigo),
  KEY idx_cupom_usuario_status (usuario_id, status),
  KEY idx_cupom_mercado (status, validade_ate),
  CONSTRAINT fk_cupom_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id),
  CONSTRAINT fk_cupom_template FOREIGN KEY (template_id) REFERENCES cupom_template (id)
) ENGINE=InnoDB;

-- Controle de trocas mensais por usuário
CREATE TABLE usuario_troca_mes (
  usuario_id      INT UNSIGNED NOT NULL,
  ano_mes         CHAR(6)      NOT NULL COMMENT 'YYYYMM',
  quantidade      SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (usuario_id, ano_mes),
  CONSTRAINT fk_troca_mes_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
) ENGINE=InnoDB;

CREATE TABLE proposta_troca (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  solicitante_id      INT UNSIGNED    NOT NULL,
  proprietario_id     INT UNSIGNED    NOT NULL,
  cupom_solicitante_id BIGINT UNSIGNED NOT NULL,
  cupom_proprietario_id BIGINT UNSIGNED NOT NULL,
  status              ENUM('pendente', 'aceita', 'recusada', 'cancelada') NOT NULL DEFAULT 'pendente',
  taxa_pontos         INT UNSIGNED    NOT NULL DEFAULT 0,
  taxa_aceita         TINYINT(1)      NOT NULL DEFAULT 0,
  respondido_em       DATETIME        NULL,
  criado_em           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_proposta_solicitante (solicitante_id, status),
  KEY idx_proposta_proprietario (proprietario_id, status),
  CONSTRAINT fk_proposta_solicitante FOREIGN KEY (solicitante_id) REFERENCES usuario (id),
  CONSTRAINT fk_proposta_proprietario FOREIGN KEY (proprietario_id) REFERENCES usuario (id),
  CONSTRAINT fk_proposta_cupom_sol FOREIGN KEY (cupom_solicitante_id) REFERENCES cupom_usuario (id),
  CONSTRAINT fk_proposta_cupom_prop FOREIGN KEY (cupom_proprietario_id) REFERENCES cupom_usuario (id)
) ENGINE=InnoDB;

CREATE TABLE presente_cupom (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cupom_id            BIGINT UNSIGNED NOT NULL,
  remetente_id        INT UNSIGNED    NOT NULL,
  destinatario_id     INT UNSIGNED    NULL,
  destinatario_nome   VARCHAR(120)    NULL,
  destinatario_email  VARCHAR(180)    NULL,
  destinatario_telefone VARCHAR(20)   NULL,
  destinatario_cpf    CHAR(11)        NULL,
  canal               ENUM('email', 'whatsapp', 'sms', 'link') NOT NULL,
  mensagem            VARCHAR(200)    NULL,
  codigo_resgate      VARCHAR(64)     NOT NULL,
  status              ENUM('enviado', 'resgatado', 'expirado') NOT NULL DEFAULT 'enviado',
  criado_em           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_presente_codigo (codigo_resgate),
  CONSTRAINT fk_presente_cupom FOREIGN KEY (cupom_id) REFERENCES cupom_usuario (id),
  CONSTRAINT fk_presente_remetente FOREIGN KEY (remetente_id) REFERENCES usuario (id),
  CONSTRAINT fk_presente_destinatario FOREIGN KEY (destinatario_id) REFERENCES usuario (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Produtos e presentes físicos
-- ---------------------------------------------------------------------------
CREATE TABLE produto (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome            VARCHAR(150) NOT NULL,
  descricao       TEXT         NULL,
  preco_reais     DECIMAL(10,2) NOT NULL,
  preco_pontos    INT UNSIGNED NOT NULL DEFAULT 0,
  estoque         INT UNSIGNED NOT NULL DEFAULT 0,
  imagem_url      VARCHAR(500) NULL,
  ativo           TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE pedido_presente (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  remetente_id        INT UNSIGNED    NOT NULL,
  destinatario_id     INT UNSIGNED    NULL,
  destinatario_nome   VARCHAR(120)    NOT NULL,
  destinatario_email  VARCHAR(180)    NULL,
  destinatario_telefone VARCHAR(20)   NULL,
  destinatario_cpf    CHAR(11)        NULL,
  endereco_json       JSON            NOT NULL,
  mensagem            VARCHAR(500)    NULL,
  embrulho            TINYINT(1)      NOT NULL DEFAULT 0,
  enviar_surpresa     TINYINT(1)      NOT NULL DEFAULT 0,
  valor_reais         DECIMAL(10,2)   NOT NULL DEFAULT 0,
  pontos_usados       INT UNSIGNED    NOT NULL DEFAULT 0,
  status              ENUM(
                        'pendente', 'pago', 'enviado',
                        'a_caminho', 'entregue', 'cancelado'
                      ) NOT NULL DEFAULT 'pendente',
  codigo_rastreio     VARCHAR(60)     NULL,
  criado_em           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pedido_remetente (remetente_id),
  CONSTRAINT fk_pedido_remetente FOREIGN KEY (remetente_id) REFERENCES usuario (id),
  CONSTRAINT fk_pedido_destinatario FOREIGN KEY (destinatario_id) REFERENCES usuario (id)
) ENGINE=InnoDB;

CREATE TABLE pedido_presente_item (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pedido_id       BIGINT UNSIGNED NOT NULL,
  produto_id      INT UNSIGNED    NOT NULL,
  quantidade      SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  preco_unitario  DECIMAL(10,2)   NOT NULL,
  pontos_unitarios INT UNSIGNED   NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  CONSTRAINT fk_item_pedido FOREIGN KEY (pedido_id) REFERENCES pedido_presente (id) ON DELETE CASCADE,
  CONSTRAINT fk_item_produto FOREIGN KEY (produto_id) REFERENCES produto (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Gamificação: missões, conquistas, eventos, ranking
-- ---------------------------------------------------------------------------
CREATE TABLE missao (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo          VARCHAR(120) NOT NULL,
  descricao       TEXT         NULL,
  pontos_recompensa INT UNSIGNED NOT NULL,
  meta_valor      INT UNSIGNED NOT NULL DEFAULT 1,
  tipo_meta       ENUM('compras', 'trocas', 'presentes', 'pontos') NOT NULL,
  ativa           TINYINT(1)   NOT NULL DEFAULT 1,
  inicio_em       DATE         NULL,
  fim_em          DATE         NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE usuario_missao (
  usuario_id      INT UNSIGNED NOT NULL,
  missao_id       INT UNSIGNED NOT NULL,
  progresso       INT UNSIGNED NOT NULL DEFAULT 0,
  concluida       TINYINT(1)   NOT NULL DEFAULT 0,
  concluida_em    DATETIME     NULL,
  PRIMARY KEY (usuario_id, missao_id),
  CONSTRAINT fk_um_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id),
  CONSTRAINT fk_um_missao FOREIGN KEY (missao_id) REFERENCES missao (id)
) ENGINE=InnoDB;

CREATE TABLE conquista (
  id              SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug            VARCHAR(40)  NOT NULL,
  nome            VARCHAR(80)  NOT NULL,
  descricao       VARCHAR(255) NOT NULL,
  icone           VARCHAR(40)  NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_conquista_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE usuario_conquista (
  usuario_id      INT UNSIGNED    NOT NULL,
  conquista_id    SMALLINT UNSIGNED NOT NULL,
  desbloqueada_em DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, conquista_id),
  CONSTRAINT fk_uc_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id),
  CONSTRAINT fk_uc_conquista FOREIGN KEY (conquista_id) REFERENCES conquista (id)
) ENGINE=InnoDB;

CREATE TABLE evento_sazonal (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo          VARCHAR(120) NOT NULL,
  descricao       TEXT         NULL,
  trocas_extras   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  inicio_em       DATETIME     NOT NULL,
  fim_em          DATETIME     NOT NULL,
  ativo           TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE sala_troca (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  criador_id      INT UNSIGNED NOT NULL,
  nome            VARCHAR(80)  NOT NULL,
  codigo_convite  VARCHAR(12)  NOT NULL,
  criado_em       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_sala_codigo (codigo_convite),
  CONSTRAINT fk_sala_criador FOREIGN KEY (criador_id) REFERENCES usuario (id)
) ENGINE=InnoDB;

CREATE TABLE sala_troca_membro (
  sala_id         INT UNSIGNED NOT NULL,
  usuario_id      INT UNSIGNED NOT NULL,
  entrado_em      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (sala_id, usuario_id),
  CONSTRAINT fk_stm_sala FOREIGN KEY (sala_id) REFERENCES sala_troca (id) ON DELETE CASCADE,
  CONSTRAINT fk_stm_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Notificações e painel admin
-- ---------------------------------------------------------------------------
CREATE TABLE notificacao (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id      INT UNSIGNED    NOT NULL,
  titulo          VARCHAR(120)    NOT NULL,
  mensagem        VARCHAR(500)    NOT NULL,
  tipo            VARCHAR(40)     NOT NULL,
  lida            TINYINT(1)      NOT NULL DEFAULT 0,
  criado_em       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notificacao_usuario (usuario_id, lida),
  CONSTRAINT fk_notificacao_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
) ENGINE=InnoDB;

CREATE TABLE campanha (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo          VARCHAR(120) NOT NULL,
  descricao       TEXT         NULL,
  segmento_json   JSON         NULL,
  inicio_em       DATETIME     NOT NULL,
  fim_em          DATETIME     NOT NULL,
  ativa           TINYINT(1)   NOT NULL DEFAULT 1,
  criado_em       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- View auxiliar para ranking global
CREATE OR REPLACE VIEW vw_ranking_global AS
SELECT
  u.id,
  u.nome,
  u.avatar_url,
  n.nome AS nivel,
  n.slug AS nivel_slug,
  u.pontos,
  RANK() OVER (ORDER BY u.pontos DESC) AS posicao
FROM usuario u
JOIN nivel_fidelidade n ON n.id = u.nivel_id
WHERE u.ativo = 1;
