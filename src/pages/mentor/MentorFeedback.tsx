import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { Button } from '../../components/Button';
import { Navbar } from '../../components/Navbar';
import { PrismFoldBackground } from '../../components/PrismFoldBackground';
import { ViewportSection } from '../../components/ViewportSection';
import { PageProgress, type ProgressItem } from '../../components/PageProgress';

const PROGRESS_ITEMS: ProgressItem[] = [
  { id: 'sec-feedback-list', label: 'Feedback' },
];

interface MentorFeedbackItem {
  id: string;
  submission_id: string | null;
  milestone_id: string | null;
  project_id: string;
  mentor_id: string;
  feedback: string;
  created_at: string;
  project: {
    id: string;
    code: string;
    title: string;
  };
  milestone: {
    id: string;
    title: string;
    sequence: number;
  } | null;
  student: {
    name: string;
  } | null;
}

export const MentorFeedback: React.FC = () => {
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState<MentorFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ feedback: MentorFeedbackItem[] }>('/api/mentor/feedback');
      setFeedback(res.feedback || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load feedback history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-brand-teal/20 selection:text-brand-teal-light relative">
      <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-30" />
      <Navbar />
      <PageProgress items={PROGRESS_ITEMS} />

      <main className="flex-1 w-full relative z-10 pt-16 sm:pt-[68px]">
        <ViewportSection id="sec-feedback-list" label="Guidance History" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
                  Mentor Checkpoint Feedback Ledger
                </h1>
                <p className="text-xs text-[#888888] mt-1 font-sans">
                  Historical record of architectural advice, code review comments, and milestone approvals you provided.
                </p>
              </div>

              <span className="px-3 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white">
                {feedback.length} Recorded Reviews
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center font-mono text-xs text-[#888888]">
                <span className="inline-block w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
                <div>Loading feedback history…</div>
              </div>
            ) : error ? (
              <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-red-500/20 text-center font-mono text-xs text-red-400 space-y-3">
                <p>{error}</p>
                <Button size="sm" variant="outline" onClick={fetchFeedback}>Retry</Button>
              </div>
            ) : feedback.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] text-center font-mono text-xs text-[#888888] space-y-3">
                <p>No feedback recorded yet. Visit the Submissions queue to review student deliverables.</p>
                <Button size="sm" variant="primary" onClick={() => navigate('/mentor/submissions')}>
                  Open Review Queue
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {feedback.map((f) => (
                  <div
                    key={f.id}
                    className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] hover:border-brand-teal/30 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-white/[0.05] text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-brand-teal-light font-bold px-2 py-0.5 rounded bg-brand-teal/10 border border-brand-teal/20">
                          {f.project.code}
                        </span>
                        <span className="text-white font-semibold font-sans">{f.project.title}</span>
                        {f.milestone && (
                          <span className="text-[#888888]">
                            • Sprint {f.milestone.sequence}
                          </span>
                        )}
                      </div>

                      <span className="text-[#666666]">
                        Recorded: {new Date(f.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#DDDDDD] leading-relaxed font-sans">
                      {f.feedback}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[11px] font-mono text-[#777777]">
                      <span>Student/Team: <span className="text-white">{f.student?.name || 'Assigned Cohort'}</span></span>
                      <button
                        onClick={() => navigate(`/projects/${f.project.id}`)}
                        className="text-brand-teal-light hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Project Brief</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ViewportSection>
      </main>
    </div>
  );
};

export default MentorFeedback;
