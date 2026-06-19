import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>FRIK API</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, sans-serif;
      min-height: 100vh;
      background: linear-gradient(160deg, #e8c07a 0%, #cc9544 45%, #8b5e2a 100%);
      color: #2d1f0f;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .card {
      background: rgba(255,255,255,0.95);
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    }
    h1 { font-size: 2rem; margin-bottom: 0.25rem; color: #5c3d1e; }
    .badge {
      display: inline-block;
      background: #cc9544;
      color: #fff;
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      margin-bottom: 1rem;
    }
    p { line-height: 1.6; margin-bottom: 1rem; color: #444; }
    ul { list-style: none; margin: 1.25rem 0; }
    li { margin-bottom: 0.6rem; }
    a {
      display: block;
      padding: 0.85rem 1rem;
      background: #f5ebe0;
      border-radius: 10px;
      color: #5c3d1e;
      text-decoration: none;
      font-weight: 600;
      transition: background 0.15s;
    }
    a:hover { background: #e8d4b8; }
    a.primary { background: #cc9544; color: #fff; }
    a.primary:hover { background: #b8843a; }
    small { color: #777; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">API online</span>
    <h1>FRIK</h1>
    <p>Sistema de Fidelização com Gamificação — <strong>backend (API REST)</strong>.</p>
    <p><small>Não há site visual aqui ainda. O frontend (React/Next) será outro projeto em <code>frontend/</code>.</small></p>
    <ul>
      <li><a class="primary" href="/api/docs">📖 Swagger — testar rotas no navegador</a></li>
      <li><a href="/api/health">✓ Health check (JSON)</a></li>
      <li><a href="/api/docs.json">OpenAPI (JSON)</a></li>
    </ul>
    <p><small>Insomnia: importe <code>insomnia/frik-api.json</code> · Base: <code>http://localhost:3333/api</code></small></p>
  </div>
</body>
</html>`);
});

export default router;
