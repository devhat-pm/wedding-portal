import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  freezeOnceVisible?: boolean;
}

interface ScrollAnimationState {
  isVisible: boolean;
  hasAnimated: boolean;
  progress: number;
}

/**
 * Custom hook for triggering animations when elements scroll into view
 * Uses Intersection Observer API for performance
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  freezeOnceVisible = true,
}: UseScrollAnimationOptions = {}): [
  React.RefObject<T>,
  ScrollAnimationState
] {
  const elementRef = useRef<T>(null);
  const [state, setState] = useState<ScrollAnimationState>({
    isVisible: false,
    hasAnimated: false,
    progress: 0,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If already animated and triggerOnce is true, don't observe
    if (state.hasAnimated && triggerOnce) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;

        setState((prev) => {
          // If freezeOnceVisible and already visible, don't update
          if (freezeOnceVisible && prev.isVisible && !isVisible) {
            return prev;
          }

          return {
            isVisible,
            hasAnimated: prev.hasAnimated || isVisible,
            progress: entry.intersectionRatio,
          };
        });

        // Unobserve if triggerOnce and now visible
        if (triggerOnce && isVisible) {
          observer.unobserve(element);
        }
      },
      {
        threshold: Array.isArray(threshold)
          ? threshold
          : [0, threshold, 0.5, 1],
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, freezeOnceVisible, state.hasAnimated]);

  return [elementRef as React.RefObject<T>, state];
}

/**
 * Hook for scroll-based progress animations
 * Returns a value between 0 and 1 based on scroll position
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>(): [
  React.RefObject<T>,
  number
] {
  const elementRef = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress: 0 when element top enters, 1 when element bottom leaves
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const scrollRange = windowHeight + elementHeight;
      const scrolled = windowHeight - elementTop;

      const newProgress = Math.max(0, Math.min(1, scrolled / scrollRange));
      setProgress(newProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return [elementRef as React.RefObject<T>, progress];
}

/**
 * Hook for parallax scroll effects
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(
  speed: number = 0.5
): [React.RefObject<T>, { y: number }] {
  const elementRef = useRef<T>(null);
  const [offset, setOffset] = useState({ y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const element = elementRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const windowCenter = windowHeight / 2;

      const distance = elementCenter - windowCenter;
      const y = distance * speed * -1;

      setOffset({ y });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);

  return [elementRef as React.RefObject<T>, offset];
}

/**
 * Hook to detect scroll direction
 */
export function useScrollDirection(): 'up' | 'down' | null {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up');
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollDirection;
}

/**
 * Hook to track if page is scrolled past a threshold
 */
export function useScrolled(threshold: number = 50): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return isScrolled;
}

/**
 * Hook for staggered animations on multiple elements
 */
export function useStaggerAnimation(
  itemCount: number,
  baseDelay: number = 0,
  staggerDelay: number = 0.1
): number[] {
  return Array.from({ length: itemCount }, (_, i) => baseDelay + i * staggerDelay);
}

export default useScrollAnimation;
