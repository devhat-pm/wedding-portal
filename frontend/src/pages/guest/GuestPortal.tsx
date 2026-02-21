import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Result } from 'antd';
import {
  SendOutlined,
  CarOutlined,
  BankOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { GuestPortalProvider, useGuestPortal } from '../../context/GuestPortalContext';
import ProgressTracker from '../../components/guest/ProgressTracker';
import WelcomeSection from './sections/WelcomeSection';
import RSVPSection from './sections/RSVPSection';
import TravelSection from './sections/TravelSection';
import HotelSection from './sections/HotelSection';
import RadaChatbot from '../../components/chat/RadaChatbot';
import { colors, shadows, borderRadius } from '../../styles/theme';

// Section configuration
interface SectionConfig {
  key: string;
  label: string;
  arabicLabel: string;
  icon: React.ReactNode;
  component: React.FC;
}

const SECTIONS: SectionConfig[] = [
  { key: 'welcome', label: 'Welcome', arabicLabel: 'أهلاً', icon: <HomeOutlined />, component: WelcomeSection },
  { key: 'rsvp', label: 'RSVP', arabicLabel: 'تأكيد الحضور', icon: <SendOutlined />, component: RSVPSection },
  { key: 'travel', label: 'Arrival', arabicLabel: 'الوصول', icon: <CarOutlined />, component: TravelSection },
  { key: 'hotel', label: 'Suggested Hotels', arabicLabel: 'الفنادق المقترحة', icon: <BankOutlined />, component: HotelSection },
];

// Styled components
const PortalWrapper = styled.div`
  min-height: 100vh;
  background: ${colors.cream};
`;

const LoadingWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${colors.creamLight} 0%, ${colors.creamMedium} 100%);
  padding: 40px 20px;
`;

const LoadingContent = styled(motion.div)`
  text-align: center;
`;

const LoadingLogo = styled(motion.div)`
  width: 120px;
  height: 120px;
  margin: 0 auto 32px;
  position: relative;
`;

const LoadingRing = styled(motion.div)`
  position: absolute;
  inset: 0;
  border: 3px solid ${colors.creamDark};
  border-top-color: ${colors.primary};
  border-radius: 50%;
`;

const LoadingInnerRing = styled(motion.div)`
  position: absolute;
  inset: 15px;
  border: 3px solid ${colors.creamDark};
  border-bottom-color: ${colors.goldDark};
  border-radius: 50%;
`;

const LoadingCenter = styled(motion.div)`
  position: absolute;
  inset: 30px;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.goldDark} 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
`;

const LoadingTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  color: ${colors.secondary};
  margin: 0 0 8px;
`;

const LoadingSubtitle = styled.p`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin: 0;
`;

const ErrorWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${colors.creamLight} 0%, ${colors.creamMedium} 100%);
  padding: 40px 20px;
`;

const MainContent = styled.main`
  padding-bottom: 100px;

  @media (min-width: 1024px) {
    padding-left: 280px;
    padding-bottom: 0;
  }
`;

// Desktop sidebar navigation
const DesktopNav = styled.nav`
  display: none;

  @media (min-width: 1024px) {
    display: block;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    background: ${colors.cardBg};
    border-right: 1px solid ${colors.borderGold};
    padding: 24px;
    overflow-y: auto;
    z-index: 100;
  }
`;

const NavHeader = styled.div`
  text-align: center;
  padding-bottom: 24px;
  border-bottom: 1px solid ${colors.creamDark};
  margin-bottom: 24px;
`;

const NavTitle = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: ${colors.secondary};
  margin: 0 0 4px;
`;

const NavSubtitle = styled.p`
  font-family: 'Amiri', serif;
  font-size: 14px;
  color: ${colors.primary};
  margin: 0;
`;

