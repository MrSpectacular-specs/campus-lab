import { app } from '../server/app';
import { db } from '../server/db/database';
import { seedDatabase } from '../server/db/seed';

// Auto-seed in serverless environment if database is newly initialized
try {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number } | undefined;
  if (!userCount || userCount.count === 0) {
    console.log('[CampusLab Serverless] Empty database detected. Running initial seed...');
    seedDatabase();
  }
} catch (err) {
  console.warn('[CampusLab Serverless] Auto-seed check notice:', err);
}

export default app;
