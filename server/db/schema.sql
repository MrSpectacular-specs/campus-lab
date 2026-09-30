-- =============================================================
-- CampusLab SQLite Relational Schema
-- =============================================================

PRAGMA foreign_keys = ON;

-- 1. Institutions
CREATE TABLE IF NOT EXISTS institutions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  license_plan TEXT NOT NULL DEFAULT 'Institutional License',
  license_status TEXT NOT NULL CHECK(license_status IN ('active', 'expiring', 'expired', 'suspended')) DEFAULT 'active',
  billing_cycle TEXT NOT NULL DEFAULT 'Annual',
  license_value TEXT NOT NULL DEFAULT '₹2,40,000 / year',
  license_start TEXT,
  license_end TEXT,
  student_capacity INTEGER,
  mentor_capacity INTEGER,
  project_capacity INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'faculty', 'mentor', 'student')) DEFAULT 'student',
  institution_id TEXT REFERENCES institutions(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Sessions (HTTP-Only Secure Cookie Storage)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. Projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  problem_statement TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK(status IN ('draft', 'active', 'completed', 'archived')) DEFAULT 'draft',
  difficulty TEXT NOT NULL DEFAULT 'Intermediate',
  duration TEXT NOT NULL DEFAULT '8 Weeks',
  domain TEXT NOT NULL DEFAULT '',
  skills TEXT NOT NULL DEFAULT '[]', -- JSON Array string
  objectives TEXT NOT NULL DEFAULT '[]', -- JSON Array string
  expected_outcome TEXT NOT NULL DEFAULT '',
  prerequisites TEXT NOT NULL DEFAULT '[]', -- JSON Array string
  institution_id TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. Project Members (Student Cohort & Teams)
CREATE TABLE IF NOT EXISTS project_members (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('admin', 'faculty', 'mentor', 'student')) DEFAULT 'student',
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_id, user_id)
);

-- 6. Mentor Assignments
CREATE TABLE IF NOT EXISTS mentor_assignments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  mentor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK(status IN ('active', 'completed', 'removed')) DEFAULT 'active',
  assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_id, mentor_id)
);

-- 7. Milestones
CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sequence INTEGER NOT NULL DEFAULT 1,
  due_date TEXT,
  status TEXT NOT NULL CHECK(status IN ('upcoming', 'active', 'completed')) DEFAULT 'upcoming',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 8. Milestone Submissions
CREATE TABLE IF NOT EXISTS milestone_submissions (
  id TEXT PRIMARY KEY,
  milestone_id TEXT NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  submitted_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  repository_url TEXT,
  pr_url TEXT,
  status TEXT NOT NULL CHECK(status IN ('draft', 'submitted', 'reviewed', 'revision_requested')) DEFAULT 'draft',
  submitted_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 9. Mentor Feedback
CREATE TABLE IF NOT EXISTS mentor_feedback (
  id TEXT PRIMARY KEY,
  submission_id TEXT REFERENCES milestone_submissions(id) ON DELETE CASCADE,
  milestone_id TEXT REFERENCES milestones(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  mentor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feedback TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 10. Evaluation Criteria
CREATE TABLE IF NOT EXISTS evaluation_criteria (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  criterion TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  max_score INTEGER NOT NULL DEFAULT 10,
  weight REAL NOT NULL DEFAULT 1.0,
  sequence INTEGER NOT NULL DEFAULT 1
);

-- 11. Evaluation Results
CREATE TABLE IF NOT EXISTS evaluation_results (
  id TEXT PRIMARY KEY,
  criterion_id TEXT NOT NULL REFERENCES evaluation_criteria(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  feedback TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================
-- INDEXES FOR FAST QUERYING & INSTITUTION SCOPING
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_institution ON users(institution_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_projects_institution ON projects(institution_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_submissions_milestone ON milestone_submissions(milestone_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_project ON mentor_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_mentor ON mentor_assignments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_feedback_project ON mentor_feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_criteria_project ON evaluation_criteria(project_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_project ON evaluation_results(project_id);
