-- Execute se o banco já existia antes do campo papel
USE frik;

ALTER TABLE usuario
  ADD COLUMN papel ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente'
  AFTER ativo;

-- Admin de teste (senha: senha123) — ignore se o e-mail já existir
INSERT INTO usuario (nome, email, telefone, cpf, senha_hash, nivel_id, pontos, papel)
SELECT 'Admin FRIK', 'admin@frik.demo', '11999990000', '00000000000',
       '$2b$10$sUHWjH2s8ZU8AI4tHwyYnedwIZPfY836.hcGfw2rQI2ijNSiWDHT.', 5, 0, 'admin'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE email = 'admin@frik.demo');
