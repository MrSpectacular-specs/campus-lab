import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { navigateTo } from '../utils/navigation';
interface SolutionStage {
  id: string;
  step: string;
  category: string;
  action: string;
  title: string;
  specimen: string;
  route: string;
}
const solutionStages: SolutionStage[] = [
  {
    id: 'project',
    step: '01',
    category: 'PROJECT',
    action: 'CURATE',
    title: 'Project Library',
    specimen: 'Campus Sustainability Tracker',
    route: '/projects',
  },
  {
    id: 'mentor',
    step: '02',
    category: 'MENTOR',
    action: 'GUIDE',
    title: 'Mentor Sessions',
    specimen: 'Mentor Assigned',
    route: '/mentor',
  },
  {
    id: 'milestones',
    step: '03',
    category: 'MILESTONES',
    action: 'TRACK',
    title: 'Project Progress',
    specimen: 'Prototype Sprint',
    route: '/student',
  },
  {
    id: 'evaluation',
    step: '04',
    category: 'EVALUATION',
    action: 'EVALUATE',
    title: 'Rubrics & Review',
    specimen: 'Rubric Review',
    route: '/reports',
  },
  {
    id: 'reporting',
    step: '05',
    category: 'REPORTING',
    action: 'REPORT',
    title: 'Institutional View',
    specimen: 'Project Report',
    route: '/dashboard',
  },
];

interface CapabilityAnnotation {
  step: string;
  title: string;
  description: string;
  phase: string;
  route: string;
}
const capabilityAnnotations: CapabilityAnnotation[] = [
  {
    step: '01',
    title: 'PROJECT LIBRARY',
    description: 'Structured project starting points.',
    phase: 'Curate',
    route: '/projects',
  },
  {
    step: '02',
    title: 'MENTOR SESSIONS',
    description: 'Guidance and feedback throughout project execution.',
    phase: 'Guide',
    route: '/mentor',
  },
  {
    step: '03',
    title: 'MILESTONES',
    description: 'Structured project stages and progress.',
    phase: 'Track',
    route: '/student',
  },
  {
    step: '04',
    title: 'EVALUATION',
    description: 'Rubrics and reviews for project evaluation and feedback.',
    phase: 'Evaluate',
    route: '/reports',
  },
  {
    step: '05',
    title: 'INSTITUTIONAL REPORTING',
    description: 'Project progress, evaluation information, and reporting.',
    phase: 'Report',
    route: '/dashboard',
  },
];

