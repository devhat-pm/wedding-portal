import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Tag, Tabs, message, Checkbox, Modal } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  StarFilled,
} from '@ant-design/icons';
import { useGuestPortal } from '../../../context/GuestPortalContext';
import { SectionHeader } from '../../../components/guest';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import type { Activity } from '../../../types';

// Styled components
const SectionWrapper = styled.section`
  min-height: 100vh;
  padding: 80px 24px;
  background: linear-gradient(180deg, ${colors.cream} 0%, ${colors.creamLight} 100%);
  position: relative;

  @media (min-width: 768px) {
    padding: 100px 40px;
  }

  @media (max-width: 480px) {
    padding: 60px 16px;
  }
`;

const ContentContainer = styled.div`
  max-width: 920px;
  margin: 0 auto;
`;

const DayTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 32px;

    &::before {
      border-bottom-color: ${colors.borderGold};
    }
  }

  .ant-tabs-tab {
    font-family: 'Playfair Display', serif;
    font-size: 14px;
    padding: 12px 20px;
    color: ${colors.textSecondary};
    transition: all 0.3s ease;

    &:hover {
      color: ${colors.primary};
    }
  }

  .ant-tabs-tab-active {
    .ant-tabs-tab-btn {
      color: ${colors.primary} !important;
      font-weight: 600;
    }
  }

  .ant-tabs-ink-bar {
    background: ${colors.primary};
    height: 3px;
    border-radius: 2px;
  }
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 40px;

  &::before {
    content: '';
    position: absolute;
    left: 12px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(
      180deg,
      ${colors.primary} 0%,
      ${colors.borderGold} 50%,
      ${colors.primary} 100%
    );
  }
`;

const TimelineItem = styled(motion.div)`
  position: relative;
  margin-bottom: 28px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TimelineDot = styled.div<{ $registered: boolean; $featured: boolean }>`
  position: absolute;
  left: -40px;
  top: 24px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  z-index: 1;

  ${(props) => {
    if (props.$registered) {
      return `
        background: ${colors.success};
        color: white;
        box-shadow: 0 0 0 4px rgba(82, 196, 26, 0.2);
      `;
    }
    if (props.$featured) {
      return `
        background: ${colors.primary};
        color: white;
        box-shadow: 0 0 0 4px rgba(183, 168, 154, 0.2);
      `;
    }
    return `
      background: ${colors.cardBg};
      color: ${colors.primary};
      border: 2px solid ${colors.borderGold};
    `;
  }}
`;

const ActivityCard = styled(motion.div)<{ $registered: boolean }>`
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${(props) => (props.$registered ? colors.success : colors.borderGold)};
  box-shadow: ${shadows.md};
  overflow: hidden;
  transition: all 0.3s ease;

  ${(props) =>
    props.$registered &&
    `
    background: linear-gradient(135deg, ${colors.cardBg} 0%, rgba(82, 196, 26, 0.05) 100%);
  `}

  &:hover {
    box-shadow: ${shadows.lg};
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${colors.creamDark};
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const TimeBlock = styled.div`
  text-align: center;
  min-width: 60px;
`;

const TimeValue = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  font-weight: 600;
  color: ${colors.primary};
  line-height: 1;
`;

const TimePeriod = styled.div`
  font-size: 11px;
  color: ${colors.textSecondary};
  text-transform: uppercase;
  margin-top: 4px;
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.secondary};
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FeaturedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.goldDark} 100%);
  color: white;
  font-size: 10px;
  font-family: inherit;
  padding: 2px 8px;
  border-radius: 10px;
`;

const ActivityMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: ${colors.textSecondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  .anticon {
    color: ${colors.primary};
    font-size: 14px;
  }
`;

const CardBody = styled.div`
  padding: 20px 24px;
`;

const ActivityDescription = styled.p`
  font-size: 14px;
  color: ${colors.textPrimary};
  line-height: 1.7;
  margin: 0 0 16px;
`;

const CapacityBar = styled.div`
  margin-bottom: 16px;
`;

const CapacityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const CapacityLabel = styled.span`
  font-size: 12px;
  color: ${colors.textSecondary};
`;

const CapacityValue = styled.span<{ $almostFull: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${(props) => (props.$almostFull ? '#9A9187' : colors.primary)};
`;

const CapacityTrack = styled.div`
  height: 6px;
  background: ${colors.creamMedium};
  border-radius: 3px;
  overflow: hidden;
`;

const CapacityFill = styled(motion.div)<{ $percentage: number; $almostFull: boolean }>`
  height: 100%;
  background: ${(props) =>
    props.$almostFull
      ? 'linear-gradient(90deg, #B7A89A 0%, #9A9187 100%)'
      : `linear-gradient(90deg, ${colors.primary} 0%, ${colors.goldDark} 100%)`};
  border-radius: 3px;
`;

const CardFooter = styled.div`
  padding: 16px 24px;
  background: ${colors.creamLight};
  border-top: 1px solid ${colors.creamDark};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RegisteredBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${colors.success};
  font-weight: 500;
  font-size: 14px;

  .anticon {
    font-size: 18px;
  }
`;

const RegisterButton = styled(Button)`
  && {
    background: ${colors.primary};
    border-color: ${colors.primary};
    height: 40px;
    padding: 0 24px;
    border-radius: ${borderRadius.md}px;
    font-weight: 500;

    &:hover {
      background: ${colors.goldDark};
      border-color: ${colors.goldDark};
    }
  }
`;

const UnregisterButton = styled(Button)`
  && {
    border-color: ${colors.borderGold};
    color: ${colors.textSecondary};
    height: 40px;
    padding: 0 24px;
    border-radius: ${borderRadius.md}px;

    &:hover {
      color: #9A9187;
      border-color: #9A9187;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: ${colors.textSecondary};
  margin: 0;
`;

const SummaryCard = styled(motion.div)`
  background: linear-gradient(135deg, ${colors.secondary} 0%, #1a1a2e 100%);
  border-radius: ${borderRadius.xl}px;
  padding: 24px;
  margin-bottom: 32px;
  color: white;
`;

const SummaryTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SummaryStats = styled.div`
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 600;
  color: ${colors.primary};
`;

const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;

// Format time to 12-hour format
const formatTime = (timeString: string) => {
  if (!timeString) return { time: '--:--', period: '' };

  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return {
    time: `${displayHours}:${minutes.toString().padStart(2, '0')}`,
    period,
  };
};

// Format date to display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

const ActivitiesSection: React.FC = () => {
  const { portalData, updateActivityRegistration } = useGuestPortal();
  const [loading, setLoading] = useState<number | null>(null);

  // Get activities and group by date
  const activities = portalData?.activities || [];
  const registeredActivityIds = portalData?.guest?.registered_activities || [];

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, Activity[]> = {};

    activities.forEach((activity) => {
      const date = activity.activity_date || 'Other';
      if (!groups[date]) groups[date] = [];
      groups[date].push(activity);
    });

    // Sort activities within each group by start time
    Object.keys(groups).forEach((date) => {
      groups[date].sort((a, b) => {
        if (!a.start_time || !b.start_time) return 0;
        return a.start_time.localeCompare(b.start_time);
      });
    });

    return groups;
  }, [activities]);

  const sortedDates = Object.keys(groupedActivities).sort();

  // Calculate summary stats
  const totalActivities = activities.length;
  const registeredCount = registeredActivityIds.length;
  const featuredCount = activities.filter((a) => a.is_featured).length;

  // Handle registration toggle
  const handleToggleRegistration = async (activityId: number, isCurrentlyRegistered: boolean) => {
    setLoading(activityId);
    try {
      let updatedIds: number[];
      if (isCurrentlyRegistered) {
        updatedIds = registeredActivityIds.filter((id) => id !== activityId);
      } else {
        updatedIds = [...registeredActivityIds, activityId];
      }

      await updateActivityRegistration(updatedIds);
      message.success(
        isCurrentlyRegistered ? 'Registration cancelled' : 'Successfully registered!'
      );
    } catch (error) {
      message.error('Failed to update registration');
    } finally {
      setLoading(null);
    }
  };

  const isActivityFull = (activity: Activity) => {
    if (!activity.capacity) return false;
    return (activity.registered_count || 0) >= activity.capacity;
  };

  const getCapacityPercentage = (activity: Activity) => {
    if (!activity.capacity) return 0;
    return ((activity.registered_count || 0) / activity.capacity) * 100;
  };

  if (activities.length === 0) {
    return (
      <SectionWrapper id="activities">
        <ContentContainer>
          <SectionHeader
            title="Activities & Events"
            arabicTitle="الأنشطة والفعاليات"
            subtitle="Explore the wedding events and activities"
          />
          <EmptyState>
            <EmptyIcon>🎉</EmptyIcon>
            <EmptyText>Activity schedule will be announced soon!</EmptyText>
          </EmptyState>
        </ContentContainer>
      </SectionWrapper>
    );
  }

  const tabItems = sortedDates.map((date) => ({
    key: date,
    label: formatDate(date),
    children: (
      <Timeline>
        {groupedActivities[date].map((activity, index) => {
          const isRegistered = registeredActivityIds.includes(activity.id);
          const isFull = isActivityFull(activity);
          const capacityPercentage = getCapacityPercentage(activity);
          const almostFull = capacityPercentage >= 80;
          const startTime = formatTime(activity.start_time || '');
          const endTime = formatTime(activity.end_time || '');

          return (
            <TimelineItem
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <TimelineDot $registered={isRegistered} $featured={activity.is_featured || false}>
                {isRegistered ? (
                  <CheckCircleOutlined />
                ) : activity.is_featured ? (
                  <StarFilled />
                ) : (
                  <CalendarOutlined />
                )}
              </TimelineDot>

              <ActivityCard $registered={isRegistered}>
                <CardHeader>
                  <TimeBlock>
                    <TimeValue>{startTime.time}</TimeValue>
                    <TimePeriod>{startTime.period}</TimePeriod>
                  </TimeBlock>

                  <HeaderContent>
                    <ActivityTitle>
                      {activity.title}
                      {activity.is_featured && (
                        <FeaturedBadge>
                          <StarFilled /> Featured
                        </FeaturedBadge>
                      )}
                    </ActivityTitle>
                    <ActivityMeta>
                      {activity.end_time && (
                        <MetaItem>
                          <ClockCircleOutlined />
                          {startTime.time} {startTime.period} - {endTime.time} {endTime.period}
                        </MetaItem>
                      )}
                      {activity.location && (
                        <MetaItem>
                          <EnvironmentOutlined />
                          {activity.location}
                        </MetaItem>
                      )}
                      {activity.capacity && (
                        <MetaItem>
                          <TeamOutlined />
                          {activity.capacity} spots
                        </MetaItem>
                      )}
                    </ActivityMeta>
                  </HeaderContent>
                </CardHeader>

                <CardBody>
                  {activity.description && (
                    <ActivityDescription>{activity.description}</ActivityDescription>
                  )}

                  {activity.capacity && (
                    <CapacityBar>
                      <CapacityHeader>
                        <CapacityLabel>
                          <TeamOutlined style={{ marginRight: 6 }} />
                          Capacity
                        </CapacityLabel>
                        <CapacityValue $almostFull={almostFull}>
                          {activity.registered_count || 0} / {activity.capacity} registered
                        </CapacityValue>
                      </CapacityHeader>
                      <CapacityTrack>
                        <CapacityFill
                          $percentage={capacityPercentage}
                          $almostFull={almostFull}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </CapacityTrack>
                    </CapacityBar>
                  )}
                </CardBody>

                {activity.requires_registration !== false && (
                  <CardFooter>
                    {isRegistered ? (
                      <>
                        <RegisteredBadge>
                          <CheckCircleOutlined />
                          You're registered
                        </RegisteredBadge>
                        <UnregisterButton
                          onClick={() => handleToggleRegistration(activity.id, true)}
                          loading={loading === activity.id}
                        >
                          Cancel Registration
                        </UnregisterButton>
                      </>
                    ) : (
                      <>
                        {isFull ? (
                          <Tag color="red" style={{ margin: 0 }}>
                            Fully Booked
                          </Tag>
                        ) : (
                          <span style={{ fontSize: 13, color: colors.textSecondary }}>
                            <InfoCircleOutlined style={{ marginRight: 6 }} />
                            Registration required
                          </span>
                        )}
                        <RegisterButton
                          type="primary"
                          onClick={() => handleToggleRegistration(activity.id, false)}
                          loading={loading === activity.id}
                          disabled={isFull}
                        >
                          Register Now
                        </RegisterButton>
                      </>
                    )}
                  </CardFooter>
                )}
              </ActivityCard>
            </TimelineItem>
          );
        })}
      </Timeline>
    ),
  }));

  return (
    <SectionWrapper id="activities">
      <ContentContainer>
        <SectionHeader
          title="Activities & Events"
          arabicTitle="الأنشطة والفعاليات"
          subtitle="Register for the activities you'd like to attend"
        />

        <SummaryCard
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SummaryTitle>
            <StarFilled />
            Your Activity Summary
          </SummaryTitle>
          <SummaryStats>
            <StatItem>
              <StatValue>{totalActivities}</StatValue>
              <StatLabel>Total Events</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{registeredCount}</StatValue>
              <StatLabel>Registered</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{featuredCount}</StatValue>
              <StatLabel>Featured</StatLabel>
            </StatItem>
          </SummaryStats>
        </SummaryCard>

        {sortedDates.length === 1 ? (
          <Timeline>
            {groupedActivities[sortedDates[0]].map((activity, index) => {
              const isRegistered = registeredActivityIds.includes(activity.id);
              const isFull = isActivityFull(activity);
              const capacityPercentage = getCapacityPercentage(activity);
              const almostFull = capacityPercentage >= 80;
              const startTime = formatTime(activity.start_time || '');
              const endTime = formatTime(activity.end_time || '');

              return (
                <TimelineItem
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <TimelineDot $registered={isRegistered} $featured={activity.is_featured || false}>
                    {isRegistered ? (
                      <CheckCircleOutlined />
                    ) : activity.is_featured ? (
                      <StarFilled />
                    ) : (
                      <CalendarOutlined />
                    )}
                  </TimelineDot>

                  <ActivityCard $registered={isRegistered}>
                    <CardHeader>
                      <TimeBlock>
                        <TimeValue>{startTime.time}</TimeValue>
                        <TimePeriod>{startTime.period}</TimePeriod>
                      </TimeBlock>

                      <HeaderContent>
                        <ActivityTitle>
                          {activity.title}
                          {activity.is_featured && (
                            <FeaturedBadge>
                              <StarFilled /> Featured
                            </FeaturedBadge>
                          )}
                        </ActivityTitle>
                        <ActivityMeta>
                          {activity.end_time && (
                            <MetaItem>
                              <ClockCircleOutlined />
                              {startTime.time} {startTime.period} - {endTime.time} {endTime.period}
                            </MetaItem>
                          )}
                          {activity.location && (
                            <MetaItem>
                              <EnvironmentOutlined />
                              {activity.location}
                            </MetaItem>
                          )}
                          {activity.capacity && (
                            <MetaItem>
                              <TeamOutlined />
                              {activity.capacity} spots
                            </MetaItem>
                          )}
                        </ActivityMeta>
                      </HeaderContent>
                    </CardHeader>

                    <CardBody>
                      {activity.description && (
                        <ActivityDescription>{activity.description}</ActivityDescription>
                      )}

                      {activity.capacity && (
                        <CapacityBar>
                          <CapacityHeader>
                            <CapacityLabel>
                              <TeamOutlined style={{ marginRight: 6 }} />
                              Capacity
                            </CapacityLabel>
                            <CapacityValue $almostFull={almostFull}>
                              {activity.registered_count || 0} / {activity.capacity} registered
                            </CapacityValue>
                          </CapacityHeader>
                          <CapacityTrack>
                            <CapacityFill
                              $percentage={capacityPercentage}
                              $almostFull={almostFull}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                          </CapacityTrack>
                        </CapacityBar>
                      )}
                    </CardBody>

                    {activity.requires_registration !== false && (
                      <CardFooter>
                        {isRegistered ? (
                          <>
                            <RegisteredBadge>
                              <CheckCircleOutlined />
                              You're registered
                            </RegisteredBadge>
                            <UnregisterButton
                              onClick={() => handleToggleRegistration(activity.id, true)}
                              loading={loading === activity.id}
                            >
                              Cancel Registration
                            </UnregisterButton>
                          </>
                        ) : (
                          <>
                            {isFull ? (
                              <Tag color="red" style={{ margin: 0 }}>
                                Fully Booked
                              </Tag>
                            ) : (
                              <span style={{ fontSize: 13, color: colors.textSecondary }}>
                                <InfoCircleOutlined style={{ marginRight: 6 }} />
                                Registration required
                              </span>
                            )}
                            <RegisterButton
                              type="primary"
                              onClick={() => handleToggleRegistration(activity.id, false)}
                              loading={loading === activity.id}
                              disabled={isFull}
                            >
                              Register Now
                            </RegisterButton>
                          </>
                        )}
                      </CardFooter>
                    )}
                  </ActivityCard>
                </TimelineItem>
              );
            })}
          </Timeline>
        ) : (
          <DayTabs items={tabItems} defaultActiveKey={sortedDates[0]} />
        )}
      </ContentContainer>
    </SectionWrapper>
  );
};

export default ActivitiesSection;
