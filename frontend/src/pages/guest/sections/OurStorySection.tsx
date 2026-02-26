import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { HeartOutlined } from '@ant-design/icons';
import { useGuestPortal } from '../../../context/GuestPortalContext';
import SectionHeader from '../../../components/guest/SectionHeader';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import { getImageUrl } from '../../../utils/helpers';

const SectionWrapper = styled.section`
  padding: 80px 24px;
  max-width: 720px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }

  @media (max-width: 480px) {
    padding: 48px 16px;
  }
`;

const StoryCard = styled(motion.div)`
  background: ${colors.cardBg};
  border: 1px solid ${colors.borderGold};
  border-radius: ${borderRadius.lg}px;
  overflow: hidden;
  box-shadow: ${shadows.sm};
`;

const StoryImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  display: block;

  @media (max-width: 480px) {
    max-height: 300px;
  }
`;

const StoryContent = styled.div`
  padding: 32px;

  @media (max-width: 480px) {
    padding: 24px 20px;
  }
`;

const StoryTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  color: ${colors.secondary};
  margin: 0 0 16px;
  text-align: center;
`;

const StoryText = styled.div`
  font-size: 15px;
  line-height: 1.8;
  color: ${colors.textPrimary};
  white-space: pre-wrap;
`;

const OurStorySection: React.FC = () => {
  const { portalData } = useGuestPortal();

  if (!portalData) return null;

  const wedding = portalData.wedding as any;
  const storyTitle = wedding?.story_title;
  const storyContent = wedding?.story_content;
  const storyImageUrl = wedding?.story_image_url;

  if (!storyTitle && !storyContent) return null;

  return (
    <SectionWrapper>
      <SectionHeader
        title="Our Story"
        subtitle="How it all began"
        icon={<HeartOutlined />}
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
          {storyTitle && <StoryTitle>{storyTitle}</StoryTitle>}
          {storyContent && <StoryText>{storyContent}</StoryText>}
        </StoryContent>
      </StoryCard>
    </SectionWrapper>
  );
};

export default OurStorySection;
