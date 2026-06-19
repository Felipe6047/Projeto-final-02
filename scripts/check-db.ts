import "reflect-metadata";
import { AppDataSource } from "../src/config/data-source";
import { env } from "../src/config/env";

async function checkDatabase() {
  console.log("[CHECK-DB] Starting database check...");
  console.log("[CHECK-DB] Environment:", {
    host: env.db.host,
    port: env.db.port,
    database: env.db.database,
    user: env.db.user,
  });

  try {
    if (!AppDataSource.isInitialized) {
      console.log("[CHECK-DB] Initializing database...");
      await AppDataSource.initialize();
    }

    console.log("[CHECK-DB] ✓ Database connected");

    // Check tables
    const tables = await AppDataSource.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME"
    );
    console.log(`[CHECK-DB] ✓ Found ${tables.length} tables:`);
    tables.forEach((t: any) => console.log(`  - ${t.TABLE_NAME}`));

    // Check migrations
    const migrations = await AppDataSource.query(
      "SELECT migration FROM migrations ORDER BY timestamp"
    );
    console.log(`[CHECK-DB] ✓ Migrations executed (${migrations.length}):`);
    migrations.forEach((m: any) => console.log(`  - ${m.migration}`));

    // Check data
    const levels = await AppDataSource.query("SELECT COUNT(*) as count FROM nivel_fidelidade");
    const users = await AppDataSource.query("SELECT COUNT(*) as count FROM usuario");
    console.log(`[CHECK-DB] ✓ Data:
  - NivelFidelidade: ${levels[0].count}
  - Usuario: ${users[0].count}`);

    if (users[0].count === 0) {
      console.log("[CHECK-DB] ⚠️  WARNING: No users found! Seed may not have been applied.");
    }

    await AppDataSource.destroy();
    console.log("[CHECK-DB] ✓ Check completed successfully");
  } catch (error) {
    console.error("[CHECK-DB] ✗ Error:", error);
    process.exit(1);
  }
}

checkDatabase();
