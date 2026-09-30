import { useEffect, useRef, useState, useCallback } from 'react';

export interface ScrollRevealOptions {
  /** IntersectionObserver threshold (0–1). Default 0.15 */
  threshold?: number;
  /** Root margin. Default '0px 0px -60px 0px' (triggers slightly before full entry) */
  rootMargin?: string;
  /** Once revealed, stay revealed. Default true */
  once?: boolean;
}

/**
 * Tracks whether a DOM element is visible in the viewport.
 * Returns a ref to attach + a boolean `revealed` state.
 *
 * Respects prefers-reduced-motion: when reduced, always reveals immediately.
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: ScrollRevealOptions = {},
) {
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = options;
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setRevealed(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, revealed };
}

/**
 * Tracks the "active" section index based on which section occupies the most viewport.
 * Used by PageProgress to highlight the current section dot.
 */
export function useActiveSection(sectionIds: string[]): number {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.intersectionRatio);
        }

        let maxRatio = 0;
        let maxIdx = 0;
        for (let i = 0; i < sectionIds.length; i++) {
          const r = ratios.get(sectionIds[i]) ?? 0;
          if (r > maxRatio) {
            maxRatio = r;
            maxIdx = i;
          }
        }
        if (maxRatio > 0) setActive(maxIdx);
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      },
    );

    const elements: Element[] = [];
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    }

    return () => observer.disconnect();
  }, [sectionIds]);

  return active;
}
