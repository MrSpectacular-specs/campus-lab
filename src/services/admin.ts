import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../lib/api';
import type { Milestone, ProjectMember } from '../lib/types';

export interface AdminMetrics {
  total_projects: number;
  active_projects: number;
  active_student_teams: number;
  active_mentors: number;
  pending_reviews: number;
  completed_evaluations: number;
}

export interface NeedsAttentionItem {
  type: 'UNASSIGNED_MENTOR' | 'PENDING_REVIEW' | 'NO_STUDENT_TEAM' | 'INCOMPLETE_EVALUATION' | 'OVERDUE_MILESTONE';
  project_id: string;
  project_code: string;
  project_title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface AdminProjectListItem {
  id: string;
  title: string;
  code: string;
  description: string;
  category: string;
  domain: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  difficulty: string;
  duration: string;
  coordinator: {
    id: string;
    name: string;
    email: string;
  };
  skills: string[];
  progress: {
    percent: number | null;
    completed_milestones: number;
    total_milestones: number;
  };
  team: {
    student_count: number;
    sample: Array<{ id: string; full_name: string; avatar_url: string | null }>;
  };
  mentor: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
  evaluation: {
    criteria_count: number;
    results_count: number;
  };
  last_activity: string;
  needs_attention: boolean;
  attention_reason: string | null;
}

export interface AdminProjectDetail {
  project: {
    id: string;
    title: string;
    code: string;
    description: string;
    category: string;
    problem_statement: string;
    objectives: string[];
    expected_outcome: string;
    prerequisites: string[];
    skills: string[];
    status: string;
    difficulty: string;
    duration: string;
    domain: string;
    created_by: string;
    coordinator: {
      id: string;
      name: string;
      email: string;
    };
    created_at: string;
    updated_at: string;
  };
  progress: {
    percent: number | null;
    completed_milestones: number;
    total_milestones: number;
    milestones: Array<Milestone & { submissions_count: number; reviewed_count: number; pending_count: number }>;
  };
  team: {
    members: Array<ProjectMember & { full_name: string; email: string; avatar_url: string | null }>;
    mentors: Array<{ id: string; mentor_id: string; full_name: string; email: string; avatar_url: string | null; status: string; assigned_at: string }>;
  };
  submissions: {
    total: number;
    pending: number;
    reviewed: number;
    items: Array<{
      id: string;
      milestone_id: string;
      submitted_by: string;
      title: string;
      content: string;
      status: string;
      submitted_at: string | null;
      milestone_title: string;
      milestone_sequence: number;
      student_name: string;
    }>;
  };
  evaluation: {
    criteria: Array<{ id: string; criterion: string; description: string; max_score: number; weight: number; sequence: number }>;
    results: Array<{ id: string; criterion_id: string; score: number; feedback: string; student_name: string; criterion_name: string; max_score: number; created_at: string }>;
    average_score: number | null;
  };
  timeline: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
    actor?: string;
  }>;
}

export interface AdminLicenseData {
  institution: {
    id: string;
    name: string;
  };
  license: {
    plan: string;
    status: 'active' | 'expiring' | 'expired' | 'suspended';
    billing_cycle: string;
    value: string;
    start_date: string | null;
    end_date: string | null;
    remaining_days: number | null;
  };
  capacities: {
    student_capacity: number | null;
    mentor_capacity: number | null;
    project_capacity: number | null;
  };
  usage: {
    total_projects: number;
    active_projects: number;
    enrolled_students: number;
    active_mentors: number;
    total_mentor_assignments: number;
    faculty_coordinators: number;
    recorded_submissions: number;
    recorded_evaluations: number;
  };
}

export function useAdminOverview() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [needsAttention, setNeedsAttention] = useState<NeedsAttentionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ metrics: AdminMetrics; needs_attention: NeedsAttentionItem[] }>('/api/admin/overview');
      setMetrics(res.metrics);
      setNeedsAttention(res.needs_attention || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load admin overview.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { metrics, needsAttention, loading, error, refetch: fetchOverview };
}

export function useAdminProjects(filters: { status?: string; category?: string; health?: string; search?: string }) {
  const [projects, setProjects] = useState<AdminProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ projects: AdminProjectListItem[] }>('/api/admin/projects', filters);
      setProjects(res.projects || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load projects pipeline.');
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.category, filters.health, filters.search]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
}

export function useAdminProjectDetail(projectId: string | null) {
  const [detail, setDetail] = useState<AdminProjectDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!projectId) {
      setDetail(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<AdminProjectDetail>(`/api/admin/projects/${projectId}/detail`);
      setDetail(res);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load project details.');
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { detail, loading, error, refetch: fetchDetail };
}

export function useAdminLicense() {
  const [data, setData] = useState<AdminLicenseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLicense = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<AdminLicenseData>('/api/admin/license');
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load license details.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLicense();
  }, [fetchLicense]);

  return { data, loading, error, refetch: fetchLicense };
}
