import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { colors } from '../../styles/theme';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
}

const CounterWrapper = styled(motion.span)`
  display: inline-block;
  font-variant-numeric: tabular-nums;
`;

// Easing function for smooth animation
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2000,
  delay = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  className,
  style,
  onComplete,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  // Format number with separators
  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    const [integer, decimal] = fixed.split('.');
    const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return decimal ? `${formatted}.${decimal}` : formatted;
  };

  // Animation logic
  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);
    const currentValue = value * easedProgress;

    setDisplayValue(currentValue);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setDisplayValue(value);
      onComplete?.();
    }
  };

  // Start animation when element comes into view
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);

          if (delay > 0) {
            setTimeout(() => {
              animationRef.current = requestAnimationFrame(animate);
            }, delay);
          } else {
            animationRef.current = requestAnimationFrame(animate);
          }
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, delay]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update if value changes after initial animation
  useEffect(() => {
    if (hasStarted) {
      startTimeRef.current = undefined;
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CounterWrapper
      ref={elementRef}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </CounterWrapper>
  );
};

// Animated percentage counter with progress ring
interface AnimatedPercentageProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  duration?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  className?: string;
}

const PercentageWrapper = styled.div<{ $size: number }>`
  position: relative;
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
`;

const PercentageSvg = styled.svg`
  transform: rotate(-90deg);
`;

const PercentageText = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Playfair Display', serif;
  font-weight: 600;
  color: ${colors.secondary};
`;

export const AnimatedPercentage: React.FC<AnimatedPercentageProps> = ({
  value,
  size = 100,
  strokeWidth = 8,
  duration = 2000,
  color = colors.primary,
  backgroundColor = colors.creamDark,
  showValue = true,
  className,
}) => {
  const [progress, setProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  // Animation logic
  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progressRatio = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progressRatio);
    const currentValue = value * easedProgress;

    setProgress(currentValue);

    if (progressRatio < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setProgress(value);
    }
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          animationRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PercentageWrapper ref={elementRef} $size={size} className={className}>
      <PercentageSvg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.1 }}
        />
      </PercentageSvg>
      {showValue && (
        <PercentageText style={{ fontSize: size * 0.25 }}>
          {Math.round(progress)}%
        </PercentageText>
      )}
    </PercentageWrapper>
  );
};

// Animated stat card with count up
interface AnimatedStatProps {
  value: number;
  label: string;
  icon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  color?: string;
  className?: string;
}

const StatWrapper = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${(props) => props.$color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${(props) => props.$color};
`;

const StatContent = styled.div``;

const StatValue = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 700;
  color: ${colors.secondary};
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin-top: 4px;
`;

export const AnimatedStat: React.FC<AnimatedStatProps> = ({
  value,
  label,
  icon,
  prefix = '',
  suffix = '',
  decimals = 0,
  color = colors.primary,
  className,
}) => {
  return (
    <StatWrapper
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {icon && <StatIcon $color={color}>{icon}</StatIcon>}
      <StatContent>
        <StatValue>
          <AnimatedCounter
            value={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
          />
        </StatValue>
        <StatLabel>{label}</StatLabel>
      </StatContent>
    </StatWrapper>
  );
};

export default AnimatedCounter;
