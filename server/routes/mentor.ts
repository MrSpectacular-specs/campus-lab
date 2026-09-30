import { Router, type Request, type Response } from 'express';
import { db } from '../db/database';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Strictly guard mentor router: must be authenticated and have role = 'mentor'
router.use(requireAuth, requireRole('mentor'));

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
 * GET /api/mentor/projects
 * Returns ONLY projects to which this mentor is actively assigned
 */
router.get('/projects', (req: Request, res: Response) => {
  const mentorId = req.user!.id;
  const instId = req.user!.institution_id;

  const projects = db.prepare(`
    SELECT p.*,
           ma.assigned_at, ma.status as assignment_status,
           (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) as student_count,
           (SELECT COUNT(*) FROM milestones m WHERE m.project_id = p.id) as total_milestones,
           (SELECT COUNT(*) FROM milestones m WHERE m.project_id = p.id AND m.status = 'completed') as completed_milestones
    FROM projects p
    JOIN mentor_assignments ma ON p.id = ma.project_id
    WHERE ma.mentor_id = ? AND ma.status = 'active' AND p.institution_id = ?
    ORDER BY ma.assigned_at DESC
  `).all(mentorId, instId) as Array<{
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
    assigned_at: string;
    assignment_status: string;
    student_count: number;
    total_milestones: number;
    completed_milestones: number;
  }>;

  const formatted = projects.map((p) => {
    const progressPercent = p.total_milestones > 0 ? Math.round((p.completed_milestones / p.total_milestones) * 100) : null;

    // Get current active milestone
    const currentMilestone = db.prepare(`
      SELECT id, title, sequence, due_date, status
      FROM milestones
      WHERE project_id = ? AND status = 'active'
      ORDER BY sequence ASC
      LIMIT 1
    `).get(p.id);

    // Get latest submission status
    const latestSub = db.prepare(`
      SELECT ms.status, ms.submitted_at
      FROM milestone_submissions ms
      JOIN milestones m ON ms.milestone_id = m.id
      WHERE m.project_id = ?
      ORDER BY ms.updated_at DESC
      LIMIT 1
    `).get(p.id) as { status: string; submitted_at: string | null } | undefined;

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
      current_milestone: currentMilestone || null,
      latest_submission_status: latestSub ? latestSub.status : 'no_submissions',
    };
  });

  res.json({ projects: formatted });
});

/**
 * GET /api/mentor/submissions
 * Review queue strictly across assigned projects
 */
router.get('/submissions', (req: Request, res: Response) => {
  const mentorId = req.user!.id;
  const { status, project_id } = req.query;

  let sql = `
    SELECT s.*,
           m.id as ms_id, m.title as ms_title, m.sequence as ms_sequence, m.due_date as ms_due_date,
           p.id as project_id, p.code as project_code, p.title as project_title,
           u.full_name as student_name, u.email as student_email
    FROM milestone_submissions s
    JOIN milestones m ON s.milestone_id = m.id
    JOIN projects p ON m.project_id = p.id
    JOIN mentor_assignments ma ON p.id = ma.project_id
    JOIN users u ON s.submitted_by = u.id
    WHERE ma.mentor_id = ? AND ma.status = 'active'
  `;
  const params: unknown[] = [mentorId];

  if (status && typeof status === 'string' && status !== 'ALL') {
    sql += ' AND s.status = ?';
    params.push(status);
  }

  if (project_id && typeof project_id === 'string') {
    sql += ' AND p.id = ?';
    params.push(project_id);
  }

  sql += ' ORDER BY s.updated_at DESC';

  const rows = db.prepare(sql).all(...params) as Array<{
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
    ms_id: string;
    ms_title: string;
    ms_sequence: number;
    ms_due_date: string | null;
    project_id: string;
    project_code: string;
    project_title: string;
    student_name: string;
    student_email: string;
  }>;

  const submissions = rows.map((r) => ({
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
    project: {
      id: r.project_id,
      code: r.project_code,
      title: r.project_title,
    },
    milestone: {
      id: r.ms_id,
      title: r.ms_title,
      sequence: r.ms_sequence,
      due_date: r.ms_due_date,
    },
    student: {
      id: r.submitted_by,
      full_name: r.student_name,
      email: r.student_email,
    },
  }));

  res.json({ submissions });
});

/**
 * GET /api/mentor/feedback
 * History of feedback given by this mentor
 */
router.get('/feedback', (req: Request, res: Response) => {
  const mentorId = req.user!.id;

  const feedback = db.prepare(`
    SELECT mf.*,
           p.id as project_id, p.code as project_code, p.title as project_title,
           m.id as ms_id, m.title as ms_title, m.sequence as ms_sequence,
           s.title as submission_title, s.submitted_by as student_id,
           u.full_name as student_name
    FROM mentor_feedback mf
    JOIN projects p ON mf.project_id = p.id
    LEFT JOIN milestones m ON mf.milestone_id = m.id
    LEFT JOIN milestone_submissions s ON mf.submission_id = s.id
    LEFT JOIN users u ON s.submitted_by = u.id
    WHERE mf.mentor_id = ?
    ORDER BY mf.created_at DESC
  `).all(mentorId) as Array<{
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
    submission_title: string | null;
    student_id: string | null;
    student_name: string | null;
  }>;

  const formatted = feedback.map((f) => ({
    id: f.id,
    submission_id: f.submission_id,
    milestone_id: f.milestone_id,
    project_id: f.project_id,
    mentor_id: f.mentor_id,
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
    student: f.student_name ? { name: f.student_name } : null,
  }));

  res.json({ feedback: formatted });
});

/**
 * GET /api/mentor/evaluation
 * Projects assigned to mentor with criteria and evaluation state
 */
router.get('/evaluation', (req: Request, res: Response) => {
  const mentorId = req.user!.id;

  const projects = db.prepare(`
    SELECT p.id, p.code, p.title, p.domain, p.status,
           (SELECT COUNT(*) FROM evaluation_criteria ec WHERE ec.project_id = p.id) as criteria_count,
           (SELECT COUNT(*) FROM evaluation_results er WHERE er.project_id = p.id) as results_count
    FROM projects p
    JOIN mentor_assignments ma ON p.id = ma.project_id
    WHERE ma.mentor_id = ? AND ma.status = 'active'
    ORDER BY p.code ASC
  `).all(mentorId) as Array<{
    id: string;
    code: string;
    title: string;
    domain: string;
    status: string;
    criteria_count: number;
    results_count: number;
  }>;

  const detailedProjects = projects.map((p) => {
    const criteria = db.prepare(`
      SELECT * FROM evaluation_criteria WHERE project_id = ? ORDER BY sequence ASC
    `).all(p.id);

    const results = db.prepare(`
      SELECT er.*, ec.criterion as criterion_name, ec.max_score, u.full_name as student_name
      FROM evaluation_results er
      JOIN evaluation_criteria ec ON er.criterion_id = ec.id
      JOIN users u ON er.student_id = u.id
      WHERE er.project_id = ? AND er.evaluator_id = ?
      ORDER BY er.created_at DESC
    `).all(p.id, mentorId);

    return {
      ...p,
      criteria,
      results,
    };
  });

  res.json({ projects: detailedProjects });
});

export default router;
