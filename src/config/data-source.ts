import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env";
import { entities } from "../entities";
import { InitialSchema1748265600000 } from "../database/migrations/1748265600000-InitialSchema";
import { FeaturesExpansion1748265700000 } from "../database/migrations/1748265700000-FeaturesExpansion";
import { PlanImplementation1748265800000 } from "../database/migrations/1748265800000-PlanImplementation";
import { CouponLimits1748265900000 } from "../database/migrations/1748265900000-CouponLimits";
import { GamificationStreak1748266000000 } from "../database/migrations/1748266000000-GamificationStreak";
import { ProductCategories1748266100000 } from "../database/migrations/1748266100000-ProductCategories";
import { CartaoCreditoSalaId1748266200000 } from "../database/migrations/1748266200000-CartaoCreditoSalaId";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.database,
  entities,
  migrations: [
    InitialSchema1748265600000,
    FeaturesExpansion1748265700000,
    PlanImplementation1748265800000,
    CouponLimits1748265900000,
    GamificationStreak1748266000000,
    ProductCategories1748266100000,
    CartaoCreditoSalaId1748266200000,
  ],
  synchronize: false,
  logging: env.nodeEnv === "development",
});
