import { Express } from "express";
import { openApiSpec } from "./openapi";

export function setupSwagger(app: Express) {
  app.get("/api/docs.json", (_req, res) => {
    res.json(openApiSpec);
  });

  app.get("/api/docs", (_req, res) => {
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>FRIK API — Swagger</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css" />
    <style>html,body{height:100%}body{margin:0}</style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
    <script>
      window.onload = function() {
        SwaggerUIBundle({
          url: '/api/docs.json',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis],
          layout: 'BaseLayout',
          validatorUrl: null,
          docExpansion: 'none',
          operationsSorter: 'alpha'
        });
      };
    </script>
  </body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  });
}
