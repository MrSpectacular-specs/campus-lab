import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect serverless environments (Vercel, AWS Lambda, Netlify)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);

const dataDir = process.env.DATABASE_DIR
  ? path.resolve(process.env.DATABASE_DIR)
  : isServerless
  ? path.resolve('/tmp/campuslab-data')
  : path.resolve(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.resolve(dataDir, 'campuslab.db');
console.log(`[Database] Initializing SQLite database at: ${dbPath}`);

export const db = new Database(dbPath);

// Enable WAL mode (with fallback for serverless filesystems) & foreign keys
try {
  db.pragma('journal_mode = WAL');
} catch {
  db.pragma('journal_mode = DELETE');
}
db.pragma('foreign_keys = ON');

// Initialize schema with multi-path resolution for bundled environments
const possibleSchemaPaths = [
  path.resolve(__dirname, 'schema.sql'),
  path.resolve(process.cwd(), 'server/db/schema.sql'),
  path.resolve(process.cwd(), 'schema.sql'),
];
let schemaSql = '';
for (const p of possibleSchemaPaths) {
  if (fs.existsSync(p)) {
    schemaSql = fs.readFileSync(p, 'utf8');
    break;
  }
}
if (schemaSql) {
  db.exec(schemaSql);
  console.log('[Database] Relational schema executed successfully.');
}
// Safe Column Migrations for Projects
try {
  const columns = db.prepare("PRAGMA table_info(projects)").all() as Array<{ name: string }>;
  const colNames = new Set(columns.map(c => c.name));
  if (!colNames.has('objectives')) {
    db.exec("ALTER TABLE projects ADD COLUMN objectives TEXT NOT NULL DEFAULT '[]'");
  }
  if (!colNames.has('expected_outcome')) {
    db.exec("ALTER TABLE projects ADD COLUMN expected_outcome TEXT NOT NULL DEFAULT ''");
  }
  if (!colNames.has('prerequisites')) {
    db.exec("ALTER TABLE projects ADD COLUMN prerequisites TEXT NOT NULL DEFAULT '[]'");
  }
  // Safe Column Migrations for Institutions
  const instCols = db.prepare("PRAGMA table_info(institutions)").all() as Array<{ name: string }>;
  const instColNames = new Set(instCols.map(c => c.name));
  if (!instColNames.has('license_plan')) {
    db.exec("ALTER TABLE institutions ADD COLUMN license_plan TEXT NOT NULL DEFAULT 'Institutional License'");
  }
  if (!instColNames.has('license_status')) {
    db.exec("ALTER TABLE institutions ADD COLUMN license_status TEXT NOT NULL DEFAULT 'active'");
  }
  if (!instColNames.has('billing_cycle')) {
    db.exec("ALTER TABLE institutions ADD COLUMN billing_cycle TEXT NOT NULL DEFAULT 'Annual'");
  }
  if (!instColNames.has('license_value')) {
    db.exec("ALTER TABLE institutions ADD COLUMN license_value TEXT NOT NULL DEFAULT '₹2,40,000 / year'");
  }
  if (!instColNames.has('license_start')) {
    db.exec("ALTER TABLE institutions ADD COLUMN license_start TEXT");
  }
  if (!instColNames.has('license_end')) {
    db.exec("ALTER TABLE institutions ADD COLUMN license_end TEXT");
  }
  if (!instColNames.has('student_capacity')) {
    db.exec("ALTER TABLE institutions ADD COLUMN student_capacity INTEGER");
  }
  if (!instColNames.has('mentor_capacity')) {
    db.exec("ALTER TABLE institutions ADD COLUMN mentor_capacity INTEGER");
  }
  if (!instColNames.has('project_capacity')) {
    db.exec("ALTER TABLE institutions ADD COLUMN project_capacity INTEGER");
  }
} catch (err) {
  console.warn('[Database Migration Warning]', err);
}

export default db;
