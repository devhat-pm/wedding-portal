import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Button, Space } from 'antd';
import { MailOutlined, HomeOutlined } from '@ant-design/icons';
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

// Arabic geometric pattern
const PatternOverlay = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B7A89A' fill-opacity='1'%3E%3Cpath d='M40 0l40 40-40 40L0 40 40 0zm0 10L10 40l30 30 30-30-30-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
`;

const ContentCard = styled(motion.div)`
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xxl}px;
  box-shadow: ${shadows.xl};
  padding: 60px 48px;
  max-width: 540px;
  width: 100%;
  text-align: center;
  position: relative;
  border: 1px solid ${colors.borderGold};
  overflow: hidden;

  @media (max-width: 480px) {
    padding: 48px 24px;
  }
`;

const CardPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(135deg, ${colors.secondary} 0%, #1a1a2e 100%);
  opacity: 0.03;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20L20 0z' fill='%23B7A89A' fill-opacity='0.3'/%3E%3C/svg%3E");
  }
`;

const IconWrapper = styled(motion.div)`
  width: 100px;
  height: 100px;
  margin: 0 auto 32px;
  background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.creamMedium} 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid ${colors.borderGold};
  position: relative;
`;

const BrokenLinkIcon = styled.div`
  font-size: 48px;
  position: relative;

  &::after {
    content: '✕';
    position: absolute;
    top: -8px;
    right: -12px;
    font-size: 20px;
    color: ${colors.error};
  }
`;

const Title = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  color: ${colors.secondary};
  margin: 0 0 8px;

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;


const Divider = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const DividerLine = styled.div`
  width: 50px;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, ${colors.borderGold} 50%, transparent 100%);
`;

const DividerOrnament = styled.div`
  color: ${colors.primary};
  font-size: 16px;
`;

const Description = styled.p`
  font-size: 16px;
  color: ${colors.textSecondary};
  line-height: 1.8;
  margin: 0 0 16px;
`;

const Suggestion = styled.div`
  background: ${colors.creamLight};
  border-radius: ${borderRadius.lg}px;
  padding: 20px;
  margin: 24px 0 32px;
  border-left: 4px solid ${colors.primary};
  text-align: left;
`;

const SuggestionTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  color: ${colors.secondary};
  margin: 0 0 8px;
`;

const SuggestionText = styled.p`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

const StyledButton = styled(Button)`
  && {
    height: 48px;
    padding: 0 28px;
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

const FooterNote = styled.p`
  font-size: 13px;
  color: ${colors.textSecondary};
  margin: 32px 0 0;
  font-style: italic;
`;

const InvalidLink: React.FC = () => {
  const navigate = useNavigate();

  const handleContactCouple = () => {
    // This could open a mailto link or navigate to a contact page
    // For now, we'll just show a message
    window.location.href = 'mailto:?subject=Wedding%20Invitation%20Link%20Issue';
  };

  return (
    <PageWrapper>
      <PatternOverlay />
      <ContentCard
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <CardPattern />

        <IconWrapper
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <BrokenLinkIcon>🔗</BrokenLinkIcon>
        </IconWrapper>

        <Title>This Link Doesn't Seem to Work</Title>

        <Divider>
          <DividerLine />
          <DividerOrnament>&#10022;</DividerOrnament>
          <DividerLine />
        </Divider>

        <Description>
          We couldn't find the invitation you're looking for.
          The link may have expired, been mistyped, or the invitation may no longer be available.
        </Description>

        <Suggestion>
          <SuggestionTitle>What you can do:</SuggestionTitle>
          <SuggestionText>
            • Double-check the link in your invitation email<br />
            • Contact the couple directly for a new invitation link<br />
            • Make sure you're using the complete URL
          </SuggestionText>
        </Suggestion>

        <Space size={16} wrap style={{ justifyContent: 'center' }}>
          <PrimaryButton
            type="primary"
            icon={<MailOutlined />}
            onClick={handleContactCouple}
          >
            Contact the Couple
          </PrimaryButton>
          <SecondaryButton
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
          >
            Go Home
          </SecondaryButton>
        </Space>

        <FooterNote>
          If you believe this is an error, please reach out to the couple for assistance.
        </FooterNote>
      </ContentCard>
    </PageWrapper>
  );
};

export default InvalidLink;
