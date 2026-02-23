import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Empty,
  Spin,
  message,
  Popconfirm,
  Tabs,
  Badge,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  StarOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import ActivityForm from './ActivityForm';
import { GoldDivider } from '../../../components';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import type { Activity } from '../../../types';
import * as activitiesApi from '../../../services/activities.api';
import { getImageUrl } from '../../../utils/helpers';

const { Title, Text, Paragraph } = Typography;

const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const DayTabs = styled(Tabs)`
  && {
    .ant-tabs-tab {
      padding: 12px 20px;
      font-weight: 500;
    }

    .ant-tabs-tab-active {
      .ant-tabs-tab-btn {
        color: ${colors.primary};
      }
    }

    .ant-tabs-ink-bar {
      background: ${colors.primary};
    }
  }
`;

const TimelineWrapper = styled.div`
  position: relative;
  padding-left: 40px;

  &::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, ${colors.borderGold} 0%, ${colors.creamDark} 100%);
  }
`;

const TimelineItem = styled(motion.div)`
  position: relative;
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TimelineDot = styled.div<{ $isFirst?: boolean }>`
  position: absolute;
  left: -33px;
  top: 24px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${(props) => (props.$isFirst ? colors.primary : colors.creamDark)};
  border: 3px solid ${colors.cardBg};
  box-shadow: 0 0 0 2px ${(props) => (props.$isFirst ? colors.primary : colors.borderGold)};
  z-index: 1;
`;

const ActivityCard = styled(Card)`
  && {
    border-radius: ${borderRadius.xl}px;
    border: 1px solid ${colors.borderGold};
    box-shadow: ${shadows.sm};
    overflow: hidden;

    &:hover {
      box-shadow: ${shadows.md};
      border-color: ${colors.primary};
    }

    .ant-card-body {
      padding: 0;
    }
  }
`;

const ActivityCardContent = styled.div`
  display: flex;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActivityImage = styled.div<{ $imageUrl?: string }>`
  width: 180px;
  min-width: 180px;
  min-height: 140px;
  background: ${(props) =>
    props.$imageUrl
      ? `url(${props.$imageUrl}) center/cover no-repeat`
      : `linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.creamMedium} 100%)`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.primary};
  font-size: 32px;

  @media (max-width: 768px) {
    width: 100%;
    height: 160px;
  }
`;

const ActivityInfo = styled.div`
  flex: 1;
  min-width: 0;
  padding: 20px 0;
`;

const ActivityTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.secondary};
  margin: 0 0 8px;
`;

const ActivityMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 12px 0;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${colors.textSecondary};
  font-size: 13px;
`;

const CapacityWrapper = styled.div`
  margin-top: 12px;
  max-width: 200px;
`;

const CardActions = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
  border-left: 1px solid ${colors.creamDark};
  min-width: 120px;

  @media (max-width: 768px) {
    flex-direction: row;
    border-left: none;
    border-top: 1px solid ${colors.creamDark};
    padding: 12px 20px;
    justify-content: flex-end;
  }
`;

const TimeTag = styled(Tag)`
  && {
    font-size: 14px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 8px;
    background: ${colors.goldPale};
    border-color: ${colors.borderGold};
    color: ${colors.primary};
    margin-bottom: 12px;
  }
`;

const EmptyStateWrapper = styled.div`
  padding: 60px 20px;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.creamLight} 0%, ${colors.creamMedium} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 48px;
  color: ${colors.primary};
`;

const TypeFilterWrapper = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const TypeFilterButton = styled.button<{ $active: boolean; $variant: 'all' | 'main' | 'things' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${(props) => (props.$active ? colors.primary : colors.creamDark)};
  background: ${(props) => (props.$active ? colors.goldPale : 'white')};
  color: ${(props) => (props.$active ? colors.primary : colors.textSecondary)};
  cursor: pointer;
  font-weight: ${(props) => (props.$active ? 600 : 400)};
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${colors.primary};
    background: ${colors.goldPale};
  }
`;

const TypeBadge = styled(Tag)<{ $isMainEvent: boolean }>`
  && {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 12px;
    margin: 0;
    background: ${(props) => (props.$isMainEvent ? colors.goldPale : '#E8F5E9')};
    border-color: ${(props) => (props.$isMainEvent ? colors.borderGold : '#A5D6A7')};
    color: ${(props) => (props.$isMainEvent ? colors.primary : '#2E7D32')};
  }
`;

