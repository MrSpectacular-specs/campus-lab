import { Router, type Request, type Response } from 'express';
import { db } from '../db/database';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Strictly guard student router: must be authenticated and have role = 'student'
router.use(requireAuth, requireRole('student'));

function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * GET /api/student/projects
 * Returns ONLY projects the authenticated student has enrolled in
 */
router.get('/projects', (req: Request, res: Response) => {
  const studentId = req.user!.id;
  const instId = req.user!.institution_id;

  const projects = db.prepare(`
    SELECT p.*,
           pm.joined_at, pm.role as member_role,
           (SELECT u.full_name FROM mentor_assignments ma JOIN users u ON ma.mentor_id = u.id WHERE ma.project_id = p.id AND ma.status = 'active' LIMIT 1) as mentor_name,
           (SELECT COUNT(*) FROM milestones m WHERE m.project_id = p.id) as total_milestones,
           (SELECT COUNT(*) FROM milestones m WHERE m.project_id = p.id AND m.status = 'completed') as completed_milestones
    FROM projects p
    JOIN project_members pm ON p.id = pm.project_id
    WHERE pm.user_id = ? AND p.institution_id = ?
    ORDER BY pm.joined_at DESC
  `).all(studentId, instId) as Array<{
    id: string;
    title: string;
    code: string;
    description: string;
    category: string;
    domain: string;
    status: string;
    difficulty: string;
    duration: string;
    skills: string;
    objectives: string;
    expected_outcome: string;
    prerequisites: string;
    created_at: string;
    updated_at: string;
    joined_at: string;
    member_role: string;
    mentor_name: string | null;
    total_milestones: number;
    completed_milestones: number;
  }>;

  const formatted = projects.map((p) => {
    const progressPercent = p.total_milestones > 0 ? Math.round((p.completed_milestones / p.total_milestones) * 100) : null;

    const currentMilestone = db.prepare(`
      SELECT id, title, sequence, due_date, status
      FROM milestones
      WHERE project_id = ? AND status = 'active'
      ORDER BY sequence ASC
      LIMIT 1
    `).get(p.id);

    const submission = db.prepare(`
      SELECT s.id, s.title, s.status, s.submitted_at
      FROM milestone_submissions s
      JOIN milestones m ON s.milestone_id = m.id
      WHERE m.project_id = ? AND s.submitted_by = ?
      ORDER BY s.updated_at DESC
      LIMIT 1
    `).get(p.id, studentId) as { id: string; title: string; status: string; submitted_at: string | null } | undefined;

    return {
      ...p,
      skills: parseJsonArray(p.skills),
      objectives: parseJsonArray(p.objectives),
      prerequisites: parseJsonArray(p.prerequisites),
      progress: {
        percent: progressPercent,
        completed_milestones: p.completed_milestones,
        total_milestones: p.total_milestones,
      },
      mentor: p.mentor_name ? { name: p.mentor_name } : null,
      current_milestone: currentMilestone || null,
      submission_state: submission ? submission.status : 'not_submitted',
    };
  });

  res.json({ projects: formatted });
});

/**
 * GET /api/student/milestones
 * Sprints roadmap across all projects joined by this student
 */
router.get('/milestones', (req: Request, res: Response) => {
  const studentId = req.user!.id;
  const { project_id } = req.query;

  let sql = `
    SELECT m.*,
           p.id as project_id, p.code as project_code, p.title as project_title,
           s.id as submission_id, s.title as submission_title, s.status as submission_status, s.submitted_at
    FROM milestones m
    JOIN projects p ON m.project_id = p.id
    JOIN project_members pm ON p.id = pm.project_id
    LEFT JOIN milestone_submissions s ON m.id = s.milestone_id AND s.submitted_by = ?
    WHERE pm.user_id = ?
  `;
  const params: unknown[] = [studentId, studentId];

  if (project_id && typeof project_id === 'string') {
    sql += ' AND p.id = ?';
    params.push(project_id);
  }

  sql += ' ORDER BY p.code ASC, m.sequence ASC';

  const rows = db.prepare(sql).all(...params) as Array<{
    id: string;
    project_id: string;
    title: string;
    description: string;
    sequence: number;
    due_date: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    project_code: string;
    project_title: string;
    submission_id: string | null;
    submission_title: string | null;
    submission_status: string | null;
    submitted_at: string | null;
  }>;

  // Group by roadmap categories: completed, current, upcoming, overdue
  const now = new Date().toISOString().split('T')[0];

  const milestones = rows.map((r) => {
    let group: 'completed' | 'current' | 'upcoming' | 'overdue' = 'upcoming';

    if (r.status === 'completed') {
      group = 'completed';
    } else if (r.status === 'active') {
      if (r.due_date && r.due_date < now) {
        group = 'overdue';
      } else {
        group = 'current';
      }
    } else if (r.due_date && r.due_date < now) {
      group = 'overdue';
    }

    return {
      id: r.id,
      title: r.title,
      description: r.description,
      sequence: r.sequence,
      due_date: r.due_date,
      status: r.status,
      roadmap_group: group,
      project: {
        id: r.project_id,
        code: r.project_code,
        title: r.project_title,
      },
      submission: r.submission_id
        ? {
            id: r.submission_id,
            title: r.submission_title,
            status: r.submission_status,
            submitted_at: r.submitted_at,
          }
        : null,
    };
  });

  res.json({ milestones });
});

/**
 * GET /api/student/feedback
 * Returns ONLY feedback relevant to the student's own projects and submissions
 */
router.get('/feedback', (req: Request, res: Response) => {
  const studentId = req.user!.id;

  const feedback = db.prepare(`
    SELECT mf.*,
           p.id as project_id, p.code as project_code, p.title as project_title,
           m.id as ms_id, m.title as ms_title, m.sequence as ms_sequence,
           u.full_name as mentor_name, u.email as mentor_email
    FROM mentor_feedback mf
    JOIN projects p ON mf.project_id = p.id
    JOIN project_members pm ON p.id = pm.project_id
    JOIN users u ON mf.mentor_id = u.id
    LEFT JOIN milestones m ON mf.milestone_id = m.id
    WHERE pm.user_id = ?
    ORDER BY mf.created_at DESC
  `).all(studentId) as Array<{
    id: string;
    submission_id: string | null;
    milestone_id: string | null;
    project_id: string;
    mentor_id: string;
    feedback: string;
    created_at: string;
    project_code: string;
    project_title: string;
    ms_title: string | null;
    ms_sequence: number | null;
    mentor_name: string;
    mentor_email: string;
  }>;

  const formatted = feedback.map((f) => ({
    id: f.id,
    feedback: f.feedback,
    created_at: f.created_at,
    project: {
      id: f.project_id,
      code: f.project_code,
      title: f.project_title,
    },
    milestone: f.milestone_id
      ? {
          id: f.milestone_id,
          title: f.ms_title || 'Sprint Checkpoint',
          sequence: f.ms_sequence || 1,
        }
      : null,
    mentor: {
      name: f.mentor_name,
      email: f.mentor_email,
    },
  }));

  res.json({ feedback: formatted });
});

export default router;
