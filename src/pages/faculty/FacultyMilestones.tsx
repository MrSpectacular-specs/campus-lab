import React, { useState, useEffect } from 'react';
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Calendar,
} from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useMilestones } from '../../services';
import type { Milestone, MilestoneStatus } from '../../lib/types';
import { Button } from '../../components/Button';
import { SecondaryButton } from '../../components/SecondaryButton';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Navbar } from '../../components/Navbar';
import { PrismFoldBackground } from '../../components/PrismFoldBackground';
import { ViewportSection } from '../../components/ViewportSection';
import { PageProgress, type ProgressItem } from '../../components/PageProgress';

const PROGRESS_ITEMS: ProgressItem[] = [
  { id: 'sec-milestones', label: 'Milestone Pipeline' },
];

interface FacultyMilestoneItem extends Milestone {
  project_code: string;
  project_title: string;
  submissions_count: number;
  reviewed_count: number;
}

export const FacultyMilestones: React.FC = () => {
  const [milestones, setMilestones] = useState<FacultyMilestoneItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');

  // Create Milestone Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createProjectId, setCreateProjectId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSequence, setNewSequence] = useState(1);
  const [newDueDate, setNewDueDate] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Edit Milestone Modal state
  const [editingMilestone, setEditingMilestone] = useState<FacultyMilestoneItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState<MilestoneStatus>('upcoming');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchMilestonesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = selectedProjectId !== 'ALL' ? { project_id: selectedProjectId } : undefined;
      const res = await api.get<{ milestones: FacultyMilestoneItem[] }>('/api/faculty/milestones', params);
      setMilestones(res.milestones || []);
      if (!createProjectId && res.milestones && res.milestones.length > 0) {
        setCreateProjectId(res.milestones[0].project_id);
      }
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load milestones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestonesData();
  }, [selectedProjectId]);

  // Distinct projects represented
  const distinctProjects = Array.from(
    new Map(milestones.map((m) => [m.project_id, { id: m.project_id, code: m.project_code, title: m.project_title }])).values()
  );

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createProjectId || !newTitle) return;
    setCreateSubmitting(true);

    try {
      await api.post(`/api/projects/${createProjectId}/milestones`, {
        title: newTitle.trim(),
        description: newDescription.trim(),
        sequence: newSequence,
        due_date: newDueDate || null,
        status: 'upcoming',
      });
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      fetchMilestonesData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create milestone.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleOpenEdit = (m: FacultyMilestoneItem) => {
    setEditingMilestone(m);
    setEditTitle(m.title);
    setEditDescription(m.description || '');
    setEditDueDate(m.due_date || '');
    setEditStatus(m.status);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone) return;
    setEditSubmitting(true);

    try {
      await api.patch(`/api/milestones/${editingMilestone.id}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        due_date: editDueDate || null,
        status: editStatus,
      });
      setEditingMilestone(null);
      fetchMilestonesData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update milestone.');
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-brand-teal/20 selection:text-brand-teal-light relative">
      <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-30" />
      <Navbar />

      <PageProgress items={PROGRESS_ITEMS} />
      <main className="flex-1 w-full relative z-10 pt-16 sm:pt-[68px]">
        <ViewportSection id="sec-milestones" label="Milestone Pipeline" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-brand-teal-light font-bold">
                Sprint Roadmap Oversight
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
              Milestone Sprints Management
            </h1>
            <p className="text-xs text-[#888888] mt-1 font-sans">
              Schedule sprints, set deliverable expectations, and monitor submission pacing across coordinated cohorts.
            </p>
          </div>

          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateModalOpen(true)}
            disabled={distinctProjects.length === 0}
          >
            Add Milestone Sprint
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#0D0D0D] border border-white/[0.07] p-3.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#888888]">Filter by Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-black/60 border border-white/[0.08] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Coordinated Projects</option>
              {distinctProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.title}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs font-mono text-[#888888]">
            {milestones.length} Sprints Total
          </span>
        </div>

        {/* Sprints Board */}
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-[#888888]">
            <span className="inline-block w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
            <div>Loading milestone roadmaps…</div>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-red-500/20 text-center font-mono text-xs text-red-400 space-y-3">
            <p>{error}</p>
            <Button size="sm" variant="outline" onClick={fetchMilestonesData}>Retry</Button>
          </div>
        ) : milestones.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] text-center font-mono text-xs text-[#888888] space-y-3">
            <p>No milestone sprints found for the selected project.</p>
            <Button size="sm" variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              Provision First Sprint
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] hover:border-brand-teal/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-brand-teal-light font-bold px-2 py-0.5 rounded bg-brand-teal/10 border border-brand-teal/20">
                      {m.project_code}
                    </span>
                    <span className="font-mono text-xs text-white/70">
                      Sprint {m.sequence}
                    </span>
                    <span className="font-bold text-sm text-white font-sans">{m.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      m.status === 'completed'
                        ? 'bg-brand-teal/15 text-brand-teal-light border border-brand-teal/30'
                        : m.status === 'active'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        : 'bg-white/[0.04] text-[#666666]'
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#888888] font-sans leading-relaxed">
                    {m.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-[#777777] pt-1">
                    <span>Target Date: {m.due_date || 'Flexible'}</span>
                    <span>•</span>
                    <span>
                      Submissions: {m.submissions_count} ({m.reviewed_count} reviewed)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Edit2 className="w-3 h-3" />}
                    onClick={() => handleOpenEdit(m)}
                  >
                    Edit Sprint
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
          </div>

        </ViewportSection>

      </main>

      {/* CREATE MILESTONE MODAL */}
      {isCreateModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateModalOpen(false)}
          size="md"
          title="Add Milestone Sprint"
          subtitle="Define deliverable expectations and target completion date"
        >
          <form onSubmit={handleCreateMilestone} className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-xs uppercase text-[#888888] block mb-1">Target Project</label>
              <select
                value={createProjectId}
                onChange={(e) => setCreateProjectId(e.target.value)}
                required
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded px-3 py-2 text-xs text-white focus:outline-none"
              >
                {distinctProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Input
                  label="Sprint Title"
                  placeholder="e.g. Prototype Telemetry Pipeline"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  label="Sequence #"
                  type="number"
                  min="1"
                  value={newSequence}
                  onChange={(e) => setNewSequence(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>

            <div>
              <Input
                label="Target Due Date"
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs uppercase text-[#888888] block mb-1">Deliverable Requirements</label>
              <textarea
                rows={3}
                placeholder="Specific technical outcomes, test benchmarks, or code commits expected for this milestone…"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <SecondaryButton size="sm" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </SecondaryButton>
              <Button size="sm" variant="primary" type="submit" isLoading={createSubmitting}>
                Save Milestone
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT MILESTONE MODAL */}
      {editingMilestone && (
        <Modal
          isOpen={true}
          onClose={() => setEditingMilestone(null)}
          size="md"
          title={`Edit Sprint: ${editingMilestone.title}`}
          subtitle={`${editingMilestone.project_code} • Sequence ${editingMilestone.sequence}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-mono">
            <div>
              <Input
                label="Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  label="Due Date"
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs uppercase text-[#888888] block mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as MilestoneStatus)}
                  className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase text-[#888888] block mb-1">Description</label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <SecondaryButton size="sm" onClick={() => setEditingMilestone(null)}>
                Cancel
              </SecondaryButton>
              <Button size="sm" variant="primary" type="submit" isLoading={editSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default FacultyMilestones;
