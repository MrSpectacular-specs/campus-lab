import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../lib/api';
import type { Milestone, MilestoneSubmission } from '../lib/types';

export function useMilestones(projectId: string | undefined) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ milestones: Milestone[] }>(`/api/projects/${projectId}/milestones`);
      setMilestones(data.milestones || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load milestones.');
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const createMilestone = async (milestone: Partial<Milestone>) => {
    if (!projectId) return { data: null, error: 'No project specified.' };
    try {
      const res = await api.post<{ milestone: Milestone }>(`/api/projects/${projectId}/milestones`, milestone);
      await fetchMilestones();
      return { data: res.milestone, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create milestone.' };
    }
  };

  const updateMilestone = async (id: string, updates: Partial<Milestone>) => {
    try {
      const res = await api.patch<{ milestone: Milestone }>(`/api/milestones/${id}`, updates);
      await fetchMilestones();
      return { data: res.milestone, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update milestone.' };
    }
  };

  const deleteMilestone = async (id: string) => {
    try {
      await api.delete(`/api/milestones/${id}`);
      await fetchMilestones();
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to delete milestone.' };
    }
  };

  return {
    milestones,
    loading,
    error,
    refetch: fetchMilestones,
    fetchMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
  };
}

export function useSubmissions(milestoneId: string | undefined) {
  const [submissions, setSubmissions] = useState<MilestoneSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!milestoneId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ submissions: MilestoneSubmission[] }>(`/api/milestones/${milestoneId}/submissions`);
      setSubmissions(data.submissions || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load submissions.');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [milestoneId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const createSubmission = async (submission: Partial<MilestoneSubmission>) => {
    if (!milestoneId) return { data: null, error: 'No milestone specified.' };
    try {
      const res = await api.post<{ submission: MilestoneSubmission }>(`/api/milestones/${milestoneId}/submissions`, submission);
      await fetchSubmissions();
      return { data: res.submission, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to submit deliverable.' };
    }
  };

  const updateSubmission = async (id: string, updates: Partial<MilestoneSubmission>) => {
    try {
      const res = await api.patch<{ submission: MilestoneSubmission }>(`/api/submissions/${id}`, updates);
      await fetchSubmissions();
      return { data: res.submission, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update submission.' };
    }
  };

  return {
    submissions,
    loading,
    error,
    refetch: fetchSubmissions,
    fetchSubmissions,
    createSubmission,
    updateSubmission,
  };
}

export function useProjectSubmissions(projectId: string | undefined) {
  const [submissions, setSubmissions] = useState<
    (MilestoneSubmission & { milestone?: Milestone })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectSubmissions = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ submissions: (MilestoneSubmission & { milestone?: Milestone })[] }>(
        `/api/projects/${projectId}/submissions`
      );
      setSubmissions(data.submissions || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load project deliverables.');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectSubmissions();
  }, [fetchProjectSubmissions]);

  return { submissions, loading, error, refetch: fetchProjectSubmissions };
}