const NavItem = styled.button<{ $active: boolean; $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px 18px;
  margin-bottom: 10px;
  background: ${(props) => (props.$active ? colors.creamLight : 'transparent')};
  border: none;
  border-radius: ${borderRadius.md}px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: ${colors.creamLight};
  }

  ${(props) =>
    props.$active &&
    `
    border-left: 3px solid ${colors.primary};
    box-shadow: 0 2px 8px rgba(183, 168, 154, 0.1);
  `}
`;

const NavItemIcon = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
  transition: all 0.2s ease;

  ${(props) => {
    if (props.$completed) {
      return `
        background: ${colors.success};
        color: white;
        box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);
      `;
    }
    if (props.$active) {
      return `
        background: ${colors.primary};
        color: white;
        box-shadow: 0 2px 6px rgba(183, 168, 154, 0.3);
      `;
    }
    return `
      background: ${colors.creamMedium};
      color: ${colors.textSecondary};
    `;
  }}
`;

const NavItemText = styled.div`
  flex: 1;
`;

const NavItemLabel = styled.div<{ $active: boolean }>`
  font-size: 14px;
  font-weight: ${(props) => (props.$active ? 600 : 500)};
  color: ${(props) => (props.$active ? colors.secondary : colors.textPrimary)};
`;

const NavItemArabic = styled.div`
  font-family: 'Amiri', serif;
  font-size: 12px;
  color: ${colors.textSecondary};
`;

const NavProgress = styled.div`
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid ${colors.creamDark};
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
  color: ${colors.textSecondary};
  font-weight: 500;
`;

const ProgressBar = styled.div`
  height: 10px;
  background: ${colors.creamMedium};
  border-radius: 5px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const ProgressFill = styled(motion.div)<{ $percentage: number }>`
  height: 100%;
  background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.goldDark} 100%);
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(183, 168, 154, 0.3);
`;

// Mobile bottom navigation
const MobileNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${colors.cardBg};
  border-top: 1px solid ${colors.borderGold};
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
  z-index: 100;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);

  @media (min-width: 1024px) {
    display: none;
  }
`;

const MobileNavItem = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: none;
  border: none;
  cursor: pointer;
  min-width: 60px;
`;

const MobileNavIcon = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;

  ${(props) => {
    if (props.$completed) {
      return `
        background: ${colors.success};
        color: white;
      `;
    }
    if (props.$active) {
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
`;

const MobileNavLabel = styled.span<{ $active: boolean }>`
  font-size: 10px;
  color: ${(props) => (props.$active ? colors.primary : colors.textSecondary)};
  font-weight: ${(props) => (props.$active ? 600 : 400)};
`;

