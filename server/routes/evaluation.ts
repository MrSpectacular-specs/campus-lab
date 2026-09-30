import { Router, type Request, type Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

interface DbCriterion {
  id: string;
  project_id: string;
  criterion: string;
  description: string;
  max_score: number;
  weight: number;
  sequence: number;
}

interface DbResult {
  id: string;
  criterion_id: string;
  project_id: string;
  student_id: string;
  evaluator_id: string;
  score: number;
  feedback: string;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/projects/:id/evaluation
 * Returns criteria and results for a project
 * Applies strict confidential student isolation and mentor verification
 */
router.get('/projects/:id/evaluation', (req: Request, res: Response) => {
  const project = db.prepare('SELECT id, institution_id, status FROM projects WHERE id = ?').get(req.params.id) as { id: string; institution_id: string; status: string } | undefined;
  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  const user = req.user;

  // Mentor check: must be assigned
  if (user?.role === 'mentor') {
    const isAssigned = db.prepare("SELECT id FROM mentor_assignments WHERE project_id = ? AND mentor_id = ? AND status = 'active'").get(req.params.id, user.id);
    if (!isAssigned) {
      res.status(403).json({ error: 'Mentors can only inspect evaluation records for assigned projects.' });
      return;
    }
  }

  // Criteria is public/project-level
  const criteria = db.prepare(`
    SELECT * FROM evaluation_criteria
    WHERE project_id = ?
    ORDER BY sequence ASC
  `).all(req.params.id) as DbCriterion[];

  // Results: if student, ONLY return their own evaluation results
  let resultsSql = `
    SELECT er.*,
           ec.criterion as criterion_name, ec.description as criterion_desc, ec.max_score, ec.weight,
           stu.full_name as student_name, stu.email as student_email,
           eva.full_name as evaluator_name, eva.email as evaluator_email
    FROM evaluation_results er
    JOIN evaluation_criteria ec ON er.criterion_id = ec.id
    JOIN users stu ON er.student_id = stu.id
    JOIN users eva ON er.evaluator_id = eva.id
    WHERE er.project_id = ?
  `;
  const params: unknown[] = [req.params.id];

  if (user?.role === 'student') {
    resultsSql += ' AND er.student_id = ?';
    params.push(user.id);
  }

  resultsSql += ' ORDER BY er.created_at DESC';

  const results = db.prepare(resultsSql).all(...params) as Array<DbResult & {
    criterion_name: string;
    criterion_desc: string;
    max_score: number;
    weight: number;
    student_name: string;
    student_email: string;
    evaluator_name: string;
    evaluator_email: string;
  }>;

  const formattedResults = results.map((r) => ({
    id: r.id,
    criterion_id: r.criterion_id,
    project_id: r.project_id,
    student_id: r.student_id,
    evaluator_id: r.evaluator_id,
    score: r.score,
    feedback: r.feedback,
    created_at: r.created_at,
    updated_at: r.updated_at,
    criterion: {
      id: r.criterion_id,
      criterion: r.criterion_name,
      description: r.criterion_desc,
      max_score: r.max_score,
      weight: r.weight,
    },
    student: {
      id: r.student_id,
      full_name: r.student_name,
      email: user?.role === 'admin' || user?.role === 'faculty' ? r.student_email : undefined,
    },
    evaluator: {
      id: r.evaluator_id,
      full_name: r.evaluator_name,
      email: user?.role === 'admin' || user?.role === 'faculty' ? r.evaluator_email : undefined,
    },
  }));

  res.json({ criteria, results: formattedResults });
});

/**
 * POST /api/projects/:id/evaluation/criteria
 * Admin / Faculty only
 */
router.post('/projects/:id/evaluation/criteria', requireAuth, requireRole('admin', 'faculty'), (req: Request, res: Response) => {
  const { criterion, description, max_score, weight, sequence } = req.body;

  if (!criterion || typeof criterion !== 'string' || !criterion.trim()) {
    res.status(400).json({ error: 'Criterion title is required.' });
    return;
  }

  const critId = crypto.randomUUID();

  let seq = sequence;
  if (seq === undefined || seq === null) {
    const maxRow = db.prepare('SELECT MAX(sequence) as maxSeq FROM evaluation_criteria WHERE project_id = ?').get(req.params.id) as { maxSeq: number | null };
    seq = (maxRow?.maxSeq ?? 0) + 1;
  }

  db.prepare(`
    INSERT INTO evaluation_criteria (id, project_id, criterion, description, max_score, weight, sequence)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    critId,
    req.params.id,
    criterion.trim(),
    description || '',
    max_score || 10,
    weight || 1.0,
    seq
  );

  const created = db.prepare('SELECT * FROM evaluation_criteria WHERE id = ?').get(critId) as DbCriterion;
  res.status(201).json({ criterion: created });
});

/**
 * PATCH /api/evaluation/criteria/:id
 */
router.patch('/evaluation/criteria/:id', requireAuth, requireRole('admin', 'faculty'), (req: Request, res: Response) => {
  const { criterion, description, max_score, weight, sequence } = req.body;

  db.prepare(`
    UPDATE evaluation_criteria
    SET criterion = COALESCE(?, criterion),
        description = COALESCE(?, description),
        max_score = COALESCE(?, max_score),
        weight = COALESCE(?, weight),
        sequence = COALESCE(?, sequence)
    WHERE id = ?
  `).run(criterion, description, max_score, weight, sequence, req.params.id);

  const updated = db.prepare('SELECT * FROM evaluation_criteria WHERE id = ?').get(req.params.id) as DbCriterion;
  res.json({ criterion: updated });
});

/**
 * DELETE /api/evaluation/criteria/:id
 */
router.delete('/evaluation/criteria/:id', requireAuth, requireRole('admin', 'faculty'), (req: Request, res: Response) => {
  db.prepare('DELETE FROM evaluation_criteria WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

/**
 * POST /api/projects/:id/evaluation/results
 * Mentor / Faculty / Admin submit rubric marks and defense remarks
 * Students are strictly forbidden.
 */
router.post('/projects/:id/evaluation/results', requireAuth, requireRole('admin', 'faculty', 'mentor'), (req: Request, res: Response) => {
  const user = req.user!;

  // If mentor, verify assignment
  if (user.role === 'mentor') {
    const isAssigned = db.prepare("SELECT id FROM mentor_assignments WHERE project_id = ? AND mentor_id = ? AND status = 'active'").get(req.params.id, user.id);
    if (!isAssigned) {
      res.status(403).json({ error: 'You are not assigned to evaluate this project.' });
      return;
    }
  }

  const { criterion_id, student_id, score, feedback } = req.body;

  if (!criterion_id) {
    res.status(400).json({ error: 'criterion_id is required.' });
    return;
  }

  let targetStudentId = student_id;
  if (!targetStudentId) {
    const firstMember = db.prepare("SELECT user_id FROM project_members WHERE project_id = ? AND role = 'student' LIMIT 1").get(req.params.id) as { user_id: string } | undefined;
    targetStudentId = firstMember?.user_id;
  }

  if (!targetStudentId) {
    res.status(400).json({ error: 'No student found in project team to evaluate.' });
    return;
  }

  const resultId = crypto.randomUUID();
  const now = new Date().toISOString();
  const numericScore = typeof score === 'number' ? score : parseInt(String(score), 10) || 0;

  db.prepare(`
    INSERT INTO evaluation_results (id, criterion_id, project_id, student_id, evaluator_id, score, feedback, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    resultId,
    criterion_id,
    req.params.id,
    targetStudentId,
    user.id,
    numericScore,
    feedback || '',
    now,
    now
  );

  const created = db.prepare('SELECT * FROM evaluation_results WHERE id = ?').get(resultId) as DbResult;
  res.status(201).json({ result: created });
});

export default router;
