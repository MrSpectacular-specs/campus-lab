import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Trash2,
  LogOut,
  Users,
  Award,
  Clock,
  Layers,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Building2,
  Activity,
  Briefcase,
  FileCheck2,
  Check,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { PrismFoldBackground } from '../components/PrismFoldBackground';
import {
  useAdminOverview,
  useAdminProjects,
  useAdminProjectDetail,
  useAdminLicense,
  type AdminProjectListItem,
} from '../services/admin';
import { useProjects, useAvailableMentors, useMentorAssignments } from '../services';
import type { ProjectStatus } from '../lib/types';
import { Button } from '../components/Button';
import { SecondaryButton } from '../components/SecondaryButton';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Navbar } from '../components/Navbar';

export interface AdminDashboardProps {
  onNavigateHome?: () => void;
  onRequestDemo?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateHome,
}) => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const [searchParams] = useSearchParams();
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'mentoring' | 'evaluation' | 'reports' | 'settings'>('overview');

  // Synchronize activeTab with URL ?tab= parameter
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && ['overview', 'projects', 'mentoring', 'evaluation', 'reports', 'settings'].includes(urlTab)) {
      setActiveTab(urlTab as 'overview' | 'projects' | 'mentoring' | 'evaluation' | 'reports' | 'settings');
    }
  }, [searchParams]);
  // Filters for operational project table
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedHealthFilter, setSelectedHealthFilter] = useState<string>('ALL');

  // Admin Services
  const { metrics, needsAttention, loading: overviewLoading, refetch: refetchOverview } = useAdminOverview();
  const { projects: adminProjects, loading: projectsLoading, error: projectsError, refetch: refetchProjects } = useAdminProjects({
    status: selectedStatusFilter,
    category: selectedCategoryFilter,
    health: selectedHealthFilter,
    search: searchQuery,
  });
  const { data: licenseData, loading: licenseLoading, refetch: refetchLicense } = useAdminLicense();
  const { createProject, updateProject, deleteProject } = useProjects();
  const { mentors: availableMentors } = useAvailableMentors(profile?.institution_id ?? undefined);

  // Project Detail Drawer state
  const [selectedDrawerProjectId, setSelectedDrawerProjectId] = useState<string | null>(null);
  const [drawerSubTab, setDrawerSubTab] = useState<'overview' | 'progress' | 'team' | 'submissions' | 'evaluation' | 'timeline'>('overview');
  const { detail: projectDetail, loading: detailLoading, refetch: refetchDetail } = useAdminProjectDetail(selectedDrawerProjectId);
  const { assignMentor } = useMentorAssignments(selectedDrawerProjectId ?? undefined);

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

  // Delete confirmation modal state
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; title: string; code: string } | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Mentor allocation dropdown state inside drawer
  const [selectedMentorToAssign, setSelectedMentorToAssign] = useState<string>('');
  const [assigningMentor, setAssigningMentor] = useState(false);

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

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    await updateProject(projectId, { status: newStatus });
    refetchProjects();
    refetchOverview();
    if (selectedDrawerProjectId === projectId) {
      refetchDetail();
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setDeleteSubmitting(true);
    await deleteProject(projectToDelete.id);
    setDeleteSubmitting(false);
    setProjectToDelete(null);
    if (selectedDrawerProjectId === projectToDelete.id) {
      setSelectedDrawerProjectId(null);
    }
    refetchProjects();
    refetchOverview();
  };

  const handleAssignMentor = async () => {
    if (!selectedDrawerProjectId || !selectedMentorToAssign) return;
    setAssigningMentor(true);
    await assignMentor(selectedMentorToAssign, profile!.id);
    setAssigningMentor(false);
    setSelectedMentorToAssign('');
    refetchDetail();
    refetchProjects();
    refetchOverview();
  };

  const openDrawerForProject = (projectId: string) => {
    setSelectedDrawerProjectId(projectId);
    setDrawerSubTab('overview');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-brand-teal/20 selection:text-brand-teal-light relative">
      {/* Ambient Subtle PrismFold Background for Admin Shell */}
      <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-40" />
      {/* Unified Global Role-Aware Navbar */}
      <Navbar />

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="border-b border-white/[0.07] bg-[#080808]/80 backdrop-blur-md sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto">
          <nav className="flex space-x-1 sm:space-x-4 py-2" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'projects', label: 'Projects Pipeline' },
              { id: 'mentoring', label: 'Mentoring' },
              { id: 'evaluation', label: 'Evaluation' },
              { id: 'reports', label: 'Reporting' },
              { id: 'settings', label: 'Settings & License' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors whitespace-nowrap uppercase tracking-wider cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white/[0.08] text-white font-semibold border border-white/[0.12]'
                    : 'text-[#888888] hover:text-[#B8B8B8] hover:bg-white/[0.02]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pt-20 sm:pt-24">
        {/* ======================================================== */}
        {/* OVERVIEW TAB */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 6 Interactive Top-Level Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedStatusFilter('ALL');
                  setActiveTab('projects');
                }}
                className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07] hover:border-brand-teal/40 transition-all text-left group cursor-pointer"
              >
                <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1 group-hover:text-white">
                  Total Projects
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                  {overviewLoading ? '…' : metrics?.total_projects ?? 0}
                </span>
                <span className="text-[10px] font-mono text-[#666666] block mt-1">
                  All registered briefs →
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedStatusFilter('active');
                  setActiveTab('projects');
                }}
                className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07] hover:border-brand-teal/40 transition-all text-left group cursor-pointer"
              >
                <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1 group-hover:text-white">
                  Active Projects
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-brand-teal-light">
                  {overviewLoading ? '…' : metrics?.active_projects ?? 0}
                </span>
                <span className="text-[10px] font-mono text-brand-teal-light/80 block mt-1">
                  Filter active →
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedStatusFilter('ALL');
                  setActiveTab('projects');
                }}
                className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07] hover:border-brand-teal/40 transition-all text-left group cursor-pointer"
              >
                <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1 group-hover:text-white">
                  Enrolled Students
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                  {overviewLoading ? '…' : metrics?.active_student_teams ?? 0}
                </span>
                <span className="text-[10px] font-mono text-[#666666] block mt-1">
                  Active participants →
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('mentoring')}
                className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07] hover:border-brand-teal/40 transition-all text-left group cursor-pointer"
              >
                <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1 group-hover:text-white">
                  Active Mentors
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                  {overviewLoading ? '…' : metrics?.active_mentors ?? 0}
                </span>
                <span className="text-[10px] font-mono text-[#666666] block mt-1">
                  Supervising cohort →
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedHealthFilter('attention');
                  setActiveTab('projects');
                }}
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
                  {(metrics?.pending_reviews ?? 0) > 0 ? 'Requires attention →' : 'Up to date'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('evaluation')}
                className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07] hover:border-brand-teal/40 transition-all text-left group cursor-pointer"
              >
                <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1 group-hover:text-white">
                  Completed Defenses
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                  {overviewLoading ? '…' : metrics?.completed_evaluations ?? 0}
                </span>
                <span className="text-[10px] font-mono text-[#666666] block mt-1">
                  Rubric scores →
                </span>
              </button>
            </div>

            {/* Data-Driven "Needs Attention" Area */}
            {needsAttention && needsAttention.length > 0 && (
              <div className="bg-[#0D0D0D] border border-yellow-500/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-yellow-400">
                      Needs Administrative Attention ({needsAttention.length} Items)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#888888]">
                    Click item to open operational project drawer
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {needsAttention.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => openDrawerForProject(item.project_id)}
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
            )}

            {/* Quick Project Pipeline Snapshot */}
            <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold tracking-tight text-[#F5F5F5] font-mono uppercase">
                  Institutional Cohort Execution Snapshot
                </h3>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="text-xs font-mono text-brand-teal-light hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View full operational pipeline ({adminProjects.length}) <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {projectsLoading ? (
                <div className="py-12 text-center text-xs font-mono text-[#888888]">Loading pipeline…</div>
              ) : adminProjects.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-[#888888]">
                  No projects configured yet.
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {adminProjects.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => openDrawerForProject(p.id)}
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
                          {p.domain} • {p.duration} • Coordinator: {p.coordinator.name}
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
        )}

        {/* ======================================================== */}
        {/* PROJECTS TAB (OPERATIONAL PIPELINE TABLE) */}
        {/* ======================================================== */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-[#0D0D0D] border border-white/[0.07] p-3 rounded-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by code, title, or domain…"
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
                  <option value="ALL">All Health</option>
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

                <Button
                  size="sm"
                  variant="primary"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  New Project
                </Button>
              </div>
            </div>

            {/* Operational Table */}
            <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl overflow-hidden">
              {projectsLoading ? (
                <div className="py-16 text-center text-xs font-mono text-[#888888]">
                  Loading operational project pipeline…
                </div>
              ) : projectsError ? (
                <div className="py-12 px-4 text-center space-y-3">
                  <p className="text-red-400 font-mono text-xs">{projectsError}</p>
                  <Button size="sm" variant="primary" onClick={() => refetchProjects()}>
                    Retry
                  </Button>
                </div>
              ) : adminProjects.length === 0 ? (
                <div className="py-16 text-center text-xs font-mono text-[#888888]">
                  No matching projects found in institutional database.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.07] bg-white/[0.02] text-[#888888] font-mono text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-4">Project</th>
                        <th className="py-3 px-4">Domain</th>
                        <th className="py-3 px-4">Coordinator</th>
                        <th className="py-3 px-4">Students</th>
                        <th className="py-3 px-4">Mentor</th>
                        <th className="py-3 px-4">Progress</th>
                        <th className="py-3 px-4">Defense</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {adminProjects.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                          onClick={() => openDrawerForProject(p.id)}
                        >
                          <td className="py-3 px-4">
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

                          <td className="py-3 px-4 font-mono text-[#B8B8B8]">{p.domain}</td>

                          <td className="py-3 px-4">
                            <span className="text-white text-[11px] block">{p.coordinator.name}</span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-mono text-xs text-white">
                              {p.team.student_count} enrolled
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {p.mentor ? (
                              <span className="text-white text-[11px] font-medium">{p.mentor.name}</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 font-bold uppercase">
                                Unassigned
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 min-w-[120px]">
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

                          <td className="py-3 px-4 font-mono text-[11px]">
                            {p.evaluation.results_count > 0 ? (
                              <span className="text-brand-teal-light font-bold">
                                {p.evaluation.results_count} marks
                              </span>
                            ) : (
                              <span className="text-[#666666]">Pending</span>
                            )}
                          </td>

                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
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

                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openDrawerForProject(p.id)}
                                className="px-2 py-1 rounded text-[11px] font-mono text-brand-teal-light hover:bg-brand-teal/10 transition-colors"
                              >
                                Detail
                              </button>
                              <button
                                onClick={() => setProjectToDelete({ id: p.id, title: p.title, code: p.code })}
                                className="text-red-400/60 hover:text-red-400 p-1 rounded transition-colors"
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
        )}

        {/* ======================================================== */}
        {/* MENTORING TAB */}
        {/* ======================================================== */}
        {activeTab === 'mentoring' && (
          <div className="space-y-4">
            <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-[#F5F5F5] font-mono uppercase">
                  Institutional Mentor Network & Allocation
                </h3>
                <p className="text-xs text-[#888888] mt-1 font-sans">
                  Active industry and faculty mentors assigned to supervise student cohort teams.
                </p>
              </div>

              {availableMentors.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-[#888888]">
                  No mentors currently registered in this institution.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableMentors.map((m) => (
                    <div key={m.id} className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white">{m.full_name || 'Mentor'}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-teal/10 text-brand-teal-light uppercase font-bold">
                          Mentor
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#888888]">{m.email}</div>
                      <div className="text-[10px] text-[#666666] pt-2 border-t border-white/[0.04]">
                        Enrolled in institutional roster
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* EVALUATION TAB */}
        {/* ======================================================== */}
        {activeTab === 'evaluation' && (
          <div className="space-y-4">
            <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-[#F5F5F5] font-mono uppercase">
                  Accredited Defense & Rubric Evaluation Registry
                </h3>
                <p className="text-xs text-[#888888] mt-1 font-sans">
                  Review formal rubric marks, milestone weights, and defense examiner observations.
                </p>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {adminProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => openDrawerForProject(p.id)}
                    className="py-3 flex items-center justify-between text-xs hover:bg-white/[0.02] px-2 rounded cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-brand-teal-light font-bold">{p.code}</span>
                        <span className="font-medium text-white">{p.title}</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#888888] mt-0.5">
                        Coordinator: {p.coordinator.name} • {p.domain}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-teal/10 text-brand-teal-light uppercase font-bold">
                        {p.evaluation.results_count > 0 ? `${p.evaluation.results_count} Evaluated` : 'Pending Defense'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#666666]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* REPORTS TAB */}
        {/* ======================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-[#F5F5F5] font-mono uppercase">
                    Institutional Compliance & Accreditation Reports
                  </h3>
                  <p className="text-xs text-[#888888] mt-1 font-sans">
                    Computed audit reports for ABET / NBA accreditation governance.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                  onClick={() => navigate('/reports')}
                >
                  Open Full Reports Workspace
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06]">
                  <span className="text-[#888888] uppercase text-[10px] block mb-1">Total Submissions Recorded</span>
                  <span className="text-2xl font-bold text-white">{licenseData?.usage.recorded_submissions ?? 0}</span>
                </div>
                <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06]">
                  <span className="text-[#888888] uppercase text-[10px] block mb-1">Defense Marks Stored</span>
                  <span className="text-2xl font-bold text-brand-teal-light">{licenseData?.usage.recorded_evaluations ?? 0}</span>
                </div>
                <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06]">
                  <span className="text-[#888888] uppercase text-[10px] block mb-1">Faculty Supervisors</span>
                  <span className="text-2xl font-bold text-white">{licenseData?.usage.faculty_coordinators ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SETTINGS & LICENSE TAB (PROFESSIONAL INSTITUTIONAL CONFIG) */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* License & Commercial Contract */}
            <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-teal-light" />
                  <h3 className="text-sm font-semibold tracking-tight text-[#F5F5F5] font-mono uppercase">
                    Institutional Subscription & Commercial License
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded font-mono text-xs uppercase font-bold ${
                  licenseData?.license.status === 'active'
                    ? 'bg-brand-teal/15 text-brand-teal-light border border-brand-teal/30'
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                }`}>
                  {licenseData?.license.status || 'ACTIVE'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[#888888] uppercase text-[10px]">Contract Plan</span>
                  <div className="text-white font-bold text-sm">{licenseData?.license.plan || 'Institutional License'}</div>
                </div>

                <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[#888888] uppercase text-[10px]">Annual License Value</span>
                  <div className="text-brand-teal-light font-bold text-sm">{licenseData?.license.value || '₹2,40,000 / year'}</div>
                </div>

                <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[#888888] uppercase text-[10px]">Billing Cycle</span>
                  <div className="text-white font-bold text-sm">{licenseData?.license.billing_cycle || 'Annual'}</div>
                </div>

                <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[#888888] uppercase text-[10px]">Term Validity</span>
                  <div className="text-white font-bold text-xs">
                    {licenseData?.license.end_date
                      ? `Valid until ${licenseData.license.end_date} (${licenseData.license.remaining_days} days remaining)`
                      : 'Active Term'}
                  </div>
                </div>
              </div>
            </div>

            {/* Measurable Platform Capacity Utilization */}
            <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
                <Activity className="w-4 h-4 text-brand-teal-light" />
                <h3 className="text-sm font-semibold tracking-tight text-[#F5F5F5] font-mono uppercase">
                  Measurable Platform Capacity & Resource Utilization
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[#888888] uppercase text-[10px]">Project Utilization</span>
                  <div className="text-white font-bold text-base">
                    {licenseData?.usage.active_projects ?? 0} active / {licenseData?.usage.total_projects ?? 0} total
                  </div>
                  <div className="text-[10px] text-[#666666]">
                    Entitlement: {licenseData?.capacities.project_capacity ?? 'Unlimited / Configured'}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[#888888] uppercase text-[10px]">Student Participation</span>
                  <div className="text-white font-bold text-base">
                    {licenseData?.usage.enrolled_students ?? 0} enrolled students
                  </div>
                  <div className="text-[10px] text-[#666666]">
                    Entitlement: {licenseData?.capacities.student_capacity ?? 'Unlimited / Configured'}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[#888888] uppercase text-[10px]">Mentor Allocations</span>
                  <div className="text-white font-bold text-base">
                    {licenseData?.usage.active_mentors ?? 0} active / {licenseData?.usage.total_mentor_assignments ?? 0} assigned
                  </div>
                  <div className="text-[10px] text-[#666666]">
                    Entitlement: {licenseData?.capacities.mentor_capacity ?? 'Unlimited / Configured'}
                  </div>
                </div>
              </div>
            </div>

            {/* Institution Identity */}
            <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
                <Building2 className="w-4 h-4 text-brand-teal-light" />
                <h3 className="text-sm font-semibold tracking-tight text-[#F5F5F5] font-mono uppercase">
                  Institutional Identity
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[#888888] uppercase text-[10px]">Registered University / College</span>
                  <div className="text-white font-bold text-sm">{licenseData?.institution.name || 'Manipal Institute of Technology'}</div>
                </div>
                <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[#888888] uppercase text-[10px]">Tenant UID</span>
                  <div className="text-brand-teal-light font-bold text-xs">{licenseData?.institution.id || profile?.institution_id}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* 4. ADMIN OPERATIONAL PROJECT DETAIL DRAWER */}
      {/* ======================================================== */}
      {selectedDrawerProjectId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-[#0A0C10] border-l border-white/[0.08] h-full flex flex-col justify-between overflow-hidden shadow-2xl">
            {/* Drawer Header */}
            <div className="p-5 sm:p-6 border-b border-white/[0.08] bg-[#07090D] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-brand-teal-light font-bold px-2 py-0.5 rounded bg-brand-teal/10 border border-brand-teal/20">
                    {projectDetail?.project.code || '…'}
                  </span>
                  <span className="font-mono text-[10px] text-[#888888] uppercase">
                    {projectDetail?.project.category} • {projectDetail?.project.duration}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<ExternalLink className="w-3 h-3" />}
                    onClick={() => navigate(`/projects/${selectedDrawerProjectId}`)}
                  >
                    Open Page
                  </Button>
                  <button
                    onClick={() => setSelectedDrawerProjectId(null)}
                    className="p-1 rounded text-[#888888] hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold font-sans text-white line-clamp-1">
                  {projectDetail?.project.title || 'Loading project…'}
                </h2>
                <div className="flex items-center gap-3 text-xs font-mono text-[#888888] mt-1">
                  <span>Coordinator: {projectDetail?.project.coordinator.name}</span>
                  <span>•</span>
                  <span>
                    Status:{' '}
                    <span className="text-white capitalize">{projectDetail?.project.status}</span>
                  </span>
                </div>
              </div>

              {/* Drawer Sub-tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pt-2">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'progress', label: 'Progress & Sprints' },
                  { id: 'team', label: 'Team & Mentors' },
                  { id: 'submissions', label: 'Submissions' },
                  { id: 'evaluation', label: 'Evaluation' },
                  { id: 'timeline', label: 'Activity' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setDrawerSubTab(st.id as 'overview' | 'progress' | 'team' | 'submissions' | 'evaluation' | 'timeline')}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                      drawerSubTab === st.id
                        ? 'bg-white text-black font-bold'
                        : 'text-[#888888] hover:text-white bg-white/[0.04]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
              {detailLoading ? (
                <div className="py-24 text-center font-mono text-[#888888]">
                  <span className="inline-block w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
                  <div>Loading operational project details…</div>
                </div>
              ) : projectDetail ? (
                <>
                  {/* SUBTAB 1: OVERVIEW */}
                  {drawerSubTab === 'overview' && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] text-[#888888] uppercase block">
                          Summary Specification
                        </span>
                        <p className="text-xs text-[#DDDDDD] leading-relaxed font-sans">
                          {projectDetail.project.description}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                        <span className="font-mono text-[10px] text-brand-teal-light uppercase font-bold block">
                          Problem Statement
                        </span>
                        <p className="text-xs text-[#CCCCCC] leading-relaxed">
                          {projectDetail.project.problem_statement || 'Standard engineering brief problem statement.'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                        <span className="font-mono text-[10px] text-brand-teal-light uppercase font-bold block">
                          Expected Outcome / Deliverable
                        </span>
                        <p className="text-xs text-[#CCCCCC] leading-relaxed">
                          {projectDetail.project.expected_outcome || 'Functional prototype with telemetry and accredited defense.'}
                        </p>
                      </div>

                      {projectDetail.project.objectives && projectDetail.project.objectives.length > 0 && (
                        <div className="space-y-2">
                          <span className="font-mono text-[10px] text-[#888888] uppercase block">
                            Key Objectives
                          </span>
                          <div className="space-y-1.5">
                            {projectDetail.project.objectives.map((obj, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-[#CCCCCC]">
                                <span className="text-brand-teal font-mono font-bold mt-0.5">•</span>
                                <span>{obj}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <span className="font-mono text-[10px] text-[#888888] uppercase block">
                          Technical Stack
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {projectDetail.project.skills.map((s, idx) => (
                            <span key={idx} className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-white">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 2: PROGRESS & SPRINTS */}
                  {drawerSubTab === 'progress' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-[#888888] uppercase block">Overall Progress</span>
                          <span className="text-2xl font-bold font-mono text-white">
                            {projectDetail.progress.percent !== null ? `${projectDetail.progress.percent}%` : 'Not configured'}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-brand-teal-light">
                          {projectDetail.progress.completed_milestones} / {projectDetail.progress.total_milestones} Sprints Complete
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {projectDetail.progress.milestones.map((ms) => (
                          <div key={ms.id} className="p-3.5 rounded-lg bg-black/40 border border-white/[0.06] space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs text-brand-teal-light font-bold">
                                Sprint {ms.sequence}: {ms.title}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                                ms.status === 'completed'
                                  ? 'bg-brand-teal/15 text-brand-teal-light'
                                  : ms.status === 'active'
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : 'bg-white/[0.04] text-[#666666]'
                              }`}>
                                {ms.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#888888]">{ms.description}</p>
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#666666] pt-1">
                              <span>Due: {ms.due_date || 'Flexible'}</span>
                              <span>
                                Submissions: {ms.submissions_count} ({ms.reviewed_count} reviewed)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 3: TEAM & MENTORS */}
                  {drawerSubTab === 'team' && (
                    <div className="space-y-5">
                      {/* Supervising Mentors */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs uppercase font-bold text-white">
                            Supervising Mentors
                          </span>
                        </div>

                        {projectDetail.team.mentors.length === 0 ? (
                          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-mono">
                            No mentor assigned. Allocate an industry mentor below.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {projectDetail.team.mentors.map((m) => (
                              <div key={m.id} className="p-3 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-white">{m.full_name}</div>
                                  <div className="text-[10px] font-mono text-[#888888]">{m.email}</div>
                                </div>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-teal/10 text-brand-teal-light uppercase">
                                  {m.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 1-Click Mentor Allocator */}
                        <div className="p-3 rounded-lg bg-black/60 border border-white/[0.06] space-y-2">
                          <span className="font-mono text-[10px] text-[#888888] uppercase block">
                            Assign Mentor to Project
                          </span>
                          <div className="flex gap-2">
                            <select
                              value={selectedMentorToAssign}
                              onChange={(e) => setSelectedMentorToAssign(e.target.value)}
                              className="flex-1 bg-[#0D0D0D] border border-white/[0.08] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                            >
                              <option value="">Select available mentor…</option>
                              {availableMentors.map((am) => (
                                <option key={am.id} value={am.id}>
                                  {am.full_name} ({am.email})
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={!selectedMentorToAssign || assigningMentor}
                              isLoading={assigningMentor}
                              onClick={handleAssignMentor}
                            >
                              Assign
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Enrolled Students */}
                      <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                        <span className="font-mono text-xs uppercase font-bold text-white">
                          Enrolled Student Team ({projectDetail.team.members.length})
                        </span>
                        {projectDetail.team.members.length === 0 ? (
                          <p className="text-xs text-[#888888] font-mono">No students currently enrolled.</p>
                        ) : (
                          <div className="space-y-2">
                            {projectDetail.team.members.map((sm) => (
                              <div key={sm.id} className="p-3 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-white">{sm.full_name}</div>
                                  <div className="text-[10px] font-mono text-[#888888]">{sm.email}</div>
                                </div>
                                <span className="text-[10px] font-mono text-[#666666]">
                                  Joined {new Date(sm.joined_at).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 4: SUBMISSIONS */}
                  {drawerSubTab === 'submissions' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                        <span className="font-mono text-xs uppercase font-bold text-white">
                          Deliverable Submissions ({projectDetail.submissions.total})
                        </span>
                        <span className="text-[11px] font-mono text-brand-teal-light">
                          {projectDetail.submissions.reviewed} reviewed / {projectDetail.submissions.pending} pending
                        </span>
                      </div>

                      {projectDetail.submissions.items.length === 0 ? (
                        <p className="text-xs text-[#888888] font-mono py-8 text-center">
                          No deliverables submitted yet by student teams.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {projectDetail.submissions.items.map((sub) => (
                            <div key={sub.id} className="p-3.5 rounded-lg bg-black/40 border border-white/[0.06] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-white">{sub.title}</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                                  sub.status === 'reviewed'
                                    ? 'bg-brand-teal/15 text-brand-teal-light'
                                    : 'bg-yellow-500/20 text-yellow-300'
                                }`}>
                                  {sub.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#888888] font-mono line-clamp-2">
                                {sub.content}
                              </p>
                              <div className="flex items-center justify-between text-[10px] font-mono text-[#666666] pt-1">
                                <span>Sprint {sub.milestone_sequence} • By {sub.student_name}</span>
                                <span>{sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'Draft'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUBTAB 5: EVALUATION */}
                  {drawerSubTab === 'evaluation' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-[#888888] uppercase block">Average Rubric Score</span>
                          <span className="text-2xl font-bold font-mono text-brand-teal-light">
                            {projectDetail.evaluation.average_score !== null
                              ? `${projectDetail.evaluation.average_score} / 10`
                              : 'No scores recorded'}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-white">
                          {projectDetail.evaluation.results.length} evaluations recorded
                        </span>
                      </div>

                      <div className="space-y-2">
                        <span className="font-mono text-xs uppercase font-bold text-white block">
                          Rubric Criteria ({projectDetail.evaluation.criteria.length})
                        </span>
                        {projectDetail.evaluation.criteria.map((c) => (
                          <div key={c.id} className="p-3 rounded-lg bg-black/40 border border-white/[0.05] flex items-center justify-between">
                            <div>
                              <div className="font-medium text-white">{c.criterion}</div>
                              <div className="text-[10px] text-[#888888]">{c.description}</div>
                            </div>
                            <span className="text-xs font-mono text-brand-teal-light font-bold">
                              Weight: {Math.round(c.weight * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 6: TIMELINE */}
                  {drawerSubTab === 'timeline' && (
                    <div className="space-y-3">
                      <span className="font-mono text-xs uppercase font-bold text-white block pb-2 border-b border-white/[0.06]">
                        Chronological Ledger Timeline
                      </span>
                      <div className="space-y-3 pl-2 border-l border-white/[0.08]">
                        {projectDetail.timeline.map((ev) => (
                          <div key={ev.id} className="relative pl-4 space-y-0.5">
                            <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-brand-teal" />
                            <div className="text-xs font-medium text-white">{ev.title}</div>
                            <div className="text-[10px] font-mono text-[#666666]">
                              {new Date(ev.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-white/[0.08] bg-[#07090D] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#666666]">
                Operational Workspace ID: {selectedDrawerProjectId}
              </span>
              <SecondaryButton size="sm" onClick={() => setSelectedDrawerProjectId(null)}>
                Close Drawer
              </SecondaryButton>
            </div>
          </div>
        </div>
      )}

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
                placeholder="e.g. Campus Smart Energy Ingestion Engine"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Project Code"
                placeholder="CL-NRG-401"
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
                placeholder="IoT / Energy"
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

export default AdminDashboard;
