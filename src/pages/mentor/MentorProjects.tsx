import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useMentorProjects } from '../../services';
import { Button } from '../../components/Button';
import { Navbar } from '../../components/Navbar';
import { PrismFoldBackground } from '../../components/PrismFoldBackground';
import { ViewportSection } from '../../components/ViewportSection';
import { PageProgress, type ProgressItem } from '../../components/PageProgress';

const PROGRESS_ITEMS: ProgressItem[] = [
  { id: 'sec-assigned', label: 'My Projects' },
];

export const MentorProjects: React.FC = () => {
  const navigate = useNavigate();
  const { projects, loading, error, refetch } = useMentorProjects();

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-brand-teal/20 selection:text-brand-teal-light relative">
      <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-30" />
      <Navbar />
      <PageProgress items={PROGRESS_ITEMS} />

      <main className="flex-1 w-full relative z-10 pt-16 sm:pt-[68px]">
        <ViewportSection id="sec-assigned" label="Industry Practitioner Guidance">
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
                  My Supervised Projects
                </h1>
                <p className="text-xs text-[#888888] mt-1 font-sans">
                  Student cohort engineering briefs allocated to you for milestone reviews and technical guidance.
                </p>
              </div>
              <span className="px-3 py-1 rounded bg-brand-teal/10 border border-brand-teal/20 text-xs font-mono text-brand-teal-light font-bold">
                {projects.length} Assigned Project(s)
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center font-mono text-xs text-[#888888]">
                <span className="inline-block w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
                <div>Loading assigned projects…</div>
              </div>
            ) : error ? (
              <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-red-500/20 text-center font-mono text-xs text-red-400 space-y-3">
                <p>{error}</p>
                <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] text-center font-mono text-xs text-[#888888]">
                You are currently not assigned to supervise any cohort projects.
              </div>
            ) : (
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
                          Project Brief
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={<ArrowRight className="w-3 h-3" />}
                          onClick={() => navigate('/mentor/submissions')}
                        >
                          Review Submissions
                        </Button>
                      </div>
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

export default MentorProjects;
