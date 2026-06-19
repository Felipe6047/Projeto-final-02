USE frik;

INSERT INTO nivel_fidelidade (nome, slug, ordem, trocas_mes, mesmo_rank_apenas, pode_presentear_cupom, pode_presentear_produto, valor_max_presente, pode_criar_sala_troca, pontos_minimos) VALUES
('Bronze',   'bronze',   1,  1,    1, 0, 0,    NULL, 0,     0),
('Prata',    'prata',    2,  3,    0, 1, 0,    NULL, 0,   500),
('Ouro',     'ouro',     3, 10,    0, 1, 1,   100.00, 0,  2000),
('Platina',  'platina',  4, NULL,  0, 1, 1,    NULL, 1,  5000),
('Diamante', 'diamante', 5, NULL,  0, 1, 1,    NULL, 1, 15000);

INSERT INTO conquista (slug, nome, descricao, icone) VALUES
('amigo_ouro',     'Amigo Ouro',      'Deu 5 presentes para amigos',           'star'),
('troca_justa',    'Troca Justa',     'Concluiu 10 trocas aprovadas',          'handshake'),
('corrente_bem',   'Corrente do Bem', 'Presente gerou nova compra',            'link');

INSERT INTO cupom_template (titulo, descricao, categoria, desconto_percentual, valor_minimo_compra, dias_validade) VALUES
('20% off Eletrônicos', 'Desconto em eletrônicos selecionados', 'Eletrônicos', 20.00, 150.00, 30),
('R$ 25 de cashback',   'Abatimento na próxima compra',         'Geral',       NULL,  80.00,  45),
('Frete grátis',        'Válido para compras acima de R$ 99',  'Frete',       NULL,  99.00,  15);

INSERT INTO produto (nome, descricao, preco_reais, preco_pontos, estoque) VALUES
('Caneca FRIK',           'Caneca personalizada 350ml', 49.90,  500, 100),
('Kit Café Especial',     'Seleção de cafés premium',   89.90,  900,  50),
('Camiseta Edição Ouro',  'Camiseta algodão premium',  129.90, 1300,  30);

INSERT INTO missao (titulo, descricao, pontos_recompensa, meta_valor, tipo_meta) VALUES
('Primeira troca',  'Realize sua primeira troca de cupom', 100, 1, 'trocas'),
('Presenteie alguém', 'Envie um cupom de presente',        150, 1, 'presentes');

-- Senha de teste: senha123 (bcrypt)
INSERT INTO usuario (nome, email, telefone, cpf, senha_hash, nivel_id, pontos, papel) VALUES
('Ana Silva',    'ana@frik.demo',    '11999990001', '11111111111',
 '$2b$10$/UGd4aICWq8pRbItFREnYufRhToMw5LydAu8O5nnO5wwxVV2sy1Ma', 3, 2500, 'cliente'),
('Bruno Costa',  'bruno@frik.demo',  '11999990002', '22222222222',
 '$2b$10$/UGd4aICWq8pRbItFREnYufRhToMw5LydAu8O5nnO5wwxVV2sy1Ma', 2,  800, 'cliente'),
('Carla Mendes', 'carla@frik.demo',  '11999990003', '33333333333',
 '$2b$10$/UGd4aICWq8pRbItFREnYufRhToMw5LydAu8O5nnO5wwxVV2sy1Ma', 1,  120, 'cliente'),
('Admin FRIK',   'admin@frik.demo',  '11999990000', '00000000000',
 '$2b$10$/UGd4aICWq8pRbItFREnYufRhToMw5LydAu8O5nnO5wwxVV2sy1Ma', 5, 0, 'admin');

INSERT INTO campanha (titulo, descricao, segmento_json, inicio_em, fim_em, ativa) VALUES
('Boas-vindas Bronze', 'Bônus para novos membros nível Bronze', '{"nivel_slug":["bronze"]}',
 DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 1);

INSERT INTO cupom_usuario (usuario_id, template_id, codigo, status, validade_ate, origem) VALUES
(1, 1, 'FRIK-ANA-001', 'disponivel', DATE_ADD(CURDATE(), INTERVAL 25 DAY), 'compra'),
(1, 2, 'FRIK-ANA-002', 'disponivel', DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'missao'),
(2, 1, 'FRIK-BRU-001', 'oferecido_troca', DATE_ADD(CURDATE(), INTERVAL 20 DAY), 'compra'),
(3, 3, 'FRIK-CAR-001', 'disponivel', DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'campanha');

INSERT INTO evento_sazonal (titulo, descricao, trocas_extras, inicio_em, fim_em) VALUES
('Semana do Troca-Troca', '+2 trocas extras para todos os níveis!', 2,
 NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY));
