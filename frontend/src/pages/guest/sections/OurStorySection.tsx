import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { HeartFilled } from '@ant-design/icons';
import { useGuestPortal } from '../../../context/GuestPortalContext';
import SectionHeader from '../../../components/guest/SectionHeader';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import { getImageUrl } from '../../../utils/helpers';

const SectionWrapper = styled.section`
  padding: 48px 24px;
  max-width: 780px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 40px 20px;
  }

  @media (max-width: 480px) {
    padding: 32px 16px;
  }
`;

const StoryCard = styled(motion.div)`
  background: white;
  border: 1px solid ${colors.borderGold};
  border-radius: ${borderRadius.xl}px;
  overflow: hidden;
  box-shadow: ${shadows.md};
`;

const StoryImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  display: block;

  @media (max-width: 480px) {
    max-height: 280px;
  }
`;

const StoryContent = styled.div`
  padding: 40px 44px;
  text-align: center;

  @media (max-width: 768px) {
    padding: 32px 28px;
  }

  @media (max-width: 480px) {
    padding: 28px 20px;
  }
`;

const Flourish = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 28px;
  color: ${colors.primary};
  font-size: 16px;

  &::before,
  &::after {
    content: '';
    width: 60px;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      ${colors.primary},
      transparent
    );
  }
`;

const StoryParagraph = styled.p`
  font-size: 16px;
  line-height: 1.9;
  color: ${colors.textPrimary};
  margin: 0 0 20px;
  font-style: italic;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 480px) {
    font-size: 15px;
    line-height: 1.8;
  }
`;

const ClosingFlourish = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 28px;
  color: ${colors.primary};
  font-size: 14px;

  &::before,
  &::after {
    content: '';
    width: 40px;
    height: 1px;
    background: ${colors.primary};
    opacity: 0.4;
  }
`;

const OurStorySection: React.FC = () => {
  const { portalData } = useGuestPortal();

  if (!portalData) return null;

  const wedding = portalData.wedding as any;
  const storyTitle = wedding?.story_title;
  const storyContent = wedding?.story_content;
  const storyImageUrl = wedding?.story_image_url;

  if (!storyTitle && !storyContent) return null;

  // Split content into paragraphs for proper rendering
  const paragraphs = storyContent
    ? storyContent.split(/\n\n+/).filter((p: string) => p.trim())
    : [];

  return (
    <SectionWrapper>
      <SectionHeader
        title={storyTitle || 'Our Story'}
        subtitle="How it all began"
      />

      <StoryCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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
        </StoryContent>
      </StoryCard>
    </SectionWrapper>
  );
};

export default OurStorySection;
