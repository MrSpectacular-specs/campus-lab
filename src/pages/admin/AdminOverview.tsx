import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  AlertTriangle,
  ChevronRight,
  CreditCard,
  Activity,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useAdminOverview, useAdminProjects, useAdminLicense } from '../../services/admin';
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
  { id: 'sec-overview', label: 'Overview' },
  { id: 'sec-attention', label: 'Attention' },
  { id: 'sec-pipeline', label: 'Pipeline' },
  { id: 'sec-license', label: 'License' },
];

export const AdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { metrics, needsAttention, loading: overviewLoading, refetch: refetchOverview } = useAdminOverview();
  const { projects: adminProjects, loading: projectsLoading, refetch: refetchProjects } = useAdminProjects({});
  const { data: licenseData, loading: licenseLoading } = useAdminLicense();
  const { createProject } = useProjects();

  // Create Project Modal state
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
      refetchOverview();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-brand-teal/20 selection:text-brand-teal-light relative">
      <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-40" />
      <Navbar />

      <PageProgress items={PROGRESS_ITEMS} />
      <main className="flex-1 w-full relative z-10 pt-16 sm:pt-[68px]">
        <ViewportSection id="sec-overview" label="Institutional Control Center" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-brand-teal-light font-bold">
                Institutional Control Center
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
              University Overview & Operations
            </h1>
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

        {/* 6 Interactive Top-Level Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/projects')}
            className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07] hover:border-brand-teal/40 transition-all text-left group cursor-pointer"
          >
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1 group-hover:text-white">
              Total Projects
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {overviewLoading ? '…' : metrics?.total_projects ?? 0}
            </span>
            <span className="text-[10px] font-mono text-[#666666] block mt-1">
              Inspect pipeline →
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard/projects?status=active')}
            className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07] hover:border-brand-teal/40 transition-all text-left group cursor-pointer"
          >
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1 group-hover:text-white">
              Active Projects
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-brand-teal-light">
              {overviewLoading ? '…' : metrics?.active_projects ?? 0}
            </span>
            <span className="text-[10px] font-mono text-brand-teal-light/80 block mt-1">
              Active cohorts →
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard/projects')}
            className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07] hover:border-brand-teal/40 transition-all text-left group cursor-pointer"
          >
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1 group-hover:text-white">
              Enrolled Students
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {overviewLoading ? '…' : metrics?.active_student_teams ?? 0}
            </span>
            <span className="text-[10px] font-mono text-[#666666] block mt-1">
              Participants →
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard/mentoring')}
            className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07] hover:border-brand-teal/40 transition-all text-left group cursor-pointer"
          >
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1 group-hover:text-white">
              Active Mentors
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {overviewLoading ? '…' : metrics?.active_mentors ?? 0}
            </span>
            <span className="text-[10px] font-mono text-[#666666] block mt-1">
              Mentor roster →
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard/projects?health=attention')}
            className={`p-4 rounded-xl border transition-all text-left group cursor-pointer ${
              (metrics?.pending_reviews ?? 0) > 0
                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                : 'bg-[#0D0D0D] border-white/[0.07]'
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider block mb-1 text-[#888888] group-hover:text-white">
              Pending Reviews
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono">
              {overviewLoading ? '…' : metrics?.pending_reviews ?? 0}
            </span>
            <span className="text-[10px] font-mono block mt-1">
              {(metrics?.pending_reviews ?? 0) > 0 ? 'Requires action →' : 'Up to date'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard/evaluation')}
            className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07] hover:border-brand-teal/40 transition-all text-left group cursor-pointer"
          >
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1 group-hover:text-white">
              Completed Defenses
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {overviewLoading ? '…' : metrics?.completed_evaluations ?? 0}
            </span>
            <span className="text-[10px] font-mono text-[#666666] block mt-1">
              Rubric marks →
            </span>
          </button>
        </div>
          </div>
        </ViewportSection>

        {/* Data-Driven "Needs Attention" Area */}
        {needsAttention && needsAttention.length > 0 && (
          <ViewportSection id="sec-attention" label="Action Required" fullHeight={false}>
            <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
              <div className="bg-[#0D0D0D] border border-yellow-500/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-yellow-400">
                      Needs Administrative Attention ({needsAttention.length} Items)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#888888]">
                    Direct action shortcuts derived from database bottlenecks
                  </span>
                </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {needsAttention.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (item.type === 'UNASSIGNED_MENTOR') {
                      navigate('/dashboard/mentoring');
                    } else {
                      navigate(`/projects/${item.project_id}`);
                    }
                  }}
                  className="p-3.5 rounded-lg bg-black/40 border border-white/[0.06] hover:border-yellow-500/40 text-left transition-all group cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-brand-teal-light font-bold">
                      {item.project_code}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        item.severity === 'high'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}
                    >
                      {item.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="font-sans text-xs font-semibold text-white group-hover:text-brand-teal-light transition-colors line-clamp-1">
                    {item.project_title}
                  </div>
                  <p className="text-[11px] text-[#888888] font-sans leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
            </div>
          </ViewportSection>
        )}

        {/* Project Pipeline Quick Snapshot */}
        <ViewportSection id="sec-pipeline" label="Cohort Pipeline" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold tracking-tight text-[#F5F5F5] font-mono uppercase">
                  Cohort Pipeline Snapshot
                </h3>
            <button
              onClick={() => navigate('/dashboard/projects')}
              className="text-xs font-mono text-brand-teal-light hover:underline flex items-center gap-1 cursor-pointer"
            >
              Open dedicated projects operations ({adminProjects.length}) <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {projectsLoading ? (
            <div className="py-12 text-center text-xs font-mono text-[#888888]">Loading pipeline…</div>
          ) : adminProjects.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-[#888888]">No projects registered.</div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {adminProjects.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="py-3 flex items-center justify-between text-xs hover:bg-white/[0.02] px-2 rounded cursor-pointer transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-brand-teal-light font-bold">{p.code}</span>
                      <span className="font-medium text-white">{p.title}</span>
                      {p.needs_attention && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          {p.attention_reason}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[10px] text-[#888888]">
                      {p.domain} • Coordinator: {p.coordinator.name}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <span className="text-[11px] font-mono text-white font-bold">
                        {p.progress.percent !== null ? `${p.progress.percent}%` : 'No sprints'}
                      </span>
                      <span className="text-[10px] font-mono text-[#666666] block">
                        {p.progress.completed_milestones}/{p.progress.total_milestones} milestones
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                      p.status === 'active'
                        ? 'bg-brand-teal/10 text-brand-teal-light border border-brand-teal/20'
                        : p.status === 'completed'
                        ? 'bg-white/[0.06] text-white/80'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {p.status}
                    </span>

                    <ChevronRight className="w-4 h-4 text-[#666666]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </div>
        </ViewportSection>

        {/* Commercial License & Usage Summary */}
        <ViewportSection id="sec-license" label="License & Resource Allocation" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[#0D0D0D] border border-white/[0.07] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-brand-teal-light" />
                    <h3 className="font-mono text-xs uppercase font-bold text-white">Commercial License</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-teal-light">
                    {licenseData?.license.value || '₹2,40,000 / year'}
                  </span>
                </div>
            <div className="text-xs font-mono space-y-1.5 text-[#888888]">
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="text-white">{licenseData?.license.plan || 'Institutional License'}</span>
              </div>
              <div className="flex justify-between">
                <span>Billing:</span>
                <span className="text-white">{licenseData?.license.billing_cycle || 'Annual'}</span>
              </div>
              <div className="flex justify-between">
                <span>Term Validity:</span>
                <span className="text-white">{licenseData?.license.remaining_days ?? 0} days remaining</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#0D0D0D] border border-white/[0.07] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-teal-light" />
                <h3 className="font-mono text-xs uppercase font-bold text-white">Platform Utilization</h3>
              </div>
              <span className="text-xs font-mono text-white">Measured</span>
            </div>
            <div className="text-xs font-mono space-y-1.5 text-[#888888]">
              <div className="flex justify-between">
                <span>Active Projects:</span>
                <span className="text-white">{licenseData?.usage.active_projects ?? 0} active</span>
              </div>
              <div className="flex justify-between">
                <span>Participating Students:</span>
                <span className="text-white">{licenseData?.usage.enrolled_students ?? 0} enrolled</span>
              </div>
              <div className="flex justify-between">
                <span>Supervising Mentors:</span>
                <span className="text-white">{licenseData?.usage.active_mentors ?? 0} allocated</span>
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default AdminOverview;
