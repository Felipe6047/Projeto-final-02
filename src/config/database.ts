import { AppDataSource } from "./data-source";
import { env } from "./env";
import bcrypt from "bcrypt";

export { AppDataSource };

let migrationsInitialized = false;
let seedInitialized = false;
let initializationPromise: Promise<void> | null = null;

async function runSeed(): Promise<void> {
  if (seedInitialized) return;
  seedInitialized = true;

  try {
    console.log("[FRIK] Starting seed process...");

    // Check if seed already applied by checking if nivel_fidelidade has data
    const nivelCount = await AppDataSource.query(
      "SELECT COUNT(*) as count FROM nivel_fidelidade"
    );
    
    if (nivelCount[0]?.count > 0) {
      console.log("[FRIK] ✓ Seed already applied (found " + nivelCount[0].count + " niveis)");
      return;
    }

    console.log("[FRIK] Inserting loyalty levels (niveis de fidelidade)...");

    // Insert niveis de fidelidade
    await AppDataSource.query(`
      INSERT INTO nivel_fidelidade (nome, slug, ordem, trocas_mes, mesmo_rank_apenas, pode_presentear_cupom, pode_presentear_produto, valor_max_presente, pode_criar_sala_troca, pontos_minimos)
      VALUES
        ('Bronze', 'bronze', 1, 1, 1, 0, 0, NULL, 0, 0),
        ('Prata', 'prata', 2, 3, 0, 1, 0, NULL, 0, 500),
        ('Ouro', 'ouro', 3, 10, 0, 1, 1, 100.00, 0, 2000),
        ('Platina', 'platina', 4, NULL, 0, 1, 1, NULL, 1, 5000),
        ('Diamante', 'diamante', 5, NULL, 0, 1, 1, NULL, 1, 15000)
    `);

    console.log("[FRIK] ✓ Loyalty levels inserted");

    // Insert test user
    console.log("[FRIK] Inserting test user...");
    const hash = await bcrypt.hash("senha123", 10);
    
    await AppDataSource.query(`
      INSERT INTO usuario (nome, email, cpf, telefone, senha_hash, nivel_id, papel, kyc_status, ativo)
      VALUES (?, ?, ?, ?, ?, 1, 'cliente', 'aprovado', 1)
    `, ["Ana Silva", "ana@frik.demo", "12345678901", "11999999999", hash]);

    console.log("[FRIK] ✓ Test user inserted (ana@frik.demo / senha123)");
    console.log("[FRIK] ✓ Seed completed successfully");
  } catch (error) {
    console.error("[FRIK] ✗ Seed error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    seedInitialized = false;
    throw error;
  }
}

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
        console.log("[FRIK] ✓ Connection verified");
      } catch (testError) {
        console.error("[FRIK] ✗ Connection test failed:", testError);
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
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Verificar se as tabelas foram criadas
          try {
            const tables = await AppDataSource.query(
              "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME"
            );
            console.log(
              "[FRIK] ✓ Database schema ready with " + tables.length + " tables"
            );
          } catch (tableError) {
            console.error("[FRIK] Failed to list tables:", tableError);
          }
        } catch (migrationError) {
          console.error("[FRIK] ✗ Migration execution error:", migrationError);
          migrationsInitialized = false;
          throw migrationError;
        }

        // Rodar seed após migrations
        try {
          await runSeed();
        } catch (seedError) {
          console.error("[FRIK] ✗ Seed error:", seedError);
          seedInitialized = false;
          throw seedError;
        }
      } else {
        // Migrations já rodaram, tenta seed se ainda não foi
        try {
          await runSeed();
        } catch (seedError) {
          console.error("[FRIK] Seed error on reinitialization:", seedError);
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
      seedInitialized = false;
      throw error;
    }
  })();

  return initializationPromise;
}
