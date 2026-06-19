import dotenv from "dotenv";

dotenv.config();

const defaultCors = ["http://localhost:3000", "http://127.0.0.1:3000"];

type DatabaseUrlConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
};

const parseDatabaseUrl = (databaseUrl: string): DatabaseUrlConfig | null => {
  try {
    const url = new URL(databaseUrl);

    if (!["mysql", "mysql2"].includes(url.protocol.replace(":", ""))) {
      return null;
    }

    const sslMode = url.searchParams.get("ssl-mode")?.toLowerCase();
    const ssl = sslMode === "required" || sslMode === "true";

    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, "") || "frik",
      ssl,
    };
  } catch {
    return null;
  }
};

const databaseUrlConfig = process.env.DATABASE_URL
  ? parseDatabaseUrl(process.env.DATABASE_URL)
  : null;

const dbSsl = databaseUrlConfig?.ssl ?? process.env.DB_SSL?.toLowerCase() === "true";

export const env = {
  port: Number(process.env.PORT ?? 3333),
  nodeEnv: process.env.NODE_ENV ?? "development",
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : defaultCors,
  db: {
    host: databaseUrlConfig?.host ?? process.env.DB_HOST ?? "localhost",
    port: databaseUrlConfig?.port ?? Number(process.env.DB_PORT ?? 3306),
    user: databaseUrlConfig?.user ?? process.env.DB_USER ?? "root",
    password: databaseUrlConfig?.password ?? process.env.DB_PASSWORD ?? "",
    database: databaseUrlConfig?.database ?? process.env.DB_NAME ?? "frik",
    ssl: dbSsl,
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? "dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },
  taxaTrocaPontos: Number(process.env.TAXA_TROCA_PONTOS ?? 50),
  pontosPorReal: Number(process.env.PONTOS_POR_REAL ?? 1),
};
