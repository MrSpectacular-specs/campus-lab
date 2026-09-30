import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { navigateTo } from '../utils/navigation';

interface ParticipantNode {
  id: string;
  role: string;
  badge: string;
  badgeType: 'payer' | 'delivery' | 'users' | 'artefacts' | 'oversight';
  description: string;
  sublabel: string;
  route: string;
}

const participantFlow: ParticipantNode[] = [
  {
    id: 'institution',
    role: 'COLLEGE / INSTITUTION',
    badge: 'PAYING CUSTOMER',
    badgeType: 'payer',
    description: 'Pays for CampusLab and receives institutional visibility.',
    sublabel: 'Academic Governance & Sponsorship',
    route: '/for-colleges',
  },
  {
    id: 'delivery',
    role: 'FACULTY + MENTORS',
    badge: 'DELIVERY PARTICIPANTS',
    badgeType: 'delivery',
    description: 'Participate in project delivery through guidance, mentoring, and evaluation.',
    sublabel: 'Practitioner Guidance & Review',
    route: '/mentor',
  },
  {
    id: 'students',
    role: 'STUDENT TEAMS',
    badge: 'PRIMARY USERS',
    badgeType: 'users',
    description: 'Primary users participating in project-based learning.',
    sublabel: 'Project Execution & Milestones',
    route: '/student',
  },
  {
    id: 'artefacts',
    role: 'PROJECT + EVALUATION INFO',
    badge: 'WORKFLOW ARTEFACTS',
    badgeType: 'artefacts',
    description: 'Project deliverables, milestone checkpoints, and review feedback.',
    sublabel: 'Structured Process Data',
    route: '/reports',
  },
  {
    id: 'reporting',
    role: 'INSTITUTIONAL VISIBILITY',
    badge: 'REPORTING / OVERSIGHT VIEW',
    badgeType: 'oversight',
    description: 'Project progress, evaluation, and reporting.',
    sublabel: 'Feedback Loop Surfaced to College Leadership',
    route: '/dashboard',
  },
];

