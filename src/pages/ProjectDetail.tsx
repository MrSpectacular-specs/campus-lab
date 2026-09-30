import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Compass,
  Users2,
  CheckCircle2,
  ShieldCheck,
  FileCheck2,
  Layers,
  Award,
  Check,
  Calendar,
  ChevronRight,
  UserCheck,
  Target,
  Cpu,
  AlertCircle,
  Briefcase,
  Trash2,
  Settings,
} from 'lucide-react';
import { useProject, useMilestones, useMentorAssignments, useEvaluationCriteria, useProjects } from '../services';
import { useAuth } from '../lib/auth';
import { Button } from '../components/Button';
import { SecondaryButton } from '../components/SecondaryButton';
import { Modal } from '../components/Modal';
import { PrismFoldBackground } from '../components/PrismFoldBackground';
import { ViewportSection } from '../components/ViewportSection';
import { PageProgress, type ProgressItem } from '../components/PageProgress';

const PROGRESS_ITEMS: ProgressItem[] = [
  { id: 'sec-intro', label: 'Brief' },
  { id: 'sec-problem', label: 'Problem' },
  { id: 'sec-outcome', label: 'Outcome' },
  { id: 'sec-skills', label: 'Skills' },
  { id: 'sec-roadmap', label: 'Roadmap' },
  { id: 'sec-team', label: 'Team' },
  { id: 'sec-evaluation', label: 'Rubric' },
  { id: 'sec-cta', label: 'Action' },
];

export interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  onRequestDemo?: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  projectId,
  onBack,
}) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { project, members, loading: projectLoading, error: projectError, refetch: refetchProject, addMember } = useProject(projectId);
  const { milestones, loading: milestonesLoading } = useMilestones(projectId);
  const { assignments, loading: assignmentsLoading } = useMentorAssignments(projectId);
  const { criteria, loading: criteriaLoading } = useEvaluationCriteria(projectId);
  const { updateProject, deleteProject } = useProjects();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [activeSprintIndex, setActiveSprintIndex] = useState<number>(0);
  const [isJoinSubmitting, setIsJoinSubmitting] = useState<boolean>(false);
  const [joinSuccess, setJoinSuccess] = useState<boolean>(false);

  const isMember = members.some((m) => m.user_id === user?.id);
  const isMentorAssigned = assignments.some((a) => a.mentor_id === user?.id);
  const activeMilestone = milestones[activeSprintIndex] || milestones[0];

  const handleJoinProject = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsJoinSubmitting(true);
    const { error } = await addMember(user.id, profile?.role || 'student');
    setIsJoinSubmitting(false);
    if (!error) {
      setJoinSuccess(true);
      setTimeout(() => setJoinSuccess(false), 3000);
    } else {
      alert(`Could not join project: ${error}`);
    }
  };

  // Render role-specific primary CTA button
  const renderPrimaryAction = () => {
    if (!user) {
      return (
        <Button
          size="sm"
          variant="primary"
          icon={<ArrowRight className="w-3.5 h-3.5" />}
          onClick={() => navigate('/login')}
        >
          Sign In to Join
        </Button>
      );
    }

    if (user.role === 'student') {
      if (isMember) {
        return (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-teal/10 border border-brand-teal/30 text-xs font-mono text-brand-teal-light font-semibold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Enrolled Team Member</span>
            </span>
            <Button
              size="sm"
              variant="primary"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/student')}
            >
              Open My Workspace
            </Button>
          </div>
        );
      }

      return (
        <Button
          size="sm"
          variant="primary"
          onClick={handleJoinProject}
          isLoading={isJoinSubmitting}
        >
          {joinSuccess ? 'Joined Team!' : 'Join Project Team'}
        </Button>
      );
    }

    if (user.role === 'mentor') {
      return (
        <Button
          size="sm"
          variant="primary"
          icon={<ArrowRight className="w-3.5 h-3.5" />}
          onClick={() => navigate('/mentor')}
        >
          {isMentorAssigned ? 'Open Mentor Review' : 'View Mentor Workspace'}
        </Button>
      );
    }

    if (user.role === 'faculty') {
      return (
        <Button
          size="sm"
          variant="primary"
          icon={<ArrowRight className="w-3.5 h-3.5" />}
          onClick={() => navigate('/faculty')}
        >
          Manage in Faculty Workspace
        </Button>
      );
    }

    // Admin
    return (
      <Button
        size="sm"
        variant="primary"
        icon={<ArrowRight className="w-3.5 h-3.5" />}
        onClick={() => navigate('/dashboard')}
      >
        Manage in Dashboard
      </Button>
    );
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex items-center justify-center">
        <div className="text-center font-mono text-xs text-[#888888]">
          <span className="inline-block w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
          <div>Loading accredited project specification…</div>
        </div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col items-center justify-center p-4">
        <div className="bg-[#0D0D0D] border border-red-500/20 rounded-2xl p-8 max-w-md text-center space-y-4">
          <p className="text-red-400 font-mono text-xs">
            {projectError || 'Project not found or access restricted.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="sm" variant="outline" onClick={onBack}>
              Return to Library
            </Button>
            <Button size="sm" variant="primary" onClick={() => refetchProject()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] selection:bg-brand-teal/20 selection:text-brand-teal-light">
      {/* 1. TOP HEADER & WORKSPACE CONTEXT */}
      <section className="sticky top-16 sm:top-[68px] z-30 py-3.5 border-b border-white/[0.08] bg-[#07090D]/95 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer select-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Project Library</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block font-mono text-xs text-[#888888]">
              Ref: <span className="text-brand-teal-light font-bold">{project.code}</span>
            </span>

            {renderPrimaryAction()}
          </div>
        </div>
      </section>

      <PageProgress items={PROGRESS_ITEMS} />
      <main className="flex-1 w-full relative z-10 pt-4">
        <ViewportSection id="sec-intro" label="Project Brief" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center space-y-6">
        {/* 2. PROJECT HERO & SPECIFICATION HEADER */}
        <div className="relative rounded-2xl prism-glass p-6 sm:p-8 space-y-4 overflow-hidden">
          <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-35" />
          <div className="prism-highlight w-full absolute top-0 left-0" />
          <div className="relative z-10 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-brand-teal/10 text-brand-teal-light border border-brand-teal/20 font-bold uppercase">
              {project.category}
            </span>
            <span className="px-2.5 py-1 rounded bg-white/[0.04] text-[#B8B8B8] border border-white/[0.08]">
              {project.domain}
            </span>
            <span className="px-2.5 py-1 rounded bg-white/[0.04] text-[#888888] border border-white/[0.08]">
              {project.duration}
            </span>
            <span className="px-2.5 py-1 rounded bg-white/[0.04] text-[#888888] border border-white/[0.08]">
              {project.difficulty}
            </span>
            <span className={`px-2.5 py-1 rounded uppercase font-bold text-[10px] ${
              project.status === 'active'
                ? 'bg-brand-teal/15 text-brand-teal-light border border-brand-teal/30'
                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
            }`}>
              {project.status}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            {project.title}
          </h1>

          <p className="text-sm sm:text-base text-[#B8B8B8] leading-relaxed max-w-4xl font-sans">
            {project.description}
          </p>
        </div>
        {/* ADMIN OPERATIONAL CONTROL BAR */}
        {user?.role === 'admin' && (
          <div className="p-4 rounded-xl bg-brand-teal/5 border border-brand-teal/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              <span className="font-mono text-xs uppercase font-bold text-brand-teal-light">
                Institutional Admin Control Bar
              </span>
              <span className="text-[10px] font-mono text-[#888888]">
                (Lifecycle State & Mutation Controls)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-[#888888]">Status:</span>
                <select
                  value={project.status}
                  disabled={statusUpdating}
                  onChange={async (e) => {
                    setStatusUpdating(true);
                    await updateProject(project.id, { status: e.target.value as 'draft' | 'active' | 'completed' | 'archived' });
                    await refetchProject();
                    setStatusUpdating(false);
                  }}
                  className="bg-black/60 border border-white/[0.08] rounded px-2.5 py-1 text-xs text-white font-mono uppercase focus:outline-none cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-mono text-red-400 hover:text-red-300 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}


          </div>
        </ViewportSection>

        {/* 2. THE PROBLEM */}
        <ViewportSection id="sec-problem" label="The Engineering Problem" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
          {/* Section: The Problem */}
          <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-brand-teal-light" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-white font-bold">
                The Engineering Problem
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed font-sans">
              {project.problem_statement ||
                'Colleges and industrial facilities face critical operational friction, lack of real-time sensory data, and manual bottlenecks that require automated engineering intervention.'}
            </p>
          </div>
          </div>
        </ViewportSection>

        {/* 3. WHAT YOU'LL BUILD & OBJECTIVES */}
        <ViewportSection id="sec-outcome" label="What You'll Build & Objectives" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center space-y-6">
          {/* Section: What You'll Build */}
          <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-teal-light" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-white font-bold">
                What You'll Build (Target Outcome)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed font-sans">
              {project.expected_outcome ||
                'A fully integrated and tested prototype with data ingestion, edge processing, real-time telemetry, and formal validation defense.'}
            </p>
          </div>

        {/* 4. CONCRETE OBJECTIVES (3-5 SPECIFIC ITEMS) */}
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-teal-light" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-white font-bold">
              Engineering Objectives & Roadmap Milestones
            </h3>
          </div>

          {project.objectives && project.objectives.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.objectives.map((obj, oIdx) => (
                <div key={oIdx} className="p-3.5 rounded-xl bg-black/40 border border-white/[0.05] flex items-start gap-3">
                  <span className="font-mono text-xs text-brand-teal-light font-bold mt-0.5">
                    0{oIdx + 1}
                  </span>
                  <p className="text-xs text-[#DDDDDD] font-sans leading-relaxed">{obj}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.05] flex items-start gap-3">
                <span className="font-mono text-xs text-brand-teal-light font-bold mt-0.5">01</span>
                <p className="text-xs text-[#DDDDDD]">Research & Scope Requirements Specification</p>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.05] flex items-start gap-3">
                <span className="font-mono text-xs text-brand-teal-light font-bold mt-0.5">02</span>
                <p className="text-xs text-[#DDDDDD]">System Architecture & Core Prototype Development</p>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.05] flex items-start gap-3">
                <span className="font-mono text-xs text-brand-teal-light font-bold mt-0.5">03</span>
                <p className="text-xs text-[#DDDDDD]">Testing, Telemetry Verification, and Metric Validation</p>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.05] flex items-start gap-3">
                <span className="font-mono text-xs text-brand-teal-light font-bold mt-0.5">04</span>
                <p className="text-xs text-[#DDDDDD]">Accredited Defense Presentation and Documentation</p>
              </div>
            </div>
          )}
        </div>
          </div>
        </ViewportSection>

        {/* 4. TECHNICAL REQUIREMENTS */}
        <ViewportSection id="sec-skills" label="Technical Requirements" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] space-y-3">
            <span className="font-mono text-[10px] text-brand-teal-light uppercase tracking-wider block font-bold">
              VERIFIED ARCHITECTURE STACK
            </span>
            <div className="flex flex-wrap gap-2">
              {project.skills && project.skills.length > 0 ? (
                project.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/[0.03] text-white border border-white/[0.07]"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs font-mono text-[#888888]">Standard engineering stack</span>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] space-y-3">
            <span className="font-mono text-[10px] text-brand-teal-light uppercase tracking-wider block font-bold">
              TECHNICAL PREREQUISITES
            </span>
            <div className="flex flex-wrap gap-2">
              {project.prerequisites && project.prerequisites.length > 0 ? (
                project.prerequisites.map((p, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono px-3 py-1.5 rounded-lg bg-black/40 text-[#CCCCCC] border border-white/[0.05]"
                  >
                    {p}
                  </span>
                ))
              ) : (
                <span className="text-xs font-mono text-[#888888]">Undergraduate engineering foundation</span>
              )}
            </div>
          </div>
        </div>
          </div>
        </ViewportSection>

        {/* 5. PROJECT ROADMAP */}
        <ViewportSection id="sec-roadmap" label="Project Roadmap" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div>
              <span className="font-mono text-[10px] text-brand-teal-light uppercase tracking-wider block font-bold">
                STRUCTURED DELIVERABLE TIMELINE
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white font-sans mt-0.5">
                Milestone Execution Sprints
              </h2>
            </div>
            <span className="font-mono text-xs text-[#888888]">
              {milestones.length} Sprints Configured
            </span>
          </div>

          {milestonesLoading ? (
            <div className="py-8 text-center text-xs font-mono text-[#888888]">Loading roadmap milestones…</div>
          ) : milestones.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#888888]">
              Sprint roadmap is being provisioned by the academic coordinator.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sprint Selectors */}
              <div className="space-y-2">
                {milestones.map((m, idx) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveSprintIndex(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      activeSprintIndex === idx
                        ? 'bg-white/[0.08] border-brand-teal/40 text-white shadow-sm'
                        : 'bg-black/30 border-white/[0.05] text-[#888888] hover:text-[#B8B8B8] hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span>Sprint {m.sequence}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        m.status === 'completed'
                          ? 'bg-brand-teal/10 text-brand-teal-light'
                          : m.status === 'active'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-white/[0.04] text-[#666666]'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                    <div className="font-sans font-semibold text-xs text-[#F5F5F5] mt-1.5 line-clamp-1">
                      {m.title}
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Milestone Card */}
              <div className="md:col-span-2 p-6 rounded-2xl bg-black/40 border border-white/[0.06] space-y-4">
                {activeMilestone && (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                      <span className="font-mono text-xs text-brand-teal-light font-bold">
                        SPRINT {activeMilestone.sequence} DELIVERABLE SPECIFICATION
                      </span>
                      {activeMilestone.due_date && (
                        <span className="font-mono text-xs text-[#888888]">
                          Target: {activeMilestone.due_date}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white font-sans">
                        {activeMilestone.title}
                      </h4>
                      <p className="mt-2 text-xs sm:text-sm text-[#CCCCCC] leading-relaxed font-sans">
                        {activeMilestone.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#888888]">
                        Status: <span className="text-white capitalize">{activeMilestone.status}</span>
                      </span>
                      {user?.role === 'student' && isMember && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => navigate('/student')}
                        >
                          Submit Work
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
          </div>
        </ViewportSection>

        {/* 6. TEAM & MENTOR */}
        <ViewportSection id="sec-team" label="Team & Mentoring" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supervising Mentors */}
          <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] space-y-4">
            <span className="font-mono text-xs text-brand-teal-light uppercase tracking-wider block font-bold">
              SUPERVISING MENTORS
            </span>

            {assignmentsLoading ? (
              <div className="py-4 text-xs font-mono text-[#888888]">Loading mentors…</div>
            ) : assignments.length === 0 ? (
              <p className="text-xs text-[#888888] font-mono">
                No mentor assigned yet. Institutional coordinators assign industry supervisors through the dashboard.
              </p>
            ) : (
              <div className="space-y-3">
                {assignments.map((a) => (
                  <div key={a.id} className="p-3.5 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-white">{a.mentor?.full_name || 'Assigned Mentor'}</div>
                      {a.mentor?.email && (
                        <div className="text-[10px] font-mono text-[#888888] mt-0.5">{a.mentor.email}</div>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-teal/10 text-brand-teal-light uppercase font-bold">
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enrolled Team Members */}
          <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] space-y-4">
            <span className="font-mono text-xs text-brand-teal-light uppercase tracking-wider block font-bold">
              ENROLLED STUDENT TEAM
            </span>

            {members.length === 0 ? (
              <p className="text-xs text-[#888888] font-mono">
                Team is open for enrollment. Eligible students can join this project brief.
              </p>
            ) : (
              <div className="space-y-2.5">
                {members.map((m) => (
                  <div key={m.id} className="p-3 rounded-lg bg-black/40 border border-white/[0.05] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium text-white">{m.profile?.full_name || 'Student Member'}</span>
                      {m.profile?.email && (
                        <span className="text-[10px] font-mono text-[#777777] ml-2">{m.profile.email}</span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-[#888888] capitalize">{m.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          </div>
        </ViewportSection>

        {/* 7. EVALUATION RUBRIC */}
        <ViewportSection id="sec-evaluation" label="Accredited Rubric" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        {criteria.length > 0 ? (
          <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] space-y-4">
            <span className="font-mono text-xs text-brand-teal-light uppercase tracking-wider block font-bold">
              ACCREDITED EVALUATION RUBRIC
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {criteria.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-black/40 border border-white/[0.05] space-y-1">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-brand-teal-light font-bold">Weight: {Math.round(c.weight * 100)}%</span>
                    <span className="text-[#888888]">Max: {c.max_score}</span>
                  </div>
                  <h4 className="font-semibold text-xs text-white">{c.criterion}</h4>
                  <p className="text-[10px] text-[#888888] leading-relaxed line-clamp-2">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] text-center font-mono text-xs text-[#888888]">Evaluation criteria pending specification.</div>
        )}
          </div>
        </ViewportSection>

        {/* 8. ACTION */}
        <ViewportSection id="sec-cta" label="Next Action" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-white font-sans">
              Ready to execute this engineering brief?
            </h4>
            <p className="text-xs text-[#888888] mt-0.5">
              Structured sprint roadmaps, mentor checkpoint reviews, and formal defense marks.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <SecondaryButton size="sm" onClick={onBack} className="flex-1 sm:flex-none">
              Back to Library
            </SecondaryButton>
            {renderPrimaryAction()}
          </div>
        </div>
          </div>
        </ViewportSection>
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsDeleteModalOpen(false)}
          size="sm"
          title="Confirm Project Deletion"
          subtitle="Permanent administrative purge"
        >
          <div className="space-y-4 text-xs font-mono">
            <p className="text-[#CCCCCC]">
              Are you sure you want to permanently delete project brief{' '}
              <span className="font-bold text-white">{project.code}</span> ({project.title})?
            </p>
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[11px]">
              Warning: All associated milestones, student submissions, and rubric evaluations will be purged.
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
              <SecondaryButton size="sm" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </SecondaryButton>
              <Button
                size="sm"
                variant="primary"
                className="bg-red-600 hover:bg-red-500 text-white"
                isLoading={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  await deleteProject(project.id);
                  setIsDeleting(false);
                  setIsDeleteModalOpen(false);
                  onBack();
                }}
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

export default ProjectDetail;
