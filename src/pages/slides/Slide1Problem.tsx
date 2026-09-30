import React from 'react';
import { ArrowRight } from 'lucide-react';

interface OperationalStage {
  step: string;
  name: string;
  note: string;
}

const frictionStages: OperationalStage[] = [
  { step: '01', name: 'PROJECT CURATION', note: 'Selecting and scoping briefs appropriate for syllabus requirements.' },
  { step: '02', name: 'MENTORING', note: 'Organizing continuous practitioner guidance without overloading faculty.' },
  { step: '03', name: 'PROGRESS', note: 'Ensuring accountability across progressive milestone checkpoints.' },
  { step: '04', name: 'EVALUATION', note: 'Structuring review rubrics and assessment across student cohorts.' },
  { step: '05', name: 'REPORTING', note: 'Consolidating project records for institutional visibility.' },
];

export const Slide1Problem: React.FC = () => {
  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-8 bg-[#050505] min-h-screen text-[#F5F5F5] select-none font-sans">
      {/* 16:9 Presentation Slide Canvas */}
      <div className="w-full max-w-[1280px] aspect-[16/9] bg-[#07090D] border border-white/[0.08] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.95)] rounded-2xl relative overflow-hidden flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        
        {/* Subtle Ambient Background Mesh */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.03)_0%,transparent_60%)]" 
          aria-hidden="true" 
        />

        {/* Slide Header: Mono Eyebrow & Slide Counter */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/[0.07] pb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#B8B8B8] font-semibold">
              THE PROBLEM
            </span>
          </div>
          <span className="font-mono text-xs text-[#666666]">
            01 / 06
          </span>
        </div>

        {/* Central Editorial Message */}
        <div className="relative z-10 max-w-4xl my-auto space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-[-0.035em] text-[#F5F5F5] leading-[1.12]">
            Valuable learning.<br />
            <span className="text-[#888888] font-normal">Hard to scale.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#B8B8B8] font-normal leading-relaxed max-w-2xl">
            Coordinating mentors, milestones, and evaluation across student cohorts breaks down without infrastructure.
          </p>

          {/* Operational Dependencies Visual Track */}
          <div className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 relative">
              {frictionStages.map((stage, idx) => (
                <div 
                  key={stage.step}
                  className="p-4 rounded-xl bg-[#0D1016]/70 border border-white/[0.07] flex flex-col justify-between space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#666666]">
                      {stage.step}
                    </span>
                    {idx === 2 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" title="Operational friction focal point" />
                    )}
                  </div>

                  <h3 className="font-mono text-xs font-semibold text-[#F5F5F5] tracking-wider uppercase">
                    {stage.name}
                  </h3>

                  <p className="text-[11px] text-[#888888] leading-relaxed">
                    {stage.note}
                  </p>

                  {/* Horizontal Arrow on Desktop */}
                  {idx < frictionStages.length - 1 && (
                    <div className="hidden sm:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 text-white/[0.20] pointer-events-none">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide Footer / Optional Closing Line */}
        <div className="relative z-10 pt-4 border-t border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-[#666666]">
          <span className="text-[#888888]">
            Access to projects is not the same as executing them institutionally.
          </span>
          <span className="uppercase tracking-wider text-[11px] text-[#555555]">
            CAMPUSLAB EXECUTIVE CASE // PROBLEM
          </span>
        </div>

      </div>
    </div>
  );
};

export default Slide1Problem;
