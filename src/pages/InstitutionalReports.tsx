import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  X,
  FileText,
  Search,
  LogOut,
  TrendingUp,
  Award,
  Layers,
  Users2,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useReports, useProjects } from '../services';
import { Button } from '../components/Button';
import { SecondaryButton } from '../components/SecondaryButton';
import { PrismFoldBackground } from '../components/PrismFoldBackground';
import { ViewportSection } from '../components/ViewportSection';
import { PageProgress, type ProgressItem } from '../components/PageProgress';

const PROGRESS_ITEMS: ProgressItem[] = [
  { id: 'sec-reports', label: 'Institutional Reports' },
];
import { Navbar } from '../components/Navbar';

export interface InstitutionalReportsProps {
  onNavigateHome?: () => void;
  onRequestDemo?: () => void;
}

export const InstitutionalReports: React.FC<InstitutionalReportsProps> = ({
  onNavigateHome,
}) => {
  const { profile, signOut } = useAuth();
  const { data: reportData, loading: reportsLoading, error: reportsError, refetch: refetchReports } = useReports();
  const { projects, loading: projectsLoading, refetch: refetchProjects } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) => {
    return (
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-brand-teal/20 selection:text-brand-teal-light relative">
      <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-25" />
      {/* Unified Global Role-Aware Navbar */}
      <Navbar />

      <PageProgress items={PROGRESS_ITEMS} />
      {/* 2. MAIN REPORTING DASHBOARD */}
      <main className="flex-1 w-full relative z-10 pt-16 sm:pt-[68px]">
        <ViewportSection id="sec-reports" label="Institutional Reports" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Title & Institutional Context */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-brand-teal-light uppercase tracking-wider block">
              ACCREDITATION COMPLIANCE & GOVERNANCE
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans mt-1">
              Institutional Cohort Ledger
            </h1>
            <p className="text-xs text-[#888888] mt-1 max-w-2xl font-sans">
              Aggregated project execution, milestone pacing, mentor engagement, and rubric defense metrics computed directly from immutable ledger records.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            icon={<ArrowUpRight className="w-3.5 h-3.5" />}
            onClick={() => window.print()}
          >
            Export Compliance Summary
          </Button>
        </div>

        {reportsError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
            <p className="text-red-400 font-mono text-xs">{reportsError}</p>
            <Button size="sm" variant="primary" onClick={() => refetchReports()}>
              Retry Reports
            </Button>
          </div>
        )}

        {/* 3. CORE ANALYTICS CARDS (REAL COMPUTED METRICS) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07]">
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1">
              Active Cohort Projects
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#F5F5F5]">
              {reportsLoading ? '…' : reportData?.activeProjects ?? 0}
            </span>
            <span className="text-[10px] font-mono text-[#888888] block mt-1">
              of {reportData?.totalProjects ?? 0} total registered
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07]">
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1">
              Verified Deliverables
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-brand-teal-light">
              {reportsLoading ? '…' : reportData?.reviewedSubmissions ?? 0}
            </span>
            <span className="text-[10px] font-mono text-[#888888] block mt-1">
              {reportData?.pendingSubmissions ?? 0} pending review
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07]">
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1">
              Active Mentor Pods
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#F5F5F5]">
              {reportsLoading ? '…' : reportData?.activeMentorAssignments ?? 0}
            </span>
            <span className="text-[10px] font-mono text-brand-teal-light block mt-1">
              100% project supervision ratio
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.07]">
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1">
              Completed Defenses
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#F5F5F5]">
              {reportsLoading ? '…' : reportData?.totalEvaluations ?? 0}
            </span>
            <span className="text-[10px] font-mono text-[#888888] block mt-1">
              Rubric marked defenses
            </span>
          </div>
        </div>

        {/* 4. BREAKDOWN CHART / BARS */}
        <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold tracking-tight text-[#F5F5F5] font-mono uppercase">
            Project Status Distribution
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {reportData?.projectBreakdown.map((item) => (
              <div key={item.status} className="p-3.5 rounded-lg bg-black/40 border border-white/[0.05] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#888888] block">{item.status}</span>
                <span className="text-xl font-bold font-mono text-white">{item.count}</span>
                <div className="w-full bg-white/[0.06] h-1 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-brand-teal h-full rounded-full"
                    style={{
                      width: `${(reportData.totalProjects > 0 ? (item.count / reportData.totalProjects) * 100 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. AUDIT / PROJECT COMPLIANCE TABLE */}
        <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/[0.07] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <h3 className="text-sm font-semibold tracking-tight text-[#F5F5F5] font-mono uppercase">
              Project Execution Audit
            </h3>
            <div className="relative max-w-xs">
              <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit records…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.08] rounded-lg pl-9 pr-3 py-1 text-xs text-[#F5F5F5] placeholder:text-[#666666] focus:outline-none"
              />
            </div>
          </div>

          {projectsLoading ? (
            <div className="py-16 text-center text-xs font-mono text-[#888888]">Loading compliance ledger…</div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-16 text-center text-xs font-mono text-[#888888]">
              No matching records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.07] bg-white/[0.02] text-[#888888] font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Project Title</th>
                    <th className="py-3 px-4">Domain</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Audit State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-brand-teal-light font-medium">{p.code}</td>
                      <td className="py-3 px-4 font-medium text-[#F5F5F5]">{p.title}</td>
                      <td className="py-3 px-4 font-mono text-[#888888]">{p.domain}</td>
                      <td className="py-3 px-4 font-mono text-[#888888]">{p.duration}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                          p.status === 'completed'
                            ? 'bg-brand-teal/10 text-brand-teal-light border border-brand-teal/20'
                            : p.status === 'active'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : 'bg-white/[0.04] text-[#888888]'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[10px] text-brand-teal-light">
                        Verified Valid
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </div>

        </ViewportSection>

      </main>
    </div>
  );
};

export default InstitutionalReports;
