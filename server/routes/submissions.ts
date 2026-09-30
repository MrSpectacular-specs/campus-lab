import { Router, type Request, type Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database';
import { requireAuth } from '../middleware/auth';

const router = Router();

interface DbSubmission {
  id: string;
  milestone_id: string;
  submitted_by: string;
  title: string;
  content: string;
  repository_url: string | null;
  pr_url: string | null;
  status: string;
  submitted_at: string | null;
  updated_at: string;
}

/**
 * GET /api/milestones/:id/submissions
 * Resource-level authorization:
 * - Student: only their own/team submissions
 * - Mentor: only if assigned to this project
 * - Faculty/Admin: permitted within institution
 */
router.get('/milestones/:id/submissions', requireAuth, (req: Request, res: Response) => {
  const milestone = db.prepare(`
    SELECT m.id, m.project_id, p.institution_id
    FROM milestones m
    JOIN projects p ON m.project_id = p.id
    WHERE m.id = ?
  `).get(req.params.id) as { id: string; project_id: string; institution_id: string } | undefined;

  if (!milestone) {
    res.status(404).json({ error: 'Milestone not found.' });
    return;
  }

  const user = req.user!;

  if (milestone.institution_id !== user.institution_id) {
    res.status(403).json({ error: 'Access restricted to your institution.' });
    return;
  }

  // Mentor check
  if (user.role === 'mentor') {
    const isAssigned = db.prepare("SELECT id FROM mentor_assignments WHERE project_id = ? AND mentor_id = ? AND status = 'active'").get(milestone.project_id, user.id);
    if (!isAssigned) {
      res.status(403).json({ error: 'Mentors can only inspect submissions for assigned projects.' });
      return;
    }
  }

  // Student check: must be a member
  if (user.role === 'student') {
    const isMember = db.prepare('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?').get(milestone.project_id, user.id);
    if (!isMember) {
      res.status(403).json({ error: 'You are not enrolled in this project.' });
      return;
    }
  }

  let sql = `
    SELECT s.*, u.full_name as submitter_name, u.email as submitter_email
    FROM milestone_submissions s
    JOIN users u ON s.submitted_by = u.id
    WHERE s.milestone_id = ?
  `;
  const params: unknown[] = [req.params.id];

  // If student, only return their team / own submissions
  if (user.role === 'student') {
    sql += ' AND s.submitted_by = ?';
    params.push(user.id);
  }

  sql += ' ORDER BY s.updated_at DESC';

  const submissions = db.prepare(sql).all(...params) as DbSubmission[];
  res.json({ submissions });
});

/**
 * POST /api/milestones/:id/submissions
 * Requires user to be an enrolled member of the project team
 */
router.post('/milestones/:id/submissions', requireAuth, (req: Request, res: Response) => {
  const { title, content, repository_url, pr_url, status } = req.body;

  if (!content || typeof content !== 'string' || !content.trim()) {
    res.status(400).json({ error: 'Submission content/description is required.' });
    return;
  }

  const milestone = db.prepare('SELECT id, project_id FROM milestones WHERE id = ?').get(req.params.id) as { id: string; project_id: string } | undefined;
  if (!milestone) {
    res.status(404).json({ error: 'Milestone not found.' });
    return;
  }

  const user = req.user!;

  // Student must be an enrolled team member
  if (user.role === 'student') {
    const isMember = db.prepare('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?').get(milestone.project_id, user.id);
    if (!isMember) {
      res.status(403).json({ error: 'Only enrolled team members can submit work to this milestone.' });
      return;
    }
  }

  const submissionId = crypto.randomUUID();
  const now = new Date().toISOString();
  const subTitle = (title || 'Milestone Sprint Deliverable').trim();
  const subStatus = status || 'submitted';

  db.prepare(`
    INSERT INTO milestone_submissions (
      id, milestone_id, submitted_by, title, content, repository_url, pr_url, status, submitted_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    submissionId,
    req.params.id,
    user.id,
    subTitle,
    content.trim(),
    repository_url || null,
    pr_url || null,
    subStatus,
    now,
    now
  );

  const created = db.prepare('SELECT * FROM milestone_submissions WHERE id = ?').get(submissionId) as DbSubmission;
  res.status(201).json({ submission: created });
});

/**
 * PATCH /api/submissions/:id
 */
router.patch('/submissions/:id', requireAuth, (req: Request, res: Response) => {
  const sub = db.prepare(`
    SELECT s.*, m.project_id
    FROM milestone_submissions s
    JOIN milestones m ON s.milestone_id = m.id
    WHERE s.id = ?
  `).get(req.params.id) as (DbSubmission & { project_id: string }) | undefined;

  if (!sub) {
    res.status(404).json({ error: 'Submission not found.' });
    return;
  }

  const user = req.user!;
  const isOwner = sub.submitted_by === user.id;
  const isMentor = user.role === 'mentor';
  const isCoord = ['admin', 'faculty'].includes(user.role);

  if (isMentor) {
    const isAssigned = db.prepare("SELECT id FROM mentor_assignments WHERE project_id = ? AND mentor_id = ? AND status = 'active'").get(sub.project_id, user.id);
    if (!isAssigned) {
      res.status(403).json({ error: 'You are not assigned to supervise this project.' });
      return;
    }
  } else if (!isOwner && !isCoord) {
    res.status(403).json({ error: 'Not authorized to modify this submission.' });
    return;
  }

  const { status, title, content } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE milestone_submissions
    SET status = COALESCE(?, status),
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        updated_at = ?
    WHERE id = ?
  `).run(status, title, content, now, req.params.id);

  const updated = db.prepare('SELECT * FROM milestone_submissions WHERE id = ?').get(req.params.id) as DbSubmission;
  res.json({ submission: updated });
});

/**
 * GET /api/projects/:id/submissions
 * Used by Mentor / Coordinator review queues
 */
router.get('/projects/:id/submissions', requireAuth, (req: Request, res: Response) => {
  const project = db.prepare('SELECT id, institution_id FROM projects WHERE id = ?').get(req.params.id) as { id: string; institution_id: string } | undefined;
  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  const user = req.user!;

  if (project.institution_id !== user.institution_id) {
    res.status(403).json({ error: 'Access restricted to your institution.' });
    return;
  }

  // Mentor check: MUST be assigned to this project
  if (user.role === 'mentor') {
    const isAssigned = db.prepare("SELECT id FROM mentor_assignments WHERE project_id = ? AND mentor_id = ? AND status = 'active'").get(req.params.id, user.id);
    if (!isAssigned) {
      res.status(403).json({ error: 'Access denied. Mentors can only inspect submissions on assigned projects.' });
      return;
    }
  }

  // Student check: must be a member
  if (user.role === 'student') {
    const isMember = db.prepare('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?').get(req.params.id, user.id);
    if (!isMember) {
      res.status(403).json({ error: 'You are not enrolled in this project.' });
      return;
    }
  }

  let sql = `
    SELECT s.*,
           m.id as ms_id, m.title as ms_title, m.sequence as ms_sequence, m.due_date as ms_due_date, m.status as ms_status,
           u.full_name as submitter_name, u.email as submitter_email
    FROM milestone_submissions s
    JOIN milestones m ON s.milestone_id = m.id
    JOIN users u ON s.submitted_by = u.id
    WHERE m.project_id = ?
  `;
  const params: unknown[] = [req.params.id];

  // Student only sees their own team submissions
  if (user.role === 'student') {
    sql += ' AND s.submitted_by = ?';
    params.push(user.id);
  }

  sql += ' ORDER BY s.updated_at DESC';

  const rows = db.prepare(sql).all(...params) as Array<DbSubmission & {
    ms_id: string;
    ms_title: string;
    ms_sequence: number;
    ms_due_date: string | null;
    ms_status: string;
    submitter_name: string;
    submitter_email: string;
  }>;

  const formatted = rows.map((r) => ({
    id: r.id,
    milestone_id: r.milestone_id,
    submitted_by: r.submitted_by,
    title: r.title,
    content: r.content,
    repository_url: r.repository_url,
    pr_url: r.pr_url,
    status: r.status,
    submitted_at: r.submitted_at,
    updated_at: r.updated_at,
    milestone: {
      id: r.ms_id,
      title: r.ms_title,
      sequence: r.ms_sequence,
      due_date: r.ms_due_date,
      status: r.ms_status,
    },
    submitter: {
      id: r.submitted_by,
      full_name: r.submitter_name,
      email: user.role === 'admin' || user.role === 'faculty' ? r.submitter_email : undefined,
    },
  }));

  res.json({ submissions: formatted });
});

export default router;
