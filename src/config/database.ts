import { AppDataSource } from "./data-source";

export { AppDataSource };

export async function initializeDatabase(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}
