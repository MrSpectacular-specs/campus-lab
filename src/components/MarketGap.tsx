import React, { useState, useEffect, useRef } from 'react';

interface FrictionPoint {
  number: string;
  title: string;
  description: string;
}

const frictionPoints: FrictionPoint[] = [
  {
    number: '01',
    title: 'FACULTY COORDINATION',
    description: 'Project activity requires coordination across faculty and students.',
  },
  {
    number: '02',
    title: 'MENTOR INVOLVEMENT',
    description: 'Mentoring needs to fit into the project workflow.',
  },
  {
    number: '03',
    title: 'PROJECT PROGRESS',
    description: 'Student progress needs structure across project stages.',
  },
  {
    number: '04',
    title: 'EVALUATION + REPORTING',
    description: 'Reviews and institutional reporting need a consistent workflow.',
  },
];

interface WorkflowStage {
  number: string;
  label: string;
  tag: string;
}

const workflowStages: WorkflowStage[] = [
  { number: '01', label: 'PROJECT CURATION', tag: 'Project Selection & Curation' },
  { number: '02', label: 'MENTOR INVOLVEMENT', tag: 'Mentor Coordination' },
  { number: '03', label: 'STUDENT PROGRESS', tag: 'Progress Tracking' },
  { number: '04', label: 'EVALUATION', tag: 'Structured Review' },
  { number: '05', label: 'INSTITUTIONAL REPORTING', tag: 'Institutional Reporting' },
];

