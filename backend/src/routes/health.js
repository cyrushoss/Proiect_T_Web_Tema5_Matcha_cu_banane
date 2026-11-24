import { Router } from 'express';
import { sequelize } from '../models/index.js';

const router = Router();

router.get('/health', async (_req, res) => {
  try {
    await sequelize.query('SELECT 1');
    res.json({ status: 'ok', db: 'ok' });
  } catch {
    res.status(503).json({ error: { code: 'DB_UNAVAILABLE', message: 'Baza de date nu răspunde.', details: null } });
  }
});

export default router;
