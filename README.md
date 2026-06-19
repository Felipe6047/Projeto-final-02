# FRIK — Backend

API REST do **Sistema de Fidelização com Gamificação** (projeto FRIK).

## Stack

- Node.js + Express + TypeScript
- MySQL 8
- JWT para autenticação
- Swagger UI (OpenAPI 3)

## Início rápido

Consulte **[START_SERVER.md](./START_SERVER.md)** para configurar banco, `.env`, subir o servidor e importar a coleção do Insomnia.

## Estrutura

```
backend/
├── database/
│   ├── schema.sql      # DDL completo
│   └── seed.sql        # Dados de teste
├── insomnia/
│   └── frik-api.json   # Coleção Insomnia
├── src/swagger/
│   ├── openapi.ts      # Especificação OpenAPI 3
│   └── setup.ts        # Swagger UI em /api/docs
├── src/
│   ├── routes/         # Rotas HTTP
│   ├── services/       # Regras de negócio
│   └── ...
├── START_SERVER.md
└── package.json
```

## Repositório

Este diretório deve ser um repositório Git **separado** do frontend.

```bash
git init
git add .
git commit -m "feat: API FRIK com DDL, rotas e Insomnia"
```
