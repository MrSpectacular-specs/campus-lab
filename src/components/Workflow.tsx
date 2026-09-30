import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowDown, ArrowUpRight } from 'lucide-react';
import { navigateTo } from '../utils/navigation';
interface WorkflowStage {
  id: string;
  step: string;
  title: string;
  description: string;
  route: string;
  isActive?: boolean;
}

const stages: WorkflowStage[] = [
  {
    id: 'brief',
    step: '01',
    title: 'PROJECT BRIEF',
    description: 'A structured starting point for the project.',
    route: '/projects',
  },
  {
    id: 'mentoring',
    step: '02',
    title: 'MENTORING',
    description: 'Guidance and feedback throughout project execution.',
    route: '/mentor',
  },
  {
    id: 'milestones',
    step: '03',
    title: 'MILESTONES',
    description: 'Progress organized through defined project stages.',
    route: '/student',
    isActive: true,
  },
  {
    id: 'evaluation',
    step: '04',
    title: 'EVALUATION',
    description: 'Rubrics and reviews structure assessment and feedback.',
    route: '/reports',
  },
  {
    id: 'reporting',
    step: '05',
    title: 'REPORTING',
    description: 'Project and evaluation information surfaced for the institution.',
    route: '/dashboard',
  },
];

export const Workflow: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);
  const [activeStageId, setActiveStageId] = useState<string>('milestones');
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);
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
      id="how-it-works"
      ref={sectionRef}
      className="relative pt-10 pb-10 sm:pt-16 sm:pb-20 lg:pt-[88px] lg:pb-[104px] border-t border-white/[0.07] bg-[#050505]/40 overflow-hidden"
      aria-label="How It Works"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER: Editorial Marker, Main Headline, Supporting Copy */}
        <div
          className={`max-w-3xl mb-6 sm:mb-12 ${transitionClass} ${
            inView || prefersReducedMotion
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Product Section Eyebrow */}
          <div className="flex items-center gap-2.5 mb-2.5 sm:mb-5 select-none">
            <span className="w-6 h-px bg-[#14B8A6]" aria-hidden="true" />
            <span className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B8B8B8]">
              HOW IT WORKS
            </span>
          </div>

          {/* Main Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-[38px] xl:text-[42px] font-bold tracking-[-0.035em] text-[#F5F5F5] leading-[1.14] mb-2.5 sm:mb-5">
            From project brief to institutional visibility.
          </h2>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-[#B8B8B8] leading-relaxed font-normal max-w-2xl">
            CampusLab structures the project journey across mentoring, milestones, evaluation, and reporting.
          </p>
        </div>

        {/* 
          MAIN WORKFLOW DIAGRAM
          Desktop & Tablet (>= 768px): Horizontal continuous sequence with centered arrows
          Mobile (< 768px): Vertical continuous sequence with centered arrows
        */}
        <div
          className={`mb-6 sm:mb-12 ${transitionClass} ${
            inView || prefersReducedMotion
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: prefersReducedMotion ? '0ms' : '150ms' }}
        >
          {/* 
            DESKTOP & TABLET HORIZONTAL SEQUENCE (>= 768px)
          */}
          <div className="hidden md:block">
            <div className="grid grid-cols-5 gap-3 lg:gap-4 relative items-stretch">
              {stages.map((stage, index) => {
                const isLast = index === stages.length - 1;
                const isHovered = hoveredStageId === stage.id;
                const isActive = stage.id === (hoveredStageId || activeStageId);
                return (
                  <div
                    key={stage.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`${stage.step} — ${stage.title}: ${stage.description}`}
                    onClick={() => navigateTo(stage.route)}
                    onMouseEnter={() => setHoveredStageId(stage.id)}
                    onMouseLeave={() => setHoveredStageId(null)}
                    onFocus={() => setHoveredStageId(stage.id)}
                    onBlur={() => setHoveredStageId(null)}
                    className="group relative flex flex-col focus:outline-none cursor-pointer select-none"
                  >
                    {/* Top Anchor: Numbered Badge + Track Line + Centered Arrow */}
                    <div className="relative flex items-center mb-3 sm:mb-4">
                      {/* Step Number Badge */}
                      <div
                        className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center font-mono text-[11px] lg:text-xs font-semibold border transition-all duration-200 z-10 ${
                          isActive
                            ? 'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/30 shadow-[0_0_12px_rgba(20,184,166,0.15)]'
                            : isHovered
                            ? 'bg-[#161616] text-[#F5F5F5] border-white/[0.20]'
                            : 'bg-[#0D0D0D] text-[#777777] border-white/[0.08]'
                        }`}
                      >
                        {stage.step}
                      </div>

                      {/* Connector to Next Stage (Thin horizontal line + Centered Arrow) */}
                      {!isLast && (
                        <div
                          className="absolute left-7 lg:left-8 right-[-12px] lg:right-[-16px] top-1/2 -translate-y-1/2 flex items-center justify-center z-0 pointer-events-none"
                          aria-hidden="true"
                        >
                          <div className="w-full h-px bg-white/[0.08] relative flex items-center justify-center">
                            <ArrowRight
                              className={`w-3 h-3 transition-colors duration-200 bg-[#050505] px-0.5 ${
                                isActive
                                  ? 'text-[#14B8A6]'
                                  : isHovered
                                  ? 'text-[#F5F5F5]'
                                  : 'text-white/[0.25]'
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stage Card */}
                    <div
                      className={`flex-1 p-3 lg:p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                        isActive
                          ? 'bg-[#0D0D0D] border-[#14B8A6]/30 shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
                          : isHovered
                          ? 'bg-[#121212] border-white/[0.14]'
                          : 'bg-[#0A0A0A] border-white/[0.06] hover:border-white/[0.10]'
                      } ${!prefersReducedMotion && (isActive || isHovered) ? '-translate-y-[1px]' : ''}`}
                    >
                      <div>
                        {/* Title and Active Chip */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1 min-w-0">
                            <h3 className="font-mono text-[11px] lg:text-xs font-semibold tracking-wider text-[#F5F5F5] uppercase truncate">
                              {stage.title}
                            </h3>
                            <ArrowUpRight className="w-2.5 h-2.5 text-[#666666] opacity-0 group-hover:opacity-100 group-hover:text-white transition-opacity flex-shrink-0" />
                          </div>
                          {isActive && (
                            <span className="font-mono text-[8.5px] px-1.5 py-0.5 rounded bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/20 uppercase tracking-wider flex-shrink-0">
                              DEMO
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-[11px] lg:text-xs text-[#B8B8B8] leading-relaxed font-normal">
                          {stage.description}
                        </p>
                      </div>

                      {/* Subtle Active Indicator Bar */}
                      {isActive && (
                        <div className="mt-3 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[9px] font-mono text-[#777777]">
                          <span className="text-[#14B8A6] font-medium uppercase tracking-wider">
                            CURRENT STAGE
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 
            MOBILE VERTICAL SEQUENCE (< 768px)
            One continuous thin vertical line with centered downward arrows
          */}
          <div className="md:hidden relative pl-5 py-1">
            {/* Continuous Vertical Track Line: Aligned with node centers */}
            <div
              className="absolute top-4 bottom-4 left-[14px] w-px bg-white/[0.08] pointer-events-none z-0"
              aria-hidden="true"
            />

            <div className="flex flex-col gap-2 sm:gap-3 relative z-10">
              {stages.map((stage, index) => {
                const isLast = index === stages.length - 1;
                const isHovered = hoveredStageId === stage.id;
                const isActive = stage.id === (hoveredStageId || activeStageId);
                return (
                  <React.Fragment key={stage.id}>
                    <div
                      tabIndex={0}
                      role="button"
                      aria-label={`${stage.step} — ${stage.title}: ${stage.description}`}
                      onClick={() => navigateTo(stage.route)}
                      onMouseEnter={() => setHoveredStageId(stage.id)}
                      onMouseLeave={() => setHoveredStageId(null)}
                      onFocus={() => setHoveredStageId(stage.id)}
                      onBlur={() => setHoveredStageId(null)}
                      className="group flex items-start gap-3 focus:outline-none cursor-pointer select-none"
                    >
                      {/* Left Numbered Node */}
                      <div className="flex flex-col items-center flex-shrink-0 relative">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[11px] font-semibold border transition-all duration-200 z-10 ${
                            isActive
                              ? 'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/30 shadow-[0_0_12px_rgba(20,184,166,0.15)]'
                              : isHovered
                              ? 'bg-[#161616] text-[#F5F5F5] border-white/[0.20]'
                              : 'bg-[#0D0D0D] text-[#777777] border-white/[0.08]'
                          }`}
                        >
                          {stage.step}
                        </div>
                      </div>

                      {/* Right Stage Card Details */}
                      <div
                        className={`flex-1 p-2.5 sm:p-3 rounded-lg border transition-all duration-200 ${
                          isActive
                            ? 'bg-[#0D0D0D] border-[#14B8A6]/30 shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
                            : isHovered
                            ? 'bg-[#121212] border-white/[0.14]'
                            : 'bg-[#0A0A0A] border-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5 sm:mb-1">
                          <h3 className="font-mono text-xs font-semibold tracking-wider text-[#F5F5F5] uppercase">
                            {stage.step} — {stage.title}
                          </h3>
                          {isActive && (
                            <span className="font-mono text-[8.5px] px-1.5 py-0.5 rounded bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/20 uppercase tracking-wider flex-shrink-0">
                              DEMO WORKFLOW
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#B8B8B8] leading-relaxed font-normal">
                          {stage.description}
                        </p>
                      </div>
                    </div>

                    {/* Centered Downward Connector Arrow */}
                    {!isLast && (
                      <div
                        className="h-3.5 ml-[-5px] flex items-center justify-start pl-[14px] pointer-events-none"
                        aria-hidden="true"
                      >
                        <ArrowDown
                          className={`w-3 h-3 transition-colors duration-200 bg-[#050505] py-0.5 -ml-1.5 ${
                            isActive ? 'text-[#14B8A6]' : 'text-white/[0.25]'
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* 
          INPUT → PROCESS → OUTPUT SERVICE FLOW STRIP
          Very compact conceptual strip matching Section 6
        */}
        <div
          className={`rounded-xl bg-[#080808] border border-white/[0.07] p-3 sm:p-4 select-none ${transitionClass} ${
            inView || prefersReducedMotion
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: prefersReducedMotion ? '0ms' : '220ms' }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.06] text-[9.5px] sm:text-[10px] font-mono text-[#777777]">
            <span className="uppercase tracking-wider">ILLUSTRATIVE SERVICE WORKFLOW</span>
            <span className="uppercase tracking-wider text-[#555555]">DELIVERY FRAMEWORK</span>
          </div>

          {/* 3 Conceptual Steps: INPUT → PROCESS → OUTPUT */}
          {/* Desktop/Tablet 3-Card Row (>= 768px) */}
          <div className="hidden md:grid grid-cols-11 items-center gap-2">
            {/* INPUT */}
            <div className="col-span-3 flex flex-col items-start p-2 sm:p-2.5 rounded-lg bg-[#0D0D0D] border border-white/[0.05]">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#777777] mb-0.5">
                INPUT
              </span>
              <h4 className="font-mono text-xs sm:text-[12.5px] font-semibold text-[#F5F5F5]">
                Project Brief
              </h4>
            </div>

            {/* Arrow Divider */}
            <div className="col-span-1 flex items-center justify-center text-white/[0.20]" aria-hidden="true">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>

            {/* PROCESS */}
            <div className="col-span-3 flex flex-col items-start p-2 sm:p-2.5 rounded-lg bg-[#0D0D0D] border border-white/[0.05]">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#14B8A6] mb-0.5 font-medium">
                PROCESS
              </span>
              <h4 className="font-mono text-xs sm:text-[12.5px] font-semibold text-[#F5F5F5]">
                Mentoring · Milestones · Evaluation
              </h4>
            </div>

            {/* Arrow Divider */}
            <div className="col-span-1 flex items-center justify-center text-white/[0.20]" aria-hidden="true">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>

            {/* OUTPUT */}
            <div className="col-span-3 flex flex-col items-start p-2 sm:p-2.5 rounded-lg bg-[#0D0D0D] border border-white/[0.05]">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#777777] mb-0.5">
                OUTPUT
              </span>
              <h4 className="font-mono text-xs sm:text-[12.5px] font-semibold text-[#F5F5F5]">
                Project Work · Evaluation Information · Institutional Reporting
              </h4>
            </div>
          </div>

          {/* Mobile Compact 3-Row List (< 768px) */}
          <div className="flex flex-col gap-2 md:hidden text-xs font-mono">
            <div className="flex items-baseline gap-2 pb-1 border-b border-white/[0.04]">
              <span className="text-[9px] uppercase tracking-wider text-[#777777] w-14 flex-shrink-0">
                INPUT
              </span>
              <span className="text-[#F5F5F5] font-medium text-[11px] truncate">
                Project Brief
              </span>
            </div>
            <div className="flex items-baseline gap-2 pb-1 border-b border-white/[0.04]">
              <span className="text-[9px] uppercase tracking-wider text-[#14B8A6] w-14 flex-shrink-0 font-medium">
                PROCESS
              </span>
              <span className="text-[#F5F5F5] font-medium text-[11px]">
                Mentoring · Milestones · Evaluation
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[9px] uppercase tracking-wider text-[#777777] w-14 flex-shrink-0">
                OUTPUT
              </span>
              <span className="text-[#F5F5F5] font-medium text-[11px] leading-tight">
                Project Work · Evaluation Information · Institutional Reporting
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Workflow;
