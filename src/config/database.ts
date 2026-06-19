import { AppDataSource } from "./data-source";
import { env } from "./env";

export { AppDataSource };

let migrationsInitialized = false;
let initializationPromise: Promise<void> | null = null;

export async function initializeDatabase(): Promise<void> {
  // Evitar inicializações paralelas
  if (initializationPromise) {
    console.log("[FRIK] Reusing existing initialization promise");
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log("[FRIK] Starting database initialization...");

      // Conectar ao banco
      if (!AppDataSource.isInitialized) {
        console.log("[FRIK] Connecting to database:", {
          host: env.db.host,
          port: env.db.port,
          database: env.db.database,
          ssl: env.db.ssl,
        });

        await AppDataSource.initialize();
        console.log("[FRIK] ✓ Database connection established");
      } else {
        console.log("[FRIK] ✓ Database already initialized, reusing connection");
      }

      // Testar conexão com query simples
      try {
        const testQuery = await AppDataSource.query("SELECT 1 AS test");
        console.log("[FRIK] ✓ Connection verified:", testQuery);
      } catch (testError) {
        console.error("[FRIK] Connection test failed:", testError);
        throw testError;
      }

      // Rodar migrations uma única vez
      if (!migrationsInitialized) {
        console.log("[FRIK] Starting migration process...");
        migrationsInitialized = true;

        try {
          const executed = await AppDataSource.runMigrations();

          if (executed && executed.length > 0) {
            console.log(
              "[FRIK] ✓ Migrations executed (" + executed.length + "):",
              executed.map((m) => m.name).join(", ")
            );
          } else {
            console.log("[FRIK] ✓ No pending migrations (all up-to-date)");
          }

          // Pequeno delay para garantir que as mudanças foram aplicadas
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Verificar se as tabelas foram criadas
          try {
            const tables = await AppDataSource.query(
              "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME"
            );
            console.log(
              "[FRIK] ✓ Database schema ready with " + tables.length + " tables:",
              tables.map((t: any) => t.TABLE_NAME).join(", ")
            );
          } catch (tableError) {
            console.error("[FRIK] Failed to list tables:", tableError);
          }
        } catch (migrationError) {
          console.error("[FRIK] ✗ Migration execution error:", migrationError);
          migrationsInitialized = false; // Permitir retry
          throw migrationError;
        }
      }

      console.log("[FRIK] ✓ Database initialization completed successfully");
    } catch (error) {
      console.error("[FRIK] ✗ Database initialization error:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      initializationPromise = null;
      migrationsInitialized = false;
      throw error;
    }
  })();

  return initializationPromise;
}
