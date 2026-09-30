import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, LogOut, Menu, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from './Button';
import { useAuth } from '../lib/auth';
import { BrandLogo } from './BrandLogo';
import type { UserRole } from '../lib/types';

export interface NavRouteItem {
  label: string;
  href: string;
  id: string;
}

export interface NavbarProps {
  brandText?: string;
  className?: string;
  onRequestDemo?: () => void;
}

// -------------------------------------------------------------------
// 1. Centralized, Strictly Role-Aware Navigation Configurations
// Exactly ONE set is chosen per authentication & role state.
// -------------------------------------------------------------------
export const NAV_CONFIG: Record<'public' | UserRole, NavRouteItem[]> = {
  public: [
    { label: 'Platform', href: '#platform', id: 'platform' },
    { label: 'Projects', href: '/projects', id: 'projects' },
    { label: 'For Colleges', href: '/for-colleges', id: 'for-colleges' },
    { label: 'How It Works', href: '#how-it-works', id: 'how-it-works' },
  ],
  admin: [
    { label: 'Overview', href: '/dashboard', id: 'admin-overview' },
    { label: 'Projects', href: '/dashboard/projects', id: 'admin-projects' },
    { label: 'Mentoring', href: '/dashboard/mentoring', id: 'admin-mentoring' },
    { label: 'Evaluation', href: '/dashboard/evaluation', id: 'admin-evaluation' },
    { label: 'Reports', href: '/reports', id: 'admin-reports' },
  ],
  faculty: [
    { label: 'My Projects', href: '/faculty', id: 'faculty-projects' },
    { label: 'Teams', href: '/faculty/teams', id: 'faculty-teams' },
    { label: 'Milestones', href: '/faculty/milestones', id: 'faculty-milestones' },
    { label: 'Evaluation', href: '/faculty/evaluation', id: 'faculty-evaluation' },
  ],
  mentor: [
    { label: 'My Projects', href: '/mentor', id: 'mentor-projects' },
    { label: 'Submissions', href: '/mentor/submissions', id: 'mentor-submissions' },
    { label: 'Feedback', href: '/mentor/feedback', id: 'mentor-feedback' },
    { label: 'Evaluation', href: '/mentor/evaluation', id: 'mentor-evaluation' },
  ],
  student: [
    { label: 'Project Library', href: '/projects', id: 'student-library' },
    { label: 'My Projects', href: '/student', id: 'student-projects' },
    { label: 'Milestones', href: '/student/milestones', id: 'student-milestones' },
    { label: 'Feedback', href: '/student/feedback', id: 'student-feedback' },
  ],
};

// -------------------------------------------------------------------
// 2. Active Route & Query Parameter Evaluator
// -------------------------------------------------------------------
export function isNavItemActive(href: string, pathname: string): boolean {
  if (href.startsWith('#')) {
    return pathname === '/' && typeof window !== 'undefined' && window.location.hash === href;
  }

  // Exact pathname match
  if (pathname === href) {
    return true;
  }

  // Special case: /projects active when on project details
  if (href === '/projects' && pathname.startsWith('/projects/')) {
    return true;
  }

  return false;
}

