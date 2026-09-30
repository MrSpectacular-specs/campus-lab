export type UserRole = 'admin' | 'faculty' | 'mentor' | 'student';
export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';
export type MilestoneStatus = 'upcoming' | 'active' | 'completed';
export type SubmissionStatus = 'draft' | 'submitted' | 'reviewed' | 'revision_requested';
export type MentorAssignmentStatus = 'active' | 'completed' | 'removed';

export interface Institution {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  institution_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  code: string;
  description: string;
  category: string;
  problem_statement: string;
  status: ProjectStatus;
  difficulty: string;
  duration: string;
  domain: string;
  skills: string[];
  objectives: string[];
  expected_outcome: string;
  prerequisites: string[];
  institution_id: string;
  created_by: string;
  is_coordinator?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
}

export interface MentorAssignment {
  id: string;
  project_id: string;
  mentor_id: string;
  assigned_by: string | null;
  status: MentorAssignmentStatus;
  assigned_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  sequence: number;
  due_date: string | null;
  status: MilestoneStatus;
  created_at: string;
  updated_at: string;
}

export interface MilestoneSubmission {
  id: string;
  milestone_id: string;
  submitted_by: string;
  title: string;
  content: string;
  repository_url?: string | null;
  pr_url?: string | null;
  status: SubmissionStatus;
  submitted_at: string | null;
  updated_at: string;
}

export interface MentorFeedback {
  id: string;
  submission_id: string | null;
  milestone_id: string | null;
  project_id: string;
  mentor_id: string;
  feedback: string;
  created_at: string;
}

export interface EvaluationCriterion {
  id: string;
  project_id: string;
  criterion: string;
  description: string;
  max_score: number;
  weight: number;
  sequence: number;
}

export interface EvaluationResult {
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
