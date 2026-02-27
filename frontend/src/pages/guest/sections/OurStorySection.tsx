import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { HeartFilled } from '@ant-design/icons';
import { useGuestPortal } from '../../../context/GuestPortalContext';
import SectionHeader from '../../../components/guest/SectionHeader';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import { getImageUrl } from '../../../utils/helpers';
import ArabicPattern from '../../../components/Common/ArabicPattern';

const SectionWrapper = styled.section`
  padding: 48px 24px;
  max-width: 780px;
  margin: 0 auto;
  position: relative;

  @media (max-width: 768px) {
    padding: 40px 20px;
  }

  @media (max-width: 480px) {
    padding: 32px 16px;
  }
`;

const PatternBackground = styled.div`
  position: absolute;
  top: 0;
  left: -60px;
  right: -60px;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
`;

const StoryCard = styled(motion.div)`
  background: white;
  border: 1.5px solid ${colors.borderGold};
  border-radius: ${borderRadius.xxl}px;
  overflow: hidden;
  box-shadow: ${shadows.lg};
  position: relative;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 20%;
    right: 20%;
    height: 3px;
    background: linear-gradient(90deg, transparent, ${colors.primary}, transparent);
    z-index: 2;
  }
`;

const StoryImage = styled.img`
  width: 100%;
  max-height: 420px;
  object-fit: cover;
  display: block;

  @media (max-width: 480px) {
    max-height: 280px;
  }
`;

const StoryContent = styled.div`
  padding: 48px 52px;
  text-align: center;
  position: relative;

  /* Decorative corner elements */
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 40px;
    height: 40px;
    border-color: ${colors.primary};
    opacity: 0.3;
  }

  &::before {
    top: 20px;
    left: 24px;
    border-top: 2px solid;
    border-left: 2px solid;
  }

  &::after {
    bottom: 20px;
    right: 24px;
    border-bottom: 2px solid;
    border-right: 2px solid;
  }

  @media (max-width: 768px) {
    padding: 36px 32px;
  }

  @media (max-width: 480px) {
    padding: 28px 20px;

    &::before,
    &::after {
      width: 24px;
      height: 24px;
    }

    &::before {
      top: 12px;
      left: 12px;
    }

    &::after {
      bottom: 12px;
      right: 12px;
    }
  }
`;

const Flourish = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
  color: ${colors.primary};
  font-size: 18px;

  &::before,
  &::after {
    content: '';
    width: 80px;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      ${colors.primary},
      transparent
    );
  }

  @media (max-width: 480px) {
    &::before,
    &::after {
      width: 50px;
    }
  }
`;

const StoryParagraph = styled.p`
  font-size: 17px;
  line-height: 2;
  color: ${colors.textPrimary};
  margin: 0 0 24px;
  font-style: italic;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  &:last-of-type {
    margin-bottom: 0;
  }

  @media (max-width: 480px) {
    font-size: 15px;
    line-height: 1.9;
  }
`;

const CoupleNames = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 600;
  color: ${colors.secondary};
  margin-top: 32px;
  letter-spacing: 2px;

  @media (max-width: 480px) {
    font-size: 18px;
    letter-spacing: 1px;
  }
`;

const ClosingFlourish = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 32px;
  color: ${colors.primary};
  font-size: 16px;

  &::before,
  &::after {
    content: '';
    width: 50px;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${colors.primary});
    opacity: 0.5;
  }

  &::after {
    background: linear-gradient(90deg, ${colors.primary}, transparent);
  }
`;

const OurStorySection: React.FC = () => {
  const { portalData } = useGuestPortal();

  if (!portalData) return null;

  const wedding = portalData.wedding as any;
  const storyTitle = wedding?.story_title;
  const storyContent = wedding?.story_content;
  const storyImageUrl = wedding?.story_image_url;
  const brideName = wedding?.bride_name;
  const groomName = wedding?.groom_name;

  if (!storyTitle && !storyContent) return null;

  // Split content into paragraphs for proper rendering
  const paragraphs = storyContent
    ? storyContent.split(/\n\n+/).filter((p: string) => p.trim())
    : [];

  return (
    <SectionWrapper>
      <PatternBackground>
        <ArabicPattern
          variant="arabesque"
          color={colors.primary}
          opacity={0.04}
          width="100%"
          height="100%"
        />
      </PatternBackground>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <SectionHeader
          title={storyTitle || 'Our Story'}
          subtitle="How it all began"
        />

        <StoryCard
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {storyImageUrl && (
            <StoryImage
              src={getImageUrl(storyImageUrl) || storyImageUrl}
              alt={storyTitle || 'Our Story'}
            />
          )}
          <StoryContent>
            <Flourish>
              <HeartFilled />
            </Flourish>
            {paragraphs.map((paragraph: string, index: number) => (
              <StoryParagraph key={index}>{paragraph.trim()}</StoryParagraph>
            ))}
            <ClosingFlourish>
              <HeartFilled />
            </ClosingFlourish>
            {brideName && groomName && (
              <CoupleNames>{brideName} & {groomName}</CoupleNames>
            )}
          </StoryContent>
        </StoryCard>
      </div>
    </SectionWrapper>
  );
};

export default OurStorySection;
