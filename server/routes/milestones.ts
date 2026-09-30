import { Router, type Request, type Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

interface DbMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  sequence: number;
  due_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Helper to check project coordinator permissions
 */
function canManageProjectMilestones(projectId: string, user: { id: string; role: string; institution_id: string | null }): boolean {
  if (user.role === 'admin') {
    const proj = db.prepare('SELECT institution_id FROM projects WHERE id = ?').get(projectId) as { institution_id: string } | undefined;
    return proj?.institution_id === user.institution_id;
  }
  if (user.role === 'faculty') {
    const proj = db.prepare('SELECT created_by, institution_id FROM projects WHERE id = ?').get(projectId) as { created_by: string; institution_id: string } | undefined;
    return proj?.institution_id === user.institution_id && proj?.created_by === user.id;
  }
  return false;
}

/**
 * GET /api/projects/:id/milestones
 */
router.get('/projects/:id/milestones', (req: Request, res: Response) => {
  const project = db.prepare('SELECT id, status, institution_id FROM projects WHERE id = ?').get(req.params.id) as { id: string; status: string; institution_id: string } | undefined;
  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  const user = req.user;

  // Mentor check: only assigned projects
  if (user?.role === 'mentor') {
    const isAssigned = db.prepare("SELECT id FROM mentor_assignments WHERE project_id = ? AND mentor_id = ? AND status = 'active'").get(req.params.id, user.id);
    if (!isAssigned) {
      res.status(403).json({ error: 'Mentors cannot inspect milestones of unassigned projects.' });
      return;
    }
  }

  // Unauthenticated check
  if (!user && project.status !== 'active') {
    res.status(403).json({ error: 'Access restricted.' });
    return;
  }

  const milestones = db.prepare(`
    SELECT * FROM milestones
    WHERE project_id = ?
    ORDER BY sequence ASC
  `).all(req.params.id) as DbMilestone[];

  res.json({ milestones });
});

/**
 * POST /api/projects/:id/milestones
 * Admin or Project Coordinator Faculty
 */
router.post('/projects/:id/milestones', requireAuth, requireRole('admin', 'faculty'), (req: Request, res: Response) => {
  if (!canManageProjectMilestones(req.params.id, req.user!)) {
    res.status(403).json({ error: 'You are not authorized to create milestones on this project.' });
    return;
  }

  const { title, description, sequence, due_date, status } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    res.status(400).json({ error: 'Milestone title is required.' });
    return;
  }

  const milestoneId = crypto.randomUUID();
  const now = new Date().toISOString();

  let seq = sequence;
  if (seq === undefined || seq === null) {
    const maxRow = db.prepare('SELECT MAX(sequence) as maxSeq FROM milestones WHERE project_id = ?').get(req.params.id) as { maxSeq: number | null };
    seq = (maxRow?.maxSeq ?? 0) + 1;
  }

  db.prepare(`
    INSERT INTO milestones (id, project_id, title, description, sequence, due_date, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    milestoneId,
    req.params.id,
    title.trim(),
    description || '',
    seq,
    due_date || null,
    status || 'upcoming',
    now,
    now
  );

  const created = db.prepare('SELECT * FROM milestones WHERE id = ?').get(milestoneId) as DbMilestone;
  res.status(201).json({ milestone: created });
});

/**
 * PATCH /api/milestones/:id
 */
router.patch('/milestones/:id', requireAuth, requireRole('admin', 'faculty'), (req: Request, res: Response) => {
  const milestone = db.prepare('SELECT * FROM milestones WHERE id = ?').get(req.params.id) as DbMilestone | undefined;
  if (!milestone) {
    res.status(404).json({ error: 'Milestone not found.' });
    return;
  }

  if (!canManageProjectMilestones(milestone.project_id, req.user!)) {
    res.status(403).json({ error: 'You are not authorized to update milestones on this project.' });
    return;
  }

  const updates = req.body;
  const now = new Date().toISOString();

  const allowedFields = ['title', 'description', 'sequence', 'due_date', 'status'];
  const setClauses: string[] = ['updated_at = ?'];
  const values: unknown[] = [now];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      values.push(updates[field]);
    }
  }

  values.push(req.params.id);

  db.prepare(`UPDATE milestones SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM milestones WHERE id = ?').get(req.params.id) as DbMilestone;
  res.json({ milestone: updated });
});

/**
 * DELETE /api/milestones/:id
 */
router.delete('/milestones/:id', requireAuth, requireRole('admin', 'faculty'), (req: Request, res: Response) => {
  const milestone = db.prepare('SELECT project_id FROM milestones WHERE id = ?').get(req.params.id) as { project_id: string } | undefined;
  if (!milestone) {
    res.status(404).json({ error: 'Milestone not found.' });
    return;
  }

  if (!canManageProjectMilestones(milestone.project_id, req.user!)) {
    res.status(403).json({ error: 'You are not authorized to delete milestones on this project.' });
    return;
  }

  db.prepare('DELETE FROM milestones WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
