import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import { useGuestPortal } from '../../../context/GuestPortalContext';

const SectionWrapper = styled.section`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
`;

// Hero with cover image
const HeroSection = styled.div<{ $imageUrl?: string }>`
  position: relative;
  height: 70vh;
  min-height: 500px;
  background: ${(props) =>
    props.$imageUrl
      ? `url(${props.$imageUrl}) center/cover no-repeat`
      : `linear-gradient(135deg, ${colors.creamLight} 0%, ${colors.creamMedium} 100%)`};
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    height: 60vh;
    min-height: 400px;
  }
`;

// Arabic pattern overlay
const PatternOverlay = styled.div`
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(26, 26, 46, 0.3) 0%, rgba(26, 26, 46, 0.6) 100%),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0zm0 10L10 30l20 20 20-20-20-20z' fill='%23B7A89A' fill-opacity='0.08'/%3E%3C/svg%3E");
`;

const HeroContent = styled(motion.div)`
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 40px;
  max-width: 800px;
`;

// Decorative frame
const DecorativeFrame = styled.div`
  position: relative;
  padding: 40px 60px;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 80px;
    height: 80px;
    border: 2px solid ${colors.goldLight};
    opacity: 0.6;
  }

  &::before {
    top: 0;
    left: 0;
    border-right: none;
    border-bottom: none;
  }

  &::after {
    bottom: 0;
    right: 0;
    border-left: none;
    border-top: none;
  }

  @media (max-width: 768px) {
    padding: 30px 40px;

    &::before,
    &::after {
      width: 50px;
      height: 50px;
    }
  }
`;

const ArabicCalligraphy = styled(motion.div)`
  font-family: 'Amiri', serif;
  font-size: 24px;
  color: ${colors.goldLight};
  margin-bottom: 16px;
  letter-spacing: 4px;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const CoupleNames = styled(motion.h1)`
  font-family: 'Playfair Display', serif;
  font-size: 56px;
  font-weight: 600;
  color: white;
  margin: 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  letter-spacing: 4px;

  @media (max-width: 768px) {
    font-size: 36px;
    letter-spacing: 2px;
  }
