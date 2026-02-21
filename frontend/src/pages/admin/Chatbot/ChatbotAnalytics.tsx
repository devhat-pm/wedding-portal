import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Space,
  Spin,
  Empty,
  Progress,
} from 'antd';
import {
  RobotOutlined,
  MessageOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
  LikeOutlined,
} from '@ant-design/icons';
import styled from '@emotion/styled';
import { colors, borderRadius } from '../../../styles/theme';
import {
  getChatbotStats,
  getChatLogs,
  type ChatbotStats,
  type ChatLogEntry,
} from '../../../services/chatbot.api';

const { Title, Text } = Typography;

const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const StatCard = styled(Card)`
  border-radius: ${borderRadius.lg}px;
  text-align: center;

  .ant-statistic-title {
    color: ${colors.textSecondary};
    font-size: 13px;
  }

  .ant-statistic-content-value {
    color: ${colors.secondary};
  }
`;

const StyledCard = styled(Card)`
  border-radius: ${borderRadius.lg}px;
  margin-top: 24px;

  .ant-card-head {
    border-bottom: 1px solid ${colors.creamDark};
  }
`;

const TopicBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const TopicLabel = styled.span`
  width: 100px;
  font-size: 13px;
  color: ${colors.textPrimary};
  text-transform: capitalize;
`;

const TOPIC_COLORS: Record<string, string> = {
  rsvp: '#B7A89A',
  schedule: '#87CEEB',
  venue: '#DDA0DD',
  hotel: '#F0E68C',
  travel: '#98FB98',
  dress_code: '#FFB6C1',
  food: '#FFDAB9',
  activities: '#87CEFA',
  gift: '#FFD700',
  general: '#D3D3D3',
};

const ChatbotAnalytics: React.FC = () => {
  const [stats, setStats] = useState<ChatbotStats | null>(null);
  const [logs, setLogs] = useState<ChatLogEntry[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, logsData] = await Promise.all([
          getChatbotStats(),
          getChatLogs(pageSize, 0),
        ]);
        setStats(statsData);
        setLogs(logsData.logs);
        setTotalLogs(logsData.total);
      } catch {
        // Failed
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePageChange = async (newPage: number) => {
    setPage(newPage);
    try {
      const logsData = await getChatLogs(pageSize, (newPage - 1) * pageSize);
      setLogs(logsData.logs);
      setTotalLogs(logsData.total);
    } catch {
      // Failed
    }
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (val: string) => {
        const d = new Date(val);
        return d.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      title: 'User Message',
      dataIndex: 'user_message',
      key: 'user_message',
      ellipsis: true,
    },
    {
      title: 'Bot Response',
      dataIndex: 'bot_response',
      key: 'bot_response',
      ellipsis: true,
      width: 300,
    },
    {
      title: 'Topic',
      dataIndex: 'topic_detected',
      key: 'topic_detected',
      width: 120,
      render: (topic: string | null) =>
        topic ? (
          <Tag color={TOPIC_COLORS[topic] || '#d9d9d9'} style={{ textTransform: 'capitalize' }}>
            {topic.replace('_', ' ')}
          </Tag>
        ) : (
          <Tag>-</Tag>
        ),
    },
    {
      title: 'Lang',
      dataIndex: 'language',
      key: 'language',
      width: 60,
      render: (lang: string) => lang.toUpperCase(),
    },
    {
      title: 'Feedback',
      dataIndex: 'was_helpful',
      key: 'was_helpful',
      width: 90,
      render: (val: boolean | null) => {
        if (val === true) return <Tag color="success">Helpful</Tag>;
        if (val === false) return <Tag color="error">Not helpful</Tag>;
        return <Tag>-</Tag>;
      },
    },
  ];

  if (loading) {
    return (
      <PageWrapper>
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      </PageWrapper>
    );
  }

  if (!stats) {
    return (
      <PageWrapper>
        <Empty description="No chatbot data yet" />
      </PageWrapper>
    );
  }

  const maxTopicCount = Math.max(...Object.values(stats.topics), 1);

  return (
    <PageWrapper>
      <Space style={{ marginBottom: 24 }}>
        <RobotOutlined style={{ fontSize: 24, color: colors.primary }} />
        <Title level={3} style={{ margin: 0 }}>
          Chatbot Analytics
        </Title>
      </Space>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <StatCard>
            <Statistic
              title="Total Messages"
              value={stats.total_messages}
              prefix={<MessageOutlined />}
            />
          </StatCard>
        </Col>
        <Col xs={12} sm={6}>
          <StatCard>
            <Statistic
              title="Unique Sessions"
              value={stats.unique_sessions}
              prefix={<TeamOutlined />}
            />
          </StatCard>
        </Col>
        <Col xs={12} sm={6}>
          <StatCard>
            <Statistic
              title="Unanswered"
              value={stats.unanswered_count}
              prefix={<QuestionCircleOutlined />}
            />
          </StatCard>
        </Col>
        <Col xs={12} sm={6}>
          <StatCard>
            <Statistic
              title="Helpful Rate"
              value={stats.helpful_rate}
              suffix="%"
              prefix={<LikeOutlined />}
            />
          </StatCard>
        </Col>
      </Row>

      {/* Topic Breakdown */}
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <StyledCard title="Topic Breakdown">
            {Object.keys(stats.topics).length === 0 ? (
              <Empty description="No topics detected yet" />
            ) : (
              Object.entries(stats.topics)
                .sort((a, b) => b[1] - a[1])
                .map(([topic, count]) => (
                  <TopicBar key={topic}>
                    <TopicLabel>{topic.replace('_', ' ')}</TopicLabel>
                    <Progress
                      percent={Math.round((count / maxTopicCount) * 100)}
                      showInfo={false}
                      strokeColor={TOPIC_COLORS[topic] || colors.primary}
                      style={{ flex: 1 }}
                    />
                    <Text style={{ width: 40, textAlign: 'right' }}>{count}</Text>
                  </TopicBar>
                ))
            )}
          </StyledCard>
        </Col>
        <Col xs={24} md={12}>
          <StyledCard title="Language Distribution">
            {Object.keys(stats.languages).length === 0 ? (
              <Empty description="No data yet" />
            ) : (
              <Row gutter={16}>
                {Object.entries(stats.languages).map(([lang, count]) => (
                  <Col key={lang} span={12}>
                    <Statistic
                      title={lang === 'ar' ? 'Arabic' : 'English'}
                      value={count}
                      suffix={`/ ${stats.total_messages}`}
                    />
                  </Col>
                ))}
              </Row>
            )}

            <div style={{ marginTop: 24 }}>
              <Text type="secondary">Feedback Summary</Text>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={12}>
                  <Statistic
                    title="Rated"
                    value={stats.rated_count}
                    valueStyle={{ fontSize: 20 }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Helpful"
                    value={stats.helpful_count}
                    valueStyle={{ fontSize: 20, color: '#52c41a' }}
                  />
                </Col>
              </Row>
            </div>
          </StyledCard>
        </Col>
      </Row>

      {/* Conversation Logs */}
      <StyledCard title="Conversation Logs">
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total: totalLogs,
            onChange: handlePageChange,
            showSizeChanger: false,
          }}
          scroll={{ x: 800 }}
          size="small"
        />
      </StyledCard>
    </PageWrapper>
  );
};

export default ChatbotAnalytics;
