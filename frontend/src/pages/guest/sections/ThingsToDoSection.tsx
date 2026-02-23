import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import {
  CompassOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  SkinOutlined,
  CoffeeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
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

const ActivityCard = styled(motion.div)`
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${shadows.md};
  overflow: hidden;
  margin-bottom: 20px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${shadows.lg};
    transform: translateY(-2px);
  }
`;

const CardImage = styled.div<{ $imageUrl?: string }>`
  width: 100%;
  height: 180px;
  background: ${(props) =>
    props.$imageUrl
      ? `url(${props.$imageUrl}) center/cover no-repeat`
      : `linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.creamMedium} 100%)`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.primary};
  font-size: 40px;
  position: relative;

  @media (max-width: 480px) {
    height: 140px;
  }
`;

const CardBody = styled.div`
  padding: 24px;

  @media (max-width: 480px) {
    padding: 20px 16px;
  }
`;

const ActivityTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: ${colors.secondary};
  margin: 0 0 12px;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${colors.textSecondary};

  .anticon {
    color: ${colors.primary};
    font-size: 14px;
  }
`;

const Description = styled.p`
  font-size: 14px;
  color: ${colors.textPrimary};
  line-height: 1.7;
  margin: 0;
`;

const DetailSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${colors.creamDark};
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
`;

const DetailIcon = styled.span`
  color: ${colors.primary};
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 1px;
`;

const DetailLabel = styled.span`
  color: ${colors.textSecondary};
  font-weight: 500;
  min-width: 80px;
`;

const DetailValue = styled.span`
  color: ${colors.textPrimary};
`;

const ColorDots = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
`;

const ColorDot = styled.div<{ $color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${(props) => props.$color};
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 60px 20px;
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${colors.borderGold};
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.creamLight} 0%, ${colors.creamMedium} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 32px;
  color: ${colors.primary};
`;

const EmptyTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.secondary};
  margin: 0 0 8px;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin: 0;
`;

const ThingsToDoSection: React.FC = () => {
  const { portalData } = useGuestPortal();

  if (!portalData) return null;

  // Filter for "Things to Do" activities (requires_signup === false)
  const thingsToDo = (portalData.activities || []).filter(
    (a: any) => a.requires_signup === false
  );

  const formatDateTime = (dateTime: string) => {
    return dayjs(dateTime).format('ddd, MMM D [at] h:mm A');
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  if (thingsToDo.length === 0) {
    return (
      <SectionWrapper>
        <SectionHeader
          title="Things to Do"
          arabicTitle="أنشطة مقترحة"
          subtitle="Explore activities and things to do during your stay"
        />
        <EmptyState
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <EmptyIcon>
            <CompassOutlined />
          </EmptyIcon>
          <EmptyTitle>Coming Soon</EmptyTitle>
          <EmptyText>Activity suggestions will be added shortly!</EmptyText>
        </EmptyState>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper>
      <SectionHeader
        title="Things to Do"
        arabicTitle="أنشطة مقترحة"
        subtitle="Explore activities and things to do during your stay"
      />

      {thingsToDo.map((activity: any, index: number) => (
        <ActivityCard
          key={activity.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
        >
          {activity.image_url && (
            <CardImage $imageUrl={getImageUrl(activity.image_url)} />
          )}

          <CardBody>
            <ActivityTitle>
              {activity.activity_name || activity.title}
            </ActivityTitle>

            <MetaRow>
              {(activity.date_time || activity.start_time) && (
                <MetaItem>
                  <CalendarOutlined />
                  {formatDateTime(activity.date_time || activity.start_time)}
                </MetaItem>
              )}
              {activity.duration_minutes && (
                <MetaItem>
                  <ClockCircleOutlined />
                  {formatDuration(activity.duration_minutes)}
                </MetaItem>
              )}
              {activity.location && (
                <MetaItem>
                  <EnvironmentOutlined />
                  {activity.location}
                </MetaItem>
              )}
            </MetaRow>

            {activity.description && (
              <Description>{activity.description}</Description>
            )}

            {(activity.dress_code_info || activity.dress_colors?.length > 0 || activity.food_description || activity.dietary_options?.length > 0) && (
              <DetailSection>
                {activity.dress_code_info && (
                  <DetailRow>
                    <DetailIcon><SkinOutlined /></DetailIcon>
                    <DetailLabel>Dress Code:</DetailLabel>
                    <DetailValue>{activity.dress_code_info}</DetailValue>
                  </DetailRow>
                )}
                {activity.dress_colors?.length > 0 && (
                  <DetailRow>
                    <DetailIcon><SkinOutlined /></DetailIcon>
                    <DetailLabel>Colors:</DetailLabel>
                    <ColorDots>
                      {activity.dress_colors.map((c: any, i: number) => (
                        <ColorDot key={i} $color={c.hex || c} title={c.name || ''} />
                      ))}
                    </ColorDots>
                  </DetailRow>
                )}
                {activity.food_description && (
                  <DetailRow>
                    <DetailIcon><CoffeeOutlined /></DetailIcon>
                    <DetailLabel>Food:</DetailLabel>
                    <DetailValue>{activity.food_description}</DetailValue>
                  </DetailRow>
                )}
                {activity.dietary_options?.length > 0 && (
                  <DetailRow>
                    <DetailIcon><CoffeeOutlined /></DetailIcon>
                    <DetailLabel>Dietary:</DetailLabel>
                    <DetailValue>{activity.dietary_options.join(', ')}</DetailValue>
                  </DetailRow>
                )}
              </DetailSection>
            )}

            {activity.notes && (
              <DetailSection>
                <Description style={{ fontStyle: 'italic', color: colors.textSecondary }}>
                  {activity.notes}
                </Description>
              </DetailSection>
            )}
          </CardBody>
        </ActivityCard>
      ))}
    </SectionWrapper>
  );
};

export default ThingsToDoSection;
