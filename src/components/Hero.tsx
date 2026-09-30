import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { Button } from './Button';
import { SecondaryButton } from './SecondaryButton';
import { BrandLogo } from './BrandLogo';
import { navigateTo } from '../utils/navigation';
import { PrismFoldBackground } from './PrismFoldBackground';

export interface HeroProps {
  onRequestDemo?: () => void;
  onExplorePlatform?: () => void;
}

interface WorkflowNode {
  id: string;
  step: string;
  title: string;
  stateLabel: string;
  route: string;
  isComplete?: boolean;
  isActive?: boolean;
}

const workflowSteps: WorkflowNode[] = [
  {
    id: '01',
    step: '01 — PROJECT',
    title: 'Campus Sustainability Tracker',
    stateLabel: 'Brief Specified',
    route: '/projects',
    isComplete: true,
  },
  {
    id: '02',
    step: '02 — MENTOR',
    title: 'Mentor Assigned',
    stateLabel: 'Guidance Available',
    route: '/mentor',
    isComplete: true,
  },
  {
    id: '03',
    step: '03 — MILESTONES',
    title: 'Prototype Sprint',
    stateLabel: 'In Progress · 78%',
    route: '/student',
    isActive: true,
  },
  {
    id: '04',
    step: '04 — EVALUATION',
    title: 'Rubric Review',
    stateLabel: 'Rubric Ready',
    route: '/reports',
  },
  {
    id: '05',
    step: '05 — REPORTING',
    title: 'Project Report',
    stateLabel: 'Institutional Reporting',
    route: '/dashboard',
  },
];

