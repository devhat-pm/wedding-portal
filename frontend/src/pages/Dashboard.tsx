import React from 'react';
import { Row, Col, Card, Progress, Typography, Table, Space, Tag } from 'antd';
import {
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  MailOutlined,
  CrownOutlined,
  ManOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageHeader, StatsCard, RSVPTag, VIPBadge, LoadingSpinner } from '../components';
import { useDashboardStats, useGuests, useEvents } from '../hooks';
import { colors } from '../styles/theme';
import { calculatePercentage, formatDateTime } from '../utils/helpers';
import { RSVPStatus } from '../types';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: guestsData, isLoading: guestsLoading } = useGuests(1, 5, 'created_at', 'desc');
  const { data: events, isLoading: eventsLoading } = useEvents(true);

  const recentGuests = guestsData?.items || [];
  const upcomingEvents = events?.filter(e => e.is_upcoming).slice(0, 3) || [];

  const guestColumns = [
    {
      title: 'Name',
      dataIndex: 'first_name',
      key: 'name',
      render: (_: any, record: any) => (
        <Space>
          <span>{record.first_name} {record.last_name}</span>
          {record.is_vip && <VIPBadge size="small" />}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'rsvp_status',
      key: 'rsvp_status',
      render: (status: RSVPStatus) => <RSVPTag status={status} size="small" />,
    },
    {
      title: 'Guests',
      dataIndex: 'total_guests',
      key: 'total_guests',
      render: (count: number) => <Tag>{count}</Tag>,
    },
  ];

  if (statsLoading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const confirmedPercentage = calculatePercentage(
    stats?.confirmed_guests || 0,
    stats?.total_guests || 0
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to your wedding guest management system"
      />

      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Total Guests"
            value={stats?.total_guests || 0}
            prefix={<TeamOutlined style={{ color: colors.primary }} />}
            color={colors.secondary}
            loading={statsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Confirmed"
            value={stats?.confirmed_guests || 0}
            prefix={<CheckCircleOutlined style={{ color: colors.success }} />}
            color={colors.success}
            loading={statsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Pending"
            value={stats?.pending_guests || 0}
            prefix={<ClockCircleOutlined style={{ color: colors.warning }} />}
            color={colors.warning}
            loading={statsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Total Attending"
            value={stats?.total_attending || 0}
            prefix={<TeamOutlined style={{ color: colors.accent }} />}
            color={colors.accent}
            loading={statsLoading}
          />
        </Col>
      </Row>

      {/* Second Row Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Declined"
            value={stats?.declined_guests || 0}
            prefix={<CloseCircleOutlined style={{ color: colors.error }} />}
            color={colors.error}
            loading={statsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="VIP Guests"
            value={stats?.vip_guests || 0}
            prefix={<CrownOutlined style={{ color: colors.primary }} />}
            color={colors.primary}
            loading={statsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Bride's Side"
            value={stats?.bride_side_guests || 0}
            prefix={<WomanOutlined style={{ color: '#E5CEC0' }} />}
            color="#E5CEC0"
            loading={statsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Groom's Side"
            value={stats?.groom_side_guests || 0}
            prefix={<ManOutlined style={{ color: '#B7A89A' }} />}
            color="#B7A89A"
            loading={statsLoading}
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* RSVP Progress */}
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: colors.primary }} />
                  <span>RSVP Progress</span>
                </Space>
              }
              style={{
                borderRadius: 16,
                border: '1px solid #D6C7B8',
                height: '100%',
              }}
            >
              <div style={{ textAlign: 'center', padding: 24 }}>
                <Progress
                  type="circle"
                  percent={confirmedPercentage}
                  strokeColor={{
                    '0%': colors.primary,
                    '100%': colors.goldDark,
                  }}
                  strokeWidth={10}
                  size={180}
                  format={(percent) => (
                    <div>
                      <div style={{ fontSize: 36, fontWeight: 600, color: colors.secondary }}>
                        {percent}%
                      </div>
                      <div style={{ color: colors.gray[600], fontSize: 14 }}>Confirmed</div>
                    </div>
                  )}
                />
                <div style={{ marginTop: 24 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text type="secondary">Responded</Text>
                      <div style={{ fontSize: 20, fontWeight: 600 }}>
                        {(stats?.confirmed_guests || 0) + (stats?.declined_guests || 0)}
                      </div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">Remaining</Text>
                      <div style={{ fontSize: 20, fontWeight: 600 }}>
                        {stats?.pending_guests || 0}
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* Recent Guests */}
        <Col xs={24} lg={16}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card
              title={
                <Space>
                  <TeamOutlined style={{ color: colors.primary }} />
                  <span>Recent Guests</span>
                </Space>
              }
              extra={
                <a onClick={() => navigate('/guests')} style={{ color: colors.primary }}>
                  View All
                </a>
              }
              style={{
                borderRadius: 16,
                border: '1px solid #D6C7B8',
                height: '100%',
              }}
            >
              <Table
                columns={guestColumns}
                dataSource={recentGuests}
                rowKey="id"
                pagination={false}
                loading={guestsLoading}
                size="small"
                onRow={(record) => ({
                  onClick: () => navigate(`/guests/${record.id}`),
                  style: { cursor: 'pointer' },
                })}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Upcoming Events */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card
              title={
                <Space>
                  <CalendarOutlined style={{ color: colors.primary }} />
                  <span>Upcoming Events</span>
                </Space>
              }
              extra={
                <a onClick={() => navigate('/events')} style={{ color: colors.primary }}>
                  View All
                </a>
              }
              style={{
                borderRadius: 16,
                border: '1px solid #D6C7B8',
              }}
            >
              {eventsLoading ? (
                <LoadingSpinner size="small" text="" />
              ) : upcomingEvents.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {upcomingEvents.map((event) => (
                    <Col xs={24} sm={8} key={event.id}>
                      <Card
                        hoverable
                        onClick={() => navigate(`/events/${event.id}`)}
                        style={{
                          borderRadius: 12,
                          border: '1px solid #D6C7B8',
                        }}
                      >
                        <Title level={5} style={{ marginBottom: 8 }}>
                          {event.name}
                        </Title>
                        {event.name_arabic && (
                          <Text
                            style={{
                              display: 'block',
                              fontFamily: "'Amiri', serif",
                              direction: 'rtl',
                              marginBottom: 8,
                            }}
                          >
                            {event.name_arabic}
                          </Text>
                        )}
                        <Space direction="vertical" size={4}>
                          <Text type="secondary">
                            <CalendarOutlined /> {formatDateTime(event.start_datetime)}
                          </Text>
                          {event.venue_name && (
                            <Text type="secondary">{event.venue_name}</Text>
                          )}
                          <Tag color="gold">{event.confirmed_guests_count} confirmed</Tag>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Text type="secondary">No upcoming events</Text>
              )}
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
