import React from 'react';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  const handleAnchorClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', `/#${id}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleRouteClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState(null, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/[0.07] bg-[#050505] text-[#888888] relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        
        {/* Top Strip: Brand & Navigation */}
        <div className="pb-8 sm:pb-10 border-b border-white/[0.06] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <a
              href="/"
              onClick={(e) => handleRouteClick('/', e)}
              className="inline-block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded"
              aria-label="CAMPUSLAB Home"
            >
              <BrandLogo variant="full" size="sm" context="footer" />
            </a>
            <p className="text-xs sm:text-[13px] text-[#888888] leading-relaxed">
              Structured project-based learning for institutions.
            </p>
          </div>

          {/* Primary Navigation Links */}
          <nav
            aria-label="Footer Navigation"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono"
          >
            <a
              href="#platform"
              onClick={(e) => handleAnchorClick('platform', e)}
              className="text-[#B8B8B8] hover:text-[#F5F5F5] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded py-0.5"
            >
              PLATFORM
            </a>
            <a
              href="/projects"
              onClick={(e) => handleRouteClick('/projects', e)}
              className="text-[#B8B8B8] hover:text-[#F5F5F5] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded py-0.5"
            >
              PROJECTS
            </a>
            <a
              href="/for-colleges"
              onClick={(e) => handleRouteClick('/for-colleges', e)}
              className="text-[#B8B8B8] hover:text-[#F5F5F5] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded py-0.5"
            >
              FOR COLLEGES
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleAnchorClick('how-it-works', e)}
              className="text-[#B8B8B8] hover:text-[#F5F5F5] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded py-0.5"
            >
              HOW IT WORKS
            </a>
          </nav>
        </div>

        {/* Bottom Microstrip: Technical Signature & Minimal Legal Line */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] font-mono text-[#777777]">
          <div className="flex items-center gap-2 tracking-wider uppercase text-[#777777]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
            <span>PROJECTS · MENTORING · MILESTONES · EVALUATION · REPORTING</span>
          </div>

          <div className="text-[#666666]">
            © CampusLab
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