export const Hero: React.FC<HeroProps> = ({
  onRequestDemo,
  onExplorePlatform,
}) => {
  const [activeStepId, setActiveStepId] = useState<string>('03');
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    const timer = setTimeout(() => setIsMounted(true), 40);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      clearTimeout(timer);
    };
  }, []);

  const handleDemoClick = () => {
    if (onRequestDemo) {
      onRequestDemo();
    } else {
      const demoModal = document.getElementById('request-demo');
      demoModal?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreClick = () => {
    if (onExplorePlatform) {
      onExplorePlatform();
    } else {
      const platformSection = document.getElementById('platform') || document.getElementById('how-it-works');
      platformSection?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Motion transition helper classes
  const transitionClass = prefersReducedMotion
    ? ''
    : 'transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:transform-none';

  return (
    <section
      ref={containerRef}
      className="relative pt-5 pb-7 sm:pt-10 sm:pb-14 lg:pt-14 lg:pb-16 overflow-hidden"
      aria-label="CampusLab Hero"
    >
      {/* Ambient Interactive PrismFold Background Layer */}
      <PrismFoldBackground variant="hero" intensity="strong" interactive={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Asymmetrical Editorial Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-8 lg:gap-10 xl:gap-12 items-center">
          
          {/* LEFT COLUMN: Large Typography & Value Proposition */}
          <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
            {/* Small Letter-Spaced Eyebrow */}
            <div
              className={`${transitionClass} ${
                isMounted || prefersReducedMotion
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2'
              }`}
            >
              <div className="flex flex-wrap items-center gap-3 mb-3 sm:mb-5">
                <BrandLogo variant="compact" size="sm" context="hero" />
                <span className="h-3 w-[1px] bg-white/[0.12] hidden sm:inline-block" />
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0D0D0D] border border-white/[0.08]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                  <span className="font-mono text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B8B8B8]">
                    PROJECT-BASED EDTECH
                  </span>
                </div>
              </div>
            </div>

            {/* Dominant Editorial Headline */}
            <h1
              className={`text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-bold text-[#F5F5F5] tracking-[-0.035em] leading-[1.12] mb-2.5 sm:mb-5 ${transitionClass} ${
                isMounted || prefersReducedMotion
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-3'
              }`}
              style={{ transitionDelay: prefersReducedMotion ? '0ms' : '60ms' }}
            >
              Turn project-based learning into a system your college can run.
            </h1>

            {/* Supporting Copy */}
            <p
              className={`text-base sm:text-lg text-[#B8B8B8] font-normal leading-relaxed max-w-lg mb-4 sm:mb-7 ${transitionClass} ${
                isMounted || prefersReducedMotion
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-3'
              }`}
              style={{ transitionDelay: prefersReducedMotion ? '0ms' : '120ms' }}
            >
              CampusLab brings projects, mentoring, milestones, evaluation, and institutional reporting into one structured workflow.
            </p>

            {/* Call To Actions */}
            <div
              className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 w-full sm:w-auto ${transitionClass} ${
                isMounted || prefersReducedMotion
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-3'
              }`}
              style={{ transitionDelay: prefersReducedMotion ? '0ms' : '180ms' }}
            >
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
                onClick={handleDemoClick}
                className="w-full sm:w-auto text-xs sm:text-sm font-semibold group px-4 py-2.5 sm:px-6 sm:py-3"
              >
                Request a Demo
              </Button>

              <SecondaryButton
                size="lg"
                onClick={handleExploreClick}
                className="w-full sm:w-auto text-xs sm:text-sm font-medium px-4 py-2.5 sm:px-6 sm:py-3"
              >
                Explore the Platform
              </SecondaryButton>
            </div>
          </div>

          {/* RIGHT COLUMN: Quiet Product Workflow Viewport */}
          <div
            className={`lg:col-span-6 w-full z-10 ${transitionClass} ${
              isMounted || prefersReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: prefersReducedMotion ? '0ms' : '220ms' }}
          >
            <div className="w-full max-w-xl mx-auto lg:max-w-none">
              {/* Framed Viewport: Smoked Glass Surface with Crisp Hairline Border */}
              <div className="relative rounded-xl prism-glass prism-edge border border-white/[0.08] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.7)] specular-highlight overflow-hidden">
                <div className="prism-highlight w-full" />
                {/* Product Viewport Header */}
                <div className="px-3 sm:px-5 py-1.5 min-[360px]:py-2 sm:py-3 border-b border-white/[0.07] bg-[#0D0D0D] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0" aria-hidden="true">
                      <span className="w-2 h-2 rounded-full bg-white/[0.12]" />
                      <span className="w-2 h-2 rounded-full bg-white/[0.08]" />
                      <span className="w-2 h-2 rounded-full bg-white/[0.08]" />
                    </div>
                    <span className="font-mono text-[8.5px] min-[360px]:text-[9.5px] sm:text-[11px] uppercase tracking-normal sm:tracking-wider text-[#777777] truncate">
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
                      <span className="font-mono text-[10px] sm:text-[11px] text-[#14B8A6] uppercase tracking-wider font-medium">
                        WORKFLOW LIVE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Refined Workflow Stages */}
                <div className="p-1.5 min-[360px]:p-2.5 sm:p-4 flex flex-col gap-1 min-[360px]:gap-1.5 sm:gap-2">
                  {workflowSteps.map((node) => {
                    const isSelected = activeStepId === node.id;
                    const isCurrentMilestone = node.id === '03';

                    return (
                      <div
                        key={node.id}
                        tabIndex={0}
                        role="button"
                        aria-label={`${node.step}: ${node.title} (${node.stateLabel})`}
                        onClick={() => navigateTo(node.route)}
                        onMouseEnter={() => setActiveStepId(node.id)}
                        onFocus={() => setActiveStepId(node.id)}
                        className={`group relative rounded-lg border px-2 sm:px-3 py-1 min-[360px]:py-1.5 sm:py-2.5 transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-[#14B8A6]/40 motion-reduce:transition-none motion-reduce:transform-none ${
                          isSelected
                            ? 'bg-[#161616] border-white/[0.14] shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
                            : 'bg-[#0D0D0D]/60 border-white/[0.05] hover:border-white/[0.09] hover:bg-[#111111]/80'
                        } ${!prefersReducedMotion && isSelected ? '-translate-y-[1px] motion-reduce:translate-y-0' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-2 sm:gap-3">
                          {/* Left: Step indicator and Title */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-mono border transition-colors ${
                                node.isComplete
                                  ? 'bg-white/[0.04] text-[#F5F5F5] border-white/[0.10]'
                                  : isCurrentMilestone
                                  ? 'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/25'
                                  : 'bg-white/[0.02] text-[#777777] border-white/[0.06]'
                              }`}
                            >
                              {node.isComplete ? (
                                <Check className="w-3 h-3 stroke-[2.5]" />
                              ) : (
                                <span>{node.id}</span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#777777] block leading-none mb-0.5 sm:mb-1 truncate">
                                {node.step}
                              </span>
                              <h4 className="text-xs sm:text-[13px] font-medium text-[#F5F5F5] truncate leading-tight">
                                {node.title}
                              </h4>
                            </div>
                          </div>

                          {/* Right: Focused State/Metric */}
                          <div className="text-right flex-shrink-0 flex items-center gap-1.5">
                            <span
                              className={`font-mono text-[9.5px] sm:text-[11px] whitespace-nowrap ${
                                isCurrentMilestone
                                  ? 'text-[#14B8A6] font-medium'
                                  : node.isComplete
                                  ? 'text-[#B8B8B8]'
                                  : 'text-[#777777]'
                              }`}
                            >
                              {node.stateLabel}
                            </span>
                            <ArrowUpRight className="w-2.5 h-2.5 text-[#666666] opacity-0 group-hover:opacity-100 group-hover:text-white transition-opacity hidden sm:inline" />
                          </div>
                        </div>

                        {/* Quiet progress indicator on active sprint milestone */}
                        {isCurrentMilestone && (
                          <div className="mt-1 sm:mt-2 w-full h-[2px] bg-white/[0.05] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#14B8A6] rounded-full transition-all duration-500 ease-smooth"
                              style={{ width: '78%' }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Viewport Footer */}
                <div className="px-3 sm:px-5 py-1.5 min-[360px]:py-2 sm:py-2.5 border-t border-white/[0.06] bg-[#080808] flex flex-col min-[380px]:flex-row min-[380px]:items-center justify-between gap-1 text-[8.5px] min-[360px]:text-[9px] sm:text-[11px] font-mono select-none">
                  <span className="tracking-wider uppercase text-[#777777]">CAMPUSLAB // PRODUCT WORKFLOW</span>
                  <div className="flex items-center gap-3">
                    <a href="/projects" onClick={(e) => navigateTo('/projects', e)} className="text-[#888888] hover:text-[#F5F5F5] transition-colors flex items-center gap-1">
                      <span>Demo Brief</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </a>
                    <a href="/dashboard" onClick={(e) => navigateTo('/dashboard', e)} className="text-[#888888] hover:text-[#14B8A6] transition-colors flex items-center gap-1">
                      <span>Institutional View</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
