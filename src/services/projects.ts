import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../lib/api';
import type { Project, ProjectMember, Profile } from '../lib/types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ projects: Project[] }>('/api/projects');
      setProjects(data.projects || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to fetch projects.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (project: Partial<Project>) => {
    try {
      const res = await api.post<{ project: Project }>('/api/projects', project);
      setProjects((prev) => [res.project, ...prev]);
      return { data: res.project, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create project.' };
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const res = await api.patch<{ project: Project }>(`/api/projects/${id}`, updates);
      setProjects((prev) => prev.map((p) => (p.id === id ? res.project : p)));
      return { data: res.project, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update project.' };
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await api.delete(`/api/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to delete project.' };
    }
  };

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}

export function useProject(projectId: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<(ProjectMember & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [projData, membersData] = await Promise.all([
        api.get<{ project: Project }>(`/api/projects/${projectId}`),
        api.get<{ members: (ProjectMember & { profile?: Profile })[] }>(`/api/projects/${projectId}/members`),
      ]);
      setProject(projData.project);
      setMembers(membersData.members || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load project.');
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const addMember = async (_userId: string, _role: string) => {
    if (!projectId) return { error: 'No project selected.' };
    try {
      await api.post(`/api/projects/${projectId}/join`);
      await fetchProject();
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to join project.' };
    }
  };

  const removeMember = async (userId: string) => {
    if (!projectId) return { error: 'No project selected.' };
    try {
      await api.delete(`/api/projects/${projectId}/members/${userId}`);
      await fetchProject();
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to remove member.' };
    }
  };

  return {
    project,
    members,
    loading,
    error,
    refetch: fetchProject,
    fetchProject,
    addMember,
    removeMember,
  };
}

export function useMyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ projects: Project[] }>('/api/projects', { my: 'true' });
      setProjects(data.projects || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load enrolled projects.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyProjects();
  }, [fetchMyProjects]);

  return { projects, loading, error, refetch: fetchMyProjects };
}

export function useMentorProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMentorProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ projects: Project[] }>('/api/projects', { assigned: 'true' });
      setProjects(data.projects || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load assigned projects.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentorProjects();
  }, [fetchMentorProjects]);

  return { projects, loading, error, refetch: fetchMentorProjects };
}
