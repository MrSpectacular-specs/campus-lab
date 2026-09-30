import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Award,
  MessageSquare,
  Clock,
  ExternalLink,
  Target,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useMyProjects, useMilestones, useSubmissions, useMentorFeedback, useEvaluationResults } from '../services';
import type { Milestone, SubmissionStatus } from '../lib/types';
import { Button } from '../components/Button';
import { SecondaryButton } from '../components/SecondaryButton';
import { Modal } from '../components/Modal';
import { PrismFoldBackground } from '../components/PrismFoldBackground';
import { Navbar } from '../components/Navbar';

export interface StudentWorkspaceProps {
  onNavigateHome?: () => void;
  onRequestDemo?: () => void;
}

export const StudentWorkspace: React.FC<StudentWorkspaceProps> = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { projects, loading: projectsLoading, error: projectsError, refetch: refetchMyProjects } = useMyProjects();

  const [searchParams] = useSearchParams();
  const activeView = searchParams.get('view') || 'projects'; // 'projects' | 'milestones' | 'feedback'

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const activeProjectId = selectedProjectId || projects[0]?.id;
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const { milestones, loading: milestonesLoading } = useMilestones(activeProjectId);
  const { feedback, loading: feedbackLoading } = useMentorFeedback(activeProjectId);
  const { results: evalResults, loading: evalLoading } = useEvaluationResults(activeProjectId);

  // Milestone submission modal
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [submissionTitle, setSubmissionTitle] = useState('');
  const [submissionContent, setSubmissionContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { createSubmission } = useSubmissions(selectedMilestone?.id);

  const handleOpenSubmit = (m: Milestone) => {
    setSelectedMilestone(m);
    setSubmissionTitle(`Submission for ${m.title}`);
    setSubmissionContent('');
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleSubmitMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await createSubmission({
      title: submissionTitle,
      content: submissionContent,
      submitted_by: profile.id,
      status: 'submitted' as SubmissionStatus,
      submitted_at: new Date().toISOString(),
    });

    setSubmitting(false);
    if (error) {
      setSubmitError(error);
    } else {
      setSubmitSuccess(true);
      setTimeout(() => {
        setSelectedMilestone(null);
        setSubmitSuccess(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-brand-teal/20 selection:text-brand-teal-light relative">
      <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-30" />
      {/* Unified Global Role-Aware Navbar */}
      <Navbar />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pt-20 sm:pt-24 relative z-10">
        {projectsLoading ? (
          <div className="py-24 text-center text-xs font-mono text-[#888888]">
            <span className="inline-block w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
            <div>Loading your enrolled projects…</div>
          </div>
        ) : projectsError ? (
          <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-red-500/20 text-center max-w-xl mx-auto space-y-4">
            <p className="text-red-400 font-mono text-xs">{projectsError}</p>
            <Button size="sm" variant="primary" onClick={() => refetchMyProjects()}>
              Retry
            </Button>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] text-center max-w-xl mx-auto space-y-4">
            <h2 className="text-lg font-bold text-white font-sans">No Active Project Enrollment</h2>
            <p className="text-xs text-[#888888] font-mono leading-relaxed">
              You haven't joined any projects yet. Browse the accredited Project Library to find and join a project brief for your semester.
            </p>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/projects')}
            >
              Explore Project Library
            </Button>
          </div>
        ) : (
          <>
            {/* Active Project Selector when multiple projects exist */}
            {projects.length > 1 && (
              <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
                  <span className="text-xs font-mono text-[#888888] uppercase tracking-wider">
                    Enrolled Project:
                  </span>
                  <span className="font-mono text-xs font-bold text-brand-teal-light">{activeProject?.code}</span>
                  <span className="text-xs font-bold text-white font-sans truncate max-w-xs">{activeProject?.title}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#888888]">Switch Project:</span>
                  <select
                    value={activeProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="bg-black/60 border border-white/[0.08] rounded-lg px-2.5 py-1 text-xs text-[#F5F5F5] font-mono focus:outline-none cursor-pointer"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 1: MY PROJECTS PAGE (/student or /student?view=projects) */}
            {/* ======================================================== */}
            {activeView === 'projects' && (
              <div className="space-y-6 animate-page-enter">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                      My Enrolled Project Cohorts
                    </h1>
                    <p className="text-xs text-[#888888] mt-1 font-sans">
                      Engineering project teams you have joined. Track sprint deliverables, commit milestone work, and inspect mentor guidance.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded bg-brand-teal/10 border border-brand-teal/20 text-xs font-mono text-brand-teal-light font-bold">
                    {projects.length} Active Enrollment(s)
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] hover:border-brand-teal/30 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="text-brand-teal-light font-bold px-2 py-0.5 rounded bg-brand-teal/10 border border-brand-teal/20">
                            {p.code}
                          </span>
                          <span className="text-[#888888]">
                            {p.domain} • {p.duration}
                          </span>
                        </div>

                        <div>
                          <h2 className="text-base font-bold text-white font-sans line-clamp-1">
                            {p.title}
                          </h2>
                          <p className="text-xs text-[#888888] mt-1 line-clamp-2 leading-relaxed font-sans">
                            {p.description}
                          </p>
                        </div>

                        {p.skills && p.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {p.skills.slice(0, 4).map((s, idx) => (
                              <span key={idx} className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-[#CCCCCC]">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                        <span className="text-[10px] font-mono text-brand-teal-light uppercase font-bold">
                          ✓ Enrolled Team Member
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            icon={<ExternalLink className="w-3 h-3" />}
                            onClick={() => navigate(`/projects/${p.id}`)}
                          >
                            Full Brief
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            icon={<ArrowRight className="w-3 h-3" />}
                            onClick={() => {
                              setSelectedProjectId(p.id);
                              navigate('/student?view=milestones');
                            }}
                          >
                            View Sprints
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 2: MILESTONES PAGE (/student?view=milestones) */}
            {/* ======================================================== */}
            {activeView === 'milestones' && (
              <div className="space-y-6 animate-page-enter">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                      Milestone Execution Roadmap
                    </h1>
                    <p className="text-xs text-[#888888] mt-1 font-sans">
                      Structured sprint progress, deadlines, deliverable specifications, and work submissions.
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#888888]">
                    {milestones.filter((m) => m.status === 'completed').length} / {milestones.length} Completed Sprints
                  </span>
                </div>

                {milestonesLoading ? (
                  <div className="py-16 text-center text-xs font-mono text-[#888888]">Loading milestones roadmap…</div>
                ) : milestones.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] text-center font-mono text-xs text-[#888888]">
                    No milestones provisioned yet for this project brief.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {milestones.map((m) => (
                      <div
                        key={m.id}
                        className="p-5 sm:p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] hover:border-brand-teal/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xs text-brand-teal-light font-bold">
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

                          {m.due_date && (
                            <div className="text-[10px] font-mono text-[#666666] flex items-center gap-1 pt-1">
                              <Clock className="w-3 h-3" /> Target Date: {m.due_date}
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant={m.status === 'completed' ? 'outline' : 'primary'}
                          onClick={() => handleOpenSubmit(m)}
                          className="whitespace-nowrap flex-shrink-0 self-end md:self-center"
                        >
                          {m.status === 'completed' ? 'Update Work' : 'Submit Work'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 3: FEEDBACK PAGE (/student?view=feedback) */}
            {/* ======================================================== */}
            {activeView === 'feedback' && (
              <div className="space-y-6 animate-page-enter">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                      Supervising Mentor Guidance & Feedback
                    </h1>
                    <p className="text-xs text-[#888888] mt-1 font-sans">
                      Checkpoint advice and architectural reviews submitted by your project's industry supervisor.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white">
                    {feedback.length} Feedback Notes
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Feedback Notes */}
                  <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                      <MessageSquare className="w-4 h-4 text-brand-teal-light" />
                      <h3 className="font-mono text-xs uppercase font-bold text-white">
                        Reviewer Observations ({feedback.length})
                      </h3>
                    </div>

                    {feedbackLoading ? (
                      <div className="py-8 text-center text-xs font-mono text-[#888888]">Loading feedback…</div>
                    ) : feedback.length === 0 ? (
                      <div className="py-12 text-center text-xs font-mono text-[#888888] space-y-2">
                        <p>No mentor feedback recorded yet for this project brief.</p>
                        <p className="text-[10px] text-[#666666]">Submit your sprint deliverable notes to receive practitioner guidance.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {feedback.map((f) => (
                          <div key={f.id} className="p-4 rounded-xl bg-black/40 border border-white/[0.05] space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-brand-teal-light font-bold">{f.mentor?.full_name || 'Assigned Mentor'}</span>
                              <span className="text-[#666666]">{new Date(f.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-[#DDDDDD] leading-relaxed font-sans">
                              {f.feedback}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Formal Defense Rubric Marks (Personalized to Student) */}
                  <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                      <Award className="w-4 h-4 text-brand-teal-light" />
                      <h3 className="font-mono text-xs uppercase font-bold text-white">
                        Formal Defense Rubric Marks
                      </h3>
                    </div>

                    {evalLoading ? (
                      <div className="py-8 text-center text-xs font-mono text-[#888888]">Loading marks…</div>
                    ) : evalResults.length === 0 ? (
                      <div className="py-12 text-center text-xs font-mono text-[#888888] space-y-2">
                        <p>Evaluation defense is scheduled following completion of all milestone sprints.</p>
                        <p className="text-[10px] text-[#666666]">Examiner marks will be published here upon defense finalization.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {evalResults.map((r) => (
                          <div key={r.id} className="p-3.5 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-xs text-white">{r.criterion?.criterion || 'Criterion'}</div>
                              <div className="text-[10px] text-[#888888] mt-0.5">{r.feedback}</div>
                            </div>
                            <div className="text-right font-mono">
                              <span className="text-base font-bold text-brand-teal-light">{r.score}</span>
                              <span className="text-xs text-[#666666]"> / 10</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* SUBMISSION MODAL */}
      {selectedMilestone && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedMilestone(null)}
          size="lg"
          title={`Milestone Submission: ${selectedMilestone.title}`}
          subtitle={`Sprint ${selectedMilestone.sequence} Deliverable`}
        >
          <form onSubmit={handleSubmitMilestone} className="space-y-4 text-xs">
            {submitError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded font-mono text-[11px]">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="bg-brand-teal/10 border border-brand-teal/30 text-brand-teal-light p-2.5 rounded font-mono text-[11px]">
                Deliverable submitted successfully! Recorded in cohort timeline.
              </div>
            )}

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#888888] block mb-1">
                Submission Title
              </label>
              <input
                type="text"
                value={submissionTitle}
                onChange={(e) => setSubmissionTitle(e.target.value)}
                required
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-brand-teal/50"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#888888] block mb-1">
                Deliverable Description / Architecture Notes / Repository Links
              </label>
              <textarea
                rows={6}
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                placeholder="Detail your engineering implementation, key test results, architecture diagrams, pull requests, and commit summaries…"
                required
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-brand-teal/50 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <SecondaryButton size="sm" onClick={() => setSelectedMilestone(null)}>
                Cancel
              </SecondaryButton>
              <Button size="sm" variant="primary" type="submit" isLoading={submitting}>
                Record Submission
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StudentWorkspace;
