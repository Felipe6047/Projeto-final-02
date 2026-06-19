import dotenv from "dotenv";

dotenv.config();

const defaultCors = ["http://localhost:3000", "http://127.0.0.1:3000"];

export const env = {
  port: Number(process.env.PORT ?? 3333),
  nodeEnv: process.env.NODE_ENV ?? "development",
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : defaultCors,
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "frik",
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? "dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },
  taxaTrocaPontos: Number(process.env.TAXA_TROCA_PONTOS ?? 50),
  pontosPorReal: Number(process.env.PONTOS_POR_REAL ?? 1),
};
