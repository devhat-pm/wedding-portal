import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { LoadingOutlined } from '@ant-design/icons';
import { colors } from '../../styles/theme';

type SpinnerSize = 'small' | 'medium' | 'large' | 'xlarge';
type SpinnerVariant = 'default' | 'arabic' | 'dots' | 'pulse';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  color?: string;
  className?: string;
}

const sizeMap = {
  small: { spinner: 20, text: 12, gap: 8 },
  medium: { spinner: 32, text: 14, gap: 12 },
  large: { spinner: 48, text: 16, gap: 16 },
  xlarge: { spinner: 64, text: 18, gap: 20 },
};

// Animations
const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.8); opacity: 0.5; }
`;

const dotBounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

const arabicPatternRotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Wrapper components
const FullScreenWrapper = styled.div<{ $overlay?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${(props) =>
    props.$overlay ? 'rgba(255, 255, 255, 0.9)' : colors.cream};
  z-index: 9999;
  backdrop-filter: ${(props) => (props.$overlay ? 'blur(4px)' : 'none')};
`;

const InlineWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

// Default spinner
const DefaultSpinner = styled.div<{ $size: number; $color: string }>`
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;

  .anticon {
    font-size: ${(props) => props.$size}px;
    color: ${(props) => props.$color};
  }
`;

// Arabic pattern spinner
const ArabicPatternWrapper = styled.div<{ $size: number }>`
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  position: relative;
`;

const ArabicPatternOuter = styled.div<{ $size: number; $color: string }>`
  position: absolute;
  inset: 0;
  border: 3px solid transparent;
  border-top-color: ${(props) => props.$color};
  border-radius: 50%;
  animation: ${arabicPatternRotate} 1.2s linear infinite;

  &::before {
    content: '';
    position: absolute;
    inset: 4px;
    border: 3px solid transparent;
    border-top-color: ${(props) => props.$color}80;
    border-radius: 50%;
    animation: ${arabicPatternRotate} 1.5s linear infinite reverse;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 12px;
    border: 3px solid transparent;
    border-top-color: ${(props) => props.$color}40;
    border-radius: 50%;
    animation: ${arabicPatternRotate} 2s linear infinite;
  }
`;

const ArabicCenter = styled.div<{ $size: number; $color: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${(props) => props.$size * 0.2}px;
  height: ${(props) => props.$size * 0.2}px;
  background: ${(props) => props.$color};
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

// Dots spinner
const DotsWrapper = styled.div<{ $size: number }>`
  display: flex;
  gap: ${(props) => props.$size * 0.2}px;
`;

const Dot = styled.div<{ $size: number; $color: string; $delay: number }>`
  width: ${(props) => props.$size * 0.25}px;
  height: ${(props) => props.$size * 0.25}px;
  background: ${(props) => props.$color};
  border-radius: 50%;
  animation: ${dotBounce} 1.4s ease-in-out infinite both;
  animation-delay: ${(props) => props.$delay}s;
`;

// Pulse spinner
const PulseWrapper = styled.div<{ $size: number; $color: string }>`
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  position: relative;
`;

const PulseRing = styled.div<{ $size: number; $color: string; $delay: number }>`
  position: absolute;
  inset: 0;
  border: 3px solid ${(props) => props.$color};
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-out infinite;
  animation-delay: ${(props) => props.$delay}s;
`;

const PulseCenter = styled.div<{ $size: number; $color: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${(props) => props.$size * 0.3}px;
  height: ${(props) => props.$size * 0.3}px;
  background: ${(props) => props.$color};
  border-radius: 50%;
`;

// Text component
const SpinnerText = styled.p<{ $size: number; $gap: number }>`
  margin-top: ${(props) => props.$gap}px;
  font-size: ${(props) => props.$size}px;
  color: ${colors.textSecondary};
  text-align: center;
  font-family: 'Inter', sans-serif;
`;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  variant = 'default',
  text,
  fullScreen = false,
  overlay = false,
  color = colors.primary,
  className,
}) => {
  const { spinner: spinnerSize, text: textSize, gap } = sizeMap[size];

  const renderSpinner = () => {
    switch (variant) {
      case 'arabic':
        return (
          <ArabicPatternWrapper $size={spinnerSize}>
            <ArabicPatternOuter $size={spinnerSize} $color={color} />
            <ArabicCenter $size={spinnerSize} $color={color} />
          </ArabicPatternWrapper>
        );

      case 'dots':
        return (
          <DotsWrapper $size={spinnerSize}>
            <Dot $size={spinnerSize} $color={color} $delay={0} />
            <Dot $size={spinnerSize} $color={color} $delay={0.16} />
            <Dot $size={spinnerSize} $color={color} $delay={0.32} />
          </DotsWrapper>
        );

      case 'pulse':
        return (
          <PulseWrapper $size={spinnerSize} $color={color}>
            <PulseRing $size={spinnerSize} $color={color} $delay={0} />
            <PulseRing $size={spinnerSize} $color={color} $delay={0.5} />
            <PulseCenter $size={spinnerSize} $color={color} />
          </PulseWrapper>
        );

      default:
        return (
          <DefaultSpinner $size={spinnerSize} $color={color}>
            <LoadingOutlined spin />
          </DefaultSpinner>
        );
    }
  };

  const content = (
    <>
      {renderSpinner()}
      {text && (
        <SpinnerText $size={textSize} $gap={gap}>
          {text}
        </SpinnerText>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <FullScreenWrapper className={className} $overlay={overlay}>
        {content}
      </FullScreenWrapper>
    );
  }

  return <InlineWrapper className={className}>{content}</InlineWrapper>;
};

/**
 * Button loading spinner - small inline spinner for buttons
 */
export const ButtonSpinner: React.FC<{ color?: string }> = ({
  color = 'currentColor',
}) => (
  <DefaultSpinner $size={16} $color={color}>
    <LoadingOutlined spin />
  </DefaultSpinner>
);

/**
 * Page loading spinner - centered in page content area
 */
export const PageSpinner: React.FC<{ text?: string }> = ({
  text = 'Loading...',
}) => (
  <LoadingSpinner
    size="large"
    variant="arabic"
    text={text}
    color={colors.primary}
  />
);

/**
 * Overlay spinner - covers parent element with loading overlay
 */
export const OverlaySpinner: React.FC<{
  text?: string;
  visible?: boolean;
}> = ({ text, visible = true }) => {
  if (!visible) return null;

  return (
    <LoadingSpinner
      size="large"
      variant="arabic"
      text={text}
      fullScreen
      overlay
    />
  );
};

/**
 * Card loading spinner - for loading state inside cards
 */
export const CardSpinner: React.FC<{ height?: number }> = ({ height = 200 }) => (
  <div
    style={{
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LoadingSpinner size="medium" variant="dots" />
  </div>
);

/**
 * Table loading spinner - for tables
 */
export const TableSpinner: React.FC = () => (
  <div
    style={{
      padding: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LoadingSpinner size="large" variant="default" text="Loading data..." />
  </div>
);

/**
 * Inline text spinner - for loading text inline
 */
export const InlineSpinner: React.FC<{ text?: string }> = ({ text }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      color: colors.textSecondary,
    }}
  >
    <LoadingOutlined spin style={{ fontSize: 14 }} />
    {text && <span>{text}</span>}
  </span>
);

export default LoadingSpinner;
