# Rotas da API — Insomnia

**Base URL:** `http://localhost:3000/api` (somente o backend; o front roda em outra porta, ex.: 5500)

Todas as rotas protegidas usam header:
```
Authorization: Bearer {token}
```

---

## Públicas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Status da API |
| GET | `/niveis` | Lista níveis (Bronze, Prata, Ouro, Platina) |
| POST | `/auth/login` | Login |
| POST | `/auth/registrar` | Cadastro de cliente |

### POST `/auth/login`

**No Insomnia (importante):**
1. Método: `POST`
2. URL: `http://localhost:3000/api/auth/login`
3. Aba **Body** → selecione **JSON** (não "No Body" nem "Text")
4. Cole o JSON abaixo
5. O Insomnia adiciona automaticamente `Content-Type: application/json`

```json
{
  "email": "maria@email.com",
  "senha": "cliente123"
}
```

> Os campos devem ser exatamente `"email"` e `"senha"` (não use `password` ou `username`).

### POST `/auth/registrar`
```json
{
  "nome": "João Souza",
  "email": "joao@email.com",
  "senha": "123456"
}
```

---

## Autenticado (cliente ou admin)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/auth/perfil` | Perfil do usuário logado |
| GET | `/compras` | Lista compras (admin: `?usuario_id=2`) |
| GET | `/compras/:id` | Detalhe da compra com itens |
| POST | `/compras` | Registrar compra |
| GET | `/missoes` | Todas as missões |
| GET | `/missoes/minhas` | Missões com progresso do usuário |
| GET | `/recompensas` | Catálogo de recompensas |
| POST | `/recompensas/resgatar` | Resgatar recompensa |
| GET | `/recompensas/resgates` | Histórico de resgates |
| GET | `/recomendacoes` | Ofertas personalizadas |
| POST | `/recomendacoes/regenerar` | Regenerar ofertas (próprio usuário) |
| PATCH | `/recomendacoes/:id/visualizar` | Marcar oferta como vista |

### POST `/compras`
```json
{
  "itens": [
    {
      "produto": "Notebook",
      "categoria": "Eletrônicos",
      "quantidade": 1,
      "preco_unit": 2999.90
    },
    {
      "produto": "Mouse Gamer",
      "categoria": "Eletrônicos",
      "quantidade": 1,
      "preco_unit": 149.90
    }
  ],
  "observacao": "Compra online"
}
```

### POST `/recompensas/resgatar`
```json
{
  "recompensa_id": 1
}
```

---

## Somente Admin

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/dashboard` | Métricas e gráficos |
| GET | `/admin/clientes` | Lista de clientes |
| GET | `/admin/campanhas` | Campanhas |
| POST | `/admin/campanhas` | Nova campanha |
| POST | `/missoes` | Nova missão |
| POST | `/recomendacoes/regenerar/:usuarioId` | Regenerar ofertas de um cliente |

### POST `/admin/campanhas`
```json
{
  "titulo": "Black Friday",
  "descricao": "Descontos em toda a loja",
  "desconto_percentual": 25,
  "categoria_alvo": null,
  "pontos_bonus": 200,
  "data_inicio": "2026-11-20",
  "data_fim": "2026-11-30"
}
```

### POST `/missoes`
```json
{
  "titulo": "Super comprador",
  "descricao": "Gaste R$ 1000",
  "tipo": "valor_gasto",
  "meta_valor": 1000,
  "pontos_recompensa": 500
}
```

---

## Usuários de teste (após `npm run seed`)

| Tipo | E-mail | Senha |
|------|--------|-------|
| Admin | admin@loja.com | admin123 |
| Cliente | maria@email.com | cliente123 |
