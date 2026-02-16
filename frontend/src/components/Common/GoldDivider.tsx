import React from 'react';
import styled from '@emotion/styled';
import { colors } from '../../styles/theme';

interface GoldDividerProps {
  text?: string;
  variant?: 'simple' | 'ornamental' | 'diamond' | 'floral';
  className?: string;
  style?: React.CSSProperties;
  margin?: string;
}

const DividerWrapper = styled.div<{ $margin: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: ${(props) => props.$margin};
  position: relative;
`;

const Line = styled.div`
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    ${colors.goldLight} 20%,
    ${colors.primary} 50%,
    ${colors.goldLight} 80%,
    transparent
  );
`;

const LineLeft = styled(Line)`
  background: linear-gradient(90deg, transparent, ${colors.primary});
`;

const LineRight = styled(Line)`
  background: linear-gradient(90deg, ${colors.primary}, transparent);
`;

const CenterContent = styled.div`
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Text = styled.span`
  font-family: 'Playfair Display', serif;
  color: ${colors.primary};
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
`;

// Ornamental SVG elements
const OrnamentSVG: React.FC<{ variant: string }> = ({ variant }) => {
  const svgColor = colors.primary;

  switch (variant) {
    case 'diamond':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L22 12L12 22L2 12L12 2Z"
            stroke={svgColor}
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M12 6L18 12L12 18L6 12L12 6Z"
            stroke={svgColor}
            strokeWidth="1"
            opacity="0.6"
            fill="none"
          />
          <circle cx="12" cy="12" r="2" fill={svgColor} opacity="0.8" />
        </svg>
      );

    case 'floral':
      return (
        <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
          {/* Center flower */}
          <circle cx="16" cy="12" r="3" fill={svgColor} opacity="0.3" />
          <circle cx="16" cy="12" r="1.5" fill={svgColor} />
          {/* Petals */}
          <ellipse cx="16" cy="6" rx="2" ry="3" fill={svgColor} opacity="0.4" />
          <ellipse cx="16" cy="18" rx="2" ry="3" fill={svgColor} opacity="0.4" />
          <ellipse cx="10" cy="12" rx="3" ry="2" fill={svgColor} opacity="0.4" />
          <ellipse cx="22" cy="12" rx="3" ry="2" fill={svgColor} opacity="0.4" />
          {/* Leaves */}
          <path
            d="M4 12 Q8 8, 8 12 Q8 16, 4 12"
            fill={svgColor}
            opacity="0.3"
          />
          <path
            d="M28 12 Q24 8, 24 12 Q24 16, 28 12"
            fill={svgColor}
            opacity="0.3"
          />
        </svg>
      );

    case 'ornamental':
    default:
      return (
        <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
          {/* Left scroll */}
          <path
            d="M0 8 Q5 2, 10 8 Q15 14, 20 8"
            stroke={svgColor}
            strokeWidth="1.5"
            fill="none"
          />
          {/* Right scroll */}
          <path
            d="M20 8 Q25 2, 30 8 Q35 14, 40 8"
            stroke={svgColor}
            strokeWidth="1.5"
            fill="none"
          />
          {/* Center diamond */}
          <path
            d="M17 8 L20 5 L23 8 L20 11 Z"
            fill={svgColor}
          />
          {/* Dots */}
          <circle cx="5" cy="8" r="1.5" fill={svgColor} opacity="0.6" />
          <circle cx="35" cy="8" r="1.5" fill={svgColor} opacity="0.6" />
        </svg>
      );
  }
};

const GoldDivider: React.FC<GoldDividerProps> = ({
  text,
  variant = 'simple',
  className,
  style,
  margin = '24px 0',
}) => {
  if (variant === 'simple') {
    return (
      <DividerWrapper $margin={margin} className={className} style={style}>
        {text ? (
          <>
            <LineLeft />
            <CenterContent>
              <Text>{text}</Text>
            </CenterContent>
            <LineRight />
          </>
        ) : (
          <Line />
        )}
      </DividerWrapper>
    );
  }

  return (
    <DividerWrapper $margin={margin} className={className} style={style}>
      <LineLeft />
      <CenterContent>
        {text ? (
          <>
            <OrnamentSVG variant={variant} />
            <Text style={{ margin: '0 12px' }}>{text}</Text>
            <OrnamentSVG variant={variant} />
          </>
        ) : (
          <OrnamentSVG variant={variant} />
        )}
      </CenterContent>
      <LineRight />
    </DividerWrapper>
  );
};

export default GoldDivider;