export const Ecosystem: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);
  const [activeNodeId, setActiveNodeId] = useState<string>('institution');
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
      id="ecosystem"
      ref={sectionRef}
      className="relative pt-9 pb-9 sm:pt-12 sm:pb-14 md:pt-[88px] md:pb-[96px] lg:pt-16 lg:pb-20 border-t border-white/[0.07] bg-[#050505]/50 overflow-hidden"
      aria-label="Ecosystem"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER: Editorial Marker, Main Headline, Supporting Copy */}
        <div className="max-w-3xl mb-6 sm:mb-10">
          {/* Editorial Section Marker: [short rule] 05 — Ecosystem */}
          <div
            className={`flex items-center gap-2.5 mb-3 sm:mb-5 select-none ${transitionClass} ${
              inView || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
            style={{ transitionDelay: prefersReducedMotion ? '0ms' : '0ms' }}
          >
            <span className="w-6 h-px bg-[#14B8A6]" aria-hidden="true" />
            <span className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B8B8B8]">
              PARTICIPANT ECOSYSTEM
            </span>
          </div>

          {/* Main Headline */}
          <h2
            className={`text-2xl sm:text-3xl lg:text-[38px] xl:text-[42px] font-bold tracking-[-0.035em] text-[#F5F5F5] leading-[1.14] mb-3 sm:mb-5 ${transitionClass} ${
              inView || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
            style={{ transitionDelay: prefersReducedMotion ? '0ms' : '80ms' }}
          >
            One workflow. Multiple participants.
          </h2>

          {/* Supporting Copy */}
          <p
            className={`text-base sm:text-lg text-[#B8B8B8] leading-relaxed font-normal max-w-2xl ${transitionClass} ${
              inView || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
            style={{ transitionDelay: prefersReducedMotion ? '0ms' : '160ms' }}
          >
            CampusLab connects colleges, faculty and mentors, and student teams around a shared project-learning workflow.
          </p>
        </div>

        {/* 
          MAIN CONNECTED ECOSYSTEM DIAGRAM
          ONE connected B2B2C sequence:
          College (Paying customer) -> Faculty/Mentors (Delivery) -> Students (Users) -> Project/Evaluation Info -> Institutional Visibility
        {/* 
          MAIN CONNECTED ECOSYSTEM DIAGRAM
          Desktop & Tablet (>= 768px): Horizontal 5-node flow with centered directional connectors
          Mobile (< 768px): Compact vertical flow with thin line and centered downward arrows
        */}
        <div
          className={`mb-5 sm:mb-8 ${transitionClass} ${
            inView || prefersReducedMotion
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: prefersReducedMotion ? '0ms' : '150ms' }}
        >
          {/* Framed Architecture Canvas */}
          <div className="rounded-xl prism-glass prism-edge border border-white/[0.08] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.7)] specular-highlight overflow-hidden p-3.5 sm:p-5 md:p-6 lg:p-6 relative">
            <div className="prism-highlight w-full absolute top-0 left-0" />
            
            {/* Viewport Header */}
            <div className="flex items-center justify-between pb-2.5 sm:pb-3 mb-3.5 sm:mb-5 border-b border-white/[0.06] text-[10px] sm:text-[11px] font-mono select-none">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                <span className="text-[#F5F5F5] font-semibold tracking-wider uppercase">
                  CAMPUSLAB // PARTICIPANT ECOSYSTEM
                </span>
              </div>
              <span className="text-[#777777] uppercase tracking-wider text-[9px] sm:text-[10px]">
                B2B2C SERVICE MODEL
              </span>
            </div>

            {/* 
              DESKTOP & TABLET HORIZONTAL FLOW (>= 768px)
              COLLEGE / INSTITUTION → FACULTY + MENTORS → STUDENT TEAMS → PROJECT + EVALUATION INFO → INSTITUTIONAL VISIBILITY
            */}
            <div className="hidden md:block">
              <div className="grid grid-cols-5 gap-2.5 lg:gap-3.5 relative items-stretch">
                {participantFlow.map((node, index) => {
                  const isLast = index === participantFlow.length - 1;
                  const isSelected = activeNodeId === node.id;
                  const isPayer = node.badgeType === 'payer';
                  const isOversight = node.badgeType === 'oversight';

                  return (
                    <div
                      key={node.id}
                      className={`group relative flex flex-col select-none ${transitionClass} ${
                        inView || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                      }`}
                      style={{ transitionDelay: prefersReducedMotion ? '0ms' : `${240 + index * 80}ms` }}
                    >
                      {/* Top Bar: Number & Horizontal Connector Arrow */}
                      <div className="relative flex items-center mb-2.5">
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-[10px] font-semibold border transition-all duration-200 z-10 ${
                            isPayer || isOversight
                              ? 'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/30'
                              : isSelected
                              ? 'bg-[#161616] text-[#F5F5F5] border-white/[0.20]'
                              : 'bg-[#0D0D0D] text-[#777777] border-white/[0.08]'
                          }`}
                        >
                          0{index + 1}
                        </div>

                        {/* Horizontal Line & Arrow to Next Node */}
                        {!isLast && (
                          <div
                            className={`absolute left-6 right-[-10px] lg:right-[-14px] top-1/2 -translate-y-1/2 flex items-center justify-center z-0 pointer-events-none ${transitionClass} ${
                              inView || prefersReducedMotion ? 'opacity-100' : 'opacity-0'
                            }`}
                            style={{ transitionDelay: prefersReducedMotion ? '0ms' : `${280 + index * 80}ms` }}
                            aria-hidden="true"
                          >
                            <div className="w-full h-px bg-white/[0.08] relative flex items-center justify-center">
                              <span className="font-mono text-[10px] text-white/[0.30] bg-[#080808] px-0.5">
                                →
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Node Card */}
                      <div
                        tabIndex={0}
                        role="button"
                        aria-label={`${node.role} (${node.badge}): ${node.description}`}
                        onClick={() => navigateTo(node.route)}
                        onMouseEnter={() => setActiveNodeId(node.id)}
                        onFocus={() => setActiveNodeId(node.id)}
                        className={`flex-1 p-2.5 md:p-3.5 lg:p-3 rounded-lg border transition-all duration-200 flex flex-col justify-between focus:outline-none focus:ring-1 focus:ring-[#14B8A6]/40 cursor-pointer ${
                          isSelected
                            ? 'bg-[#141414] border-white/[0.16] shadow-[0_4px_16px_rgba(0,0,0,0.4)] -translate-y-[1px]'
                            : 'bg-[#0D0D0D] border-white/[0.06] hover:border-white/[0.10]'
                        }`}
                      >
                        <div>
                          {/* Role Title */}
                          <div className="flex items-center gap-1 mb-1 leading-tight">
                            <h3 className="font-mono text-[10px] lg:text-[11px] font-semibold tracking-wider text-[#F5F5F5] uppercase">
                              {node.role}
                            </h3>
                            <ArrowUpRight className="w-2.5 h-2.5 text-[#666666] opacity-0 group-hover:opacity-100 group-hover:text-white transition-opacity flex-shrink-0" />
                          </div>

                          {/* Business Role Badge */}
                          <span
                            className={`inline-block font-mono text-[8px] lg:text-[8.5px] uppercase tracking-wider px-1.5 py-0.5 rounded border mb-2 ${
                              isPayer || isOversight
                                ? 'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/25 font-semibold'
                                : 'bg-white/[0.03] text-[#888888] border-white/[0.06]'
                            }`}
                          >
                            {node.badge}
                          </span>

                          {/* Description */}
                          <p className="text-[10px] lg:text-[11px] text-[#B8B8B8] leading-relaxed font-normal">
                            {node.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 
              MOBILE VERTICAL SEQUENCE (< 768px)
              COLLEGE / INSTITUTION ↓ FACULTY + MENTORS ↓ STUDENT TEAMS ↓ PROJECT + EVALUATION INFO ↓ INSTITUTIONAL VISIBILITY
            */}
            <div className="md:hidden relative pl-4 py-0.5">
              {/* Continuous Vertical Track Line: Aligned with node centers */}
              <div
                className="absolute top-3 bottom-3 left-[11px] w-px bg-white/[0.08] pointer-events-none z-0"
                aria-hidden="true"
              />

              <div className="flex flex-col gap-1.5 relative z-10">
                {participantFlow.map((node, index) => {
                  const isLast = index === participantFlow.length - 1;
                  const isSelected = activeNodeId === node.id;
                  const isPayer = node.badgeType === 'payer';
                  const isOversight = node.badgeType === 'oversight';

                  return (
                    <React.Fragment key={node.id}>
                      <div
                        className={`group flex items-start gap-2 select-none ${transitionClass} ${
                          inView || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}
                        style={{ transitionDelay: prefersReducedMotion ? '0ms' : `${240 + index * 80}ms` }}
                      >
                        {/* Left Numbered Node */}
                        <div className="flex flex-col items-center flex-shrink-0 relative">
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[9px] font-semibold border transition-all duration-200 z-10 ${
                              isPayer || isOversight
                                ? 'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/30'
                                : isSelected
                                ? 'bg-[#161616] text-[#F5F5F5] border-white/[0.20]'
                                : 'bg-[#0D0D0D] text-[#777777] border-white/[0.08]'
                            }`}
                          >
                            0{index + 1}
                          </div>
                        </div>

                        {/* Right Card */}
                        <div
                          tabIndex={0}
                          role="button"
                          aria-label={`${node.role} (${node.badge}): ${node.description}`}
                          onClick={() => navigateTo(node.route)}
                          onMouseEnter={() => setActiveNodeId(node.id)}
                          onFocus={() => setActiveNodeId(node.id)}
                          className={`flex-1 p-2 rounded-lg border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#14B8A6]/40 ${
                            isSelected
                              ? 'bg-[#161616] border-white/[0.14]'
                              : 'bg-[#0D0D0D] border-white/[0.05]'
                          }`}
                        >
                          <div className="flex flex-col min-[360px]:flex-row min-[360px]:items-center justify-between gap-1 min-[360px]:gap-1.5 mb-1 min-[360px]:mb-0.5">
                            <h4 className="font-mono text-[10px] font-semibold tracking-wider text-[#F5F5F5] uppercase">
                              {node.role}
                            </h4>
                            <span
                              className={`font-mono text-[7.5px] uppercase tracking-wider px-1.5 py-0.5 rounded border flex-shrink-0 ${
                                isPayer || isOversight
                                  ? 'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/25 font-semibold'
                                  : 'bg-white/[0.03] text-[#888888] border-white/[0.06]'
                              }`}
                            >
                              {node.badge}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[#B8B8B8] leading-tight font-normal">
                            {node.description}
                          </p>
                        </div>
                      </div>

                      {/* Centered Downward Connector Arrow */}
                      {!isLast && (
                        <div
                          className={`h-2.5 ml-[-4px] flex items-center justify-start pl-[11px] pointer-events-none ${transitionClass} ${
                            inView || prefersReducedMotion ? 'opacity-100' : 'opacity-0'
                          }`}
                          style={{ transitionDelay: prefersReducedMotion ? '0ms' : `${280 + index * 80}ms` }}
                          aria-hidden="true"
                        >
                          <ArrowDown
                            className={`w-2.5 h-2.5 transition-colors duration-200 bg-[#080808] py-0.2 -ml-1 ${
                              isPayer ? 'text-[#14B8A6]' : 'text-white/[0.25]'
                            }`}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Bottom Conceptual Return Path Note */}
            <div className="mt-3 pt-2 border-t border-dashed border-white/[0.06] flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-[#777777] select-none">
              <span className="uppercase tracking-wider">
                FEEDBACK LOOP // SURFACED TO INSTITUTION
              </span>
              <span className="text-[#B8B8B8] hidden min-[480px]:inline">
                VISIBILITY · OVERSIGHT · REPORTING
              </span>
            </div>
          </div>
        </div>

        {/* 
          SUPPORTING ROLE STRIP (Section 6)
          Compact three-part editorial strip:
          01 INSTITUTION (Pays & oversees)
          02 DELIVERY (Faculty + Mentors)
          03 LEARNING (Student Teams)
        */}
        <div
          className={`pt-4 sm:pt-6 border-t border-white/[0.08] ${transitionClass} ${
            inView || prefersReducedMotion
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: prefersReducedMotion ? '0ms' : '200ms' }}
        >
          {/* Desktop/Tablet 3-Column Strip (>= 768px) */}
          <div className="hidden md:grid grid-cols-3 gap-3 md:gap-4">
            {/* 01 INSTITUTION */}
            <div
              tabIndex={0}
              role="button"
              onClick={() => navigateTo('/for-colleges')}
              className="flex flex-col items-start p-2.5 sm:p-3 md:p-3.5 lg:p-3 rounded-lg bg-[#080808] border border-white/[0.06] hover:border-white/[0.14] transition-colors cursor-pointer select-none focus:outline-none"
            >
              <div className="w-full pb-1 mb-1 border-b border-white/[0.06] flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold text-[#777777]">
                  01
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[8.5px] uppercase tracking-wider text-[#14B8A6] font-medium">
                    Payer
                  </span>
                  <ArrowUpRight className="w-2.5 h-2.5 text-[#666666]" />
                </div>
              </div>
              <h3 className="font-mono text-[11px] font-semibold tracking-wider text-[#F5F5F5] uppercase mb-0.5">
                INSTITUTION
              </h3>
              <p className="text-xs text-[#B8B8B8] leading-relaxed font-normal">
                Pays &amp; oversees.
              </p>
            </div>

            {/* 02 DELIVERY */}
            <div
              tabIndex={0}
              role="button"
              onClick={() => navigateTo('/mentor')}
              className="flex flex-col items-start p-2.5 sm:p-3 md:p-3.5 lg:p-3 rounded-lg bg-[#080808] border border-white/[0.06] hover:border-white/[0.14] transition-colors cursor-pointer select-none focus:outline-none"
            >
              <div className="w-full pb-1 mb-1 border-b border-white/[0.06] flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold text-[#777777]">
                  02
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[8.5px] uppercase tracking-wider text-[#777777]">
                    Delivery
                  </span>
                  <ArrowUpRight className="w-2.5 h-2.5 text-[#666666]" />
                </div>
              </div>
              <h3 className="font-mono text-[11px] font-semibold tracking-wider text-[#F5F5F5] uppercase mb-0.5">
                DELIVERY
              </h3>
              <p className="text-xs text-[#B8B8B8] leading-relaxed font-normal">
                Faculty + Mentors.
              </p>
            </div>

            {/* 03 LEARNING */}
            <div
              tabIndex={0}
              role="button"
              onClick={() => navigateTo('/student')}
              className="flex flex-col items-start p-2.5 sm:p-3 md:p-3.5 lg:p-3 rounded-lg bg-[#080808] border border-white/[0.06] hover:border-white/[0.14] transition-colors cursor-pointer select-none focus:outline-none"
            >
              <div className="w-full pb-1 mb-1 border-b border-white/[0.06] flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold text-[#777777]">
                  03
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[8.5px] uppercase tracking-wider text-[#777777]">
                    Users
                  </span>
                  <ArrowUpRight className="w-2.5 h-2.5 text-[#666666]" />
                </div>
              </div>
              <h3 className="font-mono text-[11px] font-semibold tracking-wider text-[#F5F5F5] uppercase mb-0.5">
                LEARNING
              </h3>
              <p className="text-xs text-[#B8B8B8] leading-relaxed font-normal">
                Student Teams.
              </p>
            </div>
          </div>

          {/* Mobile Compact 3-Row List (< 768px) */}
          <div className="flex flex-col gap-1.5 md:hidden text-xs font-mono">
            <div
              tabIndex={0}
              role="button"
              onClick={() => navigateTo('/for-colleges')}
              className="flex items-baseline justify-between pb-1 border-b border-white/[0.04] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-[#777777]">01</span>
                <h3 className="font-mono text-xs font-semibold text-[#F5F5F5] uppercase">INSTITUTION</h3>
              </div>
              <span className="text-[11px] text-[#B8B8B8] flex items-center gap-1">
                <span>Pays &amp; oversees.</span>
                <ArrowUpRight className="w-2.5 h-2.5 text-[#666666]" />
              </span>
            </div>
            <div
              tabIndex={0}
              role="button"
              onClick={() => navigateTo('/mentor')}
              className="flex items-baseline justify-between pb-1 border-b border-white/[0.04] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-[#777777]">02</span>
                <h3 className="font-mono text-xs font-semibold text-[#F5F5F5] uppercase">DELIVERY</h3>
              </div>
              <span className="text-[11px] text-[#B8B8B8] flex items-center gap-1">
                <span>Faculty + Mentors.</span>
                <ArrowUpRight className="w-2.5 h-2.5 text-[#666666]" />
              </span>
            </div>
            <div
              tabIndex={0}
              role="button"
              onClick={() => navigateTo('/student')}
              className="flex items-baseline justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-[#777777]">03</span>
                <h3 className="font-mono text-xs font-semibold text-[#F5F5F5] uppercase">LEARNING</h3>
              </div>
              <span className="text-[11px] text-[#B8B8B8] flex items-center gap-1">
                <span>Student Teams.</span>
                <ArrowUpRight className="w-2.5 h-2.5 text-[#666666]" />
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Ecosystem;
