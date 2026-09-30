import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Button } from '../../components/Button';
import { SecondaryButton } from '../../components/SecondaryButton';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Navbar } from '../../components/Navbar';
import { PrismFoldBackground } from '../../components/PrismFoldBackground';
import { ViewportSection } from '../../components/ViewportSection';
import { PageProgress, type ProgressItem } from '../../components/PageProgress';

const PROGRESS_ITEMS: ProgressItem[] = [
  { id: 'sec-milestones', label: 'Project Roadmap' },
];

interface StudentMilestoneRoadmapItem {
  id: string;
  title: string;
  description: string;
  sequence: number;
  due_date: string | null;
  status: string;
  roadmap_group: 'completed' | 'current' | 'upcoming' | 'overdue';
  project: {
    id: string;
    code: string;
    title: string;
  };
  submission: {
    id: string;
    title: string;
    status: string;
    submitted_at: string | null;
  } | null;
}

export const StudentMilestones: React.FC = () => {
  const { profile } = useAuth();
  const [milestones, setMilestones] = useState<StudentMilestoneRoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Submission modal state
  const [selectedMilestone, setSelectedMilestone] = useState<StudentMilestoneRoadmapItem | null>(null);
  const [submissionTitle, setSubmissionTitle] = useState('');
  const [submissionContent, setSubmissionContent] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchMilestones = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ milestones: StudentMilestoneRoadmapItem[] }>('/api/student/milestones');
      setMilestones(res.milestones || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load milestone roadmap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const handleOpenSubmit = (m: StudentMilestoneRoadmapItem) => {
    setSelectedMilestone(m);
    setSubmissionTitle(m.submission ? m.submission.title : `Sprint ${m.sequence} Deliverable Submission`);
    setSubmissionContent('');
    setRepoUrl('');
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedMilestone || !submissionContent.trim()) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      await api.post(`/api/milestones/${selectedMilestone.id}/submissions`, {
        title: submissionTitle.trim(),
        content: submissionContent.trim(),
        repository_url: repoUrl.trim() || null,
        status: 'submitted',
      });
      setSubmitSuccess(true);
      fetchMilestones();
      setTimeout(() => {
        setSelectedMilestone(null);
        setSubmitSuccess(false);
      }, 1200);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit deliverable.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentGroup = milestones.filter((m) => m.roadmap_group === 'current');
  const overdueGroup = milestones.filter((m) => m.roadmap_group === 'overdue');
  const upcomingGroup = milestones.filter((m) => m.roadmap_group === 'upcoming');
  const completedGroup = milestones.filter((m) => m.roadmap_group === 'completed');

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-brand-teal/20 selection:text-brand-teal-light relative">
      <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-30" />
      <Navbar />

      <PageProgress items={PROGRESS_ITEMS} />
      <main className="flex-1 w-full relative z-10 pt-16 sm:pt-[68px]">
        <ViewportSection id="sec-milestones" label="Project Roadmap" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-brand-teal-light font-bold">
                Sprint Execution Roadmap
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
              Personal Milestone Sprints
            </h1>
            <p className="text-xs text-[#888888] mt-1 font-sans">
              Track deadlines, review deliverable requirements, and submit sprint work across your enrolled projects.
            </p>
          </div>

          <span className="font-mono text-xs text-[#888888]">
            {completedGroup.length} / {milestones.length} Completed Sprints
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-[#888888]">
            <span className="inline-block w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
            <div>Loading personal milestone roadmap…</div>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-red-500/20 text-center font-mono text-xs text-red-400 space-y-3">
            <p>{error}</p>
            <Button size="sm" variant="outline" onClick={fetchMilestones}>Retry</Button>
          </div>
        ) : milestones.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] text-center font-mono text-xs text-[#888888]">
            No milestones found. Join a project from the Project Library to start executing sprints.
          </div>
        ) : (
          <div className="space-y-8">
            {/* OVERDUE SPRINTS (IF ANY) */}
            {overdueGroup.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-mono text-xs uppercase font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Overdue Sprints ({overdueGroup.length})</span>
                </div>
                <div className="space-y-3">
                  {overdueGroup.map((m) => (
                    <div key={m.id} className="p-5 rounded-2xl bg-red-500/5 border border-red-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-brand-teal-light font-bold">{m.project.code}</span>
                          <span className="font-bold text-sm text-white font-sans">Sprint {m.sequence}: {m.title}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-red-500/20 text-red-400 font-bold">Overdue</span>
                        </div>
                        <p className="text-xs text-[#CCCCCC]">{m.description}</p>
                        <div className="text-[10px] font-mono text-red-300">Target Date: {m.due_date}</div>
                      </div>
                      <Button size="sm" variant="primary" onClick={() => handleOpenSubmit(m)}>Submit Work Now</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CURRENT ACTIVE SPRINTS */}
            {currentGroup.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-brand-teal-light font-mono text-xs uppercase font-bold">
                  <Clock className="w-4 h-4" />
                  <span>Current Active Sprints ({currentGroup.length})</span>
                </div>
                <div className="space-y-3">
                  {currentGroup.map((m) => (
                    <div key={m.id} className="p-5 rounded-2xl bg-[#0D0D0D] border border-brand-teal/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-brand-teal-light font-bold px-2 py-0.5 rounded bg-brand-teal/10">{m.project.code}</span>
                          <span className="font-bold text-sm text-white font-sans">Sprint {m.sequence}: {m.title}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-yellow-500/20 text-yellow-300 font-bold">Active</span>
                        </div>
                        <p className="text-xs text-[#888888]">{m.description}</p>
                        <div className="text-[10px] font-mono text-[#777777] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Due: {m.due_date || 'Flexible'}
                          {m.submission && (
                            <span className="text-brand-teal-light ml-3">
                              • Submitted: {m.submission.status}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="primary" onClick={() => handleOpenSubmit(m)}>
                        {m.submission ? 'Update Work' : 'Submit Work'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UPCOMING SPRINTS */}
            {upcomingGroup.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#888888] font-mono text-xs uppercase font-bold">
                  <span>Upcoming Sprints ({upcomingGroup.length})</span>
                </div>
                <div className="space-y-3">
                  {upcomingGroup.map((m) => (
                    <div key={m.id} className="p-4 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-brand-teal-light font-bold">{m.project.code}</span>
                          <span className="text-white font-sans font-semibold">Sprint {m.sequence}: {m.title}</span>
                        </div>
                        <p className="text-[#666666] text-[11px] mt-0.5">{m.description}</p>
                      </div>
                      <span className="text-[10px] font-mono text-[#666666]">Target: {m.due_date || 'TBD'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COMPLETED SPRINTS */}
            {completedGroup.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-brand-teal-light font-mono text-xs uppercase font-bold">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                  <span>Completed Sprints ({completedGroup.length})</span>
                </div>
                <div className="space-y-3">
                  {completedGroup.map((m) => (
                    <div key={m.id} className="p-4 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-brand-teal-light font-bold">{m.project.code}</span>
                          <span className="text-white font-sans font-semibold">Sprint {m.sequence}: {m.title}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-teal/15 text-brand-teal-light uppercase font-bold">Completed</span>
                        </div>
                        <p className="text-[#777777] text-[11px] mt-0.5">{m.description}</p>
                      </div>
                      <span className="text-[10px] font-mono text-brand-teal-light">Verified Accepted</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
          </div>

        </ViewportSection>

      </main>

      {/* SUBMISSION MODAL */}
      {selectedMilestone && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedMilestone(null)}
          size="lg"
          title={`Milestone Submission: ${selectedMilestone.title}`}
          subtitle={`${selectedMilestone.project.code} • Sprint ${selectedMilestone.sequence}`}
        >
          <form onSubmit={handleSubmitDeliverable} className="space-y-4 text-xs font-mono">
            {submitError && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="p-3 rounded bg-brand-teal/10 border border-brand-teal/20 text-brand-teal-light">
                ✓ Deliverable submitted successfully! Recorded in cohort timeline.
              </div>
            )}

            <div>
              <label className="text-xs uppercase text-[#888888] block mb-1">Deliverable Title</label>
              <input
                type="text"
                value={submissionTitle}
                onChange={(e) => setSubmissionTitle(e.target.value)}
                required
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs uppercase text-[#888888] block mb-1">Architecture Notes & Implementation Details</label>
              <textarea
                rows={5}
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                placeholder="Describe your technical architecture, telemetry test results, and implementation benchmarks…"
                required
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded px-3 py-2 text-xs text-white focus:outline-none font-sans"
              />
            </div>

            <div>
              <label className="text-xs uppercase text-[#888888] block mb-1">Code Repository or PR Link (Optional)</label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded px-3 py-2 text-xs text-white focus:outline-none"
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

export default StudentMilestones;
