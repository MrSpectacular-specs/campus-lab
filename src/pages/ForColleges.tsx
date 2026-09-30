import React, { useState } from 'react';
import { ArrowUpRight, ArrowRight, ArrowDown, Check } from 'lucide-react';
import { Button } from '../components/Button';
import { SecondaryButton } from '../components/SecondaryButton';

export interface ForCollegesProps {
  onRequestDemo: () => void;
}

interface WorkflowStep {
  id: string;
  step: string;
  title: string;
  description: string;
}

const institutionalSteps: WorkflowStep[] = [
  {
    id: 'library',
    step: '01',
    title: 'PROJECT LIBRARY',
    description: 'Curated briefs with verified stacks.',
  },
  {
    id: 'projects',
    step: '02',
    title: 'STUDENT PROJECTS',
    description: 'Student teams initiate scoped project work.',
  },
  {
    id: 'mentoring',
    step: '03',
    title: 'MENTORING',
    description: 'Practitioner reviews and milestone feedback.',
  },
  {
    id: 'milestones',
    step: '04',
    title: 'MILESTONES',
    description: 'Sprint gates and commit progress tracking.',
  },
  {
    id: 'evaluation',
    step: '05',
    title: 'EVALUATION',
    description: 'Calibrated rubrics and viva defense.',
  },
  {
    id: 'reporting',
    step: '06',
    title: 'INSTITUTIONAL REPORTING',
    description: 'Departmental records and audit packages.',
  },
];

const pillars = [
  {
    id: 'structure',
    title: 'PROJECT STRUCTURE',
    description: 'Curated briefs aligned to curriculum requirements.',
  },
  {
    id: 'mentors',
    title: 'MENTOR COORDINATION',
    description: 'Screened practitioner reviews and sprint check-ins.',
  },
  {
    id: 'evaluation',
    title: 'EVALUATION',
    description: 'Calibrated rubrics and verified viva defense.',
  },
  {
    id: 'visibility',
    title: 'INSTITUTIONAL VISIBILITY',
    description: 'Real-time cohort telemetry and auditable reports.',
  },
];

