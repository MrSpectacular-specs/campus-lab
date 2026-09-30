import { Router, type Request, type Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

interface DbProject {
  id: string;
  title: string;
  code: string;
  description: string;
  category: string;
  problem_statement: string;
  objectives: string;
  expected_outcome: string;
  prerequisites: string;
  status: string;
  difficulty: string;
  duration: string;
  domain: string;
  skills: string;
  institution_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatProject(p: DbProject, currentUserId?: string, userRole?: string) {
  const isCoordinator = userRole === 'admin' || (userRole === 'faculty' && p.created_by === currentUserId);
  return {
    ...p,
    skills: parseJsonArray(p.skills),
    objectives: parseJsonArray(p.objectives),
    prerequisites: parseJsonArray(p.prerequisites),
    is_coordinator: isCoordinator,
  };
}

/**
 * GET /api/projects
 * Query params: search, category, status, my, assigned
 * Strictly enforces role-based data isolation
 */
router.get('/', (req: Request, res: Response) => {
  const { search, category, status, my, assigned } = req.query;
  const user = req.user;

  let sql = 'SELECT * FROM projects WHERE 1=1';
  const params: unknown[] = [];

  // 1. Institution Isolation
  if (user?.institution_id) {
    sql += ' AND institution_id = ?';
    params.push(user.institution_id);
  } else if (!user) {
    // Unauthenticated public visitors see active projects only
    sql += " AND status = 'active'";
  }

  // 2. Role-specific constraints
  if (user?.role === 'mentor') {
    // Mentors MUST ONLY see projects to which they are assigned
    sql += " AND id IN (SELECT project_id FROM mentor_assignments WHERE mentor_id = ? AND status = 'active')";
    params.push(user.id);
  } else if (user?.role === 'student' && my === 'true') {
    // Student asking for enrolled projects
    sql += ' AND id IN (SELECT project_id FROM project_members WHERE user_id = ?)';
    params.push(user.id);
  } else if (user?.role === 'student') {
    // Student browsing general library: see active projects or joined projects
    sql += " AND (status = 'active' OR id IN (SELECT project_id FROM project_members WHERE user_id = ?))";
    params.push(user.id);
  } else if (assigned === 'true') {
    sql += " AND id IN (SELECT project_id FROM mentor_assignments WHERE mentor_id = ? AND status = 'active')";
    params.push(user?.id || '');
  }

  // 3. Category Filter
  if (category && typeof category === 'string' && category !== 'ALL') {
    if (category === 'AI / ML') {
      sql += " AND (domain LIKE '%AI%' OR domain LIKE '%NLP%' OR domain LIKE '%Vision%' OR category = 'AI / ML')";
    } else if (category === 'FINTECH') {
      sql += " AND (domain LIKE '%FinTech%' OR category = 'FINTECH')";
    } else if (category === 'SYSTEMS') {
      sql += " AND (domain LIKE '%Systems%' OR domain LIKE '%Logistics%' OR category = 'SYSTEMS')";
    } else if (category === 'IOT') {
      sql += " AND (domain LIKE '%IoT%' OR domain LIKE '%Grid%' OR category = 'IOT')";
    } else {
      sql += ' AND category = ?';
      params.push(category);
    }
  }

  // 4. Status Filter
  if (status && typeof status === 'string' && status !== 'ALL') {
    sql += ' AND LOWER(status) = LOWER(?)';
    params.push(status);
  }

  // 5. Search Filter
  if (search && typeof search === 'string' && search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    sql += ' AND (LOWER(title) LIKE ? OR LOWER(code) LIKE ? OR LOWER(domain) LIKE ? OR LOWER(description) LIKE ?)';
    params.push(q, q, q, q);
  }

  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params) as DbProject[];
  res.json({ projects: rows.map((p) => formatProject(p, user?.id, user?.role)) });
});

/**
 * GET /api/projects/:id
 * Strictly enforces resource-level authorization per role
 */
router.get('/:id', (req: Request, res: Response) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as DbProject | undefined;
  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  const user = req.user;

  // Unauthenticated visitors: only active projects
  if (!user) {
    if (project.status !== 'active') {
      res.status(403).json({ error: 'This project brief is currently not publicly active.' });
      return;
    }
    res.json({ project: formatProject(project) });
    return;
  }

  // Check institution boundary
  if (project.institution_id !== user.institution_id) {
    res.status(403).json({ error: 'Access denied. Project belongs to another institution.' });
    return;
  }

  // MENTOR: Must be assigned to this project
  if (user.role === 'mentor') {
    const assignment = db.prepare(`
      SELECT id FROM mentor_assignments
      WHERE project_id = ? AND mentor_id = ? AND status = 'active'
    `).get(req.params.id, user.id);

    if (!assignment) {
      res.status(403).json({
        error: 'Access restricted. Mentors can only inspect projects to which they are actively assigned.',
      });
      return;
    }
  }

  // STUDENT: If project is non-active (e.g. draft), must be an enrolled member
  if (user.role === 'student' && project.status !== 'active') {
    const isMember = db.prepare('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?').get(req.params.id, user.id);
    if (!isMember) {
      res.status(403).json({ error: 'Access restricted. Draft projects are only accessible to enrolled team members.' });
      return;
    }
  }

  res.json({ project: formatProject(project, user.id, user.role) });
});

