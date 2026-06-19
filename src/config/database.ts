import { AppDataSource } from "./data-source";
import { env } from "./env";

export { AppDataSource };

let migrationsInitialized = false;
let initializationPromise: Promise<void> | null = null;

export async function initializeDatabase(): Promise<void> {
  // Evitar inicializações paralelas
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      // Conectar ao banco
      if (!AppDataSource.isInitialized) {
        console.log("[FRIK] Connecting to database:", {
          host: env.db.host,
          port: env.db.port,
          database: env.db.database,
          ssl: env.db.ssl,
        });

        await AppDataSource.initialize();
        console.log("[FRIK] Database connected successfully");
      }

      // Testar conexão com query simples
      const testQuery = await AppDataSource.query("SELECT 1 AS test");
      console.log("[FRIK] Database connection verified:", testQuery);

      // Rodar migrations uma única vez
      if (!migrationsInitialized) {
        migrationsInitialized = true;
        try {
          console.log("[FRIK] Checking for pending migrations...");
          const migrations = await AppDataSource.runMigrations();

          if (migrations && migrations.length > 0) {
            console.log(
              "[FRIK] Migrations executed:",
              migrations.map((m) => m.name).join(", ")
            );
          } else {
            console.log("[FRIK] No pending migrations (all up-to-date)");
          }

          // Verificar se as tabelas foram criadas
          const tables = await AppDataSource.query(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()"
          );
          console.log(
            "[FRIK] Database tables:",
            tables.map((t: any) => t.TABLE_NAME).join(", ")
          );
        } catch (migrationError) {
          console.error("[FRIK] Migration execution error:", migrationError);
          migrationsInitialized = false; // Permitir retry
          throw migrationError;
        }
      }
    } catch (error) {
      console.error("[FRIK] Database initialization error:", error);
      initializationPromise = null;
      migrationsInitialized = false;
      throw error;
    }
  })();

  return initializationPromise;
}
