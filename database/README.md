# Banco de dados FRIK

O schema e os dados iniciais passaram a ser gerenciados pelo **TypeORM** em TypeScript.

## Comandos

```bash
# Criar/atualizar tabelas (migration)
npm run db:migrate

# Dados iniciais de demonstração
npm run db:seed
```

## Arquivos

| Antigo (legado) | Novo |
|-----------------|------|
| `schema.sql` | `src/database/migrations/1748265600000-InitialSchema.ts` |
| `seed.sql` | `src/database/seed.ts` |
| Definição das tabelas | `src/entities/*.ts` |

Os arquivos `.sql` permanecem apenas como referência histórica. Use os comandos acima em projetos novos.