/**
 * POST /api/projects
 * Admin & Faculty only. Mentors and students are rejected.
 */
router.post('/', requireAuth, requireRole('admin', 'faculty'), (req: Request, res: Response) => {
  const {
    title,
    code,
    description,
    category,
    domain,
    difficulty,
    duration,
    skills,
    objectives,
    expected_outcome,
    prerequisites,
    problem_statement,
  } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    res.status(400).json({ error: 'Project title is required.' });
    return;
  }

  const projectId = crypto.randomUUID();
  const projectCode = (code || `CL-${Math.floor(100 + Math.random() * 900)}`).trim();
  const now = new Date().toISOString();

  const skillsJson = JSON.stringify(Array.isArray(skills) ? skills : []);
  const objectivesJson = JSON.stringify(Array.isArray(objectives) ? objectives : []);
  const prereqsJson = JSON.stringify(Array.isArray(prerequisites) ? prerequisites : []);

  const instId = req.user!.institution_id;
  if (!instId) {
    res.status(400).json({ error: 'User does not belong to an institution.' });
    return;
  }

  db.prepare(`
    INSERT INTO projects (
      id, title, code, description, category, problem_statement,
      objectives, expected_outcome, prerequisites,
      status, difficulty, duration, domain, skills, institution_id, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    projectId,
    title.trim(),
    projectCode,
    description || '',
    category || 'AI / ML',
    problem_statement || '',
    objectivesJson,
    expected_outcome || '',
    prereqsJson,
    difficulty || 'Intermediate',
    duration || '8 Weeks',
    domain || 'Computer Science',
    skillsJson,
    instId,
    req.user!.id,
    now,
    now
  );

  const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as DbProject;
  res.status(201).json({ project: formatProject(created, req.user!.id, req.user!.role) });
});

/**
 * PATCH /api/projects/:id
 * Admin can edit any project in institution.
 * Faculty can ONLY edit projects they created/coordinate.
 * Mentors & Students are strictly rejected.
 */
router.patch('/:id', requireAuth, requireRole('admin', 'faculty'), (req: Request, res: Response) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as DbProject | undefined;
  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  if (project.institution_id !== req.user!.institution_id) {
    res.status(403).json({ error: 'Cannot modify projects from another institution.' });
    return;
  }

  // Faculty can only edit projects they created
  if (req.user!.role === 'faculty' && project.created_by !== req.user!.id) {
    res.status(403).json({ error: 'Faculty coordinators can only modify projects they created and manage.' });
    return;
  }

  const updates = req.body;
  const now = new Date().toISOString();

  const allowedFields = [
    'title',
    'code',
    'description',
    'category',
    'problem_statement',
    'expected_outcome',
    'status',
    'difficulty',
    'duration',
    'domain',
  ];

  const setClauses: string[] = ['updated_at = ?'];
  const values: unknown[] = [now];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      values.push(updates[field]);
    }
  }

  if (updates.skills !== undefined) {
    setClauses.push('skills = ?');
    values.push(JSON.stringify(Array.isArray(updates.skills) ? updates.skills : []));
  }

  if (updates.objectives !== undefined) {
    setClauses.push('objectives = ?');
    values.push(JSON.stringify(Array.isArray(updates.objectives) ? updates.objectives : []));
  }

  if (updates.prerequisites !== undefined) {
    setClauses.push('prerequisites = ?');
    values.push(JSON.stringify(Array.isArray(updates.prerequisites) ? updates.prerequisites : []));
  }

  values.push(req.params.id);

  db.prepare(`UPDATE projects SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as DbProject;
  res.json({ project: formatProject(updated, req.user!.id, req.user!.role) });
});

