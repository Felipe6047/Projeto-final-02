import { Express, Router } from "express";
import { openApiSpec } from "./openapi";

export function setupSwagger(app: Express) {
  const swaggerRouter = Router();

  // JSON spec endpoint
  swaggerRouter.get("/docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json(openApiSpec);
  });

  // HTML Swagger UI endpoint
  swaggerRouter.get("/docs", (_req, res) => {
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>FRIK API — Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css" />
    <style>
      html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
      * { box-sizing: inherit; }
      body { margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function() {
        const ui = SwaggerUIBundle({
          url: '/api/docs.json',
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          layout: 'BaseLayout',
          deepLinking: true,
          validatorUrl: null
        });
        window.ui = ui;
      };
    </script>
  </body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  });

  // Register swagger routes
  app.use("/api", swaggerRouter);
}
