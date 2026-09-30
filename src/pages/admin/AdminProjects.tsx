import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Trash2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useAdminProjects } from '../../services/admin';
import { useProjects } from '../../services';
import type { ProjectStatus } from '../../lib/types';
import { Button } from '../../components/Button';
import { SecondaryButton } from '../../components/SecondaryButton';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Navbar } from '../../components/Navbar';
import { PrismFoldBackground } from '../../components/PrismFoldBackground';
import { ViewportSection } from '../../components/ViewportSection';
import { PageProgress, type ProgressItem } from '../../components/PageProgress';

const PROGRESS_ITEMS: ProgressItem[] = [
  { id: 'sec-projects', label: 'Project Operations' },
];

export const AdminProjects: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedHealthFilter, setSelectedHealthFilter] = useState<string>('ALL');

  const { projects: adminProjects, loading: projectsLoading, error: projectsError, refetch: refetchProjects } = useAdminProjects({
    status: selectedStatusFilter,
    category: selectedCategoryFilter,
    health: selectedHealthFilter,
    search: searchQuery,
  });

  const { createProject, updateProject, deleteProject } = useProjects();

  // New Project Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState('AI / ML');
  const [newDomain, setNewDomain] = useState('Computer Science');
  const [newDifficulty, setNewDifficulty] = useState('Intermediate');
  const [newDuration, setNewDuration] = useState('8 Weeks');
  const [newDescription, setNewDescription] = useState('');
  const [newProblemStatement, setNewProblemStatement] = useState('');
  const [newExpectedOutcome, setNewExpectedOutcome] = useState('');
  const [newObjectives, setNewObjectives] = useState('');
  const [newPrerequisites, setNewPrerequisites] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete modal state
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; title: string; code: string } | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setCreateError(null);

    const skillsArray = newSkills.split(',').map((s) => s.trim()).filter(Boolean);
    const objectivesArray = newObjectives.split('\n').map((s) => s.trim()).filter(Boolean);
    const prereqsArray = newPrerequisites.split(',').map((s) => s.trim()).filter(Boolean);

    const { error } = await createProject({
      title: newTitle.trim(),
      code: newCode.trim() || `CL-${Math.floor(100 + Math.random() * 900)}`,
      category: newCategory,
      domain: newDomain.trim(),
      difficulty: newDifficulty,
      duration: newDuration,
      description: newDescription.trim(),
      problem_statement: newProblemStatement.trim(),
      expected_outcome: newExpectedOutcome.trim(),
      objectives: objectivesArray,
      prerequisites: prereqsArray,
      skills: skillsArray,
      status: 'active' as ProjectStatus,
    });

    setCreateSubmitting(false);
    if (error) {
      setCreateError(error);
    } else {
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewCode('');
      setNewDescription('');
      setNewProblemStatement('');
      setNewExpectedOutcome('');
      setNewObjectives('');
      setNewPrerequisites('');
      setNewSkills('');
      refetchProjects();
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    await updateProject(projectId, { status: newStatus });
    refetchProjects();
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setDeleteSubmitting(true);
    await deleteProject(projectToDelete.id);
    setDeleteSubmitting(false);
    setProjectToDelete(null);
    refetchProjects();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-brand-teal/20 selection:text-brand-teal-light relative">
      <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-40" />
      <Navbar />

      <PageProgress items={PROGRESS_ITEMS} />
      <main className="flex-1 w-full relative z-10 pt-16 sm:pt-[68px]">
        <ViewportSection id="sec-projects" label="Project Operations" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-brand-teal-light font-bold">
                Project Operations
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
              Institutional Project Pipeline
            </h1>
            <p className="text-xs text-[#888888] mt-1 font-sans">
              Manage engineering project briefs, inspect real milestone progress, and allocate resources.
            </p>
          </div>

          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Project
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#0D0D0D] border border-white/[0.07] p-3 rounded-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code, title, or domain…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.08] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-brand-teal/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Health Filter */}
            <select
              value={selectedHealthFilter}
              onChange={(e) => setSelectedHealthFilter(e.target.value)}
              className="bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-[#B8B8B8] font-mono focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Health States</option>
              <option value="attention">Needs Attention</option>
              <option value="on_track">On Track</option>
              <option value="unassigned_mentor">Unassigned Mentor</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-[#B8B8B8] font-mono focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-[#B8B8B8] font-mono focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="AI / ML">AI / ML</option>
              <option value="SYSTEMS">SYSTEMS</option>
              <option value="IOT">IOT</option>
              <option value="FINTECH">FINTECH</option>
            </select>
          </div>
        </div>

        {/* Operational Pipeline Table */}
        <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl overflow-hidden">
          {projectsLoading ? (
            <div className="py-20 text-center text-xs font-mono text-[#888888]">
              <span className="inline-block w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
              <div>Loading operational project pipeline…</div>
            </div>
          ) : projectsError ? (
            <div className="py-12 px-4 text-center space-y-3">
              <p className="text-red-400 font-mono text-xs">{projectsError}</p>
              <Button size="sm" variant="primary" onClick={() => refetchProjects()}>
                Retry Connection
              </Button>
            </div>
          ) : adminProjects.length === 0 ? (
            <div className="py-20 text-center text-xs font-mono text-[#888888]">
              No matching projects found in institutional database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.07] bg-white/[0.02] text-[#888888] font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Project</th>
                    <th className="py-3.5 px-4">Domain</th>
                    <th className="py-3.5 px-4">Coordinator</th>
                    <th className="py-3.5 px-4">Students</th>
                    <th className="py-3.5 px-4">Mentor</th>
                    <th className="py-3.5 px-4">Progress</th>
                    <th className="py-3.5 px-4">Defense</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {adminProjects.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      onClick={() => navigate(`/projects/${p.id}`)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-brand-teal-light font-bold">{p.code}</span>
                          <span className="font-medium text-white group-hover:text-brand-teal-light transition-colors">
                            {p.title}
                          </span>
                        </div>
                        {p.needs_attention && (
                          <span className="text-[9px] font-mono text-yellow-400 inline-block mt-0.5">
                            • {p.attention_reason}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#B8B8B8]">{p.domain}</td>

                      <td className="py-3.5 px-4">
                        <span className="text-white text-[11px] block">{p.coordinator.name}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs text-white">
                          {p.team.student_count} enrolled
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {p.mentor ? (
                          <span className="text-white text-[11px] font-medium">{p.mentor.name}</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 font-bold uppercase">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 min-w-[120px]">
                        {p.progress.percent !== null ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between font-mono text-[10px]">
                              <span className="text-white font-bold">{p.progress.percent}%</span>
                              <span className="text-[#666666]">
                                {p.progress.completed_milestones}/{p.progress.total_milestones}
                              </span>
                            </div>
                            <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-brand-teal h-full rounded-full transition-all"
                                style={{ width: `${p.progress.percent}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-[#666666]">No milestones</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {p.evaluation.results_count > 0 ? (
                          <span className="text-brand-teal-light font-bold">
                            {p.evaluation.results_count} marks
                          </span>
                        ) : (
                          <span className="text-[#666666]">Pending</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={p.status}
                          onChange={(e) => handleStatusChange(p.id, e.target.value as ProjectStatus)}
                          className="bg-black/60 border border-white/[0.08] rounded px-2 py-0.5 text-[10px] font-mono uppercase text-[#F5F5F5] focus:outline-none cursor-pointer"
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/projects/${p.id}`)}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-brand-teal-light hover:underline font-semibold"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProjectToDelete({ id: p.id, title: p.title, code: p.code })}
                            className="text-red-400/60 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </div>

        </ViewportSection>

      </main>

      {/* CREATE PROJECT MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="lg"
        title="Create New Project"
        subtitle="Provision an accredited engineering project for cohort execution"
      >
        <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
          {createError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded font-mono text-[11px]">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Project Title"
                placeholder="e.g. Autonomous Robotic Parcel Transporter"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Project Code"
                placeholder="CL-ROV-301"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#888888] block mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-2.5 py-2 text-xs text-[#F5F5F5] focus:outline-none"
              >
                <option value="AI / ML">AI / ML</option>
                <option value="SYSTEMS">SYSTEMS</option>
                <option value="IOT">IOT</option>
                <option value="FINTECH">FINTECH</option>
              </select>
            </div>
            <div>
              <Input
                label="Domain"
                placeholder="Systems / Robotics"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#888888] block mb-1">Difficulty</label>
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-2.5 py-2 text-xs text-[#F5F5F5] focus:outline-none"
              >
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#888888] block mb-1">Duration</label>
              <select
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-2.5 py-2 text-xs text-[#F5F5F5] focus:outline-none"
              >
                <option value="8 Weeks">8 Weeks</option>
                <option value="10 Weeks">10 Weeks</option>
                <option value="12 Weeks">12 Weeks</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#888888] block mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="High-level architectural summary of the project scope…"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-brand-teal/50"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#888888] block mb-1">Problem Statement</label>
            <textarea
              rows={2}
              placeholder="What core industry or engineering problem does this solve?"
              value={newProblemStatement}
              onChange={(e) => setNewProblemStatement(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-brand-teal/50"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#888888] block mb-1">Expected Outcome / Deliverable</label>
            <textarea
              rows={2}
              placeholder="What tangible prototype/app will be built?…"
              value={newExpectedOutcome}
              onChange={(e) => setNewExpectedOutcome(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-brand-teal/50"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#888888] block mb-1">Objectives (one per line)</label>
            <textarea
              rows={3}
              placeholder="Deploy prototype&#10;Benchmark latency&#10;Conduct defense presentation"
              value={newObjectives}
              onChange={(e) => setNewObjectives(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] font-mono placeholder:text-[#666666] focus:outline-none focus:border-brand-teal/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label="Skills (comma-separated)"
                placeholder="Python, MQTT, React"
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Prerequisites (comma-separated)"
                placeholder="Python basics, Networking"
                value={newPrerequisites}
                onChange={(e) => setNewPrerequisites(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
            <SecondaryButton size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </SecondaryButton>
            <Button size="sm" variant="primary" type="submit" isLoading={createSubmitting}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      {projectToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setProjectToDelete(null)}
          size="sm"
          title="Confirm Project Deletion"
          subtitle="This administrative action cannot be undone"
        >
          <div className="space-y-4 text-xs font-mono">
            <p className="text-[#CCCCCC]">
              Are you sure you want to permanently delete project brief{' '}
              <span className="font-bold text-white">{projectToDelete.code}</span> (
              {projectToDelete.title})?
            </p>
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[11px]">
              Warning: All associated milestones, submissions, and evaluations will be purged.
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
              <SecondaryButton size="sm" onClick={() => setProjectToDelete(null)}>
                Cancel
              </SecondaryButton>
              <Button
                size="sm"
                variant="primary"
                className="bg-red-600 hover:bg-red-500 text-white"
                isLoading={deleteSubmitting}
                onClick={handleConfirmDelete}
              >
                Delete Project
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminProjects;
