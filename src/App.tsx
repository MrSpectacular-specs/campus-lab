import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import {
  Navbar,
  Footer,
  Hero,
  MarketGap,
  Platform,
  DashboardPreview,
  Workflow,
  Ecosystem,
  Button,
  SecondaryButton,
  Modal,
  ViewportSection,
  PageProgress,
} from './components';
import type { ProgressItem } from './components/PageProgress';
import { PrismFoldBackground } from './components/PrismFoldBackground';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NavigationBridge } from './components/NavigationBridge';
import { AuthProvider } from './lib/auth';
import { ForColleges } from './pages/ForColleges';
import { ProjectLibrary } from './pages/ProjectLibrary';
import { ProjectDetail } from './pages/ProjectDetail';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminProjects } from './pages/admin/AdminProjects';
import { AdminMentoring } from './pages/admin/AdminMentoring';
import { AdminEvaluation } from './pages/admin/AdminEvaluation';
import { AdminSettings } from './pages/admin/AdminSettings';

import { FacultyOverview } from './pages/faculty/FacultyOverview';
import { FacultyTeams } from './pages/faculty/FacultyTeams';
import { FacultyMilestones } from './pages/faculty/FacultyMilestones';
import { FacultyEvaluation } from './pages/faculty/FacultyEvaluation';

import { MentorProjects } from './pages/mentor/MentorProjects';
import { MentorSubmissions } from './pages/mentor/MentorSubmissions';
import { MentorFeedback } from './pages/mentor/MentorFeedback';
import { MentorEvaluation } from './pages/mentor/MentorEvaluation';

import { StudentProjects } from './pages/student/StudentProjects';
import { StudentMilestones } from './pages/student/StudentMilestones';
import { StudentFeedback } from './pages/student/StudentFeedback';

import { InstitutionalReports } from './pages/InstitutionalReports';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { Slide1Problem } from './pages/slides/Slide1Problem';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

