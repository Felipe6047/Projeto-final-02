# 🌱 SEED PRODUCTION (Vercel) - DEBUGGING GUIDE

## 🚀 Como Verificar se o Seed Está Funcionando

### 1. **Verificar Status via API**
```bash
curl https://seu-dominio.vercel.app/api/admin/system/status \
  -H "Authorization: Bearer seu-jwt-token-admin"
```

Response esperado:
```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "type": "mysql"
  },
  "seed": {
    "applied": true,
    "data": {
      "nivelFidelidade": 5,
      "usuarios": 4,
      "conquistas": 10,
      "produtos": ...
    }
  }
}
```

### 2. **Ver Logs no Vercel Dashboard**
- Vá para **Deployments** → seu deployment
- Clique em **Logs**
- Procure por: `[FRIK]`
- Você verá algo como:

```
[FRIK] === VERCEL COLD START DETECTED ===
[FRIK] Initializing database connection...
[FRIK] ✓ Database connection established
[FRIK] ========== SEED PROCESS START ==========
[FRIK] ✓ No seed data found - proceeding with full seed...
[FRIK] Inserting loyalty levels...
[FRIK] ✓ Loyalty levels inserted
...
[FRIK] ========== SEED PROCESS COMPLETED ==========
[FRIK] ✓ SEED SUCCESSFULLY APPLIED!
[FRIK] Data summary:
  - Niveis de Fidelidade: 5
  - Usuarios: 4
```

### 3. **Forçar Seed Manualmente**
Se por algum motivo o seed não rodou:

```bash
curl -X POST https://seu-dominio.vercel.app/api/admin/system/seed \
  -H "Authorization: Bearer seu-jwt-token-admin"
```

---

## 🔧 Troubleshooting

### ❌ Problema: "Database initialization failed"

**Causas possíveis:**
1. DATABASE_URL incorreta
2. Banco de dados inacessível
3. SSL não configurado corretamente (Aiven requer SSL)

**Solução:**
```env
# Verifique que DATABASE_URL está no formato correto:
DATABASE_URL=mysql://user:password@host:port/database?ssl-mode=REQUIRED
```

### ❌ Problema: "Seed error"

Ver os logs no Vercel para o erro específico.

### ❌ Problema: "Timeout"

Se o seed demorar muito:
1. O timeout do Vercel é de 60 segundos em ambiente free
2. Planos pagos têm mais tempo
3. Verifique se o banco está respondendo lentamente

---

## 📊 Fluxo no Vercel (Serverless)

```
Primeira requisição (cold start)
    ↓
api/index.ts é carregado
    ↓
warmupDatabase() inicia imediatamente
    ↓
ensureDatabase()
    ↓
initializeDatabase()
    ├─ Conecta ao MySQL
    ├─ Roda migrations
    └─ Roda seed (verifica se já foi aplicado)
    ↓
Aguarda 3 segundos
    ↓
Primeira requisição é processada
```

---

## ✅ Checklist para Produção

- [ ] DATABASE_URL configurada no Vercel
- [ ] NODE_ENV=production
- [ ] SSL ativado na conexão (se usando Aiven)
- [ ] Logs vendo `[FRIK]` durante cold start
- [ ] Endpoint `/api/health` respondendo com 200
- [ ] Endpoint `/api/admin/system/status` mostrando `seed.applied: true`
- [ ] Login funcionando com credenciais do seed

---

## 📝 Mudanças Recentes

### api/index.ts
- Melhorado warm-up para Vercel
- Adicionado retry logic (até 3 tentativas)
- Melhores logs com timestamps

### src/config/database.ts
- Adicionado logging detalhado no seed
- Verificação final de dados inseridos
- Melhor error handling

### src/routes/admin.routes.ts
- Novo endpoint: `GET /admin/system/status`
- Novo endpoint: `POST /admin/system/seed` (force run)

---

## 🔐 Credenciais Seed Padrão

| Email | Senha | Papel |
|-------|-------|-------|
| admin@frik.demo | senha123 | admin |
| ana@frik.demo | senha123 | cliente |
| bruno@frik.demo | senha123 | cliente |
| carla@frik.demo | senha123 | cliente |

