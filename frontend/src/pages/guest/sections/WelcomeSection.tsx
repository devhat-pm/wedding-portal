import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { colors } from '../../../styles/theme';
import { getImageUrl } from '../../../utils/helpers';
import { useGuestPortal } from '../../../context/GuestPortalContext';

const SectionWrapper = styled.section`
  position: relative;
  overflow: hidden;
`;

const HeroSection = styled.div<{ $imageUrl?: string }>`
  position: relative;
  height: 100vh;
  min-height: 500px;
  background: ${(props) =>
    props.$imageUrl
      ? `url(${props.$imageUrl}) center/cover no-repeat`
      : `linear-gradient(135deg, ${colors.creamLight} 0%, ${colors.creamMedium} 100%)`};
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    height: 100vh;
    min-height: 400px;
  }
`;

const PatternOverlay = styled.div`
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(26, 26, 46, 0.3) 0%, rgba(26, 26, 46, 0.6) 100%);
`;

const HeroContent = styled(motion.div)`
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 40px;
  max-width: 800px;
`;

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


const WelcomeGreeting = styled(motion.div)`
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: white;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 12px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 16px;
    letter-spacing: 1.5px;
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

const VenueName = styled(motion.div)`
  margin-top: 20px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const WelcomeSection: React.FC = () => {
  const { portalData } = useGuestPortal();

  const countdown = useMemo(() => {
    if (!portalData?.wedding?.wedding_date) {
      return { days: 0, hours: 0, minutes: 0 };
    }

    const weddingDate = dayjs(portalData.wedding.wedding_date);
    const now = dayjs();
    const diff = weddingDate.diff(now);

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  }, [portalData?.wedding?.wedding_date]);

  if (!portalData) return null;

  const { wedding } = portalData;

  const weddingData = wedding as any;
  const coupleNames = wedding.couple_names ||
    (weddingData.groom_name && weddingData.bride_name
      ? `${weddingData.groom_name} & ${weddingData.bride_name}`
      : 'Wedding Portal');

  return (
    <SectionWrapper>
      <HeroSection $imageUrl={getImageUrl(wedding.cover_image_url)}>
        <PatternOverlay />
        <HeroContent
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <DecorativeFrame>
            {portalData.guest?.full_name && (
              <WelcomeGreeting
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Welcome, {portalData.guest.full_name}
              </WelcomeGreeting>
            )}
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

            {wedding.venue_name && (
              <VenueName
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                {wedding.venue_name}
              </VenueName>
            )}

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
    </SectionWrapper>
  );
};

export default WelcomeSection;
