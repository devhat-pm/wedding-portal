import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Tooltip } from 'antd';
import {
  CheckOutlined,
  SendOutlined,
  CarOutlined,
  BankOutlined,
  SkinOutlined,
  CoffeeOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { colors, shadows, borderRadius } from '../../styles/theme';
import type { SectionCompletion } from '../../context/GuestPortalContext';

interface ProgressTrackerProps {
  completion: SectionCompletion;
  currentSection?: string;
  onSectionClick?: (section: string) => void;
  variant?: 'horizontal' | 'vertical' | 'compact';
}

interface SectionConfig {
  key: keyof SectionCompletion;
  label: string;
  icon: React.ReactNode;
}

const SECTIONS: SectionConfig[] = [
  { key: 'rsvp', label: 'RSVP', icon: <SendOutlined /> },
  { key: 'travel', label: 'Travel', icon: <CarOutlined /> },
  { key: 'hotel', label: 'Hotel', icon: <BankOutlined /> },
  { key: 'dress', label: 'Dress Code', icon: <SkinOutlined /> },
  { key: 'food', label: 'Food', icon: <CoffeeOutlined /> },
  { key: 'activities', label: 'Activities', icon: <StarOutlined /> },
];

// Horizontal variant styles
const HorizontalWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 20px;
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  box-shadow: ${shadows.sm};
  overflow-x: auto;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const StepWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Step = styled(motion.button)<{ $completed: boolean; $current: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 8px 10px;
  }
`;

const StepCircle = styled.div<{ $completed: boolean; $current: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s ease;
  position: relative;

  ${(props) => {
    if (props.$completed) {
      return `
        background: linear-gradient(135deg, ${colors.success} 0%, #3d8b40 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
      `;
    }
    if (props.$current) {
      return `
        background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.goldDark} 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(183, 168, 154, 0.4);
        animation: pulse 2s infinite;
      `;
    }
    return `
      background: ${colors.creamMedium};
      color: ${colors.textSecondary};
      border: 2px dashed ${colors.borderGold};
    `;
  }}

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
`;

const StepLabel = styled.span<{ $completed: boolean; $current: boolean }>`
  font-size: 12px;
  font-weight: ${(props) => (props.$current ? 600 : 500)};
  color: ${(props) => {
    if (props.$completed) return colors.success;
    if (props.$current) return colors.primary;
    return colors.textSecondary;
  }};
  text-align: center;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 10px;
  }
`;

const Connector = styled.div<{ $completed: boolean }>`
  width: 40px;
  height: 2px;
  background: ${(props) =>
    props.$completed
      ? `linear-gradient(90deg, ${colors.success} 0%, ${colors.success} 100%)`
      : colors.creamDark};
  margin: 0 -4px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    width: 20px;
    margin-bottom: 16px;
  }
`;

// Vertical variant styles
const VerticalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 20px;
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  box-shadow: ${shadows.sm};
`;

const VerticalStep = styled(motion.button)<{ $completed: boolean; $current: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${(props) => (props.$current ? colors.creamLight : 'transparent')};
  border: none;
  border-radius: ${borderRadius.md}px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;

  &:hover {
    background: ${colors.creamLight};
  }
`;

const VerticalConnector = styled.div<{ $completed: boolean }>`
  width: 2px;
  height: 24px;
  background: ${(props) => (props.$completed ? colors.success : colors.creamDark)};
  margin-left: 39px;
`;

const VerticalLabels = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const VerticalLabel = styled.span<{ $completed: boolean; $current: boolean }>`
  font-size: 14px;
  font-weight: ${(props) => (props.$current ? 600 : 500)};
  color: ${(props) => {
    if (props.$completed) return colors.success;
    if (props.$current) return colors.secondary;
    return colors.textSecondary;
  }};
`;


// Compact variant styles
const CompactWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${colors.cardBg};
  border-radius: ${borderRadius.lg}px;
  box-shadow: ${shadows.sm};
`;

const CompactStep = styled.button<{ $completed: boolean; $current: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  ${(props) => {
    if (props.$completed) {
      return `
        background: ${colors.success};
        color: white;
      `;
    }
    if (props.$current) {
      return `
        background: ${colors.primary};
        color: white;
      `;
    }
    return `
      background: ${colors.creamMedium};
      color: ${colors.textSecondary};
    `;
  }}

  &:hover {
    transform: scale(1.1);
  }
`;

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  completion,
  currentSection = 'rsvp',
  onSectionClick,
  variant = 'horizontal',
}) => {
  const handleClick = (section: string) => {
    if (onSectionClick) {
      onSectionClick(section);
    }
  };

  if (variant === 'compact') {
    return (
      <CompactWrapper>
        {SECTIONS.map((section) => (
          <Tooltip key={section.key} title={section.label}>
            <CompactStep
              $completed={completion[section.key]}
              $current={currentSection === section.key}
              onClick={() => handleClick(section.key)}
            >
              {completion[section.key] ? <CheckOutlined /> : section.icon}
            </CompactStep>
          </Tooltip>
        ))}
      </CompactWrapper>
    );
  }

  if (variant === 'vertical') {
    return (
      <VerticalWrapper>
        {SECTIONS.map((section, index) => (
          <React.Fragment key={section.key}>
            <VerticalStep
              $completed={completion[section.key]}
              $current={currentSection === section.key}
              onClick={() => handleClick(section.key)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <StepCircle
                $completed={completion[section.key]}
                $current={currentSection === section.key}
              >
                {completion[section.key] ? <CheckOutlined /> : section.icon}
              </StepCircle>
              <VerticalLabels>
                <VerticalLabel
                  $completed={completion[section.key]}
                  $current={currentSection === section.key}
                >
                  {section.label}
                </VerticalLabel>
              </VerticalLabels>
            </VerticalStep>
            {index < SECTIONS.length - 1 && (
              <VerticalConnector $completed={completion[section.key]} />
            )}
          </React.Fragment>
        ))}
      </VerticalWrapper>
    );
  }

  // Horizontal variant (default)
  return (
    <HorizontalWrapper>
      {SECTIONS.map((section, index) => (
        <StepWrapper key={section.key}>
          <Step
            $completed={completion[section.key]}
            $current={currentSection === section.key}
            onClick={() => handleClick(section.key)}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <StepCircle
              $completed={completion[section.key]}
              $current={currentSection === section.key}
            >
              {completion[section.key] ? <CheckOutlined /> : section.icon}
            </StepCircle>
            <StepLabel
              $completed={completion[section.key]}
              $current={currentSection === section.key}
            >
              {section.label}
            </StepLabel>
          </Step>
          {index < SECTIONS.length - 1 && (
            <Connector $completed={completion[section.key]} />
          )}
        </StepWrapper>
      ))}
    </HorizontalWrapper>
  );
};

export default ProgressTracker;
