import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Progress } from 'antd';
import {
  CheckCircleOutlined,
  CarOutlined,
  BankOutlined,
  SkinOutlined,
  CoffeeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import styled from '@emotion/styled';
import { colors, shadows, borderRadius } from '../../styles/theme';
import ArabicPattern from '../Common/ArabicPattern';
import ChatBot from '../chat/ChatBot';

interface GuestLayoutProps {
  weddingInfo?: {
    groomName: string;
    brideName: string;
    weddingDate?: string;
    coverImageUrl?: string;
    welcomeMessage?: string;
  };
  completionStatus?: {
    rsvp: boolean;
    travel: boolean;
    hotel: boolean;
    dress: boolean;
    food: boolean;
    activities: boolean;
  };
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  onRefresh?: () => Promise<void>;
  children: React.ReactNode;
}

const LayoutWrapper = styled.div`
  min-height: 100vh;
  background: ${colors.background};
  position: relative;
  overflow-x: hidden;
`;

const PatternOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
`;

const HeaderSection = styled.header<{ $hasImage: boolean }>`
  position: relative;
  min-height: ${(props) => (props.$hasImage ? '400px' : '280px')};
  background: ${(props) =>
    props.$hasImage
      ? 'transparent'
      : `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%)`};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  overflow: hidden;

  @media (max-width: 768px) {
    min-height: ${(props) => (props.$hasImage ? '280px' : '220px')};
    padding: 32px 16px;
  }

  @media (max-width: 480px) {
    min-height: ${(props) => (props.$hasImage ? '240px' : '200px')};
    padding: 24px 16px;
  }
`;

const HeaderBackground = styled.div<{ $imageUrl: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url(${(props) => props.$imageUrl}) center/cover no-repeat;
  z-index: 0;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(123, 117, 109, 0.4) 0%,
      rgba(183, 168, 154, 0.6) 100%
    );
  }
`;

const HeaderPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  opacity: 0.15;
`;

const HeaderContent = styled(motion.div)`
  position: relative;
  z-index: 2;
`;

const WeddingDate = styled(motion.p)`
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: ${colors.goldLight};
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 12px;
    letter-spacing: 0.15em;
  }
`;

const CoupleNames = styled(motion.h1)`
  font-family: 'Playfair Display', serif;
  font-size: 48px;
  font-weight: 700;
  color: ${colors.white};
  margin: 0 0 8px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);

  span {
    color: ${colors.primary};
  }

  @media (max-width: 768px) {
    font-size: 32px;
  }

  @media (max-width: 480px) {
    font-size: 26px;
  }
`;

const Ampersand = styled.span`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  color: ${colors.primary};
  margin: 0 12px;

  @media (max-width: 480px) {
    margin: 0 8px;
  }
`;

const WelcomeMessage = styled(motion.p)`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.goldLight};
  max-width: 600px;
  line-height: 1.6;
  margin-top: 16px;

  @media (max-width: 768px) {
    font-size: 16px;
    max-width: 90%;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    line-height: 1.5;
  }
`;

const Ornament = styled(motion.div)`
  margin: 24px 0;

  @media (max-width: 480px) {
    margin: 16px 0;
  }
`;

const OrnamentSVG = () => (
  <svg width="120" height="20" viewBox="0 0 120 20" fill="none">
    <path
      d="M0 10 Q30 0, 60 10 Q90 20, 120 10"
      stroke={colors.primary}
      strokeWidth="1"
      fill="none"
      opacity="0.6"
    />
    <circle cx="60" cy="10" r="4" fill={colors.primary} />
    <circle cx="40" cy="10" r="2" fill={colors.primary} opacity="0.6" />
    <circle cx="80" cy="10" r="2" fill={colors.primary} opacity="0.6" />
  </svg>
);

const ProgressSection = styled(motion.div)`
  position: relative;
  z-index: 2;
  padding: 24px;
  background: ${colors.cardBg};
  margin: -40px 24px 0;
  border-radius: ${borderRadius.xl}px;
  box-shadow: ${shadows.lg};
  border: 1px solid ${colors.borderGold};

  @media (max-width: 768px) {
    margin: -30px 16px 0;
    padding: 20px;
  }

  @media (max-width: 480px) {
    margin: -24px 12px 0;
    padding: 16px;
  }
