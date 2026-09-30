import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export interface ViewportSectionProps {
  /** Unique section id used for progress tracking and anchor links */
  id: string;
  /** Small contextual label shown at the top */
  label?: string;
  /** Optional className override */
  className?: string;
  /** Whether this section should use full viewport height. Default true */
  fullHeight?: boolean;
  /** Children — the actual product UI */
  children: React.ReactNode;
}

/**
 * A viewport-sized section with IntersectionObserver-driven reveal animation.
 *
 * Structure:
 *   - min-height: 90svh (fullHeight=true) or auto
 *   - scroll-triggered opacity + translateY + blur reveal
 *   - Respects prefers-reduced-motion via useScrollReveal
 */
export const ViewportSection: React.FC<ViewportSectionProps> = ({
  id,
  label,
  className = '',
  fullHeight = true,
  children,
}) => {
  const { ref, revealed } = useScrollReveal<HTMLElement>({ threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  return (
    <section
      ref={ref}
      id={id}
      className={`relative w-full flex flex-col ${
        fullHeight ? 'min-h-[90svh]' : ''
      } px-4 sm:px-6 lg:px-8 py-10 sm:py-14 transition-section ${
        revealed ? 'section-revealed' : 'section-hidden'
      } ${className}`}
    >
      {label && (
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-brand-teal-light font-bold">
            {label}
          </span>
        </div>
      )}
      <div className="flex-1 flex flex-col">{children}</div>
    </section>
  );
};

export default ViewportSection;
