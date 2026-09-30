import { Router, type Request, type Response } from 'express';
import { db } from '../db/database';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Strictly guard all admin endpoints: must be authenticated and have role = 'admin'
router.use(requireAuth, requireRole('admin'));

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
 * GET /api/admin/overview
 * Interactive institutional control center overview metrics & data-driven attention alerts
 */
router.get('/overview', (req: Request, res: Response) => {
  const instId = req.user!.institution_id;
  if (!instId) {
    res.status(400).json({ error: 'User does not belong to an institution.' });
    return;
  }

  // 1. Total Projects
  const totalProjectsRow = db.prepare('SELECT COUNT(*) as count FROM projects WHERE institution_id = ?').get(instId) as { count: number };
  const totalProjects = totalProjectsRow.count;

  // 2. Active Projects
  const activeProjectsRow = db.prepare("SELECT COUNT(*) as count FROM projects WHERE institution_id = ? AND status = 'active'").get(instId) as { count: number };
  const activeProjects = activeProjectsRow.count;

  // 3. Active Student Teams (Distinct students enrolled in projects)
  const activeStudentsRow = db.prepare(`
    SELECT COUNT(DISTINCT pm.user_id) as count
    FROM project_members pm
    JOIN projects p ON pm.project_id = p.id
    WHERE p.institution_id = ?
  `).get(instId) as { count: number };
  const activeStudentTeams = activeStudentsRow.count;

  // 4. Active Mentors (Distinct mentors assigned to projects)
  const activeMentorsRow = db.prepare(`
    SELECT COUNT(DISTINCT ma.mentor_id) as count
    FROM mentor_assignments ma
    JOIN projects p ON ma.project_id = p.id
    WHERE p.institution_id = ? AND ma.status = 'active'
  `).get(instId) as { count: number };
  const activeMentors = activeMentorsRow.count;

  // 5. Pending Reviews (Submissions with status = 'submitted')
  const pendingReviewsRow = db.prepare(`
    SELECT COUNT(*) as count
    FROM milestone_submissions ms
    JOIN milestones m ON ms.milestone_id = m.id
    JOIN projects p ON m.project_id = p.id
    WHERE p.institution_id = ? AND ms.status = 'submitted'
  `).get(instId) as { count: number };
  const pendingReviews = pendingReviewsRow.count;

  // 6. Completed Evaluations
  const completedEvalsRow = db.prepare(`
    SELECT COUNT(*) as count
    FROM evaluation_results er
    JOIN projects p ON er.project_id = p.id
    WHERE p.institution_id = ?
  `).get(instId) as { count: number };
  const completedEvaluations = completedEvalsRow.count;

  // 7. Data-Driven "Needs Attention" Area
  // Find projects with real operational bottlenecks directly from SQLite records
  const allProjects = db.prepare(`
    SELECT id, code, title, status
    FROM projects
    WHERE institution_id = ?
  `).all(instId) as Array<{ id: string; code: string; title: string; status: string }>;

  const needsAttention: Array<{
    type: 'UNASSIGNED_MENTOR' | 'PENDING_REVIEW' | 'NO_STUDENT_TEAM' | 'INCOMPLETE_EVALUATION' | 'OVERDUE_MILESTONE';
    project_id: string;
    project_code: string;
    project_title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
  }> = [];

  for (const p of allProjects) {
    // Check: Unassigned Mentor on active project
    if (p.status === 'active') {
      const mentorAssign = db.prepare("SELECT id FROM mentor_assignments WHERE project_id = ? AND status = 'active'").get(p.id);
      if (!mentorAssign) {
        needsAttention.push({
          type: 'UNASSIGNED_MENTOR',
          project_id: p.id,
          project_code: p.code,
          project_title: p.title,
          description: 'Active project currently has no supervising mentor allocated.',
          severity: 'high',
        });
      }

      // Check: Empty team
      const memberCount = db.prepare('SELECT COUNT(*) as count FROM project_members WHERE project_id = ?').get(p.id) as { count: number };
      if (memberCount.count === 0) {
        needsAttention.push({
          type: 'NO_STUDENT_TEAM',
          project_id: p.id,
          project_code: p.code,
          project_title: p.title,
          description: 'Project is active in library but has no enrolled student members.',
          severity: 'medium',
        });
      }

      // Check: Submissions awaiting review
      const pendingSub = db.prepare(`
        SELECT COUNT(*) as count
        FROM milestone_submissions ms
        JOIN milestones m ON ms.milestone_id = m.id
        WHERE m.project_id = ? AND ms.status = 'submitted'
      `).get(p.id) as { count: number };

      if (pendingSub.count > 0) {
        needsAttention.push({
          type: 'PENDING_REVIEW',
          project_id: p.id,
          project_code: p.code,
          project_title: p.title,
          description: `${pendingSub.count} student deliverable submission(s) awaiting mentor checkpoint review.`,
          severity: 'high',
        });
      }
    }
  }

  res.json({
    metrics: {
      total_projects: totalProjects,
      active_projects: activeProjects,
      active_student_teams: activeStudentTeams,
      active_mentors: activeMentors,
      pending_reviews: pendingReviews,
      completed_evaluations: completedEvaluations,
    },
    needs_attention: needsAttention,
  });
});

