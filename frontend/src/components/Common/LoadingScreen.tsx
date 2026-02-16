import React from 'react';
import styled, { keyframes } from 'styled-components';
import { colors } from '../../styles/theme';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.95);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const Container = styled.div<{ $fullScreen: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${(props) => (props.$fullScreen ? '100vh' : '400px')};
  width: 100%;
  background: ${(props) =>
    props.$fullScreen
      ? `linear-gradient(135deg, ${colors.background} 0%, ${colors.creamMedium} 100%)`
      : 'transparent'};
  position: ${(props) => (props.$fullScreen ? 'fixed' : 'relative')};
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${(props) => (props.$fullScreen ? 9999 : 1)};
`;

const PatternOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='none' stroke='%23B7A89A' stroke-width='0.5' opacity='0.1'/%3E%3Cpath d='M30 10L50 30L30 50L10 30z' fill='none' stroke='%23B7A89A' stroke-width='0.3' opacity='0.08'/%3E%3C/svg%3E");
  background-size: 60px 60px;
  pointer-events: none;
`;

const LoaderWrapper = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OuterRing = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: ${colors.primary};
  border-radius: 50%;
  animation: ${rotate} 1.5s linear infinite;
`;

const MiddleRing = styled.div`
  position: absolute;
  width: 80%;
  height: 80%;
  border: 2px solid transparent;
  border-top-color: ${colors.goldLight};
  border-bottom-color: ${colors.goldLight};
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite reverse;
`;

const InnerRing = styled.div`
  position: absolute;
  width: 60%;
  height: 60%;
  border: 2px solid transparent;
  border-top-color: ${colors.primary};
  border-radius: 50%;
  animation: ${rotate} 0.75s linear infinite;
`;

const CenterOrnament = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const OrnamentSVG = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path
      d="M16 0L32 16L16 32L0 16L16 0Z"
      fill={colors.primary}
      opacity="0.2"
    />
    <path
      d="M16 4L28 16L16 28L4 16L16 4Z"
      fill={colors.primary}
      opacity="0.4"
    />
    <path
      d="M16 8L24 16L16 24L8 16L16 8Z"
      fill={colors.primary}
      opacity="0.6"
    />
    <path
      d="M16 12L20 16L16 20L12 16L16 12Z"
      fill={colors.primary}
    />
  </svg>
);

const Message = styled.p`
  margin-top: 32px;
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.secondary};
  text-align: center;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const ShimmerText = styled.span`
  background: linear-gradient(
    90deg,
    ${colors.secondary} 0%,
    ${colors.primary} 50%,
    ${colors.secondary} 100%
  );
  background-size: 200% auto;
  animation: ${shimmer} 3s linear infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const LoadingDots = styled.span`
  &::after {
    content: '';
    animation: dots 1.5s steps(4, end) infinite;
  }

  @keyframes dots {
    0% {
      content: '';
    }
    25% {
      content: '.';
    }
    50% {
      content: '..';
    }
    75% {
      content: '...';
    }
    100% {
      content: '';
    }
  }
`;

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading',
  fullScreen = true,
}) => {
  return (
    <Container $fullScreen={fullScreen}>
      {fullScreen && <PatternOverlay />}
      <LoaderWrapper>
        <OuterRing />
        <MiddleRing />
        <InnerRing />
        <CenterOrnament>
          <OrnamentSVG />
        </CenterOrnament>
      </LoaderWrapper>
      <Message>
        <ShimmerText>{message}</ShimmerText>
        <LoadingDots />
      </Message>
    </Container>
  );
};

// Simple inline loader for smaller areas
export const InlineLoader: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ animation: 'spin 1s linear infinite' }}
  >
    <style>
      {`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}
    </style>
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={colors.goldLight}
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M12 2 A10 10 0 0 1 22 12"
      stroke={colors.primary}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export default LoadingScreen;