// Inner portal content component
const PortalContent: React.FC = () => {
  const { portalData, isLoading, error, sectionCompletion, completionPercentage, token } = useGuestPortal();
  const [activeSection, setActiveSection] = useState('welcome');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Handle section navigation
  const scrollToSection = (sectionKey: string) => {
    setActiveSection(sectionKey);
    const element = sectionRefs.current[sectionKey];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const section of SECTIONS) {
        const element = sectionRefs.current[section.key];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.key);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <LoadingWrapper>
        <LoadingContent
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <LoadingLogo>
            <LoadingRing
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <LoadingInnerRing
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <LoadingCenter
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              💍
            </LoadingCenter>
          </LoadingLogo>
          <LoadingTitle>Loading Your Invitation</LoadingTitle>
          <LoadingSubtitle>Please wait while we prepare your personalized portal...</LoadingSubtitle>
        </LoadingContent>
      </LoadingWrapper>
    );
  }

  if (error) {
    // Get more specific error message
    const errorData = error as any;
    const errorMessage = errorData?.detail || errorData?.message || 'Unknown error';
    const isNotFound = errorData?.status_code === 404 || errorData?.error_code === 'NOT_FOUND';

    console.error('Guest portal error:', error);

    return (
      <ErrorWrapper>
        <Result
          status={isNotFound ? '404' : 'error'}
          title={isNotFound ? 'Invitation Not Found' : 'Error Loading Invitation'}
          subTitle={
            isNotFound
              ? 'This invitation link is invalid or has expired. Please check your link and try again.'
              : `Failed to load your invitation: ${errorMessage}`
          }
          extra={[
            <Button key="home" type="primary" onClick={() => window.location.href = '/'}>
              Go Home
            </Button>,
          ]}
        />
      </ErrorWrapper>
    );
  }

  if (!portalData) {
    return null;
  }

  const { wedding } = portalData;

  // Handle both API formats: couple_names or groom_name/bride_name
  const weddingData = wedding as any;
  const coupleNames = wedding.couple_names ||
    (weddingData.groom_name && weddingData.bride_name
      ? `${weddingData.groom_name} & ${weddingData.bride_name}`
      : 'Wedding Portal');

  // Set document title to couple names
  useEffect(() => {
    if (coupleNames) {
      document.title = coupleNames;
    }
  }, [coupleNames]);

  // Get completion status for sections (excluding welcome)
  const getSectionCompletion = (key: string) => {
    if (key === 'welcome') return true;
    return sectionCompletion[key as keyof typeof sectionCompletion] || false;
  };

  return (
    <PortalWrapper>
      {/* Desktop Sidebar Navigation */}
      <DesktopNav>
        <NavHeader>
          <NavTitle>{coupleNames}</NavTitle>
          <NavSubtitle>دعوة زفاف</NavSubtitle>
        </NavHeader>

        {SECTIONS.map((section) => (
          <NavItem
            key={section.key}
            $active={activeSection === section.key}
            $completed={getSectionCompletion(section.key)}
            onClick={() => scrollToSection(section.key)}
          >
            <NavItemIcon
              $active={activeSection === section.key}
              $completed={getSectionCompletion(section.key)}
            >
              {section.icon}
            </NavItemIcon>
            <NavItemText>
              <NavItemLabel $active={activeSection === section.key}>
                {section.label}
              </NavItemLabel>
              <NavItemArabic>{section.arabicLabel}</NavItemArabic>
            </NavItemText>
          </NavItem>
        ))}

        <NavProgress>
          <ProgressLabel>
            <span>Profile Completion</span>
            <span>{completionPercentage}%</span>
          </ProgressLabel>
          <ProgressBar>
            <ProgressFill
              $percentage={completionPercentage}
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </ProgressBar>
        </NavProgress>
      </DesktopNav>

      {/* Main Content */}
      <MainContent>
        {SECTIONS.map((section) => {
          const Component = section.component;
          return (
            <div
              key={section.key}
              ref={(el) => { sectionRefs.current[section.key] = el; }}
              id={section.key}
            >
              <Component />
            </div>
          );
        })}
      </MainContent>

      {/* Mobile Bottom Navigation */}
      <MobileNav>
        {SECTIONS.slice(0, 5).map((section) => (
          <MobileNavItem
            key={section.key}
            $active={activeSection === section.key}
            onClick={() => scrollToSection(section.key)}
          >
            <MobileNavIcon
              $active={activeSection === section.key}
              $completed={getSectionCompletion(section.key)}
            >
              {section.icon}
            </MobileNavIcon>
            <MobileNavLabel $active={activeSection === section.key}>
              {section.label}
            </MobileNavLabel>
          </MobileNavItem>
        ))}
      </MobileNav>

      {/* Rada Chatbot */}
      {token && (
        <RadaChatbot
          guestToken={token}
          guestName={portalData?.guest?.full_name?.split(' ')[0]}
          position="bottom-right"
        />
      )}
    </PortalWrapper>
  );
};

// Main GuestPortal component with provider
const GuestPortal: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  if (!token) {
    return (
      <ErrorWrapper>
        <Result
          status="404"
          title="Invitation Not Found"
          subTitle="Please use the invitation link provided to you."
          extra={[
            <Button key="home" type="primary" onClick={() => navigate('/')}>
              Go Home
            </Button>,
          ]}
        />
      </ErrorWrapper>
    );
  }

  return (
    <GuestPortalProvider token={token}>
      <PortalContent />
    </GuestPortalProvider>
  );
};

export default GuestPortal;
