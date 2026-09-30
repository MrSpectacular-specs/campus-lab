import { Router, type Request, type Response } from 'express';
import { db } from '../db/database';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Strictly guard faculty router: must be authenticated and have role = 'faculty' or 'admin'
router.use(requireAuth, requireRole('faculty', 'admin'));

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
 * GET /api/faculty/projects
 * Returns ONLY projects coordinated / created by the authenticated faculty member
 */
router.get('/projects', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const instId = req.user!.institution_id;

  const projects = db.prepare(`
    SELECT p.*,
           (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) as student_count,
           (SELECT u.full_name FROM mentor_assignments ma JOIN users u ON ma.mentor_id = u.id WHERE ma.project_id = p.id AND ma.status = 'active' LIMIT 1) as mentor_name,
           (SELECT COUNT(*) FROM milestones m WHERE m.project_id = p.id) as total_milestones,
           (SELECT COUNT(*) FROM milestones m WHERE m.project_id = p.id AND m.status = 'completed') as completed_milestones
    FROM projects p
    WHERE p.institution_id = ? AND p.created_by = ?
    ORDER BY p.created_at DESC
  `).all(instId, userId) as Array<{
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
    student_count: number;
    mentor_name: string | null;
    total_milestones: number;
    completed_milestones: number;
  }>;

  const formatted = projects.map((p) => {
    const progressPercent = p.total_milestones > 0 ? Math.round((p.completed_milestones / p.total_milestones) * 100) : null;
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
    };
  });

  res.json({ projects: formatted });
});

/**
 * GET /api/faculty/teams
 * Shows student teams belonging ONLY to faculty-coordinated projects
 */
router.get('/teams', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const instId = req.user!.institution_id;

  // Get coordinated projects
  const projects = db.prepare(`
    SELECT id, code, title, domain, status
    FROM projects
    WHERE institution_id = ? AND created_by = ?
    ORDER BY created_at DESC
  `).all(instId, userId) as Array<{ id: string; code: string; title: string; domain: string; status: string }>;

  const teams = projects.map((p) => {
    const students = db.prepare(`
      SELECT pm.id as membership_id, pm.role, pm.joined_at, u.id as user_id, u.full_name, u.email, u.avatar_url
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
      ORDER BY pm.joined_at ASC
    `).all(p.id) as Array<{ membership_id: string; role: string; joined_at: string; user_id: string; full_name: string; email: string; avatar_url: string | null }>;

    const mentor = db.prepare(`
      SELECT u.full_name, u.email
      FROM mentor_assignments ma
      JOIN users u ON ma.mentor_id = u.id
      WHERE ma.project_id = ? AND ma.status = 'active'
      LIMIT 1
    `).get(p.id) as { full_name: string; email: string } | undefined;

    const currentMilestone = db.prepare(`
      SELECT id, title, sequence, status, due_date
      FROM milestones
      WHERE project_id = ? AND status = 'active'
      ORDER BY sequence ASC
      LIMIT 1
    `).get(p.id) as { id: string; title: string; sequence: number; status: string; due_date: string | null } | undefined;

    const latestSubmission = db.prepare(`
      SELECT ms.id, ms.title, ms.status, ms.submitted_at
      FROM milestone_submissions ms
      JOIN milestones m ON ms.milestone_id = m.id
      WHERE m.project_id = ?
      ORDER BY ms.updated_at DESC
      LIMIT 1
    `).get(p.id) as { id: string; title: string; status: string; submitted_at: string | null } | undefined;

    return {
      project: p,
      team_size: students.length,
      students,
      mentor: mentor || null,
      current_milestone: currentMilestone || null,
      submission_state: latestSubmission ? latestSubmission.status : 'no_submissions',
    };
  });

  res.json({ teams });
});

/**
 * GET /api/faculty/milestones
 * Sprints & milestones across faculty-coordinated projects
 */
router.get('/milestones', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const instId = req.user!.institution_id;
  const { project_id } = req.query;

  let sql = `
    SELECT m.*, p.code as project_code, p.title as project_title,
           (SELECT COUNT(*) FROM milestone_submissions WHERE milestone_id = m.id) as submissions_count,
           (SELECT COUNT(*) FROM milestone_submissions WHERE milestone_id = m.id AND status = 'reviewed') as reviewed_count
    FROM milestones m
    JOIN projects p ON m.project_id = p.id
    WHERE p.institution_id = ? AND p.created_by = ?
  `;
  const params: unknown[] = [instId, userId];

  if (project_id && typeof project_id === 'string') {
    sql += ' AND m.project_id = ?';
    params.push(project_id);
  }

  sql += ' ORDER BY p.code ASC, m.sequence ASC';

  const milestones = db.prepare(sql).all(...params);
  res.json({ milestones });
});

/**
 * GET /api/faculty/evaluation
 * Rubric criteria and evaluations across faculty-coordinated projects
 */
router.get('/evaluation', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const instId = req.user!.institution_id;

  const projects = db.prepare(`
    SELECT p.id, p.code, p.title, p.domain, p.status,
           (SELECT COUNT(*) FROM evaluation_criteria ec WHERE ec.project_id = p.id) as criteria_count,
           (SELECT COUNT(*) FROM evaluation_results er WHERE er.project_id = p.id) as results_count,
           (SELECT AVG(er.score) FROM evaluation_results er WHERE er.project_id = p.id) as avg_score
    FROM projects p
    WHERE p.institution_id = ? AND p.created_by = ?
    ORDER BY p.created_at DESC
  `).all(instId, userId) as Array<{
    id: string;
    code: string;
    title: string;
    domain: string;
    status: string;
    criteria_count: number;
    results_count: number;
    avg_score: number | null;
  }>;

  res.json({
    projects: projects.map((p) => ({
      ...p,
      avg_score: p.avg_score !== null ? Number(p.avg_score.toFixed(1)) : null,
    })),
  });
});

export default router;