export const Platform: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [activeStageId, setActiveStageId] = useState<string>('milestones');
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
          setInView(true);
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
      id="platform"
      ref={sectionRef}
      className="relative pt-8 pb-8 sm:pt-16 sm:pb-20 lg:pt-[88px] lg:pb-[104px] border-t border-white/[0.07] bg-[#050505]/40 overflow-hidden"
      aria-label="Platform Solution"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP SECTION: Two-Column Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Section Marker, Main Headline, Supporting Copy, and System Pipeline */}
          <div
            className={`lg:col-span-5 flex flex-col items-start text-left ${transitionClass} ${
              inView || prefersReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            {/* Product Section Eyebrow */}
            <div className="flex items-center gap-2.5 mb-3 sm:mb-5 select-none">
              <span className="w-6 h-px bg-[#14B8A6]" aria-hidden="true" />
              <span className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B8B8B8]">
                THE PLATFORM WORKFLOW
              </span>
            </div>

            {/* Main Dominant Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-[38px] xl:text-[42px] font-bold tracking-[-0.035em] text-[#F5F5F5] leading-[1.14] mb-3 sm:mb-5">
              One structured workflow for project-based learning.
            </h2>

            {/* Concise Supporting Copy */}
            <p className="text-base sm:text-lg text-[#B8B8B8] leading-relaxed font-normal max-w-xl mb-4 sm:mb-8">
              CampusLab brings projects, mentoring, milestones, evaluation, and institutional reporting into one structured workflow.
            </p>

            {/* Visual Path Summary Pipeline */}
            <div className="hidden sm:flex flex-wrap items-center gap-2 py-2 px-3 rounded-lg bg-[#080808] border border-white/[0.06] text-[10px] font-mono text-[#777777] select-none">
              <span className="text-[#F5F5F5] font-semibold">CURATE</span>
              <span className="text-[#555555]">→</span>
              <span className="text-[#F5F5F5] font-semibold">GUIDE</span>
              <span className="text-[#555555]">→</span>
              <span className="text-[#F5F5F5] font-semibold">TRACK</span>
              <span className="text-[#555555]">→</span>
              <span className="text-[#F5F5F5] font-semibold">EVALUATE</span>
              <span className="text-[#555555]">→</span>
              <span className="text-[#F5F5F5] font-semibold">REPORT</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Single Framed CampusLab Workflow Viewport */}
          <div
            className={`lg:col-span-7 w-full ${transitionClass} ${
              inView || prefersReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: prefersReducedMotion ? '0ms' : '150ms' }}
          >
            <div className="w-full max-w-2xl mx-auto lg:max-w-none">
              {/* Framed Viewport: Crisp Smoked Surface with Hairline Border */}
              <div className="rounded-xl bg-[#080808] border border-white/[0.08] shadow-[0_12px_36px_-8px_rgba(0,0,0,0.6)] specular-highlight overflow-hidden">
                
                {/* Viewport Chrome Header */}
                <div className="px-3.5 sm:px-5 py-2 sm:py-3 border-b border-white/[0.07] bg-[#0D0D0D] flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono select-none">
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0" aria-hidden="true">
                      <span className="w-2 h-2 rounded-full bg-white/[0.12]" />
                      <span className="w-2 h-2 rounded-full bg-white/[0.08]" />
                      <span className="w-2 h-2 rounded-full bg-white/[0.08]" />
                    </div>
                    <span className="font-mono text-[9px] min-[360px]:text-[10px] sm:text-[11px] uppercase tracking-normal sm:tracking-wider text-[#777777] truncate">
                      CAMPUSLAB // PROJECT WORKFLOW
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
                    <a
                      href="/projects"
                      onClick={(e) => navigateTo('/projects', e)}
                      className="hidden sm:inline-flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded bg-white/[0.04] text-[#B8B8B8] hover:text-white hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
                    >
                      <span>Explore Library</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </a>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                      <span className="font-mono text-[10px] sm:text-[11px] text-[#14B8A6] uppercase tracking-wider font-medium hidden min-[480px]:inline">
                        WORKFLOW ACTIVE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Viewport Core: Connected Workflow Stages */}
                <div className="p-2 sm:p-4 flex flex-col">
                  {solutionStages.map((stage, index) => {
                    const isSelected = activeStageId === stage.id;
                    const isLast = index === solutionStages.length - 1;

                    return (
                      <React.Fragment key={stage.id}>
                        {/* Interactive Workflow Stage Row */}
                        <div
                        role="button"
                        aria-label={`${stage.step} — ${stage.category}: ${stage.title} (${stage.specimen})`}
                        onClick={() => navigateTo(stage.route)}
                        onMouseEnter={() => setActiveStageId(stage.id)}
                        onFocus={() => setActiveStageId(stage.id)}
                        className={`group relative rounded-lg border px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-[#14B8A6]/40 motion-reduce:transition-none motion-reduce:transform-none ${
                          isSelected
                            ? 'bg-[#161616] border-white/[0.14] shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
                            : 'bg-[#0D0D0D]/60 border-white/[0.05] hover:border-white/[0.09] hover:bg-[#111111]/80'
                        } ${!prefersReducedMotion && isSelected ? '-translate-y-[1px] motion-reduce:translate-y-0' : ''}`}
                      >
                          <div className="flex items-center justify-between gap-2.5 sm:gap-3">
                            {/* Left: Step number pill & category/title */}
                            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                              <div
                                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-mono border transition-colors ${
                                  isSelected
                                    ? 'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/30'
                                    : 'bg-white/[0.03] text-[#777777] border-white/[0.06]'
                                }`}
                              >
                                <span>{stage.step}</span>
                              </div>
                              <div className="min-w-0">
                                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#777777] block leading-none mb-0.5">
                                  {stage.category} · {stage.title}
                                </span>
                                <h4 className="text-xs sm:text-[13px] font-medium text-[#F5F5F5] truncate leading-tight">
                                  {stage.specimen}
                                </h4>
                              </div>
                            </div>
                            {/* Right: Phase Action Tag */}
                            <div className="text-right flex-shrink-0 flex items-center gap-1.5">
                              <span
                                className={`font-mono text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                  isSelected
                                    ? 'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/25 font-medium'
                                    : 'bg-white/[0.02] text-[#666666] border-white/[0.05]'
                                }`}
                              >
                                {stage.action}
                              </span>
                              <ArrowUpRight className="w-2.5 h-2.5 text-[#666666] opacity-0 group-hover:opacity-100 group-hover:text-white transition-opacity hidden sm:inline" />
                            </div>
                          </div>
                        </div>

                        {/* Downward Visual Path Connector */}
                        {!isLast && (
                          <div className="flex items-center justify-center py-0.5 sm:py-1" aria-hidden="true">
                            <div className="flex flex-col items-center">
                              <span className="w-px h-2 sm:h-2.5 bg-white/[0.12]" />
                              <span className="font-mono text-[9px] sm:text-[10px] text-[#777777] leading-none">
                                ↓
                              </span>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Viewport Footer Bar */}
                <div className="px-3.5 sm:px-5 py-2 sm:py-2.5 border-t border-dashed border-white/[0.08] bg-[#0A0A0A] flex items-center justify-between text-[10px] sm:text-[11px] font-mono select-none">
                  <span className="uppercase tracking-wider text-[#777777]">
                    PROJECT LEARNING WORKFLOW
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.08]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                    <span className="font-mono text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-[#F5F5F5]">
                      ONE STRUCTURED SYSTEM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Compact Supporting Capability Annotations Strip */}
        <div
          className={`mt-6 sm:mt-12 lg:mt-16 pt-5 sm:pt-10 border-t border-white/[0.08] ${transitionClass} ${
            inView || prefersReducedMotion
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: prefersReducedMotion ? '0ms' : '200ms' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-6">
            {capabilityAnnotations.map((cap) => (
              <div
                key={cap.title}
                tabIndex={0}
                role="button"
                aria-label={`${cap.step} ${cap.title}: ${cap.description}`}
                onClick={() => navigateTo(cap.route)}
                className="group flex flex-col items-start select-none focus:outline-none cursor-pointer py-1 sm:py-0 border-b sm:border-b-0 border-white/[0.05] sm:border-transparent last:border-b-0 hover:bg-white/[0.02] rounded px-1 -mx-1 transition-colors"
              >
                {/* Step Marker & Title Line on Mobile, Stacked on Desktop */}
                <div className="w-full pb-1 sm:pb-2 mb-1 sm:mb-2 sm:border-b sm:border-white/[0.07] group-hover:border-white/[0.14] flex items-center justify-between transition-colors duration-200">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-[#777777] group-hover:text-[#F5F5F5] transition-colors">
                      {cap.step}
                    </span>
                    <h3 className="font-mono text-xs font-semibold tracking-wider text-[#F5F5F5] uppercase">
                      {cap.title}
                    </h3>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#14B8A6] font-medium hidden sm:inline">
                    {cap.phase}
                  </span>
                </div>

                {/* Short Description */}
                <p className="text-xs text-[#B8B8B8] leading-relaxed font-normal">
                  {cap.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Platform;
