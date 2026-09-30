import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
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
  { id: 'sec-eval', label: 'Evaluation' },
];

interface MentorEvalProject {
  id: string;
  code: string;
  title: string;
  domain: string;
  status: string;
  criteria_count: number;
  results_count: number;
  criteria: Array<{
    id: string;
    criterion: string;
    description: string;
    max_score: number;
    weight: number;
    sequence: number;
  }>;
  results: Array<{
    id: string;
    criterion_id: string;
    score: number;
    feedback: string;
    student_name: string;
    criterion_name: string;
    max_score: number;
  }>;
}

export const MentorEvaluation: React.FC = () => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<MentorEvalProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected project for evaluation scoring
  const [selectedEvalProj, setSelectedEvalProj] = useState<MentorEvalProject | null>(null);
  const [evalScores, setEvalScores] = useState<Record<string, number>>({});
  const [evalFeedback, setEvalFeedback] = useState<Record<string, string>>({});
  const [evalSubmitting, setEvalSubmitting] = useState(false);
  const [evalSuccess, setEvalSuccess] = useState(false);

  const fetchEvalData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ projects: MentorEvalProject[] }>('/api/mentor/evaluation');
      setProjects(res.projects || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load evaluation workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvalData();
  }, []);

  const handleOpenEvaluationModal = (proj: MentorEvalProject) => {
    setSelectedEvalProj(proj);
    const initialScores: Record<string, number> = {};
    const initialFeedback: Record<string, string> = {};
    proj.criteria.forEach((c) => {
      initialScores[c.id] = 8;
      initialFeedback[c.id] = '';
    });
    setEvalScores(initialScores);
    setEvalFeedback(initialFeedback);
    setEvalSuccess(false);
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedEvalProj) return;
    setEvalSubmitting(true);

    try {
      for (const crit of selectedEvalProj.criteria) {
        await api.post(`/api/projects/${selectedEvalProj.id}/evaluation/results`, {
          criterion_id: crit.id,
          score: evalScores[crit.id] ?? 8,
          feedback: evalFeedback[crit.id] || 'Verified defense criterion standard.',
        });
      }
      setEvalSuccess(true);
      fetchEvalData();
      setTimeout(() => {
        setSelectedEvalProj(null);
        setEvalSuccess(false);
      }, 1200);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to submit evaluation scores.');
    } finally {
      setEvalSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-brand-teal/20 selection:text-brand-teal-light relative">
      <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-30" />
      <Navbar />

      <PageProgress items={PROGRESS_ITEMS} />
      <main className="flex-1 w-full relative z-10 pt-16 sm:pt-[68px]">
        <ViewportSection id="sec-eval" label="Evaluation" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-brand-teal-light font-bold">
                Defense Assessment
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
              Accredited Defense Rubric Evaluation
            </h1>
            <p className="text-xs text-[#888888] mt-1 font-sans">
              Score student presentations against accredited criteria for your assigned engineering briefs.
            </p>
          </div>

          <span className="px-3 py-1 rounded bg-brand-teal/10 border border-brand-teal/20 text-xs font-mono text-brand-teal-light font-bold">
            {projects.length} Assigned Project(s)
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-[#888888]">
            <span className="inline-block w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
            <div>Loading evaluation workspace…</div>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-red-500/20 text-center font-mono text-xs text-red-400 space-y-3">
            <p>{error}</p>
            <Button size="sm" variant="outline" onClick={fetchEvalData}>Retry</Button>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] text-center font-mono text-xs text-[#888888]">
            No projects currently assigned to you for defense evaluation.
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-5"
              >
                {/* Project Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-brand-teal-light font-bold px-2 py-0.5 rounded bg-brand-teal/10 border border-brand-teal/20">
                        {proj.code}
                      </span>
                      <h2 className="font-bold text-base text-white font-sans">{proj.title}</h2>
                    </div>
                    <span className="text-[11px] font-mono text-[#888888] block mt-0.5">{proj.domain}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-white">
                      {proj.results.length} Scored Defense(s)
                    </span>
                    {proj.criteria.length > 0 && (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<Award className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenEvaluationModal(proj)}
                      >
                        Conduct Evaluation
                      </Button>
                    )}
                  </div>
                </div>

                {/* Rubric Criteria & Existing Scores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                  {/* Criteria */}
                  <div className="space-y-2">
                    <span className="text-[#888888] uppercase text-[10px] block font-bold">
                      Configured Rubric Criteria ({proj.criteria.length})
                    </span>
                    {proj.criteria.length === 0 ? (
                      <p className="text-[#666666]">No rubric dimensions configured.</p>
                    ) : (
                      <div className="space-y-2">
                        {proj.criteria.map((c) => (
                          <div key={c.id} className="p-3 rounded-lg bg-black/40 border border-white/[0.05] flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-white font-sans">{c.criterion}</div>
                              <div className="text-[10px] text-[#888888]">{c.description}</div>
                            </div>
                            <span className="text-brand-teal-light font-bold">
                              Weight: {Math.round(c.weight * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Scored Results */}
                  <div className="space-y-2">
                    <span className="text-[#888888] uppercase text-[10px] block font-bold">
                      Recorded Defense Marks ({proj.results.length})
                    </span>
                    {proj.results.length === 0 ? (
                      <div className="p-4 rounded-lg bg-black/30 border border-white/[0.04] text-center text-[#666666]">
                        No evaluation marks recorded yet. Click "Conduct Evaluation" to score cohort.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {proj.results.map((r, rIdx) => (
                          <div key={rIdx} className="p-3 rounded-lg bg-black/40 border border-white/[0.05] flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-white font-sans">{r.criterion_name}</div>
                              <div className="text-[10px] text-[#888888]">{r.feedback}</div>
                            </div>
                            <div className="text-right">
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
            ))}
          </div>
        )}
          </div>

        </ViewportSection>

      </main>

      {/* EVALUATION MODAL */}
      {selectedEvalProj && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedEvalProj(null)}
          size="lg"
          title={`Evaluate Defense: ${selectedEvalProj.code}`}
          subtitle="Score cohort presentation against accredited rubric"
        >
          <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs font-mono">
            {evalSuccess && (
              <div className="p-3 rounded bg-brand-teal/10 border border-brand-teal/20 text-brand-teal-light">
                ✓ Evaluation marks recorded in institutional registry!
              </div>
            )}

            <div className="space-y-3">
              {selectedEvalProj.criteria.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-white font-sans">{c.criterion}</div>
                      <div className="text-[10px] text-[#888888]">{c.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#888888]">Score (0–10):</span>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={evalScores[c.id] ?? 8}
                        onChange={(e) => setEvalScores({ ...evalScores, [c.id]: parseInt(e.target.value) || 0 })}
                        className="w-16 bg-[#0D0D0D] border border-white/[0.08] rounded px-2 py-1 text-xs text-center text-brand-teal-light font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Examiner remarks for this criterion…"
                    value={evalFeedback[c.id] || ''}
                    onChange={(e) => setEvalFeedback({ ...evalFeedback, [c.id]: e.target.value })}
                    className="w-full bg-[#0D0D0D] border border-white/[0.06] rounded px-2.5 py-1.5 text-xs text-[#CCCCCC] focus:outline-none font-sans"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <SecondaryButton size="sm" onClick={() => setSelectedEvalProj(null)}>
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

export default MentorEvaluation;
