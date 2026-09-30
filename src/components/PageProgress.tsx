import React, { useMemo } from 'react';
import { useActiveSection } from '../hooks/useScrollReveal';

export interface ProgressItem {
  id: string;
  label: string;
}

export interface PageProgressProps {
  items: ProgressItem[];
}

/**
 * Minimal side progress indicator — fixed on the right edge.
 * Shows dots with labels that highlight based on scroll position.
 *
 * Hidden on mobile (< md) to avoid overlap.
 */
export const PageProgress: React.FC<PageProgressProps> = ({ items }) => {
  const sectionIds = useMemo(() => items.map((i) => i.id), [items]);
  const activeIndex = useActiveSection(sectionIds);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Page sections"
      className="fixed right-3 lg:right-5 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-3"
    >
      {items.map((item, idx) => {
        const isActive = idx === activeIndex;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group flex items-center gap-2"
            aria-current={isActive ? 'true' : undefined}
            title={item.label}
          >
            <span
              className={`text-[10px] font-mono uppercase tracking-wider transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                isActive ? 'text-brand-teal-light opacity-100' : 'text-[#666666]'
              }`}
            >
              {item.label}
            </span>
            <span
              className={`block rounded-full transition-all duration-300 ${
                isActive
                  ? 'w-2.5 h-2.5 bg-brand-teal shadow-[0_0_6px_rgba(20,184,166,0.4)]'
                  : 'w-1.5 h-1.5 bg-[#444444] group-hover:bg-[#888888]'
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
};

export default PageProgress;
