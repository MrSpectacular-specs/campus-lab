import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { Button } from '../../components/Button';
import { Navbar } from '../../components/Navbar';
import { PrismFoldBackground } from '../../components/PrismFoldBackground';
import { ViewportSection } from '../../components/ViewportSection';
import { PageProgress, type ProgressItem } from '../../components/PageProgress';

const PROGRESS_ITEMS: ProgressItem[] = [
  { id: 'sec-teams', label: 'Team Management' },
];

interface FacultyTeamItem {
  project: {
    id: string;
    code: string;
    title: string;
    domain: string;
    status: string;
  };
  team_size: number;
  students: Array<{
    membership_id: string;
    role: string;
    joined_at: string;
    user_id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  }>;
  mentor: {
    full_name: string;
    email: string;
  } | null;
  current_milestone: {
    id: string;
    title: string;
    sequence: number;
    status: string;
    due_date: string | null;
  } | null;
  submission_state: string;
}

export const FacultyTeams: React.FC = () => {
  const navigate = useNavigate();

  const [teams, setTeams] = useState<FacultyTeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ teams: FacultyTeamItem[] }>('/api/faculty/teams');
      setTeams(res.teams || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load student teams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-brand-teal/20 selection:text-brand-teal-light relative">
      <PrismFoldBackground variant="workspace" intensity="subtle" interactive={false} className="opacity-30" />
      <Navbar />

      <PageProgress items={PROGRESS_ITEMS} />
      <main className="flex-1 w-full relative z-10 pt-16 sm:pt-[68px]">
        <ViewportSection id="sec-teams" label="Team Management" fullHeight={false}>
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-brand-teal-light font-bold">
                Student Cohort Rosters
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
              Enrolled Project Teams
            </h1>
            <p className="text-xs text-[#888888] mt-1 font-sans">
              Student teams currently collaborating on engineering briefs under your academic coordination.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-[#888888]">
            <span className="inline-block w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
            <div>Loading student teams…</div>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-red-500/20 text-center font-mono text-xs text-red-400 space-y-3">
            <p>{error}</p>
            <Button size="sm" variant="outline" onClick={fetchTeams}>Retry</Button>
          </div>
        ) : teams.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] text-center font-mono text-xs text-[#888888]">
            No student teams are currently assigned to your coordinated projects.
          </div>
        ) : (
          <div className="space-y-5">
            {teams.map((t) => (
              <div
                key={t.project.id}
                className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] hover:border-brand-teal/30 transition-all space-y-4"
              >
                {/* Project Context Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-brand-teal-light font-bold px-2 py-0.5 rounded bg-brand-teal/10 border border-brand-teal/20">
                        {t.project.code}
                      </span>
                      <h2 className="font-bold text-sm text-white font-sans">{t.project.title}</h2>
                    </div>
                    <span className="text-[11px] font-mono text-[#888888] block">
                      {t.project.domain} • Status: <span className="capitalize text-white">{t.project.status}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-white font-semibold">
                      {t.team_size} Student Member(s)
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<ExternalLink className="w-3 h-3" />}
                      onClick={() => navigate(`/projects/${t.project.id}`)}
                    >
                      Project Brief
                    </Button>
                  </div>
                </div>

                {/* Team & Delivery Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  {/* Students Column */}
                  <div className="md:col-span-2 space-y-2">
                    <span className="text-[#888888] uppercase text-[10px] block font-bold">
                      Enrolled Student Members
                    </span>
                    {t.students.length === 0 ? (
                      <p className="text-[#666666] text-xs">No students currently enrolled in this team.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {t.students.map((st) => (
                          <div key={st.membership_id} className="p-3 rounded-lg bg-black/40 border border-white/[0.05] space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white font-sans">{st.full_name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-teal/10 text-brand-teal-light uppercase font-bold">
                                {st.role}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#888888] truncate">{st.email}</div>
                            <div className="text-[9px] text-[#666666] pt-1">
                              Enrolled: {new Date(st.joined_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Operational Context Column */}
                  <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05] space-y-3">
                    <span className="text-[#888888] uppercase text-[10px] block font-bold">
                      Delivery Supervision
                    </span>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#666666] block">Assigned Mentor:</span>
                      {t.mentor ? (
                        <div>
                          <span className="text-white font-semibold font-sans">{t.mentor.full_name}</span>
                          <span className="text-[10px] text-[#888888] block">{t.mentor.email}</span>
                        </div>
                      ) : (
                        <span className="text-yellow-400 font-bold text-xs">Unassigned</span>
                      )}
                    </div>

                    <div className="space-y-1 pt-2 border-t border-white/[0.04]">
                      <span className="text-[10px] text-[#666666] block">Active Sprint:</span>
                      {t.current_milestone ? (
                        <span className="text-white block font-sans">
                          Sprint {t.current_milestone.sequence}: {t.current_milestone.title}
                        </span>
                      ) : (
                        <span className="text-[#888888]">No active sprint</span>
                      )}
                    </div>

                    <div className="space-y-1 pt-2 border-t border-white/[0.04]">
                      <span className="text-[10px] text-[#666666] block">Submission State:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${
                        t.submission_state === 'reviewed'
                          ? 'bg-brand-teal/15 text-brand-teal-light'
                          : t.submission_state === 'submitted'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-white/[0.04] text-[#666666]'
                      }`}>
                        {t.submission_state.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </div>

        </ViewportSection>

      </main>
    </div>
  );
};

export default FacultyTeams;
