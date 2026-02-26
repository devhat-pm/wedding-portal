import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Button,
  Space,
  Progress,
  Spin,
  Empty,
} from 'antd';
import {
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
  BankOutlined,
  CalendarOutlined,
  CameraOutlined,
  UploadOutlined,
  PlusOutlined,
  EyeOutlined,
  HeartOutlined,
  RiseOutlined,
  RightOutlined,
  InboxOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/admin.api';
import { GoldDivider } from '../../components';
import { colors, shadows, borderRadius } from '../../styles/theme';
import type { DashboardStats } from '../../types/wedding.types';

const { Title, Text, Paragraph } = Typography;

const PageWrapper = styled.div`
  padding: 0;
`;

const WelcomeSection = styled(motion.div)`
  background: linear-gradient(135deg, ${colors.secondary} 0%, ${colors.tealDark} 100%);
  border-radius: ${borderRadius.xl}px;
  padding: 32px 40px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
`;

const WelcomePattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='none' stroke='%23B7A89A' stroke-width='0.5' opacity='0.15'/%3E%3C/svg%3E");
  background-size: 60px 60px;
`;

const WelcomeContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
`;

const WelcomeText = styled.div`
  color: ${colors.white};
`;

const CoupleNames = styled(Title)`
  && {
    color: ${colors.white};
    margin: 0 0 8px;
    font-family: 'Playfair Display', serif;
    font-size: 32px;

    span {
      color: ${colors.primary};
    }
  }
`;

const CountdownBox = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: ${borderRadius.lg}px;
  padding: 20px 32px;
  text-align: center;
  border: 1px solid rgba(183, 168, 154, 0.3);
  min-width: 140px;
`;

const CountdownNumber = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 48px;
  font-weight: 700;
  color: ${colors.primary};
  line-height: 1;
`;

const CountdownLabel = styled.div`
  color: ${colors.goldLight};
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 4px;
`;

const StatsCard = styled(motion(Card))`
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${shadows.sm};
  height: 100%;

  .ant-card-body {
    padding: 24px;
  }

  &:hover {
    box-shadow: ${shadows.md};
    border-color: ${colors.primary};
  }
`;

const StatIconWrapper = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: ${colors.goldPale};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: ${colors.primary};
  margin-bottom: 16px;
`;

const QuickActionsCard = styled(Card)`
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${shadows.sm};
  height: 100%;

  .ant-card-head {
    border-bottom-color: ${colors.creamDark};
  }
`;

const QuickActionButton = styled(Button)`
  && {
    height: auto;
    padding: 16px 20px;
    border-radius: ${borderRadius.md}px;
    border: 1px solid ${colors.creamDark};
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    transition: all 0.3s ease;
    background: ${colors.white};

    &:hover {
      border-color: ${colors.primary};
      box-shadow: ${shadows.md};
      transform: translateY(-2px);
    }

    .anticon {
      color: ${colors.primary};
    }
  }
`;

const QuickActionContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const QuickActionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${colors.goldPale};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: ${colors.primary};
`;

const RecentActivityCard = styled(Card)`
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${shadows.sm};
  height: 100%;

  .ant-card-head {
    border-bottom-color: ${colors.creamDark};
  }
`;

const EmptyActivityWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${colors.creamDark};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: ${colors.gray[400]};
  margin-bottom: 16px;
`;

const ActivityList = styled.div`
  padding: 8px 0;
  max-height: 360px;
  overflow-y: auto;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${colors.creamDark};

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityDot = styled.div<{ $type: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
  background: ${(props) => {
    switch (props.$type) {
      case 'rsvp': return colors.success;
      case 'travel': return colors.primary;
      case 'hotel': return colors.warning;
      case 'food': return '#B7A89A';
      case 'dress': return '#E5CEC0';
      case 'activity': return colors.info;
      case 'media': return '#9A9187';
      case 'access': return colors.gray[400];
      default: return colors.gray[400];
    }
  }};
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const RSVPChartCard = styled(Card)`
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${shadows.sm};
  height: 100%;

  .ant-card-head {
    border-bottom-color: ${colors.creamDark};
  }
`;

const RSVPStatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
`;

const RSVPMainStat = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const RSVPNumber = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 56px;
  font-weight: 700;
  color: ${colors.secondary};
  line-height: 1;
`;

const RSVPLabel = styled.div`
  color: ${colors.textSecondary};
  font-size: 14px;
  margin-top: 4px;
`;

const RSVPBreakdown = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  width: 100%;
  padding-top: 16px;
  border-top: 1px solid ${colors.creamDark};
`;

const RSVPItem = styled.div`
  text-align: center;
`;

const RSVPItemDot = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(props) => props.$color};
  margin: 0 auto 6px;
`;

const RSVPItemValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${colors.textPrimary};
`;

const RSVPItemLabel = styled.div`
  font-size: 12px;
  color: ${colors.textSecondary};
`;

const HeadcountCard = styled(motion(Card))`
  border-radius: ${borderRadius.lg}px;
  border: 2px solid ${colors.primary};
  box-shadow: ${shadows.md};
  height: 100%;
  background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.cardBg} 100%);

  .ant-card-body {
    padding: 28px 24px;
  }
