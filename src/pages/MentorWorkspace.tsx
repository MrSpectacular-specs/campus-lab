import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Layers,
  MessageSquare,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  FileCheck2,
  AlertCircle,
  FolderGit2,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  useMentorProjects,
  useMilestones,
  useProjectSubmissions,
  useMentorFeedback,
  useEvaluationCriteria,
  useEvaluationResults,
} from '../services';
import type { MilestoneSubmission } from '../lib/types';
import { Button } from '../components/Button';
import { SecondaryButton } from '../components/SecondaryButton';
import { Modal } from '../components/Modal';
import { PrismFoldBackground } from '../components/PrismFoldBackground';
import { Navbar } from '../components/Navbar';

export interface MentorWorkspaceProps {
  onNavigateHome?: () => void;
  onRequestDemo?: () => void;
}

export const MentorWorkspace: React.FC<MentorWorkspaceProps> = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { projects, loading: projectsLoading, error: projectsError, refetch: refetchMentorProjects } = useMentorProjects();

  const [searchParams] = useSearchParams();
  const activeView = searchParams.get('view') || 'projects'; // 'projects' | 'submissions' | 'feedback' | 'evaluation'

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const activeProjectId = selectedProjectId || projects[0]?.id;
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const { milestones, loading: milestonesLoading } = useMilestones(activeProjectId);
  const { submissions, loading: submissionsLoading, refetch: refetchSubmissions } = useProjectSubmissions(activeProjectId);
  const { feedback, loading: feedbackLoading, refetch: refetchFeedback, addFeedback } = useMentorFeedback(activeProjectId);
  const { criteria, loading: criteriaLoading } = useEvaluationCriteria(activeProjectId);
  const { results: evalResults, loading: evalLoading, refetch: refetchEval, submitEvaluation } = useEvaluationResults(activeProjectId);

  // Submissions filter state
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<'ALL' | 'submitted' | 'reviewed'>('ALL');

  // Review & Feedback Modal
  const [selectedSubmission, setSelectedSubmission] = useState<MilestoneSubmission | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Evaluation Modal
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [evalScores, setEvalScores] = useState<Record<string, number>>({});
  const [evalFeedback, setEvalFeedback] = useState<Record<string, string>>({});
  const [evalSubmitting, setEvalSubmitting] = useState(false);
  const [evalSuccess, setEvalSuccess] = useState(false);

  const handleOpenReview = (s: MilestoneSubmission) => {
    setSelectedSubmission(s);
    setFeedbackText('');
    setFeedbackError(null);
    setFeedbackSuccess(false);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedSubmission) return;
    setSubmittingFeedback(true);
    setFeedbackError(null);

    const { error } = await addFeedback({
      submission_id: selectedSubmission.id,
      milestone_id: selectedSubmission.milestone_id,
      mentor_id: profile.id,
      feedback: feedbackText,
    });

    setSubmittingFeedback(false);
    if (error) {
      setFeedbackError(error);
    } else {
      setFeedbackSuccess(true);
      refetchSubmissions();
      refetchFeedback();
      setTimeout(() => {
        setSelectedSubmission(null);
        setFeedbackSuccess(false);
      }, 1200);
    }
  };

  const handleOpenEvaluation = () => {
    setIsEvalModalOpen(true);
    const initialScores: Record<string, number> = {};
    const initialFeedback: Record<string, string> = {};
    criteria.forEach((c) => {
      initialScores[c.id] = 8;
      initialFeedback[c.id] = '';
    });
    setEvalScores(initialScores);
    setEvalFeedback(initialFeedback);
    setEvalSuccess(false);
  };

  const handleSubmitAllEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !activeProjectId) return;
    setEvalSubmitting(true);

    const firstSubmission = submissions[0];
    const studentId = firstSubmission?.submitted_by || profile.id;

    for (const crit of criteria) {
      await submitEvaluation({
        criterion_id: crit.id,
        project_id: activeProjectId,
        student_id: studentId,
        evaluator_id: profile.id,
        score: evalScores[crit.id] ?? 8,
        feedback: evalFeedback[crit.id] || 'Verified defense criterion standard.',
      });
    }

    setEvalSubmitting(false);
    setEvalSuccess(true);
    refetchEval();
    setTimeout(() => {
      setIsEvalModalOpen(false);
      setEvalSuccess(false);
    }, 1200);
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (submissionStatusFilter === 'ALL') return true;
    return s.status === submissionStatusFilter;
  });

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
            <div>Loading assigned projects from database…</div>
          </div>
        ) : projectsError ? (
          <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-red-500/20 text-center max-w-xl mx-auto space-y-4">
            <p className="text-red-400 font-mono text-xs">{projectsError}</p>
            <Button size="sm" variant="primary" onClick={() => refetchMentorProjects()}>
              Retry
            </Button>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] text-center max-w-xl mx-auto space-y-4">
            <h2 className="text-lg font-bold text-white font-sans">No Assigned Projects</h2>
            <p className="text-xs text-[#888888] font-mono leading-relaxed">
              You are currently not assigned to supervise any cohort projects. Institution coordinators assign mentors through the central admin dashboard.
            </p>
          </div>
        ) : (
          <>
            {/* Project Switcher Bar if mentor has > 1 project */}
            {projects.length > 1 && (
              <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
                  <span className="text-xs font-mono text-[#888888] uppercase tracking-wider">
                    Supervising Project:
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
            {/* VIEW 1: MY PROJECTS PAGE (Default / /mentor) */}
            {/* ======================================================== */}
            {activeView === 'projects' && (
              <div className="space-y-6 animate-page-enter">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                      Supervised Project Catalog
                    </h1>
                    <p className="text-xs text-[#888888] mt-1 font-sans">
                      Accredited student cohorts currently assigned to you for practitioner guidance and milestone review.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded bg-brand-teal/10 border border-brand-teal/20 text-xs font-mono text-brand-teal-light font-bold">
                    {projects.length} Assigned Project(s)
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] hover:border-brand-teal/30 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="text-brand-teal-light font-bold px-2 py-0.5 rounded bg-brand-teal/10 border border-brand-teal/20">
                            {proj.code}
                          </span>
                          <span className="text-[#888888]">
                            {proj.domain} • {proj.duration}
                          </span>
                        </div>

                        <div>
                          <h2 className="text-base font-bold text-white font-sans line-clamp-1">
                            {proj.title}
                          </h2>
                          <p className="text-xs text-[#888888] mt-1 line-clamp-2 leading-relaxed font-sans">
                            {proj.description}
                          </p>
                        </div>

                        {proj.skills && proj.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {proj.skills.slice(0, 4).map((s, idx) => (
                              <span key={idx} className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-[#CCCCCC]">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[10px] font-mono text-brand-teal-light uppercase font-bold">
                          ● Active Supervision
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            icon={<ExternalLink className="w-3 h-3" />}
                            onClick={() => navigate(`/projects/${proj.id}`)}
                          >
                            Open Brief
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            icon={<ArrowRight className="w-3 h-3" />}
                            onClick={() => {
                              setSelectedProjectId(proj.id);
                              navigate('/mentor?view=submissions');
                            }}
                          >
                            Review Work
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 2: SUBMISSIONS REVIEW PAGE (/mentor?view=submissions) */}
            {/* ======================================================== */}
            {activeView === 'submissions' && (
              <div className="space-y-6 animate-page-enter">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                      Student Deliverable Review Queue
                    </h1>
                    <p className="text-xs text-[#888888] mt-1 font-sans">
                      Inspect committed milestone deliverables, review architecture notes and pull requests, and provide checkpoint guidance.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSubmissionStatusFilter('ALL')}
                      className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                        submissionStatusFilter === 'ALL'
                          ? 'bg-white text-black font-bold'
                          : 'bg-[#0D0D0D] text-[#888888] border border-white/[0.06]'
                      }`}
                    >
                      All ({submissions.length})
                    </button>
                    <button
                      onClick={() => setSubmissionStatusFilter('submitted')}
                      className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                        submissionStatusFilter === 'submitted'
                          ? 'bg-yellow-400 text-black font-bold'
                          : 'bg-[#0D0D0D] text-[#888888] border border-white/[0.06]'
                      }`}
                    >
                      Needs Review ({submissions.filter((s) => s.status === 'submitted').length})
                    </button>
                    <button
                      onClick={() => setSubmissionStatusFilter('reviewed')}
                      className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                        submissionStatusFilter === 'reviewed'
                          ? 'bg-brand-teal text-black font-bold'
                          : 'bg-[#0D0D0D] text-[#888888] border border-white/[0.06]'
                      }`}
                    >
                      Reviewed ({submissions.filter((s) => s.status === 'reviewed').length})
                    </button>
                  </div>
                </div>

                {submissionsLoading ? (
                  <div className="py-16 text-center text-xs font-mono text-[#888888]">Loading submissions queue…</div>
                ) : filteredSubmissions.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] text-center font-mono text-xs text-[#888888]">
                    No deliverables found matching the selected filter.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSubmissions.map((s) => (
                      <div
                        key={s.id}
                        className="p-5 sm:p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] hover:border-brand-teal/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white font-sans">{s.title}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                              s.status === 'reviewed'
                                ? 'bg-brand-teal/15 text-brand-teal-light border border-brand-teal/30'
                                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            }`}>
                              {s.status === 'reviewed' ? 'Reviewed' : 'Needs Review'}
                            </span>
                          </div>

                          <p className="text-xs text-[#CCCCCC] font-mono leading-relaxed line-clamp-2">
                            {s.content}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-[#777777]">
                            <span>Submitted: {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : 'Draft'}</span>
                            {s.repository_url && (
                              <a
                                href={s.repository_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-teal-light hover:underline flex items-center gap-1"
                              >
                                <FolderGit2 className="w-3 h-3" />
                                <span>Repository Link</span>
                              </a>
                            )}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleOpenReview(s)}
                          className="whitespace-nowrap flex-shrink-0"
                        >
                          Leave Review Feedback
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 3: FEEDBACK PAGE (/mentor?view=feedback) */}
            {/* ======================================================== */}
            {activeView === 'feedback' && (
              <div className="space-y-6 animate-page-enter">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                      Mentor Guidance & Checkpoint Ledger
                    </h1>
                    <p className="text-xs text-[#888888] mt-1 font-sans">
                      Historical audit log of architectural suggestions, code review feedback, and milestone acceptance notes provided to student teams.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white">
                    {feedback.length} Recorded Feedback Item(s)
                  </span>
                </div>

                {feedbackLoading ? (
                  <div className="py-16 text-center text-xs font-mono text-[#888888]">Loading feedback history…</div>
                ) : feedback.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] text-center font-mono text-xs text-[#888888] space-y-3">
                    <p>No feedback recorded yet for this project.</p>
                    <Button size="sm" variant="outline" onClick={() => navigate('/mentor?view=submissions')}>
                      Open Submissions Queue
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedback.map((f) => (
                      <div key={f.id} className="p-5 sm:p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.05] text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
                            <span className="text-white font-bold">{f.mentor?.full_name || 'You (Mentor)'}</span>
                            <span className="text-[#666666]">({f.mentor?.email})</span>
                          </div>
                          <span className="text-[#888888]">
                            Recorded: {new Date(f.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#DDDDDD] leading-relaxed font-sans">
                          {f.feedback}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 4: EVALUATION PAGE (/mentor?view=evaluation) */}
            {/* ======================================================== */}
            {activeView === 'evaluation' && (
              <div className="space-y-6 animate-page-enter">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                      Accredited Defense Rubric Assessment
                    </h1>
                    <p className="text-xs text-[#888888] mt-1 font-sans">
                      Score cohort defense presentations against accredited ABET / NBA rubric criteria and record formal examiner remarks.
                    </p>
                  </div>

                  {criteria.length > 0 && (
                    <Button
                      size="sm"
                      variant="primary"
                      icon={<Award className="w-3.5 h-3.5" />}
                      onClick={handleOpenEvaluation}
                    >
                      Conduct Defense Evaluation
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Rubric Criteria Section */}
                  <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
                    <span className="font-mono text-xs uppercase font-bold text-brand-teal-light block">
                      Accredited Rubric Dimensions ({criteria.length})
                    </span>

                    {criteriaLoading ? (
                      <div className="py-8 text-center text-xs font-mono text-[#888888]">Loading criteria…</div>
                    ) : criteria.length === 0 ? (
                      <p className="text-xs text-[#888888] font-mono">No rubric criteria configured for this brief.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {criteria.map((c) => (
                          <div key={c.id} className="p-3.5 rounded-lg bg-black/40 border border-white/[0.05] flex items-center justify-between text-xs">
                            <div>
                              <div className="font-semibold text-white">{c.criterion}</div>
                              <div className="text-[10px] text-[#888888] mt-0.5">{c.description}</div>
                            </div>
                            <span className="font-mono text-xs text-brand-teal-light font-bold">
                              Weight: {Math.round(c.weight * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recorded Results Section */}
                  <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
                    <span className="font-mono text-xs uppercase font-bold text-brand-teal-light block">
                      Recorded Defense Marks ({evalResults.length})
                    </span>

                    {evalLoading ? (
                      <div className="py-8 text-center text-xs font-mono text-[#888888]">Loading scores…</div>
                    ) : evalResults.length === 0 ? (
                      <div className="py-8 text-center font-mono text-xs text-[#888888] space-y-2">
                        <p>No evaluation defense scores recorded yet.</p>
                        <p className="text-[10px] text-[#666666]">Click "Conduct Defense Evaluation" above to grade cohort presentation.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {evalResults.map((r) => (
                          <div key={r.id} className="p-3.5 rounded-lg bg-black/40 border border-white/[0.05] flex items-center justify-between text-xs">
                            <div>
                              <div className="font-semibold text-white">{r.criterion?.criterion || 'Criterion'}</div>
                              <div className="text-[10px] text-[#888888] mt-0.5">{r.feedback}</div>
                            </div>
                            <div className="text-right font-mono">
                              <span className="text-base font-bold text-brand-teal-light">{r.score}</span>
                              <span className="text-[10px] text-[#666666]"> / 10</span>
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

      {/* REVIEW FEEDBACK MODAL */}
      {selectedSubmission && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSubmission(null)}
          size="lg"
          title={`Review Deliverable: ${selectedSubmission.title}`}
          subtitle="Record practitioner guidance and acceptance review"
        >
          <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
            {feedbackError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded font-mono text-[11px]">
                {feedbackError}
              </div>
            )}
            {feedbackSuccess && (
              <div className="bg-brand-teal/10 border border-brand-teal/30 text-brand-teal-light p-2.5 rounded font-mono text-[11px]">
                Feedback successfully recorded in project ledger!
              </div>
            )}

            <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
              <span className="text-[10px] font-mono text-[#888888] uppercase block">Student Submission Content</span>
              <p className="text-xs text-[#CCCCCC] font-mono whitespace-pre-wrap">{selectedSubmission.content}</p>
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#888888] block mb-1">
                Mentor Guidance & Checkpoint Assessment
              </label>
              <textarea
                rows={5}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Detail technical feedback, architecture suggestions, code review comments, and approval recommendations…"
                required
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-brand-teal/50 font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <SecondaryButton size="sm" onClick={() => setSelectedSubmission(null)}>
                Cancel
              </SecondaryButton>
              <Button size="sm" variant="primary" type="submit" isLoading={submittingFeedback}>
                Submit Feedback
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* DEFENSE EVALUATION MODAL */}
      {isEvalModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsEvalModalOpen(false)}
          size="lg"
          title="Conduct Defense Evaluation"
          subtitle="Accredited rubric assessment for project cohort defense"
        >
          <form onSubmit={handleSubmitAllEvaluation} className="space-y-4 text-xs">
            {evalSuccess && (
              <div className="bg-brand-teal/10 border border-brand-teal/30 text-brand-teal-light p-2.5 rounded font-mono text-[11px]">
                Rubric defense scores recorded in institutional registry!
              </div>
            )}

            <div className="space-y-4">
              {criteria.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-white">{c.criterion}</div>
                      <div className="text-[10px] text-[#888888]">{c.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#888888]">Score (0–10):</span>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={evalScores[c.id] ?? 8}
                        onChange={(e) => setEvalScores({ ...evalScores, [c.id]: parseInt(e.target.value) || 0 })}
                        className="w-16 bg-[#0D0D0D] border border-white/[0.08] rounded px-2 py-1 text-xs text-center font-mono text-brand-teal-light font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Evaluator remarks for this criterion…"
                    value={evalFeedback[c.id] || ''}
                    onChange={(e) => setEvalFeedback({ ...evalFeedback, [c.id]: e.target.value })}
                    className="w-full bg-[#0D0D0D] border border-white/[0.06] rounded px-2.5 py-1.5 text-xs text-[#CCCCCC] placeholder:text-[#666666] focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <SecondaryButton size="sm" onClick={() => setIsEvalModalOpen(false)}>
                Cancel
              </SecondaryButton>
              <Button size="sm" variant="primary" type="submit" isLoading={evalSubmitting}>
                Submit Defense Scores
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MentorWorkspace;
