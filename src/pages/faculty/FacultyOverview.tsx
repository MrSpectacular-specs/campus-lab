import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useProjects } from '../../services';
import type { Project, ProjectStatus } from '../../lib/types';
import { Button } from '../../components/Button';
import { SecondaryButton } from '../../components/SecondaryButton';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Navbar } from '../../components/Navbar';
import { PrismFoldBackground } from '../../components/PrismFoldBackground';
import { ViewportSection } from '../../components/ViewportSection';
import { PageProgress, type ProgressItem } from '../../components/PageProgress';

const PROGRESS_ITEMS: ProgressItem[] = [
  { id: 'sec-overview', label: 'Faculty Dashboard' },
];

export const FacultyOverview: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { projects, loading: projectsLoading, error: projectsError, refetch: refetchProjects, createProject, updateProject } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');

  // Project Creation Modal state
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

  // Project Edit Modal state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState<string>('active');
  const [editDescription, setEditDescription] = useState('');
  const [editExpectedOutcome, setEditExpectedOutcome] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Projects coordinated by this faculty member
  const coordinatedProjects = projects.filter((p) => p.created_by === profile?.id || p.is_coordinator);

  const filteredProjects = coordinatedProjects.filter((p) => {
    return (
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
      status: 'active',
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

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setEditTitle(p.title);
    setEditStatus(p.status);
    setEditDescription(p.description || '');
    setEditExpectedOutcome(p.expected_outcome || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setEditSubmitting(true);

    await updateProject(editingProject.id, {
      title: editTitle.trim(),
      status: editStatus as ProjectStatus,
      description: editDescription.trim(),
      expected_outcome: editExpectedOutcome.trim(),
    });

    setEditSubmitting(false);
    setEditingProject(null);
    refetchProjects();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-brand-teal/20 selection:text-brand-teal-light relative">
      <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-30" />
      <Navbar />

      <PageProgress items={PROGRESS_ITEMS} />
      <main className="flex-1 w-full relative z-10 pt-16 sm:pt-[68px]">
        <ViewportSection id="sec-overview" label="Faculty Dashboard" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-brand-teal-light font-bold">
                Faculty Academic Coordinator
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
              My Coordinated Projects
            </h1>
            <p className="text-xs text-[#888888] mt-1 font-sans">
              Projects provisioned and supervised under your departmental curriculum.
            </p>
          </div>

          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Project Brief
          </Button>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07] space-y-1">
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
              Coordinated Cohorts
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {projectsLoading ? '…' : coordinatedProjects.length}
            </span>
            <span className="text-[10px] font-mono text-brand-teal-light block">
              Under your supervision
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07] space-y-1">
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
              Institutional Library
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {projectsLoading ? '…' : projects.length}
            </span>
            <span className="text-[10px] font-mono text-[#888888] block">
              Total briefs in university
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07] space-y-1">
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
              Role Boundary
            </span>
            <span className="text-sm font-bold font-mono text-brand-teal-light block pt-1">
              Academic Coordinator
            </span>
            <span className="text-[10px] font-mono text-[#666666] block">
              Full project & sprint oversight
            </span>
          </div>
        </div>

        {/* Search and Project Listing */}
        <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/[0.07] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <h3 className="text-sm font-semibold tracking-tight text-[#F5F5F5] font-mono uppercase">
              Coordinated Project Portfolio ({filteredProjects.length})
            </h3>
            <div className="relative max-w-xs">
              <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.08] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-brand-teal/50"
              />
            </div>
          </div>

          {projectsLoading ? (
            <div className="py-16 text-center text-xs font-mono text-[#888888]">Loading projects…</div>
          ) : projectsError ? (
            <div className="py-12 text-center text-xs font-mono text-red-400 space-y-2">
              <p>{projectsError}</p>
              <Button size="sm" variant="outline" onClick={() => refetchProjects()}>Retry</Button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-16 text-center text-xs font-mono text-[#888888] space-y-3">
              <p>No projects currently coordinated under your account.</p>
              <Button size="sm" variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                Create First Project Brief
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.07] bg-white/[0.02] text-[#888888] font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Title & Problem</th>
                    <th className="py-3 px-4">Domain</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-brand-teal-light font-bold">{p.code}</td>
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-medium text-[#F5F5F5] line-clamp-1">{p.title}</div>
                        <div className="text-[10px] text-[#777777] line-clamp-1">{p.problem_statement || p.description}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#B8B8B8]">{p.domain}</td>
                      <td className="py-3 px-4 font-mono text-[#888888]">{p.duration}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          p.status === 'active'
                            ? 'bg-brand-teal/10 text-brand-teal-light border border-brand-teal/20'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1 rounded text-[#888888] hover:text-brand-teal-light transition-colors cursor-pointer"
                            title="Edit Project Metadata"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => navigate(`/projects/${p.id}`)}
                            className="text-[11px] font-mono text-brand-teal-light hover:underline font-semibold cursor-pointer"
                          >
                            Brief →
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
        subtitle="Provision an accredited engineering project as Academic Coordinator"
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
                placeholder="e.g. Distributed Consensus Engine"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Project Code"
                placeholder="CL-ENG-101"
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
                placeholder="Systems"
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
            <label className="text-xs font-mono uppercase tracking-wider text-[#888888] block mb-1">Short Description</label>
            <textarea
              rows={2}
              placeholder="High-level architectural summary of project scope…"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-brand-teal/50"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#888888] block mb-1">Problem Statement</label>
            <textarea
              rows={2}
              placeholder="Core engineering or industrial problem addressed…"
              value={newProblemStatement}
              onChange={(e) => setNewProblemStatement(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-brand-teal/50"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#888888] block mb-1">Expected Outcome</label>
            <textarea
              rows={2}
              placeholder="What tangible prototype/deliverable will student teams produce?…"
              value={newExpectedOutcome}
              onChange={(e) => setNewExpectedOutcome(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-brand-teal/50"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#888888] block mb-1">Objectives (one per line)</label>
            <textarea
              rows={3}
              placeholder="Deploy consensus cluster&#10;Benchmark throughput under network partitions&#10;Audit cryptographic state chain"
              value={newObjectives}
              onChange={(e) => setNewObjectives(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] font-mono focus:outline-none focus:border-brand-teal/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label="Skills (comma-separated)"
                placeholder="Go, Docker, gRPC"
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Prerequisites (comma-separated)"
                placeholder="Concurrency in Go, Distributed systems basics"
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
              Create Project Brief
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT PROJECT MODAL */}
      {editingProject && (
        <Modal
          isOpen={true}
          onClose={() => setEditingProject(null)}
          size="md"
          title={`Edit Project: ${editingProject.code}`}
          subtitle="Update coordinated project parameters"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <Input
                label="Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#888888] block mb-1">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-2.5 py-2 text-xs text-[#F5F5F5] focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#888888] block mb-1">Description</label>
              <textarea
                rows={2}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#888888] block mb-1">Expected Outcome</label>
              <textarea
                rows={2}
                value={editExpectedOutcome}
                onChange={(e) => setEditExpectedOutcome(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <SecondaryButton size="sm" onClick={() => setEditingProject(null)}>
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

export default FacultyOverview;
