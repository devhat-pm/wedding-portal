import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Button, Space } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { colors, shadows, borderRadius } from '../styles/theme';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${colors.creamLight} 0%, ${colors.creamMedium} 100%);
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
`;

// Arabic pattern background
const PatternOverlay = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='%23B7A89A' fill-opacity='1'/%3E%3C/svg%3E");
  pointer-events: none;
`;

const ContentCard = styled(motion.div)`
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xxl}px;
  box-shadow: ${shadows.xl};
  padding: 60px 48px;
  max-width: 520px;
  width: 100%;
  text-align: center;
  position: relative;
  border: 1px solid ${colors.borderGold};

  @media (max-width: 480px) {
    padding: 40px 24px;
  }
`;

const DecorativeTop = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.goldDark} 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${shadows.gold};
`;

const ErrorCode = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 100px;
  font-weight: 700;
  color: ${colors.primary};
  line-height: 1;
  margin-bottom: 16px;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.goldDark} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 480px) {
    font-size: 72px;
  }
`;

const Title = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  color: ${colors.secondary};
  margin: 0 0 12px;

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;


const Description = styled.p`
  font-size: 16px;
  color: ${colors.textSecondary};
  line-height: 1.7;
  margin: 0 0 32px;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
`;

const DividerLine = styled.div`
  width: 60px;
  height: 1px;
  background: ${colors.borderGold};
`;

const DividerOrnament = styled.div`
  color: ${colors.primary};
  font-size: 18px;
`;

const StyledButton = styled(Button)`
  && {
    height: 48px;
    padding: 0 32px;
    border-radius: ${borderRadius.md}px;
    font-weight: 500;
    font-size: 15px;
  }
`;

const PrimaryButton = styled(StyledButton)`
  && {
    background: ${colors.primary};
    border-color: ${colors.primary};

    &:hover {
      background: ${colors.goldDark};
      border-color: ${colors.goldDark};
    }
  }
`;

const SecondaryButton = styled(StyledButton)`
  && {
    border-color: ${colors.borderGold};
    color: ${colors.textSecondary};

    &:hover {
      border-color: ${colors.primary};
      color: ${colors.primary};
    }
  }
`;

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <PatternOverlay />
      <ContentCard
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <DecorativeTop>
          <span style={{ fontSize: 32, color: 'white' }}>?</span>
        </DecorativeTop>

        <ErrorCode>404</ErrorCode>

        <Title>Page Not Found</Title>

        <Divider>
          <DividerLine />
          <DividerOrnament>&#10022;</DividerOrnament>
          <DividerLine />
        </Divider>

        <Description>
          The page you're looking for seems to have wandered off.
          Don't worry, let's get you back on track.
        </Description>

        <Space size={16}>
          <SecondaryButton
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </SecondaryButton>
          <PrimaryButton
            type="primary"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
          >
            Home
          </PrimaryButton>
        </Space>
      </ContentCard>
    </PageWrapper>
  );
};

export default NotFound;
