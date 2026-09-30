import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Award,
  AlertTriangle,
  Plus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { api, ApiError } from '../../lib/api';
import { Button } from '../../components/Button';
import { SecondaryButton } from '../../components/SecondaryButton';
import { Modal } from '../../components/Modal';
import { Navbar } from '../../components/Navbar';
import { PrismFoldBackground } from '../../components/PrismFoldBackground';
import { ViewportSection } from '../../components/ViewportSection';
import { PageProgress, type ProgressItem } from '../../components/PageProgress';

const PROGRESS_ITEMS: ProgressItem[] = [
  { id: 'sec-mentor-overview', label: 'Overview' },
  { id: 'sec-unassigned', label: 'Unassigned' },
  { id: 'sec-roster', label: 'Roster' },
];

interface AdminMentorItem {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  active_assignments_count: number;
}

interface UnassignedProjectItem {
  id: string;
  code: string;
  title: string;
  domain: string;
  status: string;
}

export const AdminMentoring: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [mentors, setMentors] = useState<AdminMentorItem[]>([]);
  const [unassignedProjects, setUnassignedProjects] = useState<UnassignedProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assign Mentor Modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState('');
  const [targetMentorId, setTargetMentorId] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);

  const fetchMentorsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{
        mentors: AdminMentorItem[];
        unassigned_projects: UnassignedProjectItem[];
      }>('/api/admin/mentors');
      setMentors(res.mentors || []);
      setUnassignedProjects(res.unassigned_projects || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load mentor network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorsData();
  }, []);

  const handleOpenAssignModal = (projId?: string) => {
    setTargetProjectId(projId || unassignedProjects[0]?.id || '');
    setTargetMentorId(mentors[0]?.id || '');
    setAssignSuccess(false);
    setAssignModalOpen(true);
  };

  const handleAssignMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProjectId || !targetMentorId) return;
    setAssignSubmitting(true);

    try {
      await api.post(`/api/projects/${targetProjectId}/mentors`, {
        mentor_id: targetMentorId,
      });
      setAssignSuccess(true);
      fetchMentorsData();
      setTimeout(() => {
        setAssignModalOpen(false);
        setAssignSuccess(false);
      }, 1200);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to assign mentor.');
    } finally {
      setAssignSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-brand-teal/20 selection:text-brand-teal-light relative">
      <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-40" />
      <Navbar />
      <PageProgress items={PROGRESS_ITEMS} />

      <main className="flex-1 w-full relative z-10 pt-16 sm:pt-[68px]">
        <ViewportSection id="sec-mentor-overview" label="Mentoring Administration">
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
                  Supervising Mentor Network & Allocation
                </h1>
                <p className="text-xs text-[#888888] mt-1 font-sans">
                  Manage practitioner allocations, monitor mentor workloads, and resolve unassigned cohort bottlenecks.
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => handleOpenAssignModal()}
                disabled={unassignedProjects.length === 0 || mentors.length === 0}
              >
                Assign Mentor
              </Button>
            </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07] space-y-1">
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
              Active Mentors
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {loading ? '…' : mentors.length}
            </span>
            <span className="text-[10px] font-mono text-brand-teal-light block">
              Registered practitioner roster
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07] space-y-1">
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
              Active Project Allocations
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {loading ? '…' : mentors.reduce((sum, m) => sum + m.active_assignments_count, 0)}
            </span>
            <span className="text-[10px] font-mono text-[#888888] block">
              Total active assignments
            </span>
          </div>

          <div className={`p-4 rounded-xl border space-y-1 ${
            unassignedProjects.length > 0
              ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
              : 'bg-[#0D0D0D] border-white/[0.07]'
          }`}>
            <span className="text-[10px] font-mono uppercase tracking-wider block">
              Unassigned Cohorts
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono">
              {loading ? '…' : unassignedProjects.length}
            </span>
            <span className="text-[10px] font-mono block">
              {unassignedProjects.length > 0 ? 'Requires mentor allocation' : '100% Mentoring coverage'}
            </span>
          </div>
        </div>

        {/* Unassigned Projects Alert Area */}
        {unassignedProjects.length > 0 && (
          <div className="p-5 rounded-xl bg-yellow-500/10 border border-yellow-500/25 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <h3 className="font-mono text-xs uppercase font-bold text-yellow-400">
                Active Projects Lacking Supervising Mentor ({unassignedProjects.length})
              </h3>
            </div>
            <p className="text-xs text-yellow-300/80 font-sans leading-relaxed">
              These active engineering cohorts are currently executing sprints without an assigned industry supervisor.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {unassignedProjects.map((p) => (
                <div key={p.id} className="p-3.5 rounded-lg bg-black/50 border border-yellow-500/20 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-brand-teal-light">{p.code}</span>
                    <div className="font-medium text-xs text-white line-clamp-1">{p.title}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleOpenAssignModal(p.id)}
                    className="whitespace-nowrap"
                  >
                    Assign
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mentor Workload Grid */}
        <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-[#F5F5F5] font-mono uppercase">
                Mentor Roster & Allocation Workload
              </h3>
              <p className="text-xs text-[#888888] mt-0.5">
                Current active supervisory workload per registered mentor.
              </p>
            </div>
            <span className="font-mono text-xs text-[#888888]">
              {mentors.length} Mentors
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs font-mono text-[#888888]">Loading mentor directory…</div>
          ) : error ? (
            <div className="py-12 text-center text-xs font-mono text-red-400 space-y-2">
              <p>{error}</p>
              <Button size="sm" variant="outline" onClick={fetchMentorsData}>Retry</Button>
            </div>
          ) : mentors.length === 0 ? (
            <div className="py-16 text-center text-xs font-mono text-[#888888]">
              No mentor accounts registered in this institution.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mentors.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-xl bg-black/40 border border-white/[0.06] hover:border-brand-teal/30 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-white font-sans">{m.full_name}</h4>
                      <span className="text-[11px] font-mono text-[#888888]">{m.email}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-teal/10 text-brand-teal-light uppercase font-bold">
                      Mentor
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between font-mono text-xs">
                    <span className="text-[#888888]">Active Workload:</span>
                    <span className="text-white font-bold">
                      {m.active_assignments_count} project(s)
                    </span>
                  </div>

                  <div className="pt-1 flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenAssignModal()}
                    >
                      Assign Project
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </div>
        </ViewportSection>
      </main>

      {/* ASSIGN MENTOR MODAL */}
      {assignModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setAssignModalOpen(false)}
          size="md"
          title="Assign Mentor to Project"
          subtitle="Allocate an industry practitioner to supervise student milestone deliverables"
        >
          <form onSubmit={handleAssignMentor} className="space-y-4 text-xs font-mono">
            {assignSuccess && (
              <div className="p-3 rounded bg-brand-teal/10 border border-brand-teal/20 text-brand-teal-light">
                ✓ Mentor allocated to project successfully!
              </div>
            )}

            <div>
              <label className="text-xs uppercase text-[#888888] block mb-1">Select Project</label>
              <select
                value={targetProjectId}
                onChange={(e) => setTargetProjectId(e.target.value)}
                required
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">Choose project…</option>
                {unassignedProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.title} (Unassigned)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs uppercase text-[#888888] block mb-1">Select Mentor</label>
              <select
                value={targetMentorId}
                onChange={(e) => setTargetMentorId(e.target.value)}
                required
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">Choose mentor…</option>
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <SecondaryButton size="sm" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </SecondaryButton>
              <Button size="sm" variant="primary" type="submit" isLoading={assignSubmitting}>
                Confirm Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminMentoring;