`;

const Ampersand = styled.span`
  display: block;
  font-size: 36px;
  font-weight: 300;
  margin: 8px 0;
  color: ${colors.goldLight};
  font-style: italic;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const DateBadge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(183, 168, 154, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid ${colors.goldLight};
  padding: 12px 28px;
  border-radius: 50px;
  margin-top: 24px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 2px;

  svg {
    color: ${colors.goldLight};
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 10px 20px;
  }
`;

// Countdown section
const CountdownWrapper = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 32px;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const CountdownItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
`;

const CountdownNumber = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 42px;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const CountdownLabel = styled.div`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: ${colors.goldLight};
  margin-top: 4px;
`;

// Welcome content section
const ContentSection = styled.div`
  padding: 60px 20px;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const VenueCard = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 24px 40px;
  background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.creamLight} 100%);
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${colors.borderGold};
  margin-bottom: 40px;
  text-align: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 24px;
  }
`;

const VenueIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
`;

const VenueInfo = styled.div`
  text-align: left;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const VenueName = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: ${colors.secondary};
  margin: 0 0 4px;
`;

const VenueAddress = styled.p`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin: 0;
`;

const WelcomeMessageCard = styled(motion.div)`
  position: relative;
  padding: 40px;
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${shadows.md};
  text-align: center;

  @media (max-width: 768px) {
    padding: 30px 24px;
  }
`;

const WelcomeTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  color: ${colors.secondary};
  margin: 0 0 8px;
`;

const WelcomeArabic = styled.p`
  font-family: 'Amiri', serif;
  font-size: 18px;
  color: ${colors.primary};
  margin: 0 0 24px;
`;

const WelcomeMessage = styled.p`
  font-size: 16px;
  line-height: 1.8;
  color: ${colors.textPrimary};
  margin: 0;
`;

// Decorative corner ornaments
const CornerOrnament = styled.div<{ $position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }>`
  position: absolute;
  width: 40px;
  height: 40px;

  ${(props) => {
    switch (props.$position) {
      case 'top-left':
        return 'top: 16px; left: 16px; border-top: 2px solid; border-left: 2px solid;';
      case 'top-right':
        return 'top: 16px; right: 16px; border-top: 2px solid; border-right: 2px solid;';
      case 'bottom-left':
        return 'bottom: 16px; left: 16px; border-bottom: 2px solid; border-left: 2px solid;';
      case 'bottom-right':
        return 'bottom: 16px; right: 16px; border-bottom: 2px solid; border-right: 2px solid;';
    }
  }}

  border-color: ${colors.borderGold};
`;

const GuestGreeting = styled(motion.div)`
  text-align: center;
  margin-bottom: 20px;
  padding: 16px 24px;
  background: linear-gradient(135deg, ${colors.goldPale} 0%, transparent 100%);
  border-radius: ${borderRadius.lg}px;
`;

const GreetingText = styled.span`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.secondary};
`;

const GuestName = styled.span`
  font-weight: 600;
  color: ${colors.primary};
`;

const WelcomeSection: React.FC = () => {
  const { portalData } = useGuestPortal();

  const countdown = useMemo(() => {
    if (!portalData?.wedding?.wedding_date) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const weddingDate = dayjs(portalData.wedding.wedding_date);
    const now = dayjs();
    const diff = weddingDate.diff(now);

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  }, [portalData?.wedding?.wedding_date]);

  if (!portalData) return null;

  const { guest, wedding } = portalData;

  // Handle both API formats: full_name or first_name/last_name
  const guestData = guest as any;
  const guestName = guestData.full_name || `${guest.first_name || ''} ${guest.last_name || ''}`.trim() || 'Guest';

  // Handle both API formats: couple_names or groom_name/bride_name
  const weddingData = wedding as any;
  const coupleNames = wedding.couple_names ||
    (weddingData.groom_name && weddingData.bride_name
      ? `${weddingData.groom_name} & ${weddingData.bride_name}`
      : 'Wedding Portal');

  return (
    <SectionWrapper>
      <HeroSection $imageUrl={wedding.cover_image_url}>
        <PatternOverlay />
        <HeroContent
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <DecorativeFrame>
            <ArabicCalligraphy
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              بسم الله الرحمن الرحيم
            </ArabicCalligraphy>

            <CoupleNames
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {coupleNames}
            </CoupleNames>

            <DateBadge
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <CalendarOutlined />
              {dayjs(wedding.wedding_date).format('MMMM D, YYYY')}
            </DateBadge>

            {countdown.days > 0 && (
              <CountdownWrapper
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <CountdownItem>
                  <CountdownNumber>{countdown.days}</CountdownNumber>
                  <CountdownLabel>Days</CountdownLabel>
                </CountdownItem>
                <CountdownItem>
                  <CountdownNumber>{countdown.hours}</CountdownNumber>
                  <CountdownLabel>Hours</CountdownLabel>
                </CountdownItem>
                <CountdownItem>
                  <CountdownNumber>{countdown.minutes}</CountdownNumber>
                  <CountdownLabel>Minutes</CountdownLabel>
                </CountdownItem>
              </CountdownWrapper>
            )}
          </DecorativeFrame>
        </HeroContent>
      </HeroSection>

      <ContentSection>
        <GuestGreeting
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GreetingText>
            Welcome, <GuestName>{guestName}</GuestName>
          </GreetingText>
        </GuestGreeting>

        <VenueCard
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <VenueIcon>
            <EnvironmentOutlined />
          </VenueIcon>
          <VenueInfo>
            <VenueName>{wedding.venue_name}</VenueName>
            <VenueAddress>{wedding.venue_address}</VenueAddress>
          </VenueInfo>
        </VenueCard>

        {wedding.welcome_message && (
          <WelcomeMessageCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <CornerOrnament $position="top-left" />
            <CornerOrnament $position="top-right" />
            <CornerOrnament $position="bottom-left" />
            <CornerOrnament $position="bottom-right" />

            <WelcomeMessage>{wedding.welcome_message}</WelcomeMessage>
          </WelcomeMessageCard>
        )}
      </ContentSection>
    </SectionWrapper>
  );
};

export default WelcomeSection;
