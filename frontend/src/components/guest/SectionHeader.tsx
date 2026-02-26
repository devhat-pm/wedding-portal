import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { colors, borderRadius } from '../../styles/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  centered?: boolean;
}

const HeaderWrapper = styled(motion.div)<{ $centered?: boolean }>`
  margin-bottom: 48px;
  text-align: ${(props) => (props.$centered ? 'center' : 'left')};
  padding: 0 8px;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${borderRadius.lg}px;
  background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.goldLight} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${colors.primary};
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const EnglishTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 600;
  color: ${colors.secondary};
  margin: 0;
  letter-spacing: 2px;
  text-transform: uppercase;

  @media (max-width: 768px) {
    font-size: 26px;
    letter-spacing: 1px;
  }
`;


const Subtitle = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: ${colors.textSecondary};
  margin: 12px auto 0;
  max-width: 520px;
`;

const DividerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  gap: 16px;
`;

const DividerLine = styled.div`
  height: 1px;
  width: 60px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    ${colors.borderGold} 50%,
    transparent 100%
  );

  @media (max-width: 768px) {
    width: 40px;
  }
`;

const DividerOrnament = styled.div`
  width: 12px;
  height: 12px;
  border: 2px solid ${colors.primary};
  transform: rotate(45deg);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 4px;
    height: 4px;
    background: ${colors.primary};
    border-radius: 50%;
  }
`;

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  centered = true,
}) => {
  return (
    <HeaderWrapper
      $centered={centered}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <TitleWrapper>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <TitleContainer>
          <EnglishTitle>{title}</EnglishTitle>
        </TitleContainer>
      </TitleWrapper>

      {subtitle && <Subtitle>{subtitle}</Subtitle>}

      <DividerWrapper>
        <DividerLine />
        <DividerOrnament />
        <DividerLine />
      </DividerWrapper>
    </HeaderWrapper>
  );
};

export default SectionHeader;
