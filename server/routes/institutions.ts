import { Router, type Request, type Response } from 'express';
import { db } from '../db/database';

const router = Router();

/**
 * GET /api/institutions
 * Public directory of institutions for registration dropdown
 */
router.get('/', (_req: Request, res: Response) => {
  const institutions = db.prepare('SELECT id, name, created_at FROM institutions ORDER BY name ASC').all();
  res.json({ institutions });
});

export default router;
