import "reflect-metadata";
import app from "./app";
import { env } from "./config/env";
import { initializeDatabase } from "./config/database";

async function bootstrap() {
  try {
    await initializeDatabase();
    console.log("MySQL conectado (TypeORM)");
  } catch (err) {
    console.error("\n[FRIK] Falha ao conectar no MySQL.\n");
    console.error("1. Crie/edite o arquivo backend/.env (copie de .env.example)");
    console.error("2. Defina DB_PASSWORD com a senha do seu MySQL (Workbench)");
    console.error("3. Execute: npm run db:migrate && npm run db:seed\n");
    console.error(err);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`Página inicial: http://localhost:${env.port}/`);
    console.log(`FRIK API:       http://localhost:${env.port}/api`);
    console.log(`Swagger UI:     http://localhost:${env.port}/api/docs`);
  });
}

bootstrap();