export const Navbar: React.FC<NavbarProps> = ({
  brandText = 'CAMPUSLAB',
  className = '',
  onRequestDemo,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut, loading: authLoading } = useAuth();
  const isAuthenticated = !authLoading && !!profile;

  // -------------------------------------------------------------------
  // 3. Select EXACTLY ONE Navigation Set Based on Auth & Role
  // Zero concatenation of disparate arrays.
  // -------------------------------------------------------------------
  const navItems: NavRouteItem[] = !isAuthenticated || !profile
    ? NAV_CONFIG.public
    : NAV_CONFIG[profile.role] || NAV_CONFIG.public;

  // -------------------------------------------------------------------
  // 4. Logo always navigates to the public homepage
  // -------------------------------------------------------------------
  const logoDestination = '/';

  // Detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollY > 12);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Escape key and outside click to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const handleItemClick = (item: NavRouteItem, e: React.MouseEvent) => {
    if (item.href.startsWith('#')) {
      e.preventDefault();
      const targetId = item.href.slice(1);
      const targetElement = document.getElementById(targetId);

      if (location.pathname !== '/') {
        navigate('/' + item.href);
      } else if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
      setMobileMenuOpen(false);
      return;
    }

    e.preventDefault();
    navigate(item.href);
    setMobileMenuOpen(false);
  };

  const handleDemoClick = () => {
    setMobileMenuOpen(false);
    if (onRequestDemo) {
      onRequestDemo();
    } else {
      const contactSection = document.getElementById('platform') || document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut();
    navigate('/login');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        isScrolled || location.pathname !== '/'
          ? 'bg-[#050505]/92 backdrop-blur-md border-b border-white/[0.08]'
          : 'bg-transparent border-b border-transparent'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[68px] flex items-center justify-between gap-4">
        {/* 1. LEFT: Typographic Brand Mark (routes to role workspace or home) */}
        <div className="flex-1 flex items-center justify-start">
          <Link
            to={logoDestination}
            onClick={() => {
              if (location.pathname === logoDestination) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded cursor-pointer"
            aria-label={`${brandText} Home`}
          >
            <BrandLogo variant="compact" size="md" context="navbar" />
          </Link>
        </div>

        {/* 2. CENTER: Clean, Role-Specific Navigation Items */}
        <nav
          className="hidden md:flex items-center justify-center gap-7 lg:gap-9"
          aria-label="Application Navigation"
        >
          {navItems.map((item) => {
            const isActive = isNavItemActive(item.href, location.pathname);

            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleItemClick(item, e)}
                className={`relative py-1 text-[13px] tracking-tight transition-colors duration-200 select-none group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded cursor-pointer ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-[#888888] hover:text-[#D4D4D4] font-normal'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-brand-teal rounded-full"
                    aria-hidden="true"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* 3. RIGHT: Role-Aware User Controls */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-3">
          {isAuthenticated && profile ? (
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-[#888888] font-sans truncate max-w-[140px] hidden lg:inline">
                {profile.full_name || profile.email}
              </span>
              <span className="font-mono text-[10px] text-brand-teal-light font-bold px-2 py-0.5 rounded bg-brand-teal/10 border border-brand-teal/20 uppercase tracking-wider">
                {profile.role}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-[#B8B8B8] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : !authLoading ? (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-[13px] text-[#888888] hover:text-[#D4D4D4] transition-colors font-normal"
              >
                Sign In
              </Link>
              <Button
                size="sm"
                variant="primary"
                icon={<ArrowUpRight className="w-3.5 h-3.5" />}
                onClick={handleDemoClick}
                className="text-xs px-4 py-2 font-semibold group shadow-sm"
              >
                Request Demo
              </Button>
            </div>
          ) : null}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className="w-9 h-9 rounded-lg border border-white/[0.08] bg-[#0A0A0A] flex flex-col items-center justify-center gap-1.5 text-[#B8B8B8] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 cursor-pointer select-none"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>

      {/* 4. MOBILE NAVIGATION DRAWER */}
      <div
        id="mobile-menu"
        ref={menuRef}
        aria-hidden={!mobileMenuOpen}
        className={`md:hidden fixed inset-x-0 top-16 sm:top-[68px] bottom-0 bg-[#050505]/98 backdrop-blur-2xl z-50 flex flex-col justify-between px-6 py-8 border-t border-white/[0.06] transition-all duration-250 ease-out ${
          mobileMenuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {/* Navigation list */}
        <nav aria-label="Mobile Navigation" className="flex flex-col gap-5 pt-2">
          {navItems.map((item) => {
            const isActive = isNavItemActive(item.href, location.pathname);

            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleItemClick(item, e)}
                className={`flex items-center justify-between text-xl font-medium tracking-tight transition-colors duration-150 py-1 cursor-pointer ${
                  isActive ? 'text-white font-bold' : 'text-[#888888] hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-brand-teal" />}
              </a>
            );
          })}
        </nav>

        {/* Mobile Bottom CTA / Auth State */}
        <div className="pt-6 border-t border-white/[0.08] flex flex-col gap-3">
          {isAuthenticated && profile ? (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans text-xs text-white font-medium">
                  {profile.full_name || profile.email}
                </span>
                <span className="font-mono text-[10px] text-brand-teal-light font-bold px-2 py-0.5 rounded bg-brand-teal/10 border border-brand-teal/20 uppercase tracking-wider">
                  {profile.role}
                </span>
              </div>
              <Button
                size="lg"
                variant="primary"
                icon={<LogOut className="w-4 h-4" />}
                onClick={handleSignOut}
                className="w-full justify-center text-sm font-semibold py-3"
              >
                Sign Out
              </Button>
            </>
          ) : !authLoading ? (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-base text-[#B8B8B8] hover:text-white transition-colors py-2"
              >
                Sign In
              </Link>
              <Button
                size="lg"
                variant="primary"
                icon={<ArrowUpRight className="w-4 h-4" />}
                onClick={handleDemoClick}
                className="w-full justify-center text-sm font-semibold py-3"
              >
                Request Demo
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
