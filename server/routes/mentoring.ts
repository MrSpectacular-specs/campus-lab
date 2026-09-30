import { Router, type Request, type Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

/**
 * GET /api/mentors/available
 * Restricted strictly to Admin and Faculty coordinators.
 * Students and Mentors are rejected with 403.
 */
router.get('/mentors/available', requireAuth, requireRole('admin', 'faculty'), (req: Request, res: Response) => {
  const instId = req.user!.institution_id;
  if (!instId) {
    res.json({ mentors: [] });
    return;
  }

  const mentors = db.prepare(`
    SELECT id, email, full_name, role, institution_id, avatar_url, created_at
    FROM users
    WHERE role = 'mentor' AND institution_id = ?
    ORDER BY full_name ASC
  `).all(instId);

  res.json({ mentors });
});

/**
 * GET /api/projects/:id/mentors
 */
router.get('/projects/:id/mentors', (req: Request, res: Response) => {
  const user = req.user;

  // If mentor, verify assignment
  if (user?.role === 'mentor') {
    const isAssigned = db.prepare("SELECT id FROM mentor_assignments WHERE project_id = ? AND mentor_id = ? AND status = 'active'").get(req.params.id, user.id);
    if (!isAssigned) {
      res.status(403).json({ error: 'Access restricted to assigned mentors.' });
      return;
    }
  }

  const assignments = db.prepare(`
    SELECT ma.id, ma.project_id, ma.mentor_id, ma.assigned_by, ma.status, ma.assigned_at,
           u.email, u.full_name, u.role as mentor_role, u.avatar_url
    FROM mentor_assignments ma
    JOIN users u ON ma.mentor_id = u.id
    WHERE ma.project_id = ?
    ORDER BY ma.assigned_at DESC
  `).all(req.params.id) as Array<{
    id: string;
    project_id: string;
    mentor_id: string;
    assigned_by: string | null;
    status: string;
    assigned_at: string;
    email: string;
    full_name: string;
    mentor_role: string;
    avatar_url: string | null;
  }>;

  const formatted = assignments.map((a) => ({
    id: a.id,
    project_id: a.project_id,
    mentor_id: a.mentor_id,
    assigned_by: a.assigned_by,
    status: a.status,
    assigned_at: a.assigned_at,
    mentor: {
      id: a.mentor_id,
      email: user?.role === 'admin' || user?.role === 'faculty' ? a.email : undefined,
      full_name: a.full_name,
      role: a.mentor_role,
      avatar_url: a.avatar_url,
    },
  }));

  res.json({ assignments: formatted });
});

/**
 * POST /api/projects/:id/mentors
 * Admin / Faculty assign a mentor to project
 */
router.post('/projects/:id/mentors', requireAuth, requireRole('admin', 'faculty'), (req: Request, res: Response) => {
  const { mentor_id } = req.body;
  if (!mentor_id) {
    res.status(400).json({ error: 'mentor_id is required.' });
    return;
  }

  // Verify mentor belongs to same institution
  const mentor = db.prepare("SELECT id, role, institution_id FROM users WHERE id = ? AND role = 'mentor'").get(mentor_id) as { id: string; role: string; institution_id: string } | undefined;
  if (!mentor || mentor.institution_id !== req.user!.institution_id) {
    res.status(400).json({ error: 'Invalid mentor profile for this institution.' });
    return;
  }

  const assignmentId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO mentor_assignments (id, project_id, mentor_id, assigned_by, status, assigned_at)
    VALUES (?, ?, ?, ?, 'active', ?)
    ON CONFLICT(project_id, mentor_id) DO UPDATE SET status = 'active', assigned_at = excluded.assigned_at
  `).run(assignmentId, req.params.id, mentor_id, req.user!.id, now);

  res.status(201).json({ success: true, assignmentId });
});

/**
 * DELETE /api/projects/:id/mentors/:mentorId
 */
router.delete('/projects/:id/mentors/:mentorId', requireAuth, requireRole('admin', 'faculty'), (req: Request, res: Response) => {
  db.prepare(`
    UPDATE mentor_assignments
    SET status = 'removed'
    WHERE project_id = ? AND mentor_id = ?
  `).run(req.params.id, req.params.mentorId);

  res.json({ success: true });
});

/**
 * GET /api/projects/:id/feedback
 * Mentor must be assigned; Student must be enrolled
 */
router.get('/projects/:id/feedback', (req: Request, res: Response) => {
  const user = req.user;

  if (user?.role === 'mentor') {
    const isAssigned = db.prepare("SELECT id FROM mentor_assignments WHERE project_id = ? AND mentor_id = ? AND status = 'active'").get(req.params.id, user.id);
    if (!isAssigned) {
      res.status(403).json({ error: 'Mentors can only inspect feedback for assigned projects.' });
      return;
    }
  }

  if (user?.role === 'student') {
    const isMember = db.prepare('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?').get(req.params.id, user.id);
    if (!isMember) {
      res.status(403).json({ error: 'You are not enrolled in this project.' });
      return;
    }
  }

  const feedback = db.prepare(`
    SELECT mf.id, mf.submission_id, mf.milestone_id, mf.project_id, mf.mentor_id, mf.feedback, mf.created_at,
           u.email, u.full_name, u.role as mentor_role, u.avatar_url
    FROM mentor_feedback mf
    JOIN users u ON mf.mentor_id = u.id
    WHERE mf.project_id = ?
    ORDER BY mf.created_at DESC
  `).all(req.params.id) as Array<{
    id: string;
    submission_id: string | null;
    milestone_id: string | null;
    project_id: string;
    mentor_id: string;
    feedback: string;
    created_at: string;
    email: string;
    full_name: string;
    mentor_role: string;
    avatar_url: string | null;
  }>;

  const formatted = feedback.map((f) => ({
    id: f.id,
    submission_id: f.submission_id,
    milestone_id: f.milestone_id,
    project_id: f.project_id,
    mentor_id: f.mentor_id,
    feedback: f.feedback,
    created_at: f.created_at,
    mentor: {
      id: f.mentor_id,
      email: user?.role === 'admin' || user?.role === 'faculty' ? f.email : undefined,
      full_name: f.full_name,
      role: f.mentor_role,
      avatar_url: f.avatar_url,
    },
  }));

  res.json({ feedback: formatted });
});

/**
 * POST /api/projects/:id/feedback
 * Submit feedback on project / milestone (Mentor/Faculty/Admin only)
 */
router.post('/projects/:id/feedback', requireAuth, requireRole('mentor', 'faculty', 'admin'), (req: Request, res: Response) => {
  const user = req.user!;

  // If mentor, verify assignment
  if (user.role === 'mentor') {
    const isAssigned = db.prepare("SELECT id FROM mentor_assignments WHERE project_id = ? AND mentor_id = ? AND status = 'active'").get(req.params.id, user.id);
    if (!isAssigned) {
      res.status(403).json({ error: 'You are not assigned to supervise this project.' });
      return;
    }
  }

  const { submission_id, milestone_id, feedback } = req.body;

  if (!feedback || typeof feedback !== 'string' || !feedback.trim()) {
    res.status(400).json({ error: 'Feedback content is required.' });
    return;
  }

  const feedbackId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO mentor_feedback (id, submission_id, milestone_id, project_id, mentor_id, feedback, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    feedbackId,
    submission_id || null,
    milestone_id || null,
    req.params.id,
    user.id,
    feedback.trim(),
    now
  );

  if (submission_id) {
    db.prepare("UPDATE milestone_submissions SET status = 'reviewed', updated_at = ? WHERE id = ?").run(now, submission_id);
  }

  interface CreatedFeedbackRow {
    id: string;
    submission_id: string | null;
    milestone_id: string | null;
    project_id: string;
    mentor_id: string;
    feedback: string;
    created_at: string;
    full_name: string;
    email: string;
    mentor_role: string;
    avatar_url: string | null;
  }

  const created = db.prepare(`
    SELECT mf.*, u.full_name, u.email, u.role as mentor_role, u.avatar_url
    FROM mentor_feedback mf
    JOIN users u ON mf.mentor_id = u.id
    WHERE mf.id = ?
  `).get(feedbackId) as CreatedFeedbackRow;

  res.status(201).json({
    feedback: {
      id: created.id,
      submission_id: created.submission_id,
      milestone_id: created.milestone_id,
      project_id: created.project_id,
      mentor_id: created.mentor_id,
      feedback: created.feedback,
      created_at: created.created_at,
      mentor: {
        id: created.mentor_id,
        email: created.email,
        full_name: created.full_name,
        role: created.mentor_role,
        avatar_url: created.avatar_url,
      },
    },
  });
});

/**
 * POST /api/milestones/:id/feedback
 */
router.post('/milestones/:id/feedback', requireAuth, requireRole('mentor', 'faculty', 'admin'), (req: Request, res: Response) => {
  const milestone = db.prepare('SELECT project_id FROM milestones WHERE id = ?').get(req.params.id) as { project_id: string } | undefined;
  if (!milestone) {
    res.status(404).json({ error: 'Milestone not found.' });
    return;
  }

  const user = req.user!;

  if (user.role === 'mentor') {
    const isAssigned = db.prepare("SELECT id FROM mentor_assignments WHERE project_id = ? AND mentor_id = ? AND status = 'active'").get(milestone.project_id, user.id);
    if (!isAssigned) {
      res.status(403).json({ error: 'You are not assigned to supervise this project.' });
      return;
    }
  }

  const { submission_id, feedback } = req.body;
  const feedbackId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO mentor_feedback (id, submission_id, milestone_id, project_id, mentor_id, feedback, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    feedbackId,
    submission_id || null,
    req.params.id,
    milestone.project_id,
    user.id,
    (feedback || '').trim(),
    now
  );

  if (submission_id) {
    db.prepare("UPDATE milestone_submissions SET status = 'reviewed', updated_at = ? WHERE id = ?").run(now, submission_id);
  }

  res.status(201).json({ success: true, feedbackId });
});

export default router;
