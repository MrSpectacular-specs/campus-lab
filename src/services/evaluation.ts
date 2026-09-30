import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../lib/api';
import type { EvaluationCriterion, EvaluationResult, Profile } from '../lib/types';

export function useEvaluationCriteria(projectId: string | undefined) {
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCriteria = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ criteria: EvaluationCriterion[] }>(`/api/projects/${projectId}/evaluation`);
      setCriteria(data.criteria || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load evaluation rubric.');
      setCriteria([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchCriteria();
  }, [fetchCriteria]);

  const addCriterion = async (criterion: Partial<EvaluationCriterion>) => {
    if (!projectId) return { error: 'No project selected.' };
    try {
      await api.post(`/api/projects/${projectId}/evaluation/criteria`, criterion);
      await fetchCriteria();
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to add criterion.' };
    }
  };

  const updateCriterion = async (id: string, updates: Partial<EvaluationCriterion>) => {
    try {
      await api.patch(`/api/evaluation/criteria/${id}`, updates);
      await fetchCriteria();
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to update criterion.' };
    }
  };

  const deleteCriterion = async (id: string) => {
    try {
      await api.delete(`/api/evaluation/criteria/${id}`);
      await fetchCriteria();
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to delete criterion.' };
    }
  };

  return {
    criteria,
    loading,
    error,
    refetch: fetchCriteria,
    fetchCriteria,
    addCriterion,
    updateCriterion,
    deleteCriterion,
  };
}

export function useEvaluationResults(projectId: string | undefined) {
  const [results, setResults] = useState<
    (EvaluationResult & {
      criterion?: EvaluationCriterion;
      student?: Profile;
      evaluator?: Profile;
    })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{
        results: (EvaluationResult & {
          criterion?: EvaluationCriterion;
          student?: Profile;
          evaluator?: Profile;
        })[];
      }>(`/api/projects/${projectId}/evaluation`);
      setResults(data.results || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load evaluation results.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const submitEvaluation = async (result: Partial<EvaluationResult>) => {
    if (!projectId) return { data: null, error: 'No project selected.' };
    try {
      const res = await api.post<{ result: EvaluationResult }>(
        `/api/projects/${projectId}/evaluation/results`,
        result
      );
      await fetchResults();
      return { data: res.result, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to record evaluation score.' };
    }
  };

  return {
    results,
    loading,
    error,
    refetch: fetchResults,
    fetchResults,
    submitEvaluation,
  };
}