`;

const HeadcountMain = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const HeadcountIconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.goldDark} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  flex-shrink: 0;
`;

const HeadcountNumber = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 42px;
  font-weight: 700;
  color: ${colors.secondary};
  line-height: 1;
`;

const HeadcountLabel = styled.div`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin-top: 2px;
`;

const HeadcountSubtext = styled.div`
  font-size: 12px;
  color: ${colors.textSecondary};
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid ${colors.creamDark};
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { wedding, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Parse couple names from the combined field or use fallback
  const getCoupleDisplay = () => {
    if (!wedding?.couple_names) {
      return 'Wedding Portal';
    }
    return wedding.couple_names;
  };

  const calculateDaysUntilWedding = () => {
    if (!wedding?.wedding_date) return { days: null, isPast: false, isToday: false };

    const weddingDate = dayjs(wedding.wedding_date).startOf('day');
    const today = dayjs().startOf('day');
    const days = weddingDate.diff(today, 'day');

    return {
      days: Math.abs(days),
      isPast: days < 0,
      isToday: days === 0,
    };
  };

  const { days: daysUntilWedding, isPast, isToday } = calculateDaysUntilWedding();

  const getCountdownDisplay = () => {
    if (authLoading || daysUntilWedding === null) {
      return { number: '...', label: 'Loading' };
    }
    if (isToday) {
      return { number: '!', label: 'Wedding Day' };
    }
    if (isPast) {
      return { number: daysUntilWedding, label: 'Days Ago' };
    }
    return { number: daysUntilWedding, label: 'Days to Go' };
  };

  const countdownDisplay = getCountdownDisplay();

  if (loading) {
    return (
      <LoadingWrapper>
        <Spin size="large" />
      </LoadingWrapper>
    );
  }

  const totalResponded = (stats?.confirmed_rsvps || 0) + (stats?.declined_rsvps || 0);
  const totalGuests = stats?.total_guests || 0;

  return (
    <PageWrapper>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Welcome Section */}
        <WelcomeSection variants={itemVariants}>
          <WelcomePattern />
          <WelcomeContent>
            <WelcomeText>
              <Text style={{ color: colors.goldLight, fontSize: 14, letterSpacing: '0.1em' }}>
                WELCOME TO YOUR WEDDING PORTAL
              </Text>
              <CoupleNames level={2}>
                {getCoupleDisplay()}
              </CoupleNames>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', margin: 0, maxWidth: 400 }}>
                Manage your guest list, track RSVPs, and coordinate all the details for your special day.
              </Paragraph>
            </WelcomeText>

            <CountdownBox>
              <CountdownNumber>{countdownDisplay.number}</CountdownNumber>
              <CountdownLabel>{countdownDisplay.label}</CountdownLabel>
            </CountdownBox>
          </WelcomeContent>
        </WelcomeSection>

        {/* Primary Stats Row */}
        <GoldDivider text="Guest Overview" variant="ornamental" margin="0 0 24px 0" />

        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard variants={itemVariants}>
              <StatIconWrapper>
                <TeamOutlined />
              </StatIconWrapper>
              <Statistic
                title={<Text type="secondary">Total Guests</Text>}
                value={stats?.total_guests || 0}
                valueStyle={{ color: colors.secondary, fontWeight: 600 }}
              />
            </StatsCard>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatsCard variants={itemVariants}>
              <StatIconWrapper>
                <CheckCircleOutlined />
              </StatIconWrapper>
              <Statistic
                title={<Text type="secondary">Confirmed RSVPs</Text>}
                value={stats?.confirmed_rsvps || 0}
                valueStyle={{ color: colors.success, fontWeight: 600 }}
              />
            </StatsCard>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatsCard variants={itemVariants}>
              <StatIconWrapper>
                <ClockCircleOutlined />
              </StatIconWrapper>
              <Statistic
                title={<Text type="secondary">Pending RSVPs</Text>}
                value={stats?.pending_rsvps || 0}
                valueStyle={{ color: colors.warning, fontWeight: 600 }}
              />
            </StatsCard>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatsCard variants={itemVariants}>
              <StatIconWrapper>
                <CloseCircleOutlined />
              </StatIconWrapper>
              <Statistic
                title={<Text type="secondary">Declined</Text>}
                value={stats?.declined_rsvps || 0}
                valueStyle={{ color: colors.gray[500], fontWeight: 600 }}
              />
            </StatsCard>
          </Col>
        </Row>

        {/* Headcount Row */}
        <GoldDivider text="Expected Headcount" variant="ornamental" margin="0 0 24px 0" />

        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} md={12}>
            <HeadcountCard variants={itemVariants}>
              <HeadcountMain>
                <HeadcountIconWrapper>
                  <UsergroupAddOutlined />
                </HeadcountIconWrapper>
                <div>
                  <HeadcountNumber>{stats?.total_attending || 0}</HeadcountNumber>
                  <HeadcountLabel>Total Attendees</HeadcountLabel>
                </div>
              </HeadcountMain>
              <HeadcountSubtext>
                Total people attending including guests and their party members, based on {stats?.confirmed_rsvps || 0} confirmed RSVP{(stats?.confirmed_rsvps || 0) !== 1 ? 's' : ''}
              </HeadcountSubtext>
            </HeadcountCard>
          </Col>

          <Col xs={24} md={12}>
            <HeadcountCard variants={itemVariants}>
              <HeadcountMain>
                <HeadcountIconWrapper>
                  <TeamOutlined />
                </HeadcountIconWrapper>
                <div>
                  <HeadcountNumber>{stats?.average_party_size || 0}</HeadcountNumber>
                  <HeadcountLabel>Average Party Size</HeadcountLabel>
                </div>
              </HeadcountMain>
              <HeadcountSubtext>
                Average number of attendees per confirmed invitation
              </HeadcountSubtext>
            </HeadcountCard>
          </Col>
        </Row>

        {/* Secondary Stats Row */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard variants={itemVariants}>
              <StatIconWrapper>
                <CarOutlined />
              </StatIconWrapper>
              <Statistic
                title={<Text type="secondary">Travel Info Submitted</Text>}
                value={stats?.travel_info_submitted || 0}
                valueStyle={{ fontWeight: 600 }}
              />
            </StatsCard>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatsCard variants={itemVariants}>
              <StatIconWrapper>
                <BankOutlined />
              </StatIconWrapper>
              <Statistic
                title={<Text type="secondary">Hotel Info Submitted</Text>}
                value={stats?.hotel_info_submitted || 0}
                valueStyle={{ fontWeight: 600 }}
              />
            </StatsCard>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatsCard variants={itemVariants}>
              <StatIconWrapper>
                <CalendarOutlined />
              </StatIconWrapper>
              <Statistic
                title={<Text type="secondary">Activity Registrations</Text>}
                value={stats?.activity_registrations || 0}
                valueStyle={{ fontWeight: 600 }}
              />
            </StatsCard>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatsCard variants={itemVariants}>
              <StatIconWrapper>
                <CameraOutlined />
              </StatIconWrapper>
              <Statistic
                title={<Text type="secondary">Media Pending Approval</Text>}
                value={stats?.media_pending_approval || 0}
                valueStyle={{ fontWeight: 600 }}
              />
            </StatsCard>
          </Col>
        </Row>

        {/* Quick Actions & Charts Row */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} lg={8}>
            <motion.div variants={itemVariants} style={{ height: '100%' }}>
              <QuickActionsCard
                title={
                  <Space>
                    <RiseOutlined style={{ color: colors.primary }} />
                    <span>Quick Actions</span>
                  </Space>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  <QuickActionButton
                    block
                    onClick={() => navigate('/admin/guests')}
                  >
                    <QuickActionContent>
                      <QuickActionIcon>
                        <UploadOutlined />
                      </QuickActionIcon>
                      <div>
                        <div style={{ fontWeight: 500, color: colors.textPrimary }}>Upload Guests</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Import from Excel
                        </Text>
                      </div>
                    </QuickActionContent>
                    <RightOutlined style={{ color: colors.gray[400] }} />
                  </QuickActionButton>

                  <QuickActionButton
                    block
                    onClick={() => navigate('/admin/activities')}
                  >
                    <QuickActionContent>
                      <QuickActionIcon>
                        <PlusOutlined />
                      </QuickActionIcon>
                      <div>
                        <div style={{ fontWeight: 500, color: colors.textPrimary }}>Add Activity</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Create new event
                        </Text>
                      </div>
                    </QuickActionContent>
                    <RightOutlined style={{ color: colors.gray[400] }} />
                  </QuickActionButton>

                  <QuickActionButton
                    block
                    onClick={() => navigate('/admin/media')}
                  >
                    <QuickActionContent>
                      <QuickActionIcon>
                        <EyeOutlined />
                      </QuickActionIcon>
                      <div>
                        <div style={{ fontWeight: 500, color: colors.textPrimary }}>View Media</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Review uploads
                        </Text>
                      </div>
                    </QuickActionContent>
                    <RightOutlined style={{ color: colors.gray[400] }} />
                  </QuickActionButton>
                </Space>
              </QuickActionsCard>
            </motion.div>
          </Col>

          <Col xs={24} lg={8}>
            <motion.div variants={itemVariants} style={{ height: '100%' }}>
              <RSVPChartCard
                title={
                  <Space>
                    <HeartOutlined style={{ color: colors.primary }} />
                    <span>RSVP Status</span>
                  </Space>
                }
              >
                <RSVPStatsContainer>
                  <RSVPMainStat>
                    <RSVPNumber>{totalResponded}</RSVPNumber>
                    <RSVPLabel>Total Responded</RSVPLabel>
                  </RSVPMainStat>

                  {totalGuests > 0 && (
                    <Progress
                      percent={Math.round((totalResponded / totalGuests) * 100)}
                      strokeColor={colors.primary}
                      trailColor={colors.creamDark}
                      style={{ width: '100%', marginBottom: 24 }}
                      format={(percent) => `${percent}% responded`}
                    />
                  )}

                  <RSVPBreakdown>
                    <RSVPItem>
                      <RSVPItemDot $color={colors.success} />
                      <RSVPItemValue>{stats?.confirmed_rsvps || 0}</RSVPItemValue>
                      <RSVPItemLabel>Confirmed</RSVPItemLabel>
                    </RSVPItem>
                    <RSVPItem>
                      <RSVPItemDot $color={colors.warning} />
                      <RSVPItemValue>{stats?.pending_rsvps || 0}</RSVPItemValue>
                      <RSVPItemLabel>Pending</RSVPItemLabel>
                    </RSVPItem>
                    <RSVPItem>
                      <RSVPItemDot $color={colors.gray[400]} />
                      <RSVPItemValue>{stats?.declined_rsvps || 0}</RSVPItemValue>
                      <RSVPItemLabel>Declined</RSVPItemLabel>
                    </RSVPItem>
                  </RSVPBreakdown>
                </RSVPStatsContainer>
              </RSVPChartCard>
            </motion.div>
          </Col>

          <Col xs={24} lg={8}>
            <motion.div variants={itemVariants} style={{ height: '100%' }}>
              <RecentActivityCard
                title={
                  <Space>
                    <ClockCircleOutlined style={{ color: colors.primary }} />
                    <span>Recent Activity</span>
                  </Space>
                }
                bodyStyle={{ padding: '0 24px' }}
              >
                {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                  <ActivityList>
                    {stats.recent_activity.map((item, index) => (
                      <ActivityItem key={index}>
                        <ActivityDot $type={item.action_type} />
                        <ActivityContent>
                          <Text strong style={{ fontSize: 13 }}>{item.guest_name}</Text>
                          <div>
                            <Text style={{ fontSize: 13 }}>{item.action}</Text>
                            {item.detail && (
                              <Text type="secondary" style={{ fontSize: 12 }}> — {item.detail}</Text>
                            )}
                          </div>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {dayjs(item.time).fromNow()}
                          </Text>
                        </ActivityContent>
                      </ActivityItem>
                    ))}
                  </ActivityList>
                ) : (
                  <EmptyActivityWrapper>
                    <EmptyIcon>
                      <InboxOutlined />
                    </EmptyIcon>
                    <Text strong style={{ fontSize: 16, color: colors.textPrimary, marginBottom: 4 }}>
                      No activity yet
                    </Text>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Activity will appear here as guests respond
                    </Text>
                  </EmptyActivityWrapper>
                )}
              </RecentActivityCard>
            </motion.div>
          </Col>
        </Row>
      </motion.div>
    </PageWrapper>
  );
};

export default Dashboard;