`;

const ProgressTitle = styled.p`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin-bottom: 12px;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 8px;
  }
`;

const ProgressWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const ProgressText = styled.span`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.secondary};
  font-weight: 600;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const MainContent = styled.main`
  position: relative;
  z-index: 1;
  padding: 32px 24px 120px;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 24px 16px 140px;
  }

  @media (max-width: 480px) {
    padding: 20px 12px 140px;
  }
`;

const PageTransition = styled(motion.div)`
  width: 100%;
`;

// Pull to refresh indicator
const PullToRefresh = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${colors.cardBg};
  border-radius: 50%;
  box-shadow: ${shadows.md};
  border: 1px solid ${colors.borderGold};
`;

const RefreshIcon = styled(motion.div)`
  color: ${colors.primary};
  font-size: 20px;
`;

// Bottom Navigation
const BottomNavWrapper = styled(motion.nav)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${colors.cardBg};
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  padding: 8px 8px;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
  border-top: 1px solid ${colors.borderGold};

  @media (min-width: 1024px) {
    display: none;
  }
`;

const NavItem = styled(motion.button)<{ $active: boolean; $completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 10px;
  min-width: 52px;
  background: ${(props) => (props.$active ? colors.goldPale : 'transparent')};
  border: none;
  border-radius: ${borderRadius.md}px;
  cursor: pointer;
  transition: background 0.2s ease;
  position: relative;

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 360px) {
    padding: 6px 8px;
    min-width: 44px;
  }
`;

const NavIcon = styled.span<{ $completed: boolean; $active: boolean }>`
  font-size: 20px;
  color: ${(props) => {
    if (props.$active) return colors.primary;
    if (props.$completed) return colors.success;
    return colors.textSecondary;
  }};
  transition: color 0.2s ease;

  @media (max-width: 360px) {
    font-size: 18px;
  }
`;

const NavLabel = styled.span<{ $active: boolean }>`
  font-size: 10px;
  color: ${(props) => (props.$active ? colors.primary : colors.textSecondary)};
  font-weight: ${(props) => (props.$active ? '600' : '400')};
  transition: color 0.2s ease;

  @media (max-width: 360px) {
    font-size: 9px;
  }
`;

const CompletedDot = styled(motion.span)`
  position: absolute;
  top: 4px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: ${colors.success};
  border-radius: 50%;
  border: 2px solid ${colors.cardBg};
`;

// Navigation indicator (active tab underline)
const NavIndicator = styled(motion.div)`
  position: absolute;
  bottom: -4px;
  left: 50%;
  width: 20px;
  height: 3px;
  background: ${colors.primary};
  border-radius: 2px;
  transform: translateX(-50%);