interface GroupedActivities {
  [date: string]: Activity[];
}

const ActivityList: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activeDay, setActiveDay] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'main' | 'things'>('all');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await activitiesApi.getActivities();
      setActivities(data as Activity[]);

      // Set active day to first date
      if (data.length > 0) {
        const firstDate = dayjs(data[0].start_time).format('YYYY-MM-DD');
        setActiveDay(firstDate);
      }
    } catch (error) {
      message.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await activitiesApi.deleteActivity(String(id));
      setActivities((prev) => prev.filter((a) => a.id !== id));
      message.success('Activity deleted');
    } catch (error) {
      message.error('Failed to delete activity');
    }
  };

  const handleFormSubmit = async (data: Partial<Activity>) => {
    try {
      if (editingActivity) {
        const updated = await activitiesApi.updateActivity(String(editingActivity.id), data as any);
        setActivities((prev) =>
          prev.map((a) => (a.id === editingActivity.id ? { ...updated, current_participants: (a as any).current_participants || 0 } as Activity : a))
        );
        message.success('Activity updated');
      } else {
        const created = await activitiesApi.createActivity(data as any);
        setActivities((prev) => [...prev, { ...created, current_participants: 0 } as Activity]);
        message.success('Activity added');
      }
    } catch (error) {
      message.error(editingActivity ? 'Failed to update activity' : 'Failed to add activity');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingActivity(null);
  };

  const formatTime = (time: string) => {
    return dayjs(time).format('h:mm A');
  };

  const formatTimeRange = (start: string, end?: string) => {
    const startFormatted = formatTime(start);
    if (!end) return startFormatted;
    return `${startFormatted} - ${formatTime(end)}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  // Filter activities by type
  const filteredActivities = activities.filter((a) => {
    if (typeFilter === 'main') return a.requires_signup !== false;
    if (typeFilter === 'things') return a.requires_signup === false;
    return true;
  });

  const mainCount = activities.filter((a) => a.requires_signup !== false).length;
  const thingsCount = activities.filter((a) => a.requires_signup === false).length;

  const groupedActivities = (() => {
    const grouped: GroupedActivities = {};
    filteredActivities.forEach((activity) => {
      const date = dayjs(activity.start_time).format('YYYY-MM-DD');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(activity);
    });
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) =>
        dayjs(a.start_time).unix() - dayjs(b.start_time).unix()
      );
    });
    return grouped;
  })();

  const sortedDates = Object.keys(groupedActivities).sort();

  // Reset active day if current one has no activities after filter
  if (sortedDates.length > 0 && !groupedActivities[activeDay]) {
    // Will be set on next render
  }

  const effectiveActiveDay = groupedActivities[activeDay] ? activeDay : sortedDates[0] || '';

  const tabItems = sortedDates.map((date) => ({
    key: date,
    label: (
      <span>
        {dayjs(date).format('ddd, MMM D')}
        <Badge
          count={groupedActivities[date].length}
          style={{
            marginLeft: 8,
            backgroundColor: colors.goldPale,
            color: colors.primary,
          }}
        />
      </span>
    ),
  }));

  return (
    <PageWrapper>
      <PageHeader>
        <div>
          <Title level={2} style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>
            <CalendarOutlined style={{ marginRight: 12, color: colors.primary }} />
            Activities & Events
          </Title>
          <Text type="secondary">
            Plan and manage activities for your wedding celebration
          </Text>
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          Add Activity
        </Button>
      </PageHeader>

      <GoldDivider text={`${activities.length} Activities`} variant="simple" margin="0 0 24px 0" />

      {/* Type Filter */}
      {activities.length > 0 && (
        <TypeFilterWrapper>
          <TypeFilterButton $active={typeFilter === 'all'} $variant="all" onClick={() => setTypeFilter('all')}>
            All ({activities.length})
          </TypeFilterButton>
          <TypeFilterButton $active={typeFilter === 'main'} $variant="main" onClick={() => setTypeFilter('main')}>
            <CalendarOutlined /> Main Events ({mainCount})
          </TypeFilterButton>
          <TypeFilterButton $active={typeFilter === 'things'} $variant="things" onClick={() => setTypeFilter('things')}>
            <CompassOutlined /> Things to Do ({thingsCount})
          </TypeFilterButton>
        </TypeFilterWrapper>
      )}

      {filteredActivities.length > 0 ? (
        <>
          <DayTabs
            activeKey={effectiveActiveDay}
            onChange={setActiveDay}
            items={tabItems}
            style={{ marginBottom: 24 }}
          />

          <TimelineWrapper>
            {groupedActivities[effectiveActiveDay]?.map((activity, index) => {
              const isMainEvent = activity.requires_signup !== false;
              return (
                <TimelineItem
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TimelineDot $isFirst={index === 0} />
                  <ActivityCard>
                    <ActivityCardContent>
                      <ActivityImage $imageUrl={getImageUrl(activity.image_url)}>
                        {!activity.image_url && (isMainEvent ? <StarOutlined /> : <CompassOutlined />)}
                      </ActivityImage>

                      <ActivityInfo>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <TimeTag>
                            <ClockCircleOutlined style={{ marginRight: 6 }} />
                            {formatTimeRange(activity.start_time, activity.end_time)}
                          </TimeTag>
                          <TypeBadge $isMainEvent={isMainEvent}>
                            {isMainEvent ? 'Main Event' : 'Things to Do'}
                          </TypeBadge>
                        </div>

                        <ActivityTitle>{activity.title}</ActivityTitle>

                        {activity.description && (
                          <Paragraph
                            type="secondary"
                            ellipsis={{ rows: 2 }}
                            style={{ marginBottom: 8 }}
                          >
                            {activity.description}
                          </Paragraph>
                        )}

                        <ActivityMeta>
                          {activity.location && (
                            <MetaItem>
                              <EnvironmentOutlined />
                              {activity.location}
                            </MetaItem>
                          )}
                          {isMainEvent && activity.current_participants !== undefined && (
                            <MetaItem>
                              <TeamOutlined />
                              {activity.current_participants} registered
                            </MetaItem>
                          )}
                        </ActivityMeta>

                        {isMainEvent && activity.max_participants && (
                          <CapacityWrapper>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>Capacity</Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {activity.current_participants || 0}/{activity.max_participants}
                              </Text>
                            </div>
                            <Progress
                              percent={Math.round(((activity.current_participants || 0) / activity.max_participants) * 100)}
                              showInfo={false}
                              strokeColor={colors.primary}
                              trailColor={colors.creamDark}
                              size="small"
                            />
                          </CapacityWrapper>
                        )}
                      </ActivityInfo>

                      <CardActions>
                        <Space direction="vertical" size={8}>
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(activity)}
                          >
                            Edit
                          </Button>
                          <Popconfirm
                            title="Delete this activity?"
                            description="This action cannot be undone."
                            onConfirm={() => handleDelete(activity.id)}
                            okText="Delete"
                            okButtonProps={{ danger: true }}
                          >
                            <Button type="text" danger icon={<DeleteOutlined />}>
                              Delete
                            </Button>
                          </Popconfirm>
                        </Space>
                      </CardActions>
                    </ActivityCardContent>
                  </ActivityCard>
                </TimelineItem>
              );
            })}
          </TimelineWrapper>
        </>
      ) : activities.length > 0 ? (
        <Card>
          <EmptyStateWrapper>
            <EmptyStateIcon>
              {typeFilter === 'things' ? <CompassOutlined /> : <CalendarOutlined />}
            </EmptyStateIcon>
            <Title level={4} style={{ color: colors.secondary }}>
              No {typeFilter === 'main' ? 'Main Events' : typeFilter === 'things' ? 'Things to Do' : 'Activities'} Yet
            </Title>
            <Paragraph type="secondary" style={{ maxWidth: 400, margin: '0 auto 24px' }}>
              {typeFilter === 'things'
                ? 'Add informational activities and suggestions for your guests.'
                : 'Create main events that guests can register for.'}
            </Paragraph>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
              Add Activity
            </Button>
          </EmptyStateWrapper>
        </Card>
      ) : (
        <Card>
          <EmptyStateWrapper>
            <EmptyStateIcon>
              <CalendarOutlined />
            </EmptyStateIcon>
            <Title level={4} style={{ color: colors.secondary }}>
              No Activities Added Yet
            </Title>
            <Paragraph type="secondary" style={{ maxWidth: 400, margin: '0 auto 24px' }}>
              Create activities and events to keep your guests informed and engaged.
            </Paragraph>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
              Add First Activity
            </Button>
          </EmptyStateWrapper>
        </Card>
      )}

      <ActivityForm
        open={formOpen}
        activity={editingActivity}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />
    </PageWrapper>
  );
};

export default ActivityList;