/* ─── HomepageClosingCTA ────────────────────────────────────────────── */
const HomepageClosingCTA: React.FC<{
  onRequestDemo: () => void;
  onExplore: () => void;
}> = ({ onRequestDemo, onExplore }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
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
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, []);

  const tc = prefersReducedMotion
    ? ''
    : 'transition-all duration-700 ease-smooth motion-reduce:transition-none motion-reduce:transform-none';

  return (
    <section
      ref={sectionRef}
      className="relative pt-16 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28 border-t border-white/[0.07] bg-[#050505]/80 overflow-hidden text-center"
      aria-label="Call to Action"
    >
      {/* Ambient PrismFold Background */}
      <PrismFoldBackground variant="ambient" intensity="subtle" interactive={false} />
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`inline-flex items-center gap-2.5 mb-3 sm:mb-5 select-none ${tc} ${inView || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
        >
          <span className="w-6 h-px bg-[#14B8A6]" aria-hidden="true" />
          <span className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B8B8B8]">
            READY TO STRUCTURE PROJECT-BASED LEARNING?
          </span>
        </div>

        <h2
          className={`text-2xl sm:text-3xl lg:text-[40px] xl:text-[44px] font-bold tracking-[-0.035em] text-[#F5F5F5] leading-[1.14] mb-3 sm:mb-4 ${tc} ${inView || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
          style={{ transitionDelay: prefersReducedMotion ? '0ms' : '80ms' }}
        >
          Give project-based learning a system.
        </h2>

        <p
          className={`text-base sm:text-lg text-[#B8B8B8] leading-relaxed font-normal max-w-xl mx-auto mb-7 sm:mb-9 ${tc} ${inView || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
          style={{ transitionDelay: prefersReducedMotion ? '0ms' : '160ms' }}
        >
          CampusLab brings projects, mentoring, milestones, evaluation, and institutional reporting into one structured workflow.
        </p>

        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5 w-full sm:w-auto ${tc} ${inView || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
          style={{ transitionDelay: prefersReducedMotion ? '0ms' : '240ms' }}
        >
          <Button
            size="lg"
            variant="primary"
            icon={<ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
            onClick={onRequestDemo}
            className="w-full sm:w-auto px-6 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-sm font-semibold group"
          >
            Request a Demo
          </Button>

          <SecondaryButton
            size="lg"
            onClick={onExplore}
            className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium"
          >
            Explore the Platform
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
};

/* ─── Pilot Request Modal (shared) ──────────────────────────────────── */
const PilotModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="md"
    title="Request Departmental Pilot"
    subtitle="8–12 week controlled project execution for 30–60 students"
    footer={
      <div className="flex items-center justify-end gap-3 w-full">
        <SecondaryButton size="sm" onClick={onClose}>Cancel</SecondaryButton>
        <Button size="sm" variant="primary" onClick={() => { alert('Pilot Request simulated successfully.'); onClose(); }}>
          Request pilot
        </Button>
      </div>
    }
  >
    <div className="space-y-4 text-xs">
      <div>
        <label className="block font-mono text-text-secondary uppercase mb-1.5 font-medium">Institution Name</label>
        <input type="text" placeholder="e.g. Manipal Institute of Technology" className="w-full px-3.5 py-2.5 rounded-lg bg-surface-subtle border border-border-default text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-teal/50 font-sans" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-mono text-text-secondary uppercase mb-1.5 font-medium">Academic Department</label>
          <input type="text" placeholder="Computer Science / ECE" className="w-full px-3.5 py-2.5 rounded-lg bg-surface-subtle border border-border-default text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-teal/50 font-sans" />
        </div>
        <div>
          <label className="block font-mono text-text-secondary uppercase mb-1.5 font-medium">Target Cohort Size</label>
          <input type="text" placeholder="40-60 Students" className="w-full px-3.5 py-2.5 rounded-lg bg-surface-subtle border border-border-default text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-teal/50 font-sans" />
        </div>
      </div>
      <div>
        <label className="block font-mono text-text-secondary uppercase mb-1.5 font-medium">Coordinator Official Email</label>
        <input type="email" placeholder="dean.academics@institution.edu.in" className="w-full px-3.5 py-2.5 rounded-lg bg-surface-subtle border border-border-default text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-teal/50 font-sans" />
      </div>
      <div className="p-3 rounded-lg bg-surface-base border border-border-muted flex items-start gap-2 text-text-muted">
        <ShieldCheck className="w-4 h-4 text-brand-teal-light flex-shrink-0 mt-0.5" />
        <span>DPDP Act, 2023 compliant. No student credentials or personal data collected.</span>
      </div>
    </div>
  </Modal>
);

/* ─── HomePage ──────────────────────────────────────────────────────── */
const HOME_PROGRESS: ProgressItem[] = [
  { id: 'sec-hero', label: 'Home' },
  { id: 'sec-problem', label: 'Problem' },
  { id: 'sec-platform', label: 'Platform' },
  { id: 'sec-dashboard', label: 'Dashboard' },
  { id: 'sec-workflow', label: 'How It Works' },
  { id: 'sec-ecosystem', label: 'Ecosystem' },
  { id: 'sec-cta', label: 'Get Started' },
];

const HomePage: React.FC = () => {
  const [isPilotModalOpen, setIsPilotModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-text-primary overflow-x-hidden relative">
      <div className="bg-canvas-wrapper" aria-hidden="true">
        <div className="bg-canvas-image" />
        <div className="bg-canvas-overlay" />
      </div>

      <Navbar onRequestDemo={() => setIsPilotModalOpen(true)} />
      <PageProgress items={HOME_PROGRESS} />

      <main className="flex-1 w-full max-w-full pt-16 sm:pt-[68px]">
        <ViewportSection id="sec-hero" fullHeight={false}>
          <Hero
            onRequestDemo={() => setIsPilotModalOpen(true)}
            onExplorePlatform={() => {
              const el = document.getElementById('platform');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </ViewportSection>
        <ViewportSection id="sec-problem" fullHeight={false}>
          <MarketGap />
        </ViewportSection>
        <ViewportSection id="sec-platform" fullHeight={false}>
          <Platform />
        </ViewportSection>
        <ViewportSection id="sec-dashboard" fullHeight={false}>
          <DashboardPreview />
        </ViewportSection>
        <ViewportSection id="sec-workflow" fullHeight={false}>
          <Workflow />
        </ViewportSection>
        <ViewportSection id="sec-ecosystem" fullHeight={false}>
          <Ecosystem />
        </ViewportSection>
        <ViewportSection id="sec-cta" fullHeight={false}>
          <HomepageClosingCTA
            onRequestDemo={() => setIsPilotModalOpen(true)}
            onExplore={() => {
              const el = document.getElementById('platform');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </ViewportSection>
      </main>

      <PilotModal isOpen={isPilotModalOpen} onClose={() => setIsPilotModalOpen(false)} />
      <Footer />
    </div>
  );
};

/* ─── Public Layout (projects, for-colleges, project detail) ─────── */
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPilotModalOpen, setIsPilotModalOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-text-primary overflow-x-hidden relative">
      <div className="bg-canvas-wrapper" aria-hidden="true">
        <div className="bg-canvas-image" />
        <div className="bg-canvas-overlay" />
      </div>
      <Navbar onRequestDemo={() => setIsPilotModalOpen(true)} />
      <main className="flex-1 w-full max-w-full pt-16 sm:pt-[68px]">
        <div className="animate-page-enter">{children}</div>
      </main>
      <PilotModal isOpen={isPilotModalOpen} onClose={() => setIsPilotModalOpen(false)} />
      <Footer />
    </div>
  );
};

/* ─── Wrapper pages for routes ──────────────────────────────────────── */
const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <ProjectLibrary onSelectProject={(id) => navigate(`/projects/${id}`)} />
    </PublicLayout>
  );
};

const ProjectDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  return (
    <PublicLayout>
      <ProjectDetail projectId={id ?? ''} onBack={() => navigate('/projects')} onRequestDemo={() => {}} />
    </PublicLayout>
  );
};

const ForCollegesPage: React.FC = () => {
  const [isPilotModalOpen, setIsPilotModalOpen] = useState(false);
  return (
    <PublicLayout>
      <ForColleges onRequestDemo={() => setIsPilotModalOpen(true)} />
      <PilotModal isOpen={isPilotModalOpen} onClose={() => setIsPilotModalOpen(false)} />
    </PublicLayout>
  );
};

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#07090D] text-text-primary animate-page-enter">
      <InstitutionalReports onNavigateHome={() => navigate('/')} />
    </div>
  );
};

/* ─── App Root ──────────────────────────────────────────────────────── */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavigationBridge />
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/for-colleges" element={<ForCollegesPage />} />
          <Route path="/slides" element={<Slide1Problem />} />
          <Route path="/slides/1" element={<Slide1Problem />} />

          {/* Protected — Admin */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/projects"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/mentoring"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminMentoring />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/evaluation"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminEvaluation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          {/* Protected — Faculty */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/teams"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyTeams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/milestones"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyMilestones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/evaluation"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyEvaluation />
              </ProtectedRoute>
            }
          />

          {/* Protected — Mentor */}
          <Route
            path="/mentor"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/submissions"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorSubmissions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/feedback"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorFeedback />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/evaluation"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorEvaluation />
              </ProtectedRoute>
            }
          />

          {/* Protected — Student */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/milestones"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentMilestones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/feedback"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentFeedback />
              </ProtectedRoute>
            }
          />

          {/* Protected — Reports (Admin / Faculty) */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
