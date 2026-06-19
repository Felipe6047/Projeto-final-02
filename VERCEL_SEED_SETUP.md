# Seed Setup no Vercel (Serverless)

## 🔍 Problema
O seed não estava sendo executado automaticamente no Vercel como era no Docker Compose local.

## ✅ Solução Implementada

### Como funciona:

1. **Cold Start (Primeira inicialização)**
   - Quando a API recebe a primeira requisição após um deploy, o `api/index.ts` é inicializado
   - A função `warmupDatabase()` é chamada automaticamente
   - Essa função executa `initializeDatabase()` que:
     - Conecta ao banco de dados
     - Executa migrations (caso não tenham sido executadas)
     - Executa o seed (caso não tenha sido aplicado)

2. **Verificações de Segurança**
   - O seed verifica se já foi aplicado contando os "NivelFidelidade"
   - Se já existem dados, o seed não executa novamente
   - Migrations também têm verificação similar

3. **Logs Detalhados**
   - Logs com prefixo `[FRIK]` indicam o progresso
   - Em caso de erro, mensagens detalhadas são exibidas no Vercel logs

### Fluxo de Inicialização:

```
Vercel recebe requisição (cold start)
    ↓
api/index.ts é carregado
    ↓
warmupDatabase() inicia (async, não-bloqueante)
    ↓
ensureDatabase() → initializeDatabase()
    ↓
1. Conecta ao MySQL
2. Verifica e executa migrations
3. Verifica e executa seed
    ↓
Requisição é processada (aguarda inicialização)
```

## 📋 Variáveis de Ambiente Necessárias

Certifique-se de que essas variáveis estão configuradas no Vercel:

```
DB_HOST=seu-host-mysql
DB_PORT=3306
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_NAME=seu-database
JWT_SECRET=seu-jwt-secret
TAXA_TROCA_PONTOS=50
PONTOS_POR_REAL=1
NODE_ENV=production
```

## 🔧 Verificação no Vercel Dashboard

Para verificar se o seed foi aplicado:

1. Vá para a aba "Deployments"
2. Clique no deploy mais recente
3. Acesse "Functions"
4. Clique em "Logs" do endpoint
5. Procure por `[FRIK]` nos logs

Você deverá ver mensagens como:
- `✓ Seed already applied (found X niveis)`
- `✓ Loyalty levels inserted`
- `✓ Achievements inserted`
- `✓ Database warm-up completed successfully`

## ⚠️ Troubleshooting

### Seed não aparece nos logs
- Verifique se o banco de dados está acessível
- Confirme que o `MYSQL_ROOT_PASSWORD` e `MYSQL_DATABASE` estão corretos
- Veja os logs de erro detalhados

### Erro: "Connection test failed"
- Banco de dados pode estar down
- Variáveis de ambiente podem estar incorretas
- IP do Vercel pode precisar ser whitelisted (se usando DB gerenciado)

### Dados não aparecem após seed
- A primeira requisição pode causar timeout se o seed for muito longo
- Aguarde 30-60 segundos após deploy
- Faça uma nova requisição para confirmar

## 🚀 Para Força o Seed em Desenvolvimento Local

```bash
npm run db:migrate
npm run db:seed
```

## 📝 Notas

- O seed roda **automaticamente** na primeira requisição após um cold start
- O seed **não roda novamente** se já foi aplicado
- Para resetar o seed, você precisará limpar as tabelas manualmente ou fazer um deploy com banco novo
