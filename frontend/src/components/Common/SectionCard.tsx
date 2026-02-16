import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleFilled, RightOutlined } from '@ant-design/icons';
import { colors, shadows, borderRadius } from '../../styles/theme';

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  isCompleted?: boolean;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  collapsible?: boolean;
}

const CardWrapper = styled(motion.div)<{ $isCompleted: boolean; $isExpanded: boolean }>`
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  box-shadow: ${shadows.card};
  border: 1px solid ${(props) =>
    props.$isCompleted ? colors.success : props.$isExpanded ? colors.primary : 'rgba(183, 168, 154, 0.15)'};
  overflow: hidden;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    border-color: ${(props) => (props.$isCompleted ? colors.success : colors.primary)};
    box-shadow: ${shadows.cardHover};
  }
`;

const CardHeader = styled.div<{ $clickable: boolean }>`
  display: flex;
  align-items: center;
  padding: 20px 24px;
  cursor: ${(props) => (props.$clickable ? 'pointer' : 'default')};
  gap: 16px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.$clickable ? colors.creamLight : 'transparent')};
  }
`;

const IconWrapper = styled.div<{ $isCompleted: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: ${borderRadius.lg}px;
  background: ${(props) =>
    props.$isCompleted
      ? `linear-gradient(135deg, ${colors.success} 0%, #3D6B4C 100%)`
      : `linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.goldLight} 100%)`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.$isCompleted ? colors.white : colors.primary)};
  font-size: 20px;
  flex-shrink: 0;
  box-shadow: ${(props) =>
    props.$isCompleted ? '0 4px 12px rgba(74, 124, 89, 0.3)' : shadows.sm};
`;

const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 600;
  color: ${colors.secondary};
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Description = styled.p`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin: 0;
  line-height: 1.5;
`;

const StatusBadge = styled.span<{ $isCompleted: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) =>
    props.$isCompleted ? 'rgba(74, 124, 89, 0.1)' : 'rgba(183, 168, 154, 0.1)'};
  color: ${(props) => (props.$isCompleted ? colors.success : colors.primary)};
`;

const ExpandIcon = styled(motion.div)`
  color: ${colors.textSecondary};
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const CardContent = styled(motion.div)`
  overflow: hidden;
`;

const ContentInner = styled.div`
  padding: 0 24px 24px 24px;
  border-top: 1px solid ${colors.creamDark};
`;

const SectionCard: React.FC<SectionCardProps> = ({
  icon,
  title,
  description,
  isCompleted = false,
  isExpanded: controlledExpanded,
  defaultExpanded = false,
  onToggle,
  children,
  className,
  onClick,
  collapsible = true,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (collapsible && children) {
      const newExpanded = !isExpanded;
      setInternalExpanded(newExpanded);
      onToggle?.(newExpanded);
    }
  };

  const hasClickHandler = onClick || (collapsible && children);

  return (
    <CardWrapper
      $isCompleted={isCompleted}
      $isExpanded={isExpanded}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <CardHeader $clickable={!!hasClickHandler} onClick={handleClick}>
        <IconWrapper $isCompleted={isCompleted}>{icon}</IconWrapper>
        <ContentWrapper>
          <Title>
            {title}
            {isCompleted && (
              <CheckCircleFilled style={{ color: colors.success, fontSize: 16 }} />
            )}
          </Title>
          {description && <Description>{description}</Description>}
        </ContentWrapper>
        {collapsible && children && (
          <ExpandIcon
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <RightOutlined />
          </ExpandIcon>
        )}
        {!children && (
          <StatusBadge $isCompleted={isCompleted}>
            {isCompleted ? 'Complete' : 'Pending'}
          </StatusBadge>
        )}
      </CardHeader>

      <AnimatePresence initial={false}>
        {isExpanded && children && (
          <CardContent
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ContentInner>{children}</ContentInner>
          </CardContent>
        )}
      </AnimatePresence>
    </CardWrapper>
  );
};

// Compact version for lists
export const SectionCardCompact: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  isCompleted?: boolean;
  onClick?: () => void;
}> = ({ icon, title, subtitle, isCompleted = false, onClick }) => (
  <CardWrapper
    $isCompleted={isCompleted}
    $isExpanded={false}
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <CardHeader $clickable={!!onClick}>
      <IconWrapper $isCompleted={isCompleted}>{icon}</IconWrapper>
      <ContentWrapper>
        <Title style={{ fontSize: 16 }}>
          {title}
          {isCompleted && (
            <CheckCircleFilled style={{ color: colors.success, fontSize: 14 }} />
          )}
        </Title>
        {subtitle && <Description style={{ fontSize: 13 }}>{subtitle}</Description>}
      </ContentWrapper>
      {onClick && (
        <ExpandIcon>
          <RightOutlined />
        </ExpandIcon>
      )}
    </CardHeader>
  </CardWrapper>
);

export default SectionCard;
