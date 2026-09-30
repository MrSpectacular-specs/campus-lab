import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  ChevronRight,
  ExternalLink,
  Target,
  FileCheck2,
} from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { Button } from '../../components/Button';
import { Navbar } from '../../components/Navbar';
import { PrismFoldBackground } from '../../components/PrismFoldBackground';
import { ViewportSection } from '../../components/ViewportSection';
import { PageProgress, type ProgressItem } from '../../components/PageProgress';

const PROGRESS_ITEMS: ProgressItem[] = [
  { id: 'sec-eval', label: 'Evaluation Pipeline' },
];

interface FacultyEvalProjectItem {
  id: string;
  code: string;
  title: string;
  domain: string;
  status: string;
  criteria_count: number;
  results_count: number;
  avg_score: number | null;
}

export const FacultyEvaluation: React.FC = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<FacultyEvalProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvalData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ projects: FacultyEvalProjectItem[] }>('/api/faculty/evaluation');
      setProjects(res.projects || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load evaluation overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvalData();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-brand-teal/20 selection:text-brand-teal-light relative">
      <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-30" />
      <Navbar />

      <PageProgress items={PROGRESS_ITEMS} />
      <main className="flex-1 w-full relative z-10 pt-16 sm:pt-[68px]">
        <ViewportSection id="sec-eval" label="Evaluation Pipeline" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-brand-teal-light font-bold">
                Accreditation Defense
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
              Evaluation & Rubric Criteria
            </h1>
            <p className="text-xs text-[#888888] mt-1 font-sans">
              Monitor rubric configuration and examine defense scoring across your coordinated engineering briefs.
            </p>
          </div>
        </div>

        {/* Evaluation Pipeline Table */}
        <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight text-[#F5F5F5] font-mono uppercase">
              Coordinated Evaluation Pipeline
            </h3>
            <span className="text-xs font-mono text-[#888888]">{projects.length} Projects</span>
          </div>

          {loading ? (
            <div className="py-20 text-center font-mono text-xs text-[#888888]">
              <span className="inline-block w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
              <div>Loading evaluation registry…</div>
            </div>
          ) : error ? (
            <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-red-500/20 text-center font-mono text-xs text-red-400 space-y-3">
              <p>{error}</p>
              <Button size="sm" variant="outline" onClick={fetchEvalData}>Retry</Button>
            </div>
          ) : projects.length === 0 ? (
            <div className="py-16 text-center text-xs font-mono text-[#888888]">
              No coordinated projects found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.07] bg-white/[0.02] text-[#888888] font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Project</th>
                    <th className="py-3.5 px-4">Domain</th>
                    <th className="py-3.5 px-4">Rubric Dimensions</th>
                    <th className="py-3.5 px-4">Defenses Scored</th>
                    <th className="py-3.5 px-4">Average Score</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {projects.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      onClick={() => navigate(`/projects/${p.id}`)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-brand-teal-light font-bold">{p.code}</span>
                          <span className="font-medium text-white group-hover:text-brand-teal-light transition-colors">
                            {p.title}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#B8B8B8]">{p.domain}</td>

                      <td className="py-3.5 px-4 font-mono text-white">
                        {p.criteria_count} dimension(s)
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {p.results_count > 0 ? (
                          <span className="text-brand-teal-light font-bold">{p.results_count} evaluated</span>
                        ) : (
                          <span className="text-[#666666]">Pending Defense</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {p.avg_score !== null ? (
                          <span className="text-white font-bold text-sm">
                            {p.avg_score} <span className="text-[#666666] text-xs">/ 10</span>
                          </span>
                        ) : (
                          <span className="text-[#666666]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/projects/${p.id}`)}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-brand-teal-light hover:underline font-semibold"
                        >
                          <span>Rubric</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </div>

        </ViewportSection>

      </main>
    </div>
  );
};

export default FacultyEvaluation;
