# 🔧 Debugging Login e Performance

## ✅ Solução Implementada

### 1. **Rotas Faltantes Adicionadas**
As seguintes rotas estavam faltando no `src/routes/index.ts`:
- `/mercado`
- `/presentes`
- `/ranking`
- `/produtos`
- `/admin`
- `/compra`
- `/notificacoes`
- `/salas`
- `/simulador-caixa`
- `/missoes`
- `/cartoes`

Isso explicava os erros **404** que você estava vendo.

### 2. **Novo Script de Verificação**
Criado `scripts/check-db.ts` que verifica:
- ✓ Conexão com banco de dados
- ✓ Tabelas criadas
- ✓ Migrations executadas
- ✓ Dados do seed (usuários, níveis)

## 🚀 Como Testar

### Localmente:

```bash
# 1. Verificar status do banco
npm run db:check

# 2. Se o seed não foi aplicado, forçar:
npm run db:full

# 3. Iniciar servidor
npm run dev
```

### Credenciais de Teste (criadas pelo seed):

```
Email: admin@frik.demo
Senha: senha123

Email: ana@frik.demo
Senha: senha123

Email: bruno@frik.demo
Senha: senha123

Email: carla@frik.demo
Senha: senha123
```

### Via cURL (Login):

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@frik.demo","senha":"senha123"}'
```

### Via Vercel (Remoto):

1. Faça um deploy com `git push`
2. Verifique logs em **Vercel Dashboard → Deployments → Logs**
3. Procure por `[FRIK]` nos logs
4. Verifique se a seed foi aplicada

## 🐌 Performance Lenta

### Causas e Soluções:

#### 1. **Seed Muito Longo**
- ✅ Já melhorado com logging detalhado
- ✅ Será executado apenas uma vez (após verificação)

#### 2. **Queries Lentas**
Adicione índices nas tabelas frequentemente consultadas:

```sql
-- Execute no seu banco
ALTER TABLE usuario ADD INDEX idx_email (email);
ALTER TABLE usuario ADD INDEX idx_cpf (cpf);
ALTER TABLE nivel_fidelidade ADD INDEX idx_slug (slug);
ALTER TABLE cupom_usuario ADD INDEX idx_usuario_id (usuario_id);
```

#### 3. **TypeORM Logging**
Para desabilitar logs em produção, certifique-se que:

```env
NODE_ENV=production
```

#### 4. **Connection Pool**
Verifique `src/config/data-source.ts` - a pool está configurada? Não está. Vou melhorar.

## 📋 Checklist para Vercel

- [ ] Rotas adicionadas ✅
- [ ] Variáveis de ambiente configuradas
- [ ] Seed sendo executado no cold start
- [ ] Usuário admin criado
- [ ] Login funciona

## 🔗 Endpoints Críticos

```
POST   /api/auth/login          → Fazer login
POST   /api/auth/registro       → Registrar novo usuário
GET    /api/auth/perfil         → Obter perfil (precisa token)
GET    /api/health              → Status da API
GET    /api/health/db           → Status do banco
GET    /api/health/schema       → Esquema e migrations
POST   /admin/system/seed       → Forçar seed (admin only)
```

## 🆘 Se Ainda Tiver Problemas

1. Rode `npm run db:check` para verificar o estado do banco
2. Verifique variáveis de ambiente em `.env`
3. Confirme que o MySQL está rodando e acessível
4. Verifique logs do Vercel: `[FRIK]` prefixo
5. Faça um novo deploy
