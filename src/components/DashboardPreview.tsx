import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { navigateTo } from '../utils/navigation';

interface ProjectRecord {
  id: string;
  title: string;
  stage: string;
  mentoring: string;
  evaluation: string;
  report: string;
  statusType: 'active' | 'review' | 'queued';
}

const projectRecords: ProjectRecord[] = [
  {
    id: '01',
    title: 'Campus Sustainability Tracker',
    stage: 'Prototype Sprint',
    mentoring: 'Assigned',
    evaluation: 'In Review',
    report: 'Preparing',
    statusType: 'active',
  },
  {
    id: '02',
    title: 'Autonomous Rover Guidance',
    stage: 'Project Brief',
    mentoring: 'Assigned',
    evaluation: 'Pending',
    report: 'Draft',
    statusType: 'queued',
  },
  {
    id: '03',
    title: 'Distributed Event Ledger',
    stage: 'Milestones',
    mentoring: 'Upcoming',
    evaluation: 'In Review',
    report: 'Queued',
    statusType: 'review',
  },
];

export const DashboardPreview: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, []);

  const transitionClass = prefersReducedMotion
    ? ''
    : 'transition-all duration-700 ease-smooth motion-reduce:transition-none motion-reduce:transform-none';

  return (
    <section
      id="dashboard"
      ref={sectionRef}
      className="relative pt-12 pb-12 sm:pt-16 sm:pb-20 lg:pt-[88px] lg:pb-[104px] border-t border-white/[0.07] bg-[#050505]/50 overflow-hidden"
      aria-label="Institutional Visibility"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Two-Column Composition: Left Header/Intro/Legend, Right Framed Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Section Marker, Headline, Copy, Status Legend */}
          <div
            className={`lg:col-span-5 flex flex-col items-start text-left ${transitionClass} ${
              hasEntered || prefersReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            {/* Product Section Eyebrow */}
            <div className="flex items-center gap-2.5 mb-3 sm:mb-5 select-none">
              <span className="w-6 h-px bg-[#14B8A6]" aria-hidden="true" />
              <span className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B8B8B8]">
                INSTITUTIONAL VISIBILITY
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-[38px] xl:text-[42px] font-bold tracking-[-0.035em] text-[#F5F5F5] leading-[1.14] mb-3 sm:mb-5">
              See where every project stands.
            </h2>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#B8B8B8] leading-relaxed font-normal max-w-xl mb-5 sm:mb-7">
              CampusLab gives colleges a structured view of project progress, mentoring, evaluation, and reporting.
            </p>

            {/* Subtle Status Legend */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap select-none pt-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0D0D0D] border border-white/[0.08] font-mono text-[10px] sm:text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                <span className="text-[#F5F5F5]">ACTIVE</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0D0D0D] border border-white/[0.08] font-mono text-[10px] sm:text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8B8B8]" />
                <span className="text-[#B8B8B8]">IN REVIEW</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0D0D0D] border border-white/[0.08] font-mono text-[10px] sm:text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#555555]" />
                <span className="text-[#777777]">PREPARING</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Large Framed Institutional Workspace Preview */}
          <div
            className={`lg:col-span-7 w-full ${transitionClass} ${
              hasEntered || prefersReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: prefersReducedMotion ? '0ms' : '150ms' }}
          >
            <div className="w-full max-w-2xl mx-auto lg:max-w-none">
              {/* Framed Viewport: Crisp Smoked Surface with Hairline Border */}
              <div className="rounded-xl bg-[#080808] border border-white/[0.08] shadow-[0_12px_36px_-8px_rgba(0,0,0,0.6)] specular-highlight overflow-hidden">
                
                {/* Viewport Chrome Header */}
                <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-white/[0.07] bg-[#0D0D0D] flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono select-none">
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0" aria-hidden="true">
                      <span className="w-2 h-2 rounded-full bg-white/[0.12]" />
                      <span className="w-2 h-2 rounded-full bg-white/[0.08]" />
                      <span className="w-2 h-2 rounded-full bg-white/[0.08]" />
                    </div>
                    <span className="font-mono text-[9px] min-[360px]:text-[10px] sm:text-[11px] uppercase tracking-normal sm:tracking-wider text-[#777777] truncate">
                      CAMPUSLAB // INSTITUTIONAL VIEW
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
                    <a
                      href="/dashboard"
                      onClick={(e) => navigateTo('/dashboard', e)}
                      className="hidden sm:inline-flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded bg-white/[0.04] text-[#B8B8B8] hover:text-white hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
                    >
                      <span>Open Live Dashboard</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </a>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                      <span className="font-mono text-[10px] sm:text-[11px] text-[#14B8A6] uppercase tracking-wider font-medium hidden min-[480px]:inline">
                        WORKSPACE ACTIVE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Viewport Content Area */}
                <div className="p-3 sm:p-5">
                  
                  {/* Stream Context Subheader */}
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/[0.06] text-[10px] font-mono select-none">
                    <span className="text-[#B8B8B8] font-medium tracking-wider uppercase">
                      DEPARTMENT PROJECT STREAM
                    </span>
                    <span className="text-[#666666] uppercase tracking-wider text-[9px]">
                      ILLUSTRATIVE DATA
                    </span>
                  </div>

                  {/* 
                    DESKTOP TABLE VIEW (Visible on >= 768px)
                    Clean, uncrowded institutional project ledger
                  */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead
                        className={`${transitionClass} ${
                          hasEntered || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}
                        style={{ transitionDelay: prefersReducedMotion ? '0ms' : '240ms' }}
                      >
                        <tr className="border-b border-white/[0.07] text-[#777777] select-none text-[10px] sm:text-[11px]">
                          <th className="pb-2.5 font-normal uppercase tracking-wider w-[34%]">PROJECT</th>
                          <th className="pb-2.5 font-normal uppercase tracking-wider w-[18%]">STAGE</th>
                          <th className="pb-2.5 font-normal uppercase tracking-wider w-[16%]">MENTORING</th>
                          <th className="pb-2.5 font-normal uppercase tracking-wider w-[18%]">EVALUATION</th>
                          <th className="pb-2.5 font-normal uppercase tracking-wider text-right w-[14%]">REPORT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {projectRecords.map((p, rIdx) => {
                          const isHovered = hoveredRowId === p.id;

                          return (
                            <tr
                              key={p.id}
                              tabIndex={0}
                              onClick={() => navigateTo(rIdx === 0 ? '/projects' : '/reports')}
                              onMouseEnter={() => setHoveredRowId(p.id)}
                              onMouseLeave={() => setHoveredRowId(null)}
                              onFocus={() => setHoveredRowId(p.id)}
                              onBlur={() => setHoveredRowId(null)}
                              className={`transition-all duration-200 cursor-pointer focus:outline-none focus:bg-white/[0.03] ${transitionClass} ${
                                hasEntered || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                              } ${isHovered ? 'bg-white/[0.025]' : 'bg-transparent'}`}
                              style={{ transitionDelay: prefersReducedMotion ? '0ms' : `${320 + rIdx * 80}ms` }}
                            >
                              {/* Project Title */}
                              <td className="py-3 pr-3">
                                <span className="font-sans text-[13px] font-medium text-[#F5F5F5] block truncate leading-tight">
                                  {p.title}
                                </span>
                                <span className="text-[10px] text-[#666666] font-mono">
                                  SPECIMEN {p.id}
                                </span>
                              </td>

                              {/* Stage */}
                              <td className="py-3 pr-3">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] border ${
                                    p.statusType === 'active'
                                      ? 'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/25 font-medium'
                                      : 'bg-white/[0.03] text-[#B8B8B8] border-white/[0.06]'
                                  }`}
                                >
                                  <span
                                    className={`w-1 h-1 rounded-full ${
                                      p.statusType === 'active' ? 'bg-[#14B8A6]' : 'bg-[#777777]'
                                    }`}
                                  />
                                  {p.stage}
                                </span>
                              </td>

                              {/* Mentoring */}
                              <td className="py-3 pr-3 text-[#B8B8B8] text-[11px]">
                                {p.mentoring}
                              </td>

                              {/* Evaluation */}
                              <td className="py-3 pr-3 text-[#B8B8B8] text-[11px]">
                                {p.evaluation}
                              </td>

                              {/* Report with View Affordance */}
                              <td className="py-3 text-right">
                                <div className="inline-flex items-center gap-1 text-[11px] text-[#888888] group">
                                  <span className={isHovered ? 'text-[#F5F5F5]' : 'text-[#888888]'}>
                                    {p.report}
                                  </span>
                                  <ArrowUpRight
                                    className={`w-3 h-3 transition-all duration-150 ${
                                      isHovered
                                        ? 'text-[#14B8A6] translate-x-0.5 -translate-y-0.5 opacity-100'
                                        : 'text-[#555555] opacity-50'
                                    }`}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* 
                    MOBILE STACKED CARD VIEW (Visible on < 768px)
                    Compact stacked records matching Section 13
                  */}
                  <div className="md:hidden flex flex-col gap-2.5">
                    {projectRecords.map((p, mIdx) => {
                      const isHovered = hoveredRowId === p.id;

                      return (
                        <div
                          key={p.id}
                          tabIndex={0}
                          role="button"
                          onClick={() => navigateTo(mIdx === 0 ? '/projects' : '/reports')}
                          onMouseEnter={() => setHoveredRowId(p.id)}
                          onMouseLeave={() => setHoveredRowId(null)}
                          onFocus={() => setHoveredRowId(p.id)}
                          onBlur={() => setHoveredRowId(null)}
                          className={`p-3 rounded-lg border transition-all duration-200 select-none font-mono text-xs focus:outline-none cursor-pointer ${transitionClass} ${
                            hasEntered || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                          } ${
                            isHovered
                              ? 'bg-[#121212] border-white/[0.14]'
                              : 'bg-[#0D0D0D]/70 border-white/[0.05]'
                          }`}
                          style={{ transitionDelay: prefersReducedMotion ? '0ms' : `${320 + mIdx * 80}ms` }}
                        >
                          {/* PROJECT */}
                          <div className="flex items-start justify-between gap-2 pb-2 border-b border-white/[0.05]">
                            <div className="min-w-0">
                              <span className="text-[9px] uppercase tracking-wider text-[#777777] block leading-none mb-1">
                                PROJECT
                              </span>
                              <h4 className="font-sans text-xs sm:text-[13px] font-medium text-[#F5F5F5] truncate leading-tight">
                                {p.title}
                              </h4>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] border flex-shrink-0 ${
                                p.statusType === 'active'
                                  ? 'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/25 font-medium'
                                  : 'bg-white/[0.03] text-[#888888] border-white/[0.06]'
                              }`}
                            >
                              <span
                                className={`w-1 h-1 rounded-full ${
                                  p.statusType === 'active' ? 'bg-[#14B8A6]' : 'bg-[#777777]'
                                }`}
                              />
                              {p.stage}
                            </span>
                          </div>

                          {/* STAGE & MENTORING */}
                          <div className="grid grid-cols-2 gap-2 pt-1.5 text-[10px]">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-[#777777] block leading-none mb-0.5">
                                STAGE
                              </span>
                              <span className="text-[#F5F5F5]">{p.stage}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-[#777777] block leading-none mb-0.5">
                                MENTORING
                              </span>
                              <span className="text-[#B8B8B8]">{p.mentoring}</span>
                            </div>
                          </div>

                          {/* EVALUATION & REPORT */}
                          <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-white/[0.05] text-[10px]">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-[#777777] block leading-none mb-0.5">
                                EVALUATION
                              </span>
                              <span className="text-[#B8B8B8]">{p.evaluation}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-[#777777] block leading-none mb-0.5">
                                REPORT
                              </span>
                              <span className="text-[#F5F5F5]">{p.report}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Small Institutional View Summary Sentence */}
                <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-t border-dashed border-white/[0.08] bg-[#0A0A0A] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[10px] sm:text-[11px] font-mono select-none">
                  <span className="text-[#B8B8B8]">
                    Project and evaluation information brought into one institutional view.
                  </span>
                  <a
                    href="/dashboard"
                    onClick={(e) => navigateTo('/dashboard', e)}
                    className="text-[#14B8A6] hover:underline flex items-center gap-1 text-[11px] font-mono self-start sm:self-auto"
                  >
                    <span>Open Full Dashboard</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>

                {/* Viewport Footer Bar */}
                <div className="px-3.5 sm:px-5 py-2 border-t border-white/[0.06] bg-[#080808] flex items-center justify-between text-[9px] sm:text-[10px] text-[#777777] font-mono select-none">
                  <span className="tracking-wider uppercase">CAMPUSLAB // INSTITUTIONAL VIEW</span>
                  <span className="text-[#888888] hidden min-[400px]:inline">
                    PROJECTS · MENTORS · MILESTONES · EVALUATION · REPORTS
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default DashboardPreview;
