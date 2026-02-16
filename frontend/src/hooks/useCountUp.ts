import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  easing?: 'linear' | 'easeOut' | 'easeInOut';
  startOnMount?: boolean;
  separator?: string;
  prefix?: string;
  suffix?: string;
}

interface UseCountUpReturn {
  value: number;
  formattedValue: string;
  isAnimating: boolean;
  start: () => void;
  reset: () => void;
}

// Easing functions
const easingFunctions = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

/**
 * Hook for animating numbers counting up
 * Great for statistics and dashboard cards
 */
export function useCountUp({
  start = 0,
  end,
  duration = 2000,
  delay = 0,
  decimals = 0,
  easing = 'easeOut',
  startOnMount = true,
  separator = ',',
  prefix = '',
  suffix = '',
}: UseCountUpOptions): UseCountUpReturn {
  const [value, setValue] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  const formatNumber = useCallback(
    (num: number): string => {
      const fixed = num.toFixed(decimals);
      const [integer, decimal] = fixed.split('.');
      const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
      const result = decimal ? `${formatted}.${decimal}` : formatted;
      return `${prefix}${result}${suffix}`;
    },
    [decimals, separator, prefix, suffix]
  );

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunctions[easing](progress);
      const currentValue = start + (end - start) * easedProgress;

      setValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setValue(end);
        setIsAnimating(false);
      }
    },
    [start, end, duration, easing]
  );

  const startAnimation = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    startTimeRef.current = undefined;

    if (delay > 0) {
      setTimeout(() => {
        animationRef.current = requestAnimationFrame(animate);
      }, delay);
    } else {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [animate, delay, isAnimating]);

  const reset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setValue(start);
    setIsAnimating(false);
    startTimeRef.current = undefined;
  }, [start]);

  // Start on mount if enabled
  useEffect(() => {
    if (startOnMount) {
      startAnimation();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [startOnMount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update end value if it changes
  useEffect(() => {
    if (!startOnMount) return;

    reset();
    startAnimation();
  }, [end]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    value,
    formattedValue: formatNumber(value),
    isAnimating,
    start: startAnimation,
    reset,
  };
}

/**
 * Hook for counting up when element is in view
 */
export function useCountUpOnView(
  options: UseCountUpOptions & { threshold?: number }
) {
  const { threshold = 0.5, ...countUpOptions } = options;
  const elementRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  const countUp = useCountUp({
    ...countUpOptions,
    startOnMount: false,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          countUp.start();
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...countUp,
    ref: elementRef,
  };
}

export default useCountUp;
