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

const ActivitiesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ActivityCard = styled(motion.div)<{ $themeColor?: string; $fullWidth?: boolean }>`
  background: white;
  border-radius: ${borderRadius.xxl}px;
  border: 1.5px solid ${colors.borderGold};
  box-shadow: ${shadows.md};
  overflow: hidden;
  transition: all 0.3s ease;
  grid-column: ${(props) => props.$fullWidth ? '1 / -1' : 'auto'};

  &:hover {
    box-shadow: ${shadows.lg};
    transform: translateY(-3px);
    border-color: ${(props) => props.$themeColor || colors.primary};
  }
`;

const CardImage = styled.div<{ $imageUrl?: string }>`
  width: 100%;
  height: 180px;
  background: ${(props) =>
    props.$imageUrl
      ? `url(${props.$imageUrl}) center/cover no-repeat`
      : `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.goldDark} 100%)`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 40px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.1));
  }

  @media (max-width: 480px) {
    height: 150px;
  }
`;

const CardBody = styled.div`
  padding: 22px 20px;

  @media (max-width: 480px) {
    padding: 18px 16px;
  }
`;

const ActivityTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 19px;
  color: ${colors.secondary};
  margin: 0 0 12px;
  font-weight: 600;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: ${colors.textSecondary};
  background: ${colors.creamLight};
  padding: 4px 10px;
  border-radius: 20px;

  .anticon {
    color: ${colors.primary};
    font-size: 12px;
  }
`;

const Description = styled.p`
  font-size: 14px;
  color: ${colors.textPrimary};
  line-height: 1.7;
  margin: 0;
`;

const DetailSection = styled.div`
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid ${colors.creamDark};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
`;

const DetailIcon = styled.span`
  color: ${colors.primary};
  font-size: 13px;
  flex-shrink: 0;
  margin-top: 1px;
`;

const DetailLabel = styled.span`
  color: ${colors.textSecondary};
  font-weight: 500;
  min-width: 70px;
  font-size: 12px;
`;

const DetailValue = styled.span`
  color: ${colors.textPrimary};
  font-size: 13px;
`;

const ColorPalette = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  flex-wrap: wrap;
`;

const ColorSwatch = styled.div<{ $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${(props) => props.$color};
  border: 2.5px solid white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
  flex-shrink: 0;
`;

const ColorSwatchLabel = styled.span`
  font-size: 12px;
  color: ${colors.textSecondary};
  margin-left: 2px;
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: ${borderRadius.xxl}px;
  border: 1.5px solid ${colors.borderGold};
  box-shadow: ${shadows.md};
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.creamMedium} 100%);
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
        subtitle="Explore activities and things to do during your stay"
      />

      <ActivitiesGrid>
        {thingsToDo.map((activity: any, index: number) => {
          const themeColor = activity.dress_colors?.[0]?.hex || activity.dress_colors?.[0] || undefined;
          // First item spans full width if there are odd items
          const isFirst = index === 0 && thingsToDo.length > 2;
          return (
            <ActivityCard
              key={activity.id}
              $themeColor={themeColor}
              $fullWidth={isFirst}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              {activity.image_url ? (
                <CardImage $imageUrl={getImageUrl(activity.image_url)} />
              ) : (
                <CardImage>
                  <CompassOutlined />
                </CardImage>
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

                {/* Prominent color palette */}
                {activity.dress_colors?.length > 0 && (
                  <ColorPalette>
                    <SkinOutlined style={{ color: themeColor || colors.primary, fontSize: 14 }} />
                    {activity.dress_colors.map((c: any, i: number) => (
                      <ColorSwatch key={i} $color={c.hex || c} title={c.name || ''} />
                    ))}
                    {activity.dress_colors[0]?.name && (
                      <ColorSwatchLabel>{activity.dress_colors.map((c: any) => c.name).join(', ')}</ColorSwatchLabel>
                    )}
                  </ColorPalette>
                )}

                {activity.description && (
                  <Description>{activity.description}</Description>
                )}

                {(activity.dress_code_info || activity.food_description || activity.dietary_options?.length > 0) && (
                  <DetailSection>
                    {activity.dress_code_info && (
                      <DetailRow>
                        <DetailIcon><SkinOutlined /></DetailIcon>
                        <DetailLabel>Dress Code:</DetailLabel>
                        <DetailValue>{activity.dress_code_info}</DetailValue>
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
                    <Description style={{ fontStyle: 'italic', color: colors.textSecondary, fontSize: 13 }}>
                      {activity.notes}
                    </Description>
                  </DetailSection>
                )}
              </CardBody>
            </ActivityCard>
          );
        })}
      </ActivitiesGrid>
    </SectionWrapper>
  );
};

export default ThingsToDoSection;
