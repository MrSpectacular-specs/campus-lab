import { app } from './app';
import { db } from './db/database';
import { seedDatabase } from './db/seed';

// Auto-seed if database has no users
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  console.log('[Server] Empty database detected. Running automatic initial seed...');
  seedDatabase();
}

const PORT = Number(process.env.PORT) || 3001;

export const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CampusLab Server] Listening on http://localhost:${PORT}`);
  console.log(`[CampusLab Server] REST API available at http://localhost:${PORT}/api`);
});

export default server;