export const ForColleges: React.FC<ForCollegesProps> = ({ onRequestDemo }) => {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const handleScrollToWorkflow = () => {
    const el = document.getElementById('institutional-workflow');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] overflow-x-hidden selection:bg-brand-teal/20 selection:text-brand-teal-light">
      
      {/* 
        1. PAGE HERO (INSTITUTIONAL FOCUS)
      */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0D0D0D]/90 border border-white/[0.08] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
              <span className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B8B8B8]">
                FOR COLLEGES
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.035em] text-[#F5F5F5] leading-[1.08] mb-6">
              Project-based learning, systemized.
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg md:text-xl text-[#B8B8B8] leading-relaxed font-normal max-w-2xl mb-9">
              Structured briefs, practitioner mentors, sprint milestones, and institutional reports.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
                onClick={onRequestDemo}
                className="w-full sm:w-auto text-xs sm:text-sm font-semibold group px-7 py-3"
              >
                Request demo
              </Button>

              <SecondaryButton
                size="lg"
                onClick={handleScrollToWorkflow}
                className="w-full sm:w-auto text-xs sm:text-sm font-medium px-6 py-3"
              >
                How it works
              </SecondaryButton>
            </div>
          </div>
        </div>
      </section>

      {/* 
        2. THE INSTITUTIONAL CHALLENGE
      */}
      <section className="relative py-20 sm:py-28 border-t border-white/[0.07] bg-[#050505]/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
              <span className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-[#B8B8B8]">
                THE INSTITUTIONAL CHALLENGE
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.035em] text-[#F5F5F5] leading-[1.12] mb-6">
              Projects need infrastructure.
            </h2>

            {/* Factual explanation of coordination requirements */}
            <p className="text-base sm:text-lg text-[#B8B8B8] leading-relaxed font-normal mb-8">
              Coordinating mentors, milestones, and evaluation across cohorts breaks down without infrastructure.
            </p>

            {/* Bullet Vector Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 font-mono text-xs text-[#888888]">
              <div className="p-3 rounded-lg bg-[#0D0D0D]/60 border border-white/[0.06]">
                <span className="text-[#F5F5F5] block font-semibold mb-1">01 / CURATION</span>
                Scoped briefs aligned to curriculum requirements.
              </div>
              <div className="p-3 rounded-lg bg-[#0D0D0D]/60 border border-white/[0.06]">
                <span className="text-[#F5F5F5] block font-semibold mb-1">02 / MENTORING</span>
                Practitioner guidance without overloading faculty.
              </div>
              <div className="p-3 rounded-lg bg-[#0D0D0D]/60 border border-white/[0.06]">
                <span className="text-[#F5F5F5] block font-semibold mb-1">03 / REPORTING</span>
                Auditable records and cohort telemetry.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        3. INSTITUTIONAL WORKFLOW (HORIZONTAL DESKTOP / VERTICAL MOBILE)
      */}
      <section
        id="institutional-workflow"
        className="relative py-24 sm:py-32 border-t border-white/[0.07] bg-[#050505]/40 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14 sm:mb-18">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
              <span className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-[#B8B8B8]">
                INSTITUTIONAL WORKFLOW
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.035em] text-[#F5F5F5] leading-[1.12] mb-5">
              One connected workflow.
            </h2>
            <p className="text-base sm:text-lg text-[#B8B8B8] leading-relaxed font-normal">
              Curated briefs through mentor reviews and milestone gates to reporting.
            </p>
          </div>

          {/* Desktop Horizontal Journey (>= 1024px) */}
          <div className="hidden lg:block relative py-6 mb-12">
            <div className="absolute top-[34px] left-[4%] right-[4%] h-[1px] bg-white/[0.08] pointer-events-none z-0" />

            <div className="grid grid-cols-6 gap-3.5 relative z-10">
              {institutionalSteps.map((s, index) => {
                const isHovered = hoveredStep === s.id;
                const hasNext = index < institutionalSteps.length - 1;

                return (
                  <div
                    key={s.id}
                    onMouseEnter={() => setHoveredStep(s.id)}
                    onMouseLeave={() => setHoveredStep(null)}
                    className="flex flex-col items-center text-center cursor-pointer group"
                  >
                    <div className="relative mb-5 flex items-center justify-center">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono text-xs font-semibold border transition-all duration-200 ${
                          isHovered
                            ? 'bg-[#12161F] text-brand-teal border-brand-teal/40 scale-105'
                            : 'bg-[#0D0D0D] text-[#888888] border-white/[0.10] group-hover:border-white/[0.20] group-hover:text-[#F5F5F5]'
                        }`}
                      >
                        {s.step}
                      </div>

                      {hasNext && (
                        <div className="absolute left-[calc(100%+6px)] top-1/2 -translate-y-1/2 w-[calc(100%-12px)] flex items-center justify-center pointer-events-none">
                          <ArrowRight
                            className={`w-3.5 h-3.5 transition-colors duration-200 ${
                              isHovered ? 'text-brand-teal' : 'text-white/[0.20]'
                            }`}
                          />
                        </div>
                      )}
                    </div>

                    <div
                      className={`w-full p-3.5 rounded-xl border transition-all duration-200 ${
                        isHovered
                          ? 'bg-[#0D1016]/90 border-white/[0.16] shadow-card -translate-y-0.5'
                          : 'bg-[#0D1016]/40 border-white/[0.06] group-hover:border-white/[0.10]'
                      }`}
                    >
                      <h3 className="font-mono text-[11px] font-semibold text-[#F5F5F5] uppercase tracking-wider mb-1.5">
                        {s.title}
                      </h3>
                      <p className="text-[11px] text-[#888888] leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile & Tablet Vertical Journey (< 1024px) */}
          <div className="lg:hidden relative pl-6 sm:pl-8 py-2 mb-12">
            <div className="absolute top-4 bottom-4 left-[27px] sm:left-[35px] w-[1px] bg-white/[0.08] pointer-events-none z-0" />

            <div className="flex flex-col gap-5 relative z-10">
              {institutionalSteps.map((s, index) => {
                const isHovered = hoveredStep === s.id;
                const hasNext = index < institutionalSteps.length - 1;

                return (
                  <div
                    key={s.id}
                    onMouseEnter={() => setHoveredStep(s.id)}
                    onMouseLeave={() => setHoveredStep(null)}
                    className="flex items-start gap-4 sm:gap-5 cursor-pointer group"
                  >
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-mono text-xs font-semibold border transition-all duration-200 ${
                          isHovered
                            ? 'bg-[#12161F] text-brand-teal border-brand-teal/40 scale-105'
                            : 'bg-[#0D0D0D] text-[#888888] border-white/[0.10] group-hover:border-white/[0.20] group-hover:text-[#F5F5F5]'
                        }`}
                      >
                        {s.step}
                      </div>

                      {hasNext && (
                        <div className="h-5 flex items-center justify-center pointer-events-none pt-1">
                          <ArrowDown
                            className={`w-3 h-3 transition-colors duration-200 ${
                              isHovered ? 'text-brand-teal' : 'text-white/[0.20]'
                            }`}
                          />
                        </div>
                      )}
                    </div>

                    <div
                      className={`flex-1 p-3.5 rounded-xl border transition-all duration-200 ${
                        isHovered
                          ? 'bg-[#0D1016]/90 border-white/[0.16] shadow-card'
                          : 'bg-[#0D1016]/40 border-white/[0.06]'
                      }`}
                    >
                      <h3 className="font-mono text-xs font-semibold text-[#F5F5F5] uppercase tracking-wider mb-1">
                        {s.title}
                      </h3>
                      <p className="text-xs text-[#888888] leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* 
        4. WHAT THE COLLEGE GETS (4-PART PILLARS)
      */}
      <section className="relative py-20 sm:py-28 border-t border-white/[0.07] bg-[#050505]/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
              <span className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-[#B8B8B8]">
                CAPABILITIES
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.035em] text-[#F5F5F5] leading-[1.12] mb-5">
              Institutional deliverables.
            </h2>
            <p className="text-base sm:text-lg text-[#B8B8B8] leading-relaxed font-normal">
              Structured execution without fragmented tools or lost records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {pillars.map((p, idx) => (
              <div
                key={p.id}
                className="p-5 sm:p-6 rounded-xl bg-[#0D0D0D]/75 backdrop-blur-md border border-white/[0.07] shadow-card specular-highlight flex flex-col justify-between"
              >
                <div>
                  <div className="font-mono text-[10px] text-[#666666] mb-3">
                    0{idx + 1}
                  </div>
                  <h3 className="font-mono text-xs font-semibold text-[#F5F5F5] uppercase tracking-wider mb-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#888888] leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 
        5. PRODUCT VIEWPORT (DEMO SPECIMEN)
      */}
      <section className="relative py-20 sm:py-28 border-t border-white/[0.07] bg-[#050505]/40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
              <span className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-[#B8B8B8]">
                INTERFACE PREVIEW
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.035em] text-[#F5F5F5] leading-[1.12] mb-4">
              Single operational view.
            </h2>
            <p className="text-base sm:text-lg text-[#B8B8B8] leading-relaxed font-normal">
              Real-time visibility across briefs, mentor check-ins, sprint progress, and rubrics.
            </p>
          </div>

          {/* Framed Viewport */}
          <div className="relative rounded-2xl bg-[#0A0D12]/80 backdrop-blur-md border border-white/[0.08] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] specular-highlight overflow-hidden">
            
            {/* Header */}
            <div className="px-4 sm:px-6 py-3 border-b border-white/[0.07] bg-[#07090D]/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/[0.12]" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
                <span className="ml-2 font-mono text-[11px] uppercase tracking-wider text-[#777777]">
                  CAMPUSLAB // INSTITUTIONAL CONSOLE
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-white/[0.04] text-[#888888] border border-white/[0.08] uppercase tracking-wider">
                  DEMO INTERFACE
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                  <span className="font-mono text-[10px] text-brand-teal uppercase tracking-wider">
                    ILLUSTRATIVE DATA
                  </span>
                </div>
              </div>
            </div>

            {/* Specimen Viewport Details */}
            <div className="p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-white/[0.06]">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#777777] block mb-0.5">
                    PROJECT SPECIMEN
                  </span>
                  <h3 className="text-base sm:text-lg font-semibold text-[#F5F5F5]">
                    Campus Sustainability Tracker
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#12161F] text-brand-teal border border-brand-teal/25">
                    STAGE 03: PROTOTYPE SPRINT
                  </span>
                </div>
              </div>

              {/* 5 Operational Dimension Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6 font-mono text-xs">
                <div className="p-3.5 rounded-lg bg-[#0D1016]/50 border border-white/[0.06]">
                  <span className="text-[#666666] block text-[10px] uppercase mb-1">01 / PROJECTS</span>
                  <span className="text-[#F5F5F5] font-medium block">Curated Brief</span>
                  <span className="text-[10px] text-brand-teal">Specified</span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0D1016]/50 border border-white/[0.06]">
                  <span className="text-[#666666] block text-[10px] uppercase mb-1">02 / MENTORING</span>
                  <span className="text-[#F5F5F5] font-medium block">Mentor Assigned</span>
                  <span className="text-[10px] text-[#B8B8B8]">Session Scheduled</span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0D1016]/50 border border-white/[0.06]">
                  <span className="text-[#666666] block text-[10px] uppercase mb-1">03 / MILESTONES</span>
                  <span className="text-[#F5F5F5] font-medium block">Prototype Sprint</span>
                  <span className="text-[10px] text-brand-teal">78% Complete</span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0D1016]/50 border border-white/[0.06]">
                  <span className="text-[#666666] block text-[10px] uppercase mb-1">04 / EVALUATION</span>
                  <span className="text-[#F5F5F5] font-medium block">Rubric Review</span>
                  <span className="text-[10px] text-[#B8B8B8]">3 / 4 Criteria Met</span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0D1016]/50 border border-white/[0.06]">
                  <span className="text-[#666666] block text-[10px] uppercase mb-1">05 / REPORTING</span>
                  <span className="text-[#F5F5F5] font-medium block">Project Report</span>
                  <span className="text-[10px] text-[#888888]">Drafting Package</span>
                </div>
              </div>

              {/* Progress Line */}
              <div className="p-4 rounded-xl bg-[#0D0D0D]/60 border border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <span className="text-[#888888]">
                  Project status: Active milestone review in progress.
                </span>
                <span className="text-brand-teal font-semibold">
                  ILLUSTRATIVE WORKFLOW SPECIMEN
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-2.5 border-t border-white/[0.06] bg-[#07090D]/90 flex items-center justify-between text-[10px] sm:text-[11px] text-[#777777] font-mono select-none">
              <span>CAMPUSLAB // INSTITUTIONAL TELEMETRY</span>
              <span className="text-[#999999]">DEMO DATA · PROJECT OVERVIEW SPECIMEN</span>
            </div>
          </div>

        </div>
      </section>

      {/* 
        6. BUSINESS MODEL CLARITY (PARTICIPANT MODEL)
      */}
      <section className="relative py-20 sm:py-28 border-t border-white/[0.07] bg-[#050505]/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
              <span className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-[#B8B8B8]">
                PARTICIPANT MODEL
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.035em] text-[#F5F5F5] leading-[1.12] mb-4">
              Four defined roles.
            </h2>
            <p className="text-base sm:text-lg text-[#B8B8B8] leading-relaxed font-normal">
              Colleges sponsor the platform, mentors guide execution, and students build.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#0D0D0D]/50 border border-white/[0.06]">
              <span className="font-mono text-[10px] text-[#777777] uppercase tracking-wider block mb-2">
                ROLE 01
              </span>
              <h3 className="font-mono text-xs font-semibold text-[#F5F5F5] uppercase mb-1">
                COLLEGE / INSTITUTION
              </h3>
              <p className="text-xs text-[#888888] leading-relaxed">
                Sponsors the platform and secures institutional visibility into cohort outcomes.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0D0D0D]/50 border border-white/[0.06]">
              <span className="font-mono text-[10px] text-[#777777] uppercase tracking-wider block mb-2">
                ROLE 02
              </span>
              <h3 className="font-mono text-xs font-semibold text-[#F5F5F5] uppercase mb-1">
                FACULTY + MENTORS
              </h3>
              <p className="text-xs text-[#888888] leading-relaxed">
                Guides student teams through code reviews, architecture checks, and rubrics.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0D0D0D]/50 border border-brand-teal/20">
              <span className="font-mono text-[10px] text-brand-teal uppercase tracking-wider block mb-2">
                ROLE 03
              </span>
              <h3 className="font-mono text-xs font-semibold text-[#F5F5F5] uppercase mb-1">
                STUDENT TEAMS
              </h3>
              <p className="text-xs text-[#888888] leading-relaxed">
                Student engineering teams building production-grade systems.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0D0D0D]/50 border border-white/[0.06]">
              <span className="font-mono text-[10px] text-[#777777] uppercase tracking-wider block mb-2">
                ROLE 04
              </span>
              <h3 className="font-mono text-xs font-semibold text-[#F5F5F5] uppercase mb-1">
                INSTITUTIONAL VIEW
              </h3>
              <p className="text-xs text-[#888888] leading-relaxed">
                Surfaces progress telemetry, audit-ready portfolios, and department analytics.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 
        7. CLOSING CTA (INSTITUTIONAL FOCUS)
      */}
      <section className="relative py-24 sm:py-32 border-t border-white/[0.07] bg-[#050505]/40 overflow-hidden text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B8B8B8] mb-4 block">
            STRUCTURED PROJECT LEARNING
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.035em] text-[#F5F5F5] leading-[1.12] mb-5">
            Structure project learning today.
          </h2>

          <p className="text-base sm:text-lg text-[#B8B8B8] leading-relaxed font-normal max-w-xl mx-auto mb-9">
            One system for projects, mentors, milestones, and reports.
          </p>

          <Button
            size="lg"
            variant="primary"
            icon={<ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
            onClick={onRequestDemo}
            className="px-8 py-3.5 text-xs sm:text-sm font-semibold group"
          >
            Request demo
          </Button>
        </div>
      </section>

    </div>
  );
};

export default ForColleges;