export const MarketGap: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [activeFriction, setActiveFriction] = useState<string | null>(null);
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
      id="problem"
      ref={sectionRef}
      className="relative pt-12 pb-12 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20 border-t border-white/[0.07] bg-[#050505]/60 overflow-hidden"
      aria-label="The Problem"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP SECTION: Left Headline & Value Proposition, Right Operational Diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Section Header, Dominant Headline, and Supporting Copy */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Product Section Eyebrow */}
            <div
              className={`flex items-center gap-2.5 mb-3 sm:mb-5 select-none ${transitionClass} ${
                inView || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <span className="w-6 h-px bg-[#14B8A6]" aria-hidden="true" />
              <span className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B8B8B8]">
                THE OPERATIONAL CHALLENGE
              </span>
            </div>

            {/* Large Dominant Editorial Headline */}
            <h2
              className={`text-2xl sm:text-3xl lg:text-[38px] xl:text-[42px] font-bold tracking-[-0.035em] text-[#F5F5F5] leading-[1.14] mb-4 sm:mb-5 ${transitionClass} ${
                inView || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
              style={{ transitionDelay: prefersReducedMotion ? '0ms' : '80ms' }}
            >
              Project-based learning is valuable. Running it at scale is difficult.
            </h2>

            {/* Concise Supporting Copy */}
            <p
              className={`text-base sm:text-lg text-[#B8B8B8] leading-relaxed font-normal max-w-xl ${transitionClass} ${
                inView || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
              style={{ transitionDelay: prefersReducedMotion ? '0ms' : '160ms' }}
            >
              Colleges must coordinate project curation, mentor involvement, student progress, evaluation, and institutional reporting across project-based learning workflows.
            </p>
          </div>

          {/* RIGHT COLUMN: Operational Fragmentation System Diagram */}
          <div
            className={`lg:col-span-6 w-full ${transitionClass} ${
              inView || prefersReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: prefersReducedMotion ? '0ms' : '150ms' }}
          >
            <div className="w-full max-w-xl mx-auto lg:max-w-none">
              {/* Restrained Framed Diagram Card */}
              <div className="rounded-xl bg-[#080808] border border-white/[0.08] shadow-[0_8px_30px_-6px_rgba(0,0,0,0.5)] specular-highlight overflow-hidden">
                
                {/* Diagram Header */}
                <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-white/[0.07] bg-[#0D0D0D] flex items-center justify-between text-[10px] sm:text-[11px] font-mono select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#777777]" />
                    <span className="uppercase tracking-wider text-[#777777]">
                      OPERATIONAL FRAGMENTATION
                    </span>
                  </div>
                  <span className="text-[#666666] tracking-wider uppercase text-[9px] sm:text-[10px]">
                    SYSTEM GAP
                  </span>
                </div>

                {/* Sequential Workflow Stages with Disconnected Flow */}
                <div className="p-2.5 sm:p-4 flex flex-col">
                  {workflowStages.map((stage, index) => {
                    const isLast = index === workflowStages.length - 1;

                    return (
                      <React.Fragment key={stage.number}>
                        {/* Stage Node */}
                        <div
                          className={`flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-0.5 min-[420px]:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2.5 rounded-lg bg-[#0D0D0D] border border-white/[0.05] select-none hover:border-white/[0.10] transition-colors ${transitionClass} ${
                            inView || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                          }`}
                          style={{ transitionDelay: prefersReducedMotion ? '0ms' : `${240 + index * 80}ms` }}
                        >
                          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                            <span className="font-mono text-[10px] sm:text-[11px] text-[#777777] flex-shrink-0">
                              {stage.number}
                            </span>
                            <span className="font-mono text-xs sm:text-[12.5px] font-medium tracking-wide text-[#F5F5F5]">
                              {stage.label}
                            </span>
                          </div>
                          <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#666666] pl-4 min-[420px]:pl-0 flex-shrink-0">
                            {stage.tag}
                          </span>
                        </div>

                        {/* Downward Connector Arrow */}
                        {!isLast && (
                          <div
                            className={`flex items-center justify-center py-0.5 sm:py-1 ${transitionClass} ${
                              inView || prefersReducedMotion ? 'opacity-100' : 'opacity-0'
                            }`}
                            style={{ transitionDelay: prefersReducedMotion ? '0ms' : `${280 + index * 80}ms` }}
                            aria-hidden="true"
                          >
                            <div className="flex flex-col items-center">
                              <span className="w-px h-2 sm:h-2.5 bg-white/[0.10]" />
                              <span className="font-mono text-[9px] sm:text-[10px] text-[#555555] leading-none">
                                ↓
                              </span>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Conceptual Result Footer */}
                <div
                  className={`px-3 sm:px-5 py-2 sm:py-3 border-t border-dashed border-white/[0.08] bg-[#0A0A0A] flex items-center justify-between text-[10px] sm:text-[11px] font-mono select-none ${transitionClass} ${
                    inView || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
                  style={{ transitionDelay: prefersReducedMotion ? '0ms' : '620ms' }}
                >
                  <span className="uppercase tracking-wider text-[#777777]">
                    OPERATIONAL CHALLENGE
                  </span>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.08]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#777777]" />
                    <span className="font-mono text-[9.5px] sm:text-[10.5px] font-semibold uppercase tracking-wider text-[#F5F5F5]">
                      COORDINATION AT SCALE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Four Concise Friction Points */}
        <div
          className={`mt-8 sm:mt-12 lg:mt-16 pt-6 sm:pt-10 border-t border-white/[0.08] ${transitionClass} ${
            inView || prefersReducedMotion
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: prefersReducedMotion ? '0ms' : '220ms' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {frictionPoints.map((point, pIdx) => {
              const isActive = activeFriction === point.number;

              return (
                <div
                  key={point.number}
                  tabIndex={0}
                  role="article"
                  aria-label={`${point.number} ${point.title}: ${point.description}`}
                  onMouseEnter={() => setActiveFriction(point.number)}
                  onMouseLeave={() => setActiveFriction(null)}
                  onFocus={() => setActiveFriction(point.number)}
                  onBlur={() => setActiveFriction(null)}
                  className={`group flex flex-col items-start select-none focus:outline-none cursor-default ${transitionClass} ${
                    inView || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                  }`}
                  style={{ transitionDelay: prefersReducedMotion ? '0ms' : `${660 + pIdx * 60}ms` }}
                >
                  {/* Number & Subtle Hairline Rule */}
                  <div
                    className={`w-full pb-1.5 sm:pb-2.5 mb-1.5 sm:mb-2.5 border-b flex items-center justify-between transition-colors duration-200 ${
                      isActive
                        ? 'border-white/[0.18]'
                        : 'border-white/[0.07] group-hover:border-white/[0.14]'
                    }`}
                  >
                    <span
                      className={`font-mono text-xs font-semibold transition-colors duration-200 ${
                        isActive
                          ? 'text-[#F5F5F5]'
                          : 'text-[#777777] group-hover:text-[#F5F5F5]'
                      }`}
                    >
                      {point.number}
                    </span>
                    <span
                      className={`w-1 h-1 rounded-full transition-colors duration-200 ${
                        isActive
                          ? 'bg-[#14B8A6]'
                          : 'bg-white/[0.10] group-hover:bg-[#14B8A6]'
                      }`}
                    />
                  </div>

                  {/* Friction Title */}
                  <h3 className="font-mono text-xs font-semibold tracking-wider text-[#F5F5F5] uppercase mb-1 sm:mb-2">
                    {point.title}
                  </h3>

                  {/* Friction Description */}
                  <p className="text-xs sm:text-[13px] text-[#B8B8B8] leading-relaxed font-normal">
                    {point.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default MarketGap;
