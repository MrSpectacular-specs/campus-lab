import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../lib/api';
import type { MentorAssignment, MentorFeedback, Profile } from '../lib/types';

export function useMentorAssignments(projectId: string | undefined) {
  const [assignments, setAssignments] = useState<(MentorAssignment & { mentor?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ assignments: (MentorAssignment & { mentor?: Profile })[] }>(
        `/api/projects/${projectId}/mentors`
      );
      setAssignments(data.assignments || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load mentor assignments.');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const assignMentor = async (mentorId: string, _assignedBy: string) => {
    if (!projectId) return { error: 'No project selected.' };
    try {
      await api.post(`/api/projects/${projectId}/mentors`, { mentor_id: mentorId });
      await fetchAssignments();
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to assign mentor.' };
    }
  };

  const removeAssignment = async (mentorId: string) => {
    if (!projectId) return { error: 'No project selected.' };
    try {
      await api.delete(`/api/projects/${projectId}/mentors/${mentorId}`);
      await fetchAssignments();
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to remove mentor assignment.' };
    }
  };

  return {
    assignments,
    loading,
    error,
    refetch: fetchAssignments,
    fetchAssignments,
    assignMentor,
    removeAssignment,
  };
}

export function useMentorFeedback(projectId: string | undefined) {
  const [feedback, setFeedback] = useState<(MentorFeedback & { mentor?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ feedback: (MentorFeedback & { mentor?: Profile })[] }>(
        `/api/projects/${projectId}/feedback`
      );
      setFeedback(data.feedback || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load mentor feedback.');
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const addFeedback = async (fb: Partial<MentorFeedback>) => {
    if (!projectId) return { data: null, error: 'No project selected.' };
    try {
      const res = await api.post<{ feedback: MentorFeedback }>(`/api/projects/${projectId}/feedback`, fb);
      await fetchFeedback();
      return { data: res.feedback, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to submit mentor feedback.' };
    }
  };

  return {
    feedback,
    loading,
    error,
    refetch: fetchFeedback,
    fetchFeedback,
    addFeedback,
  };
}

export function useAvailableMentors(_institutionId: string | undefined) {
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ mentors: Profile[] }>('/api/mentors/available');
      setMentors(data.mentors || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load available mentors.');
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  return { mentors, loading, error, refetch: fetchMentors };
}
