import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Award,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Button } from '../../components/Button';
import { Navbar } from '../../components/Navbar';
import { PrismFoldBackground } from '../../components/PrismFoldBackground';
import { ViewportSection } from '../../components/ViewportSection';
import { PageProgress, type ProgressItem } from '../../components/PageProgress';

const PROGRESS_ITEMS: ProgressItem[] = [
  { id: 'sec-feedback', label: 'Feedback' },
];

interface StudentFeedbackItem {
  id: string;
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
  mentor: {
    name: string;
    email: string;
  };
}

export const StudentFeedback: React.FC = () => {
  const [feedback, setFeedback] = useState<StudentFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ feedback: StudentFeedbackItem[] }>('/api/student/feedback');
      setFeedback(res.feedback || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load mentor feedback.');
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
        <ViewportSection id="sec-feedback" label="Feedback" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-brand-teal-light font-bold">
                Practitioner Guidance
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
              Supervising Mentor Feedback
            </h1>
            <p className="text-xs text-[#888888] mt-1 font-sans">
              Reviews, architectural recommendations, and checkpoint observations provided on your sprint submissions.
            </p>
          </div>

          <span className="px-3 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white">
            {feedback.length} Feedback Notes
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-[#888888]">
            <span className="inline-block w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
            <div>Loading mentor feedback…</div>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-red-500/20 text-center font-mono text-xs text-red-400 space-y-3">
            <p>{error}</p>
            <Button size="sm" variant="outline" onClick={fetchFeedback}>Retry</Button>
          </div>
        ) : feedback.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] text-center font-mono text-xs text-[#888888]">
            No mentor feedback has been recorded on your submissions yet.
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
                    Received: {new Date(f.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#DDDDDD] leading-relaxed font-sans">
                  {f.feedback}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[11px] font-mono text-[#777777]">
                  <span>Reviewer: <span className="text-white">{f.mentor.name}</span></span>
                  <span className="text-brand-teal-light font-bold">✓ Practitioner Verified</span>
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

export default StudentFeedback;
