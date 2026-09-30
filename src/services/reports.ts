import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../lib/api';

export interface ReportData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  draftProjects: number;
  archivedProjects: number;
  totalStudents: number;
  totalMentors: number;
  totalFaculty: number;
  activeMentorAssignments: number;
  completedMentorAssignments: number;
  totalMilestones: number;
  completedMilestones: number;
  activeMilestones: number;
  totalSubmissions: number;
  reviewedSubmissions: number;
  pendingSubmissions: number;
  totalEvaluations: number;
  totalFeedback: number;
  projectBreakdown: { status: string; count: number }[];
}

export function useReports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ report: ReportData }>('/api/reports');
      setData(res.report);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load institutional reports.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { data, loading, error, refetch: fetchReports };
}
