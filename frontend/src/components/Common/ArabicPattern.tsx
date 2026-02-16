import React from 'react';
import { colors } from '../../styles/theme';

interface ArabicPatternProps {
  width?: number | string;
  height?: number | string;
  color?: string;
  opacity?: number;
  variant?: 'geometric' | 'stars' | 'arabesque' | 'diamonds';
  className?: string;
  style?: React.CSSProperties;
}

const ArabicPattern: React.FC<ArabicPatternProps> = ({
  width = '100%',
  height = '100%',
  color = colors.primary,
  opacity = 0.1,
  variant = 'geometric',
  className,
  style,
}) => {
  const renderPattern = () => {
    switch (variant) {
      case 'geometric':
        return (
          <svg
            width={width}
            height={height}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={style}
          >
            <defs>
              <pattern id="geometric" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                {/* Central diamond */}
                <path
                  d="M25 0 L50 25 L25 50 L0 25 Z"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.5"
                  opacity={opacity}
                />
                {/* Inner diamond */}
                <path
                  d="M25 10 L40 25 L25 40 L10 25 Z"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.3"
                  opacity={opacity * 0.8}
                />
                {/* Cross lines */}
                <path
                  d="M25 0 L25 50 M0 25 L50 25"
                  stroke={color}
                  strokeWidth="0.2"
                  opacity={opacity * 0.5}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#geometric)" />
          </svg>
        );

      case 'stars':
        return (
          <svg
            width={width}
            height={height}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={style}
          >
            <defs>
              <pattern id="stars" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                {/* 8-pointed star */}
                <polygon
                  points="20,0 24,16 40,20 24,24 20,40 16,24 0,20 16,16"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.5"
                  opacity={opacity}
                />
                {/* Inner star */}
                <polygon
                  points="20,8 22,18 32,20 22,22 20,32 18,22 8,20 18,18"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.3"
                  opacity={opacity * 0.7}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#stars)" />
          </svg>
        );

      case 'arabesque':
        return (
          <svg
            width={width}
            height={height}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={style}
          >
            <defs>
              <pattern id="arabesque" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                {/* Outer circle */}
                <circle
                  cx="30"
                  cy="30"
                  r="28"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.5"
                  opacity={opacity}
                />
                {/* Middle circle */}
                <circle
                  cx="30"
                  cy="30"
                  r="20"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.4"
                  opacity={opacity * 0.8}
                />
                {/* Inner circle */}
                <circle
                  cx="30"
                  cy="30"
                  r="12"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.3"
                  opacity={opacity * 0.6}
                />
                {/* Diagonal lines */}
                <path
                  d="M30 2 L30 58 M2 30 L58 30 M8 8 L52 52 M8 52 L52 8"
                  stroke={color}
                  strokeWidth="0.2"
                  opacity={opacity * 0.4}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#arabesque)" />
          </svg>
        );

      case 'diamonds':
        return (
          <svg
            width={width}
            height={height}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={style}
          >
            <defs>
              <pattern id="diamonds" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <path
                  d="M15 0 L30 15 L15 30 L0 15 Z"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.5"
                  opacity={opacity}
                />
                <path
                  d="M15 5 L25 15 L15 25 L5 15 Z"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.3"
                  opacity={opacity * 0.6}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diamonds)" />
          </svg>
        );

      default:
        return null;
    }
  };

  return renderPattern();
};

// Background wrapper component
interface ArabicPatternBackgroundProps {
  children: React.ReactNode;
  variant?: 'geometric' | 'stars' | 'arabesque' | 'diamonds';
  color?: string;
  opacity?: number;
  className?: string;
}

export const ArabicPatternBackground: React.FC<ArabicPatternBackgroundProps> = ({
  children,
  variant = 'geometric',
  color = colors.primary,
  opacity = 0.08,
  className,
}) => {
  return (
    <div style={{ position: 'relative' }} className={className}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <ArabicPattern
          variant={variant}
          color={color}
          opacity={opacity}
          width="100%"
          height="100%"
        />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
};

export default ArabicPattern;
