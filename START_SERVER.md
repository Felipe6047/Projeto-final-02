# FRIK — Como rodar o servidor (Backend)

Repositório da API REST do projeto **FRIK** (Sistema de Fidelização com Gamificação).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [MySQL](https://dev.mysql.com/downloads/) 8+
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) (opcional, para executar o DDL)
- [Insomnia](https://insomnia.rest/) (testes da API)

## 1. Banco de dados

Abra o MySQL Workbench (ou linha de comando) e execute, nesta ordem:

1. `database/schema.sql` — cria o banco `frik` e todas as tabelas
2. `database/seed.sql` — dados iniciais (níveis, usuários de teste, cupons, produtos)

**Banco já existente (sem coluna `papel`)?** Execute também:

```powershell
mysql -u root -p frik < database/migrations/001_admin_papel.sql
```

Depois crie o admin manualmente ou rode o trecho do admin no `seed.sql`.

**Linha de comando (Windows):**

```powershell
mysql -u root -p < database/schema.sql
mysql -u root -p frik < database/seed.sql
```

## 2. Variáveis de ambiente

Na pasta `backend`, crie o arquivo `.env` (se ainda não existir):

```powershell
copy .env.example .env
```

**Obrigatório:** abra `.env` no editor e preencha a senha do MySQL:

```env
DB_PASSWORD=SUA_SENHA_DO_MYSQL
```

> Erro `Access denied for user 'root'@'localhost' (using password: NO)` = `DB_PASSWORD` está vazio ou errado.

Use a **mesma senha** que você usa para abrir o MySQL Workbench.

```env
JWT_SECRET=um_segredo_longo_e_aleatorio
```

## 3. Instalar dependências

```powershell
cd backend
npm install
```

## 4. Iniciar o servidor

**Desenvolvimento** (reinicia ao salvar com nodemon + ts-node):

```powershell
npm run dev
```

**Produção local:**

```powershell
npm run build
npm start
```

| O que abrir no navegador | URL |
|--------------------------|-----|
| **Página inicial (links)** | http://localhost:3333/ |
| **Swagger (testar API)** | http://localhost:3333/api/docs |
| **API (JSON)** | http://localhost:3333/api/health |

> O projeto **não tem site de loja/fidelização na web ainda** — só a API. O frontend (`frontend/`) ainda não foi criado. Use Swagger ou Insomnia para testar.

## 5. Documentação Swagger

Com o servidor rodando, abra no navegador:

- **Swagger UI:** http://localhost:3333/api/docs
- **OpenAPI JSON:** http://localhost:3333/api/docs.json

Para testar rotas protegidas:

1. Execute **Auth → Login** (`POST /api/auth/login`) com `ana@frik.demo` / `senha123`
2. Copie o `token` da resposta
3. Clique em **Authorize** (cadeado) e informe: `Bearer <seu_token>` ou apenas o token (o Swagger adiciona o prefixo)

A documentação cobre todos os endpoints: Auth, Mercado de Cupons, Presentes, Ranking e Produtos.

## 6. Testar com Insomnia

1. Abra o Insomnia
2. **Import** → selecione `insomnia/frik-api.json`
3. No ambiente **FRIK Local**, confirme `base_url = http://localhost:3333`
4. Selecione o ambiente **FRIK Local** (canto superior esquerdo)
5. Execute **Auth → Login** com:
   - Email: `ana@frik.demo`
   - Senha: `senha123`
6. O token é salvo automaticamente na variável `token` para as demais rotas

**Erro `email/senha Required` no Insomnia?** O body não chegou como JSON:
- Aba **Body** → escolha **JSON** (não Text)
- Aba **Headers** → confirme `Content-Type: application/json`
- Ou reimporte `insomnia/frik-api.json` (versão atualizada já traz esse header)

## Usuários de teste (seed)

| Nome         | Email             | Senha     | Nível  |
|--------------|-------------------|-----------|--------|
| Ana Silva    | ana@frik.demo     | senha123  | Ouro   |
| Bruno Costa  | bruno@frik.demo   | senha123  | Prata  |
| Carla Mendes | carla@frik.demo   | senha123  | Bronze |
| Admin FRIK   | admin@frik.demo   | senha123  | Admin (painel) |

## Painel admin (`/api/admin/*`)

Requer login com `admin@frik.demo` e token JWT com `papel: admin`.

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/admin/dashboard` | KPIs gerenciais |
| GET | `/api/admin/relatorios/segmentacao` | Clientes por nível |
| CRUD | `/api/admin/campanhas` | Campanhas |
| CRUD | `/api/admin/cupom-templates` | Templates de cupom |
| CRUD | `/api/admin/produtos` | Catálogo |
| CRUD | `/api/admin/missoes` | Missões |
| CRUD | `/api/admin/eventos` | Eventos sazonais |

No frontend: http://localhost:3000/admin

## Rotas principais

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Status da API |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/registro` | Cadastro |
| GET | `/api/auth/perfil` | Perfil (auth) |
| GET | `/api/mercado-cupons` | Cupons no mercado |
| GET | `/api/mercado-cupons/meus-cupons` | Meus cupons |
| POST | `/api/mercado-cupons/oferecer/:cupomId` | Oferecer cupom |
| POST | `/api/mercado-cupons/solicitar-troca` | Solicitar troca |
| PATCH | `/api/mercado-cupons/propostas/:id` | Aceitar/recusar |
| POST | `/api/presentes/cupom` | Dar cupom de presente |
| POST | `/api/presentes/produto` | Presente físico |
| GET | `/api/ranking/global` | Ranking |
| GET | `/api/ranking/meu-nivel` | Progresso do nível |

## Problemas comuns

- **ECONNREFUSED MySQL**: MySQL não está rodando ou `DB_*` no `.env` está incorreto.
- **Unknown database 'frik'**: Execute `schema.sql` antes do seed.
- **401 nas rotas**: Faça login no Insomnia para atualizar o `token`.
