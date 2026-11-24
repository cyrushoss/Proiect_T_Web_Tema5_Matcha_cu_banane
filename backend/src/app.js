import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/env.js';
import healthRouter from './routes/health.js';
import { notFound, errorHandler } from './middleware/errors.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', healthRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
