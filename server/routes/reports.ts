import { Router, type Request, type Response } from 'express';
import { db } from '../db/database';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

/**
 * GET /api/reports
 * Computes institutional metrics directly from SQLite records
 */
router.get('/', requireAuth, requireRole('admin', 'faculty'), (req: Request, res: Response) => {
  const instId = req.user!.institution_id;
  if (!instId) {
    res.status(400).json({ error: 'User does not belong to an institution.' });
    return;
  }

  // 1. Projects Breakdown
  const projectRows = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM projects
    WHERE institution_id = ?
    GROUP BY status
  `).all(instId) as Array<{ status: string; count: number }>;

  const statusMap: Record<string, number> = {
    active: 0,
    completed: 0,
    draft: 0,
    archived: 0,
  };

  let totalProjects = 0;
  for (const r of projectRows) {
    const s = r.status.toLowerCase();
    statusMap[s] = r.count;
    totalProjects += r.count;
  }

  // 2. Users Breakdown
  const userRows = db.prepare(`
    SELECT role, COUNT(*) as count
    FROM users
    WHERE institution_id = ?
    GROUP BY role
  `).all(instId) as Array<{ role: string; count: number }>;

  const roleMap: Record<string, number> = {
    student: 0,
    mentor: 0,
    faculty: 0,
    admin: 0,
  };

  for (const r of userRows) {
    roleMap[r.role.toLowerCase()] = r.count;
  }

  // 3. Mentor Assignments
  const assignmentRows = db.prepare(`
    SELECT ma.status, COUNT(*) as count
    FROM mentor_assignments ma
    JOIN projects p ON ma.project_id = p.id
    WHERE p.institution_id = ?
    GROUP BY ma.status
  `).all(instId) as Array<{ status: string; count: number }>;

  let activeMentorAssignments = 0;
  let completedMentorAssignments = 0;
  for (const a of assignmentRows) {
    if (a.status === 'active') activeMentorAssignments = a.count;
    if (a.status === 'completed') completedMentorAssignments = a.count;
  }

  // 4. Milestones
  const milestoneRows = db.prepare(`
    SELECT m.status, COUNT(*) as count
    FROM milestones m
    JOIN projects p ON m.project_id = p.id
    WHERE p.institution_id = ?
    GROUP BY m.status
  `).all(instId) as Array<{ status: string; count: number }>;

  let totalMilestones = 0;
  let completedMilestones = 0;
  let activeMilestones = 0;
  for (const m of milestoneRows) {
    totalMilestones += m.count;
    if (m.status === 'completed') completedMilestones = m.count;
    if (m.status === 'active') activeMilestones = m.count;
  }

  // 5. Submissions
  const submissionRows = db.prepare(`
    SELECT ms.status, COUNT(*) as count
    FROM milestone_submissions ms
    JOIN milestones m ON ms.milestone_id = m.id
    JOIN projects p ON m.project_id = p.id
    WHERE p.institution_id = ?
    GROUP BY ms.status
  `).all(instId) as Array<{ status: string; count: number }>;

  let totalSubmissions = 0;
  let reviewedSubmissions = 0;
  let pendingSubmissions = 0;
  for (const s of submissionRows) {
    totalSubmissions += s.count;
    if (s.status === 'reviewed') reviewedSubmissions = s.count;
    if (s.status === 'submitted') pendingSubmissions = s.count;
  }

  // 6. Evaluations
  const evalRow = db.prepare(`
    SELECT COUNT(*) as count
    FROM evaluation_results er
    JOIN projects p ON er.project_id = p.id
    WHERE p.institution_id = ?
  `).get(instId) as { count: number };

  // 7. Feedback
  const feedbackRow = db.prepare(`
    SELECT COUNT(*) as count
    FROM mentor_feedback mf
    JOIN projects p ON mf.project_id = p.id
    WHERE p.institution_id = ?
  `).get(instId) as { count: number };

  res.json({
    report: {
      totalProjects,
      activeProjects: statusMap.active,
      completedProjects: statusMap.completed,
      draftProjects: statusMap.draft,
      archivedProjects: statusMap.archived,
      totalStudents: roleMap.student,
      totalMentors: roleMap.mentor,
      totalFaculty: roleMap.faculty,
      activeMentorAssignments,
      completedMentorAssignments,
      totalMilestones,
      completedMilestones,
      activeMilestones,
      totalSubmissions,
      reviewedSubmissions,
      pendingSubmissions,
      totalEvaluations: evalRow.count,
      totalFeedback: feedbackRow.count,
      projectBreakdown: [
        { status: 'Active', count: statusMap.active },
        { status: 'Completed', count: statusMap.completed },
        { status: 'Draft', count: statusMap.draft },
        { status: 'Archived', count: statusMap.archived },
      ],
    },
  });
});

export default router;
