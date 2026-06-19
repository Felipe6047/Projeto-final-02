import { AppDataSource } from "./data-source";

export { AppDataSource };

let migrationsInitialized = false;

export async function initializeDatabase(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log("[FRIK] Database initialized");
  }

  // Rodar migrations uma única vez após inicializar
  if (!migrationsInitialized) {
    migrationsInitialized = true;
    try {
      console.log("[FRIK] Running pending migrations...");
      const executed = await AppDataSource.runMigrations();
      if (executed.length > 0) {
        console.log(
          "[FRIK] Migrations executed:",
          executed.map((m) => m.name).join(", ")
        );
      } else {
        console.log("[FRIK] No pending migrations");
      }
    } catch (error) {
      console.error("[FRIK] Migration failed:", error);
      migrationsInitialized = false; // Permitir retry
      throw error;
    }
  }
}
