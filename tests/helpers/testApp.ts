// tests/helpers/testApp.ts
// Cria uma instância Express isolada para testes de integração (sem iniciar servidor real).

import express from 'express';
import router from '../../src/routes';
import { errorHandler } from '../../src/middleware/errorHandler';

export function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', router);
  app.use(errorHandler as express.ErrorRequestHandler);
  return app;
}
