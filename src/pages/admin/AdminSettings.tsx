import React from 'react';
import {
  CreditCard,
  Activity,
  Building2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useAdminLicense } from '../../services/admin';
import { Button } from '../../components/Button';
import { Navbar } from '../../components/Navbar';
import { PrismFoldBackground } from '../../components/PrismFoldBackground';
import { ViewportSection } from '../../components/ViewportSection';
import { PageProgress, type ProgressItem } from '../../components/PageProgress';

const PROGRESS_ITEMS: ProgressItem[] = [
  { id: 'sec-license-detail', label: 'License' },
  { id: 'sec-capacity', label: 'Capacity' },
  { id: 'sec-identity', label: 'Identity' },
];

export const AdminSettings: React.FC = () => {
  const { data: licenseData, loading, error, refetch } = useAdminLicense();

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-brand-teal/20 selection:text-brand-teal-light relative">
      <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-40" />
      <Navbar />
      <PageProgress items={PROGRESS_ITEMS} />

      <main className="flex-1 w-full relative z-10 pt-16 sm:pt-[68px]">
        {loading ? (
          <ViewportSection id="sec-license-detail" label="Institutional Governance">
            <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col items-center justify-center">
              <span className="inline-block w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
              <div className="text-xs font-mono text-[#888888]">Loading institutional configuration…</div>
            </div>
          </ViewportSection>
        ) : error ? (
          <ViewportSection id="sec-license-detail" label="Institutional Governance">
            <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col items-center justify-center">
              <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-red-500/20 text-center font-mono text-xs text-red-400 space-y-3">
                <p>{error}</p>
                <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
              </div>
            </div>
          </ViewportSection>
        ) : licenseData ? (
          <>
            {/* Section 1: Commercial License */}
            <ViewportSection id="sec-license-detail" label="Institutional Governance">
              <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
                      System Settings & Commercial License
                    </h1>
                    <p className="text-xs text-[#888888] mt-1 font-sans">
                      Manage enterprise subscription parameters, contract terms, and platform resource allocations.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => refetch()}>
                    Refresh Configuration
                  </Button>
                </div>

                <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl p-6 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-brand-teal-light" />
                      <h2 className="text-sm font-semibold tracking-tight text-[#F5F5F5] font-mono uppercase">
                        Commercial Subscription & Annual License
                      </h2>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded font-mono text-xs uppercase font-bold ${
                      licenseData.license.status === 'active'
                        ? 'bg-brand-teal/15 text-brand-teal-light border border-brand-teal/30'
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    }`}>
                      {licenseData.license.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                      <span className="text-[#888888] uppercase text-[10px]">Contract Tier</span>
                      <div className="text-white font-bold text-sm">{licenseData.license.plan}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                      <span className="text-[#888888] uppercase text-[10px]">Annual License Value</span>
                      <div className="text-brand-teal-light font-bold text-sm">{licenseData.license.value}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                      <span className="text-[#888888] uppercase text-[10px]">Billing Cycle</span>
                      <div className="text-white font-bold text-sm">{licenseData.license.billing_cycle}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                      <span className="text-[#888888] uppercase text-[10px]">Remaining Term</span>
                      <div className="text-white font-bold text-xs">
                        {licenseData.license.end_date
                          ? `${licenseData.license.remaining_days} days remaining (Expires ${licenseData.license.end_date})`
                          : 'Active Contract'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ViewportSection>

            {/* Section 2: Platform Capacity */}
            <ViewportSection id="sec-capacity" label="Platform Capacity">
              <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
                <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl p-6 space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
                    <Activity className="w-4 h-4 text-brand-teal-light" />
                    <h2 className="text-sm font-semibold tracking-tight text-[#F5F5F5] font-mono uppercase">
                      Measurable Platform Capacity & Resource Utilization
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                    <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1.5">
                      <span className="text-[#888888] uppercase text-[10px]">Project Utilization</span>
                      <div className="text-white font-bold text-base">
                        {licenseData.usage.active_projects} active / {licenseData.usage.total_projects} total
                      </div>
                      <div className="text-[10px] text-[#666666]">
                        Entitlement: {licenseData.capacities.project_capacity ?? 'Unlimited / Configured'}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1.5">
                      <span className="text-[#888888] uppercase text-[10px]">Student Cohort Participation</span>
                      <div className="text-white font-bold text-base">
                        {licenseData.usage.enrolled_students} enrolled students
                      </div>
                      <div className="text-[10px] text-[#666666]">
                        Entitlement: {licenseData.capacities.student_capacity ?? 'Unlimited / Configured'}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1.5">
                      <span className="text-[#888888] uppercase text-[10px]">Mentor Supervisions</span>
                      <div className="text-white font-bold text-base">
                        {licenseData.usage.active_mentors} active / {licenseData.usage.total_mentor_assignments} assigned
                      </div>
                      <div className="text-[10px] text-[#666666]">
                        Entitlement: {licenseData.capacities.mentor_capacity ?? 'Unlimited / Configured'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/[0.04] text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Faculty Coordinators:</span>
                      <span className="text-white font-bold">{licenseData.usage.faculty_coordinators} active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Recorded Deliverables:</span>
                      <span className="text-white font-bold">{licenseData.usage.recorded_submissions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Defense Marks Stored:</span>
                      <span className="text-brand-teal-light font-bold">{licenseData.usage.recorded_evaluations}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ViewportSection>

            {/* Section 3: Institution Identity */}
            <ViewportSection id="sec-identity" label="Institution Identity">
              <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
                <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
                    <Building2 className="w-4 h-4 text-brand-teal-light" />
                    <h2 className="text-sm font-semibold tracking-tight text-[#F5F5F5] font-mono uppercase">
                      Institutional Identity & Tenant Credentials
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                      <span className="text-[#888888] uppercase text-[10px]">University / College Name</span>
                      <div className="text-white font-bold text-sm">{licenseData.institution.name}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                      <span className="text-[#888888] uppercase text-[10px]">Institutional Tenant UID</span>
                      <div className="text-brand-teal-light font-bold text-xs">{licenseData.institution.id}</div>
                    </div>
                  </div>
                </div>
              </div>
            </ViewportSection>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default AdminSettings;
