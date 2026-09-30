import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Button } from '../../components/Button';
import { SecondaryButton } from '../../components/SecondaryButton';
import { Modal } from '../../components/Modal';
import { Navbar } from '../../components/Navbar';
import { PrismFoldBackground } from '../../components/PrismFoldBackground';
import { ViewportSection } from '../../components/ViewportSection';
import { PageProgress, type ProgressItem } from '../../components/PageProgress';

const PROGRESS_ITEMS: ProgressItem[] = [
  { id: 'sec-queue', label: 'Review Queue' },
];

interface SubmissionQueueItem {
  id: string;
  milestone_id: string;
  submitted_by: string;
  title: string;
  content: string;
  repository_url: string | null;
  pr_url: string | null;
  status: string;
  submitted_at: string | null;
  updated_at: string;
  project: {
    id: string;
    code: string;
    title: string;
  };
  milestone: {
    id: string;
    title: string;
    sequence: number;
    due_date: string | null;
  };
  student: {
    id: string;
    full_name: string;
    email: string;
  };
}

export const MentorSubmissions: React.FC = () => {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'submitted' | 'reviewed'>('ALL');

  // Feedback modal
  const [selectedSub, setSelectedSub] = useState<SubmissionQueueItem | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = statusFilter !== 'ALL' ? { status: statusFilter } : undefined;
      const res = await api.get<{ submissions: SubmissionQueueItem[] }>('/api/mentor/submissions', params);
      setSubmissions(res.submissions || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load review queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const handleOpenReview = (s: SubmissionQueueItem) => {
    setSelectedSub(s);
    setFeedbackText('');
    setFeedbackSuccess(false);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedSub || !feedbackText.trim()) return;
    setSubmittingFeedback(true);

    try {
      await api.post(`/api/projects/${selectedSub.project.id}/feedback`, {
        submission_id: selectedSub.id,
        milestone_id: selectedSub.milestone_id,
        feedback: feedbackText.trim(),
      });
      setFeedbackSuccess(true);
      fetchSubmissions();
      setTimeout(() => {
        setSelectedSub(null);
        setFeedbackSuccess(false);
      }, 1200);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to submit review feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const pendingCount = submissions.filter((s) => s.status === 'submitted').length;

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-brand-teal/20 selection:text-brand-teal-light relative">
      <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-30" />
      <Navbar />
      <PageProgress items={PROGRESS_ITEMS} />

      <main className="flex-1 w-full relative z-10 pt-16 sm:pt-[68px]">
        <ViewportSection id="sec-queue" label="Practitioner Review Queue" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
                  Deliverable Submissions
                </h1>
                <p className="text-xs text-[#888888] mt-1 font-sans">
                  Inspect student sprint deliverables, review architecture notes and pull requests, and leave checkpoint guidance.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-white text-black font-bold'
                      : 'bg-[#0D0D0D] text-[#888888] border border-white/[0.06]'
                  }`}
                >
                  All ({submissions.length})
                </button>
                <button
                  onClick={() => setStatusFilter('submitted')}
                  className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    statusFilter === 'submitted'
                      ? 'bg-yellow-400 text-black font-bold'
                      : 'bg-[#0D0D0D] text-[#888888] border border-white/[0.06]'
                  }`}
                >
                  Needs Review ({pendingCount})
                </button>
                <button
                  onClick={() => setStatusFilter('reviewed')}
                  className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    statusFilter === 'reviewed'
                      ? 'bg-brand-teal text-black font-bold'
                      : 'bg-[#0D0D0D] text-[#888888] border border-white/[0.06]'
                  }`}
                >
                  Reviewed ({submissions.length - pendingCount})
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center font-mono text-xs text-[#888888]">
                <span className="inline-block w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
                <div>Loading submission queue…</div>
              </div>
            ) : error ? (
              <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-red-500/20 text-center font-mono text-xs text-red-400 space-y-3">
                <p>{error}</p>
                <Button size="sm" variant="outline" onClick={fetchSubmissions}>Retry</Button>
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] text-center font-mono text-xs text-[#888888]">
                No deliverables awaiting review in your queue.
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((s) => (
                  <div
                    key={s.id}
                    className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] hover:border-brand-teal/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-brand-teal-light font-bold px-2 py-0.5 rounded bg-brand-teal/10 border border-brand-teal/20">
                          {s.project.code}
                        </span>
                        <span className="font-mono text-xs text-white/70">
                          Sprint {s.milestone.sequence}
                        </span>
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
                        <span>By: <span className="text-white">{s.student.full_name}</span></span>
                        <span>•</span>
                        <span>Submitted: {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : 'Draft'}</span>
                        {s.repository_url && (
                          <>
                            <span>•</span>
                            <a
                              href={s.repository_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-teal-light hover:underline flex items-center gap-1"
                            >
                              <FolderGit2 className="w-3 h-3" />
                              <span>Code Repository</span>
                            </a>
                          </>
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
        </ViewportSection>
      </main>

      {/* REVIEW FEEDBACK MODAL */}
      {selectedSub && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSub(null)}
          size="lg"
          title={`Review Deliverable: ${selectedSub.title}`}
          subtitle={`${selectedSub.project.code} • Sprint ${selectedSub.milestone.sequence}`}
        >
          <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs font-mono">
            {feedbackSuccess && (
              <div className="p-3 rounded bg-brand-teal/10 border border-brand-teal/20 text-brand-teal-light">
                ✓ Feedback recorded in project ledger!
              </div>
            )}

            <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
              <span className="text-[10px] text-[#888888] uppercase block">Student Submission Content</span>
              <p className="text-xs text-[#CCCCCC] whitespace-pre-wrap">{selectedSub.content}</p>
            </div>

            <div>
              <label className="text-xs uppercase text-[#888888] block mb-1">
                Mentor Guidance & Checkpoint Assessment
              </label>
              <textarea
                rows={5}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Detail technical feedback, architecture suggestions, code review comments, and approval recommendations…"
                required
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-brand-teal/50 font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <SecondaryButton size="sm" onClick={() => setSelectedSub(null)}>
                Cancel
              </SecondaryButton>
              <Button size="sm" variant="primary" type="submit" isLoading={submittingFeedback}>
                Submit Feedback
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MentorSubmissions;