`;

const navItems = [
  { key: 'rsvp', icon: <CheckCircleOutlined />, label: 'RSVP' },
  { key: 'travel', icon: <CarOutlined />, label: 'Travel' },
  { key: 'hotel', icon: <BankOutlined />, label: 'Hotel' },
  { key: 'dress', icon: <SkinOutlined />, label: 'Dress' },
  { key: 'food', icon: <CoffeeOutlined />, label: 'Food' },
];

const GuestLayout: React.FC<GuestLayoutProps> = ({
  weddingInfo,
  completionStatus = {
    rsvp: false,
    travel: false,
    hotel: false,
    dress: false,
    food: false,
    activities: false,
  },
  activeSection = 'rsvp',
  onSectionChange,
  onRefresh,
  children,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const completedCount = Object.values(completionStatus).filter(Boolean).length;
  const totalSections = Object.keys(completionStatus).length;
  const progressPercent = Math.round((completedCount / totalSections) * 100);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Pull to refresh handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0 && touchStartY.current > 0) {
      const distance = e.touches[0].clientY - touchStartY.current;
      if (distance > 0 && distance < 150) {
        setPullDistance(distance);
      }
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 80 && onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
    touchStartY.current = 0;
  }, [pullDistance, onRefresh]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content || !onRefresh) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, onRefresh]);

  // Header animation variants
  const headerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
    },
  };

  return (
    <LayoutWrapper ref={contentRef}>
      <PatternOverlay>
        <ArabicPattern variant="arabesque" opacity={0.03} />
      </PatternOverlay>

      {/* Pull to refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <PullToRefresh
          initial={{ y: -60 }}
          animate={{ y: Math.min(pullDistance * 0.5, 40) }}
          style={{ opacity: pullDistance / 80 }}
        >
          <RefreshIcon
            animate={isRefreshing ? { rotate: 360 } : { rotate: pullDistance * 2 }}
            transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
          >
            <ReloadOutlined />
          </RefreshIcon>
        </PullToRefresh>
      )}

      <HeaderSection $hasImage={!!weddingInfo?.coverImageUrl}>
        {weddingInfo?.coverImageUrl && (
          <HeaderBackground $imageUrl={weddingInfo.coverImageUrl} />
        )}
        <HeaderPattern>
          <ArabicPattern variant="geometric" color={colors.goldLight} opacity={0.2} />
        </HeaderPattern>

        <HeaderContent
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          {weddingInfo?.weddingDate && (
            <WeddingDate variants={itemVariants}>
              {formatDate(weddingInfo.weddingDate)}
            </WeddingDate>
          )}
          <CoupleNames variants={itemVariants}>
            {weddingInfo?.groomName || 'Groom'}
            <Ampersand>&</Ampersand>
            {weddingInfo?.brideName || 'Bride'}
          </CoupleNames>
          <Ornament variants={itemVariants}>
            <OrnamentSVG />
          </Ornament>
          {weddingInfo?.welcomeMessage && (
            <WelcomeMessage variants={itemVariants}>
              {weddingInfo.welcomeMessage}
            </WelcomeMessage>
          )}
        </HeaderContent>
      </HeaderSection>

      <ProgressSection
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <ProgressTitle>Your preparation progress</ProgressTitle>
        <ProgressWrapper>
          <Progress
            percent={progressPercent}
            strokeColor={{
              '0%': colors.primary,
              '100%': colors.goldDark,
            }}
            trailColor={colors.creamDark}
            showInfo={false}
            style={{ flex: 1 }}
          />
          <ProgressText>
            {completedCount}/{totalSections}
          </ProgressText>
        </ProgressWrapper>
      </ProgressSection>

      <MainContent>
        <AnimatePresence mode="wait">
          <PageTransition
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {children}
          </PageTransition>
        </AnimatePresence>
      </MainContent>

      {/* Bottom Navigation */}
      <BottomNavWrapper
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.key;
          const isCompleted = completionStatus[item.key as keyof typeof completionStatus];

          return (
            <NavItem
              key={item.key}
              $active={isActive}
              $completed={isCompleted}
              onClick={() => onSectionChange?.(item.key)}
              whileTap={{ scale: 0.92 }}
            >
              <NavIcon $completed={isCompleted} $active={isActive}>
                {item.icon}
              </NavIcon>
              <NavLabel $active={isActive}>{item.label}</NavLabel>
              {isCompleted && (
                <CompletedDot
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                />
              )}
              {isActive && (
                <NavIndicator
                  layoutId="navIndicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </NavItem>
          );
        })}
      </BottomNavWrapper>

      <ChatBot guestToken={activeSection} position="bottom-right" isGuestPortal />
    </LayoutWrapper>
  );
};

export default GuestLayout;