/**
 * GET /api/admin/projects
 * Operational pipeline table with computed progress, member counts, mentor info, and activity
 */
router.get('/projects', (req: Request, res: Response) => {
  const instId = req.user!.institution_id;
  if (!instId) {
    res.status(400).json({ error: 'User does not belong to an institution.' });
    return;
  }

  const { status, category, health, search } = req.query;

  let sql = `
    SELECT p.*, u.full_name as coordinator_name, u.email as coordinator_email
    FROM projects p
    JOIN users u ON p.created_by = u.id
    WHERE p.institution_id = ?
  `;
  const params: unknown[] = [instId];

  if (status && typeof status === 'string' && status !== 'ALL') {
    sql += ' AND LOWER(p.status) = LOWER(?)';
    params.push(status);
  }

  if (category && typeof category === 'string' && category !== 'ALL') {
    if (category === 'AI / ML') {
      sql += " AND (p.domain LIKE '%AI%' OR p.domain LIKE '%NLP%' OR p.domain LIKE '%Vision%' OR p.category = 'AI / ML')";
    } else if (category === 'FINTECH') {
      sql += " AND (p.domain LIKE '%FinTech%' OR p.category = 'FINTECH')";
    } else if (category === 'SYSTEMS') {
      sql += " AND (p.domain LIKE '%Systems%' OR p.domain LIKE '%Logistics%' OR p.category = 'SYSTEMS')";
    } else if (category === 'IOT') {
      sql += " AND (p.domain LIKE '%IoT%' OR p.domain LIKE '%Grid%' OR p.category = 'IOT')";
    } else {
      sql += ' AND p.category = ?';
      params.push(category);
    }
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    sql += ' AND (LOWER(p.title) LIKE ? OR LOWER(p.code) LIKE ? OR LOWER(p.domain) LIKE ?)';
    params.push(q, q, q);
  }

  sql += ' ORDER BY p.created_at DESC';

  const projects = db.prepare(sql).all(...params) as Array<{
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
    coordinator_name: string;
    coordinator_email: string;
  }>;

  // Enrich each project with computed operational metrics
  const enriched = projects.map((p) => {
    // Milestones & progress
    const milestoneCounts = db.prepare(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM milestones
      WHERE project_id = ?
    `).get(p.id) as { total: number; completed: number };

    const totalMilestones = milestoneCounts.total;
    const completedMilestones = milestoneCounts.completed || 0;
    const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : null;

    // Student team count & sample
    const studentMembers = db.prepare(`
      SELECT u.id, u.full_name, u.avatar_url
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
      LIMIT 4
    `).all(p.id) as Array<{ id: string; full_name: string; avatar_url: string | null }>;

    const totalStudents = (db.prepare('SELECT COUNT(*) as count FROM project_members WHERE project_id = ?').get(p.id) as { count: number }).count;

    // Assigned mentor
    const assignedMentor = db.prepare(`
      SELECT u.id, u.full_name, u.avatar_url, ma.status
      FROM mentor_assignments ma
      JOIN users u ON ma.mentor_id = u.id
      WHERE ma.project_id = ? AND ma.status = 'active'
      LIMIT 1
    `).get(p.id) as { id: string; full_name: string; avatar_url: string | null; status: string } | undefined;

    // Evaluation count
    const evalCounts = db.prepare(`
      SELECT (SELECT COUNT(*) FROM evaluation_criteria WHERE project_id = ?) as criteria_count,
             (SELECT COUNT(*) FROM evaluation_results WHERE project_id = ?) as results_count
    `).get(p.id, p.id) as { criteria_count: number; results_count: number };

    // Submissions awaiting review
    const pendingSubs = (db.prepare(`
      SELECT COUNT(*) as count
      FROM milestone_submissions ms
      JOIN milestones m ON ms.milestone_id = m.id
      WHERE m.project_id = ? AND ms.status = 'submitted'
    `).get(p.id) as { count: number }).count;

    // Health check
    let needsAttention = false;
    let attentionReason: string | null = null;

    if (p.status === 'active') {
      if (!assignedMentor) {
        needsAttention = true;
        attentionReason = 'Unassigned Mentor';
      } else if (pendingSubs > 0) {
        needsAttention = true;
        attentionReason = `${pendingSubs} Review(s) Pending`;
      } else if (totalStudents === 0) {
        needsAttention = true;
        attentionReason = 'No Students Enrolled';
      }
    }

    return {
      id: p.id,
      title: p.title,
      code: p.code,
      description: p.description,
      category: p.category,
      domain: p.domain,
      status: p.status,
      difficulty: p.difficulty,
      duration: p.duration,
      coordinator: {
        id: p.created_by,
        name: p.coordinator_name,
        email: p.coordinator_email,
      },
      skills: parseJsonArray(p.skills),
      progress: {
        percent: progressPercent,
        completed_milestones: completedMilestones,
        total_milestones: totalMilestones,
      },
      team: {
        student_count: totalStudents,
        sample: studentMembers,
      },
      mentor: assignedMentor
        ? {
            id: assignedMentor.id,
            name: assignedMentor.full_name,
            avatar_url: assignedMentor.avatar_url,
          }
        : null,
      evaluation: {
        criteria_count: evalCounts.criteria_count,
        results_count: evalCounts.results_count,
      },
      last_activity: p.updated_at,
      needs_attention: needsAttention,
      attention_reason: attentionReason,
    };
  });

  // Filter by health if specified
  let result = enriched;
  if (health === 'attention') {
    result = result.filter((p) => p.needs_attention);
  } else if (health === 'on_track') {
    result = result.filter((p) => !p.needs_attention && p.status === 'active');
  } else if (health === 'unassigned_mentor') {
    result = result.filter((p) => !p.mentor && p.status === 'active');
  }

  res.json({ projects: result });
});

/**
 * GET /api/admin/projects/:id/detail
 * Complete operational breakdown of a project for admin inspection drawer
 */
interface DetailedProjectRow {
  id: string;
  title: string;
  code: string;
  description: string;
  category: string;
  problem_statement: string;
  objectives: string;
  expected_outcome: string;
  prerequisites: string;
  skills: string;
  status: string;
  difficulty: string;
  duration: string;
  domain: string;
  created_by: string;
  coordinator_name: string;
  coordinator_email: string;
  created_at: string;
  updated_at: string;
}

interface DetailedMilestoneRow {
  id: string;
  project_id: string;
  title: string;
  description: string;
  sequence: number;
  due_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  submissions_count: number;
  reviewed_count: number;
  pending_count: number;
}

interface DetailedMemberRow {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface DetailedMentorRow {
  id: string;
  mentor_id: string;
  assigned_by: string | null;
  status: string;
  assigned_at: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface DetailedSubmissionRow {
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
  milestone_title: string;
  milestone_sequence: number;
  student_name: string;
}

interface DetailedResultRow {
  id: string;
  criterion_id: string;
  project_id: string;
  student_id: string;
  evaluator_id: string;
  score: number;
  feedback: string;
  created_at: string;
  updated_at: string;
  criterion_name: string;
  max_score: number;
  weight: number;
  student_name: string;
}

interface InstitutionRow {
  id: string;
  name: string;
  license_plan: string;
  license_status: string;
  billing_cycle: string;
  license_value: string;
  license_start: string | null;
  license_end: string | null;
  student_capacity: number | null;
  mentor_capacity: number | null;
  project_capacity: number | null;
  created_at: string;
  updated_at: string;
}

router.get('/projects/:id/detail', (req: Request, res: Response) => {
  const instId = req.user!.institution_id;
  const project = db.prepare(`
    SELECT p.*, u.full_name as coordinator_name, u.email as coordinator_email
    FROM projects p
    JOIN users u ON p.created_by = u.id
    WHERE p.id = ? AND p.institution_id = ?
  `).get(req.params.id, instId) as DetailedProjectRow | undefined;

  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  // 1. Milestones with submission and review states
  const milestones = db.prepare(`
    SELECT m.*,
           (SELECT COUNT(*) FROM milestone_submissions WHERE milestone_id = m.id) as submissions_count,
           (SELECT COUNT(*) FROM milestone_submissions WHERE milestone_id = m.id AND status = 'reviewed') as reviewed_count,
           (SELECT COUNT(*) FROM milestone_submissions WHERE milestone_id = m.id AND status = 'submitted') as pending_count
    FROM milestones m
    WHERE m.project_id = ?
    ORDER BY m.sequence ASC
  `).all(project.id) as DetailedMilestoneRow[];
  const completedMilestones = milestones.filter((m) => m.status === 'completed').length;
  const progressPercent = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : null;

  // 2. Team Members
  const members = db.prepare(`
    SELECT pm.id, pm.user_id, pm.role, pm.joined_at, u.full_name, u.email, u.avatar_url
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
    ORDER BY pm.joined_at ASC
  `).all(project.id) as DetailedMemberRow[];

  // 3. Mentors
  const mentors = db.prepare(`
    SELECT ma.id, ma.mentor_id, ma.assigned_by, ma.status, ma.assigned_at, u.full_name, u.email, u.avatar_url
    FROM mentor_assignments ma
    JOIN users u ON ma.mentor_id = u.id
    WHERE ma.project_id = ?
  `).all(project.id) as DetailedMentorRow[];
  // 4. Submissions Table
  const submissions = db.prepare(`
    SELECT s.*, m.title as milestone_title, m.sequence as milestone_sequence, u.full_name as student_name
    FROM milestone_submissions s
    JOIN milestones m ON s.milestone_id = m.id
    JOIN users u ON s.submitted_by = u.id
    WHERE m.project_id = ?
    ORDER BY s.updated_at DESC
  `).all(project.id) as DetailedSubmissionRow[];
  // 5. Evaluation Criteria & Average Score
  const criteria = db.prepare('SELECT * FROM evaluation_criteria WHERE project_id = ? ORDER BY sequence ASC').all(project.id);
  const results = db.prepare(`
    SELECT er.*, ec.criterion as criterion_name, ec.max_score, ec.weight, u.full_name as student_name
    FROM evaluation_results er
    JOIN evaluation_criteria ec ON er.criterion_id = ec.id
    JOIN users u ON er.student_id = u.id
    WHERE er.project_id = ?
  `).all(project.id) as DetailedResultRow[];

  let averageScore: number | null = null;
  if (results.length > 0) {
    const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0);
    averageScore = Number((totalScore / results.length).toFixed(1));
  }

  // 6. Chronological Activity Timeline from Real Timestamps
  const timeline: Array<{ id: string; type: string; title: string; timestamp: string; actor?: string }> = [];

  // Project Created
  timeline.push({
    id: `ev-create-${project.id}`,
    type: 'PROJECT_CREATED',
    title: `Project brief created by ${project.coordinator_name}`,
    timestamp: project.created_at,
    actor: project.coordinator_name,
  });

  // Students Joined
  for (const m of members) {
    timeline.push({
      id: `ev-join-${m.id}`,
      type: 'STUDENT_JOINED',
      title: `${m.full_name} enrolled in project team`,
      timestamp: m.joined_at,
      actor: m.full_name,
    });
  }

  // Mentors Assigned
  for (const a of mentors) {
    timeline.push({
      id: `ev-mentor-${a.id}`,
      type: 'MENTOR_ASSIGNED',
      title: `${a.full_name} assigned as project supervisor`,
      timestamp: a.assigned_at,
      actor: a.full_name,
    });
  }

  // Submissions
  for (const s of submissions) {
    if (s.submitted_at) {
      timeline.push({
        id: `ev-sub-${s.id}`,
        type: 'SUBMISSION_RECEIVED',
        title: `${s.student_name} submitted deliverable for Sprint ${s.milestone_sequence}`,
        timestamp: s.submitted_at,
        actor: s.student_name,
      });
    }
  }

  // Evaluations
  for (const r of results) {
    timeline.push({
      id: `ev-eval-${r.id}`,
      type: 'EVALUATION_SCORED',
      title: `Rubric score recorded for ${r.student_name}: ${r.score}/${r.max_score}`,
      timestamp: r.created_at,
    });
  }
  // Sort timeline newest first
  timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({
    project: {
      id: project.id,
      title: project.title,
      code: project.code,
      description: project.description,
      category: project.category,
      problem_statement: project.problem_statement,
      objectives: parseJsonArray(project.objectives),
      expected_outcome: project.expected_outcome,
      prerequisites: parseJsonArray(project.prerequisites),
      skills: parseJsonArray(project.skills),
      status: project.status,
      difficulty: project.difficulty,
      duration: project.duration,
      domain: project.domain,
      created_by: project.created_by,
      coordinator: {
        id: project.created_by,
        name: project.coordinator_name,
        email: project.coordinator_email,
      },
      created_at: project.created_at,
      updated_at: project.updated_at,
    },
    progress: {
      percent: progressPercent,
      completed_milestones: completedMilestones,
      total_milestones: milestones.length,
      milestones,
    },
    team: {
      members,
      mentors,
    },
    submissions: {
      total: submissions.length,
      pending: submissions.filter((s: any) => s.status === 'submitted').length,
      reviewed: submissions.filter((s: any) => s.status === 'reviewed').length,
      items: submissions,
    },
    evaluation: {
      criteria,
      results,
      average_score: averageScore,
    },
    timeline,
  });
});

/**
 * GET /api/admin/license
 * Institution license details & platform capacity utilization metrics
 * STRICTLY ADMIN ONLY
 */
router.get('/license', (req: Request, res: Response) => {
  const instId = req.user!.institution_id;
  if (!instId) {
    res.status(400).json({ error: 'User does not belong to an institution.' });
    return;
  }

  const institution = db.prepare('SELECT * FROM institutions WHERE id = ?').get(instId) as InstitutionRow | undefined;
  if (!institution) {
    res.status(404).json({ error: 'Institution not found.' });
    return;
  }

  // Calculate platform usage from SQLite records
  const totalProjects = (db.prepare('SELECT COUNT(*) as count FROM projects WHERE institution_id = ?').get(instId) as { count: number }).count;
  const activeProjects = (db.prepare("SELECT COUNT(*) as count FROM projects WHERE institution_id = ? AND status = 'active'").get(instId) as { count: number }).count;
  const enrolledStudents = (db.prepare(`
    SELECT COUNT(DISTINCT pm.user_id) as count
    FROM project_members pm
    JOIN projects p ON pm.project_id = p.id
    WHERE p.institution_id = ?
  `).get(instId) as { count: number }).count;

  const activeMentors = (db.prepare(`
    SELECT COUNT(DISTINCT ma.mentor_id) as count
    FROM mentor_assignments ma
    JOIN projects p ON ma.project_id = p.id
    WHERE p.institution_id = ? AND ma.status = 'active'
  `).get(instId) as { count: number }).count;

  const totalMentorAssignments = (db.prepare(`
    SELECT COUNT(*) as count
    FROM mentor_assignments ma
    JOIN projects p ON ma.project_id = p.id
    WHERE p.institution_id = ?
  `).get(instId) as { count: number }).count;

  const facultyCoordinators = (db.prepare("SELECT COUNT(*) as count FROM users WHERE institution_id = ? AND role = 'faculty'").get(instId) as { count: number }).count;

  const recordedSubmissions = (db.prepare(`
    SELECT COUNT(*) as count
    FROM milestone_submissions ms
    JOIN milestones m ON ms.milestone_id = m.id
    JOIN projects p ON m.project_id = p.id
    WHERE p.institution_id = ?
  `).get(instId) as { count: number }).count;

  const recordedEvaluations = (db.prepare(`
    SELECT COUNT(*) as count
    FROM evaluation_results er
    JOIN projects p ON er.project_id = p.id
    WHERE p.institution_id = ?
  `).get(instId) as { count: number }).count;

  // Calculate remaining days if license_end is set
  let remainingDays: number | null = null;
  let licenseDisplayStatus = institution.license_status || 'active';

  if (institution.license_end) {
    const end = new Date(institution.license_end).getTime();
    const now = Date.now();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    remainingDays = diff > 0 ? diff : 0;
    if (diff <= 0) {
      licenseDisplayStatus = 'expired';
    } else if (diff <= 30) {
      licenseDisplayStatus = 'expiring';
    }
  }

  res.json({
    institution: {
      id: institution.id,
      name: institution.name,
    },
    license: {
      plan: institution.license_plan || 'Institutional License',
      status: licenseDisplayStatus,
      billing_cycle: institution.billing_cycle || 'Annual',
      value: institution.license_value || '₹2,40,000 / year',
      start_date: institution.license_start || null,
      end_date: institution.license_end || null,
      remaining_days: remainingDays,
    },
    capacities: {
      student_capacity: institution.student_capacity ?? null,
      mentor_capacity: institution.mentor_capacity ?? null,
      project_capacity: institution.project_capacity ?? null,
    },
    usage: {
      total_projects: totalProjects,
      active_projects: activeProjects,
      enrolled_students: enrolledStudents,
      active_mentors: activeMentors,
      total_mentor_assignments: totalMentorAssignments,
      faculty_coordinators: facultyCoordinators,
      recorded_submissions: recordedSubmissions,
      recorded_evaluations: recordedEvaluations,
    },
  });
});
/**
 * GET /api/admin/mentors
 * Returns all mentors in institution, active workload, and unassigned projects
 */
router.get('/mentors', (req: Request, res: Response) => {
  const instId = req.user!.institution_id;
  if (!instId) {
    res.status(400).json({ error: 'User does not belong to an institution.' });
    return;
  }

  const mentors = db.prepare(`
    SELECT u.id, u.email, u.full_name, u.avatar_url, u.created_at,
           (SELECT COUNT(*) FROM mentor_assignments ma WHERE ma.mentor_id = u.id AND ma.status = 'active') as active_assignments_count
    FROM users u
    WHERE u.role = 'mentor' AND u.institution_id = ?
    ORDER BY active_assignments_count DESC, u.full_name ASC
  `).all(instId) as Array<{
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    created_at: string;
    active_assignments_count: number;
  }>;

  // Unassigned projects
  const unassignedProjects = db.prepare(`
    SELECT p.id, p.code, p.title, p.domain, p.status
    FROM projects p
    WHERE p.institution_id = ? AND p.status = 'active'
      AND p.id NOT IN (SELECT project_id FROM mentor_assignments WHERE status = 'active')
  `).all(instId) as Array<{ id: string; code: string; title: string; domain: string; status: string }>;

  res.json({
    mentors,
    unassigned_projects: unassignedProjects,
  });
});

/**
 * GET /api/admin/evaluation
 * Projects with rubric criteria, evaluation status, and scored defense results
 */
router.get('/evaluation', (req: Request, res: Response) => {
  const instId = req.user!.institution_id;
  if (!instId) {
    res.status(400).json({ error: 'User does not belong to an institution.' });
    return;
  }

  const projects = db.prepare(`
    SELECT p.id, p.code, p.title, p.domain, p.status,
           u.full_name as coordinator_name,
           (SELECT COUNT(*) FROM evaluation_criteria ec WHERE ec.project_id = p.id) as criteria_count,
           (SELECT COUNT(*) FROM evaluation_results er WHERE er.project_id = p.id) as results_count,
           (SELECT AVG(er.score) FROM evaluation_results er WHERE er.project_id = p.id) as avg_score
    FROM projects p
    JOIN users u ON p.created_by = u.id
    WHERE p.institution_id = ?
    ORDER BY results_count DESC, p.created_at DESC
  `).all(instId) as Array<{
    id: string;
    code: string;
    title: string;
    domain: string;
    status: string;
    coordinator_name: string;
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
