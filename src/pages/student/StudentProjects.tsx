import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useMyProjects } from '../../services';
import { Button } from '../../components/Button';
import { Navbar } from '../../components/Navbar';
import { PrismFoldBackground } from '../../components/PrismFoldBackground';
import { ViewportSection } from '../../components/ViewportSection';
import { PageProgress, type ProgressItem } from '../../components/PageProgress';

const PROGRESS_ITEMS: ProgressItem[] = [
  { id: 'sec-projects', label: 'My Projects' },
];

export const StudentProjects: React.FC = () => {
  const navigate = useNavigate();
  const { projects, loading, error, refetch } = useMyProjects();

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-brand-teal/20 selection:text-brand-teal-light relative">
      <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-30" />
      <Navbar />

      <PageProgress items={PROGRESS_ITEMS} />
      <main className="flex-1 w-full relative z-10 pt-16 sm:pt-[68px]">
        <ViewportSection id="sec-projects" label="My Projects" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-brand-teal-light font-bold">
                Student Learning Execution
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
              My Enrolled Projects
            </h1>
            <p className="text-xs text-[#888888] mt-1 font-sans">
              Engineering project cohorts you have joined. Track sprint deliverables and milestone progress.
            </p>
          </div>

          <span className="px-3 py-1 rounded bg-brand-teal/10 border border-brand-teal/20 text-xs font-mono text-brand-teal-light font-bold">
            {projects.length} Active Enrollment(s)
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-[#888888]">
            <span className="inline-block w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
            <div>Loading your enrolled projects…</div>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-red-500/20 text-center font-mono text-xs text-red-400 space-y-3">
            <p>{error}</p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] text-center font-mono text-xs text-[#888888] space-y-4">
            <h2 className="text-base font-bold text-white font-sans">No Active Project Enrollment</h2>
            <p className="max-w-md mx-auto leading-relaxed">
              You haven't joined any projects yet. Browse the accredited Project Library to find and join an engineering brief for your semester cohort.
            </p>
            <Button size="sm" variant="primary" onClick={() => navigate('/projects')}>
              Explore Project Library
            </Button>
          </div>
        ) : (
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

                <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
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
                      Project Brief
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={<ArrowRight className="w-3 h-3" />}
                      onClick={() => navigate('/student/milestones')}
                    >
                      View Sprints
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

export default StudentProjects;
