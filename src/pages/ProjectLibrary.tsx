import React, { useState, useMemo } from 'react';
import { Search, ArrowUpRight, ArrowRight, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { useProjects } from '../services';
import type { Project } from '../lib/types';
import { Button } from '../components/Button';
import { SecondaryButton } from '../components/SecondaryButton';
import { ViewportSection } from '../components/ViewportSection';
import { PageProgress, type ProgressItem } from '../components/PageProgress';

const PROGRESS_ITEMS: ProgressItem[] = [
  { id: 'sec-library', label: 'Project Library' },
];


export interface ProjectLibraryProps {
  onSelectProject: (projectId: string) => void;
  onRequestDemo?: () => void;
}

export const ProjectLibrary: React.FC<ProjectLibraryProps> = ({
  onSelectProject,
}) => {
  const { projects, loading, error, refetch } = useProjects();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [drawerProject, setDrawerProject] = useState<Project | null>(null);

  const categories = ['ALL', 'AI / ML', 'FINTECH', 'SYSTEMS', 'IOT'];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      let matchCategory = true;
      if (selectedCategory === 'AI / ML') {
        matchCategory = project.domain.includes('AI') || project.domain.includes('NLP') || project.domain.includes('Vision');
      } else if (selectedCategory === 'FINTECH') {
        matchCategory = project.domain.includes('FinTech');
      } else if (selectedCategory === 'SYSTEMS') {
        matchCategory = project.domain.includes('Systems') || project.domain.includes('Logistics') || project.category === 'SYSTEMS';
      } else if (selectedCategory === 'IOT') {
        matchCategory = project.domain.includes('IoT') || project.domain.includes('Grid') || project.category === 'IOT';
      }

      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.domain.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.code.toLowerCase().includes(query);

      return matchCategory && matchSearch;
    });
  }, [projects, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] overflow-x-hidden selection:bg-brand-teal/20 selection:text-brand-teal-light">
      {/* 1. COMPACT CONTEXT HEADER BAR */}
      <div className="border-b border-white/[0.07] bg-[#07090D]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
            <span className="text-[#B8B8B8] font-medium tracking-wider uppercase">
              CAMPUSLAB // PROJECT LIBRARY
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-[#888888] border border-white/[0.08] uppercase tracking-wider">
              {projects.length} PROJECTS REGISTERED
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-brand-teal/10 text-brand-teal-light border border-brand-teal/20 uppercase tracking-wider">
              ENTERPRISE CURATED
            </span>
          </div>
        </div>
      </div>
      <PageProgress items={PROGRESS_ITEMS} />
      <ViewportSection id="sec-library" label="Project Library" fullHeight={false}>
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-8">
        {/* 2. SECTION HEADER */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5] font-sans">
            Curated Engineering Briefs
          </h1>
          <p className="mt-2 text-sm text-[#888888] max-w-2xl font-sans">
            Production-grade problem statements structured with verified technology stacks, milestone roadmaps, and evaluation rubrics.
          </p>
        </div>

        {/* 3. SEARCH & CATEGORY BAR */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by keyword, code, domain, or skills…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none focus:border-brand-teal/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
                  selectedCategory === cat
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'bg-[#0D0D0D] text-[#888888] hover:text-[#B8B8B8] border border-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 4. PROJECT GRID */}
        {loading ? (
          <div className="py-24 text-center text-xs font-mono text-[#888888]">
            <span className="inline-block w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
            <div>Loading projects from institutional database…</div>
          </div>
        ) : error ? (
          <div className="py-16 text-center max-w-lg mx-auto bg-[#0D0D0D] border border-red-500/20 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-sans">Database Query Failed</h3>
            <p className="text-xs text-red-400/90 font-mono leading-relaxed">{error}</p>
            <div className="pt-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => refetch()}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retry Connection
              </Button>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-24 text-center text-xs font-mono text-[#888888] bg-[#0D0D0D] border border-white/[0.07] rounded-xl p-8">
            No projects found matching the selected filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group p-5 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] hover:border-brand-teal/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-brand-teal-light font-bold">
                      {project.code}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#888888] border border-white/[0.08] uppercase">
                      {project.duration}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-sans font-bold text-base text-[#F5F5F5] group-hover:text-white transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#888888] line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {project.skills?.slice(0, 3).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.03] text-[#B8B8B8] border border-white/[0.05]"
                      >
                        {skill}
                      </span>
                    ))}
                    {(project.skills?.length ?? 0) > 3 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 text-[#666666]">
                        +{(project.skills?.length ?? 0) - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#888888] uppercase">
                    {project.difficulty}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDrawerProject(project)}
                      className="text-xs font-mono text-[#B8B8B8] hover:text-white px-2 py-1 transition-colors"
                    >
                      Quick View
                    </button>
                    <button
                      onClick={() => onSelectProject(project.id)}
                      className="inline-flex items-center gap-1 text-xs font-mono text-brand-teal-light hover:underline font-semibold"
                    >
                      <span>Open Brief</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </ViewportSection>

      {/* 5. QUICK VIEW DRAWER */}
      {drawerProject && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0D0D0D] border-l border-white/[0.08] h-full p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <span className="font-mono text-xs text-brand-teal-light font-bold">
                  {drawerProject.code}
                </span>
                <button
                  onClick={() => setDrawerProject(null)}
                  className="p-1 rounded text-[#888888] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#888888] block mb-1">
                  {drawerProject.domain} • {drawerProject.difficulty}
                </span>
                <h2 className="text-xl font-bold font-sans text-white">
                  {drawerProject.title}
                </h2>
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#888888] mb-1">
                  Architectural Summary
                </h4>
                <p className="text-xs text-[#B8B8B8] leading-relaxed">
                  {drawerProject.description}
                </p>
              </div>

              {drawerProject.problem_statement && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#888888] mb-1">
                    Problem Statement
                  </h4>
                  <p className="text-xs text-[#B8B8B8] leading-relaxed">
                    {drawerProject.problem_statement}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#888888] mb-2">
                  Required Technology Stack
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {drawerProject.skills?.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono px-2.5 py-1 rounded bg-white/[0.04] text-[#F5F5F5] border border-white/[0.08]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between gap-3">
              <SecondaryButton size="sm" onClick={() => setDrawerProject(null)}>
                Close
              </SecondaryButton>
              <Button
                size="sm"
                variant="primary"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => {
                  onSelectProject(drawerProject.id);
                  setDrawerProject(null);
                }}
              >
                View Full Brief & Milestones
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectLibrary;