/**
 * DELETE /api/projects/:id
 * Strictly ADMIN only. Faculty, mentors, students are forbidden.
 */
router.delete('/:id', requireAuth, requireRole('admin'), (req: Request, res: Response) => {
  const project = db.prepare('SELECT institution_id FROM projects WHERE id = ?').get(req.params.id) as { institution_id: string } | undefined;
  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  if (project.institution_id !== req.user!.institution_id) {
    res.status(403).json({ error: 'Cannot delete projects from another institution.' });
    return;
  }

  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

/**
 * POST /api/projects/:id/join
 * Enrolled by students only
 */
router.post('/:id/join', requireAuth, (req: Request, res: Response) => {
  if (req.user!.role !== 'student') {
    res.status(403).json({ error: 'Only student accounts can join project teams.' });
    return;
  }

  const project = db.prepare('SELECT id, institution_id, status FROM projects WHERE id = ?').get(req.params.id) as { id: string; institution_id: string; status: string } | undefined;
  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  if (project.institution_id !== req.user!.institution_id) {
    res.status(403).json({ error: 'Cannot join projects from another institution.' });
    return;
  }

  if (project.status === 'archived' || project.status === 'completed') {
    res.status(400).json({ error: `Cannot join project in '${project.status}' status.` });
    return;
  }

  const existing = db.prepare('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?').get(req.params.id, req.user!.id);
  if (existing) {
    res.status(409).json({ error: 'You are already an enrolled member of this project team.' });
    return;
  }

  const memberId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO project_members (id, project_id, user_id, role, joined_at)
    VALUES (?, ?, ?, 'student', ?)
  `).run(memberId, req.params.id, req.user!.id, now);

  res.status(201).json({ success: true, memberId });
});

/**
 * GET /api/projects/:id/members
 * Role-aware member roster
 */
router.get('/:id/members', (req: Request, res: Response) => {
  const project = db.prepare('SELECT id, institution_id, status FROM projects WHERE id = ?').get(req.params.id) as { id: string; institution_id: string; status: string } | undefined;
  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  const user = req.user;

  // Mentors can only see members of assigned projects
  if (user?.role === 'mentor') {
    const isAssigned = db.prepare("SELECT id FROM mentor_assignments WHERE project_id = ? AND mentor_id = ? AND status = 'active'").get(req.params.id, user.id);
    if (!isAssigned) {
      res.status(403).json({ error: 'Access denied. Mentors can only view rosters for assigned projects.' });
      return;
    }
  }

  const members = db.prepare(`
    SELECT pm.id, pm.project_id, pm.user_id, pm.role, pm.joined_at,
           u.email, u.full_name, u.role as user_role, u.avatar_url
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
    ORDER BY pm.joined_at ASC
  `).all(req.params.id) as Array<{
    id: string;
    project_id: string;
    user_id: string;
    role: string;
    joined_at: string;
    email: string;
    full_name: string;
    user_role: string;
    avatar_url: string | null;
  }>;

  // If public or student, only expose sanitized roster without private metadata
  const formatted = members.map((m) => ({
    id: m.id,
    project_id: m.project_id,
    user_id: m.user_id,
    role: m.role,
    joined_at: m.joined_at,
    profile: {
      id: m.user_id,
      email: user?.role === 'admin' || user?.role === 'faculty' ? m.email : undefined,
      full_name: m.full_name,
      role: m.user_role,
      avatar_url: m.avatar_url,
    },
  }));

  res.json({ members: formatted });
});

/**
 * DELETE /api/projects/:id/members/:userId
 */
router.delete('/:id/members/:userId', requireAuth, (req: Request, res: Response) => {
  // Students can withdraw themselves; Admin and Faculty can remove members
  const isSelf = req.user!.id === req.params.userId;
  const isCoord = ['admin', 'faculty'].includes(req.user!.role);

  if (!isSelf && !isCoord) {
    res.status(403).json({ error: 'Not authorized to remove this member.' });
    return;
  }

  db.prepare('DELETE FROM project_members WHERE project_id = ? AND user_id = ?').run(req.params.id, req.params.userId);
  res.json({ success: true });
});

export default router;
