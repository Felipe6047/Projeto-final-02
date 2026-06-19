import { AppDataSource } from "./data-source";
import { env } from "./env";

export { AppDataSource };

let migrationsInitialized = false;
let seedInitialized = false;
let initializationPromise: Promise<void> | null = null;

async function runSeed(): Promise<void> {
  if (seedInitialized) return;
  seedInitialized = true;

  try {
    console.log("[FRIK] Starting seed data...");

    const { NivelFidelidade } = await import("../entities/NivelFidelidade");
    const { Conquista } = await import("../entities/Conquista");
    const { Usuario } = await import("../entities/Usuario");
    const bcrypt = await import("bcrypt");

    // Check if seed already applied
    const nivelCount = await AppDataSource.getRepository(NivelFidelidade).count();
    if (nivelCount > 0) {
      console.log("[FRIK] ✓ Seed already applied — skipping");
      return;
    }

    // Insert níveis de fidelidade
    await AppDataSource.getRepository(NivelFidelidade).save([
      {
        nome: "Bronze",
        slug: "bronze",
        ordem: 1,
        trocasMes: 1,
        mesmoRankApenas: true,
        podePresentearCupom: false,
        podePresentearProduto: false,
        valorMaxPresente: null,
        podeCriarSalaTroca: false,
        pontosMinimos: 0,
      },
      {
        nome: "Prata",
        slug: "prata",
        ordem: 2,
        trocasMes: 3,
        mesmoRankApenas: false,
        podePresentearCupom: true,
        podePresentearProduto: false,
        valorMaxPresente: null,
        podeCriarSalaTroca: false,
        pontosMinimos: 500,
      },
      {
        nome: "Ouro",
        slug: "ouro",
        ordem: 3,
        trocasMes: 10,
        mesmoRankApenas: false,
        podePresentearCupom: true,
        podePresentearProduto: true,
        valorMaxPresente: "100.00",
        podeCriarSalaTroca: false,
        pontosMinimos: 2000,
      },
      {
        nome: "Platina",
        slug: "platina",
        ordem: 4,
        trocasMes: null,
        mesmoRankApenas: false,
        podePresentearCupom: true,
        podePresentearProduto: true,
        valorMaxPresente: null,
        podeCriarSalaTroca: true,
        pontosMinimos: 5000,
      },
    ]);

    // Insert test user
    const hash = await bcrypt.default.hash("senha123", 10);
    await AppDataSource.getRepository(Usuario).save({
      nome: "Ana Silva",
      email: "ana@frik.demo",
      cpf: "12345678901",
      telefone: "11999999999",
      senhaHash: hash,
      nivelId: 1,
      papel: "cliente",
      kycStatus: "aprovado",
      ativo: true,
    });

    console.log("[FRIK] ✓ Seed data inserted successfully");
  } catch (error) {
    console.error("[FRIK] Seed error:", error);
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

        // Rodar seed após migrations
        try {
          await runSeed();
        } catch (seedError) {
          console.error("[FRIK] ✗ Seed error:", seedError);
          seedInitialized = false;
          throw seedError;
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
