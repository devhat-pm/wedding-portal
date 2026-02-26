import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  message,
  Spin,
  Divider,
  Tag,
  Row,
  Col,
} from 'antd';
import {
  RobotOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import styled from '@emotion/styled';
import { colors, borderRadius } from '../../../styles/theme';
import {
  getAdminChatbotSettings,
  updateAdminChatbotSettings,
  type ChatbotSettings,
} from '../../../services/chatbot.api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PageWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const StyledCard = styled(Card)`
  border-radius: ${borderRadius.lg}px;
  margin-bottom: 24px;

  .ant-card-head {
    border-bottom: 1px solid ${colors.creamDark};
  }
`;

const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-weight: 600;
  color: ${colors.secondary};
`;

const QuestionTag = styled(Tag)`
  margin-bottom: 8px;
  padding: 4px 12px;
  border-radius: 16px;
`;

const ChatbotSettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionsEn, setQuestionsEn] = useState<string[]>([]);
  const [questionsAr, setQuestionsAr] = useState<string[]>([]);
  const [newQuestionEn, setNewQuestionEn] = useState('');
  const [newQuestionAr, setNewQuestionAr] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getAdminChatbotSettings();
        form.setFieldsValue({
          chatbot_name: data.chatbot_name,
          greeting_message_en: data.greeting_message_en,
          greeting_message_ar: data.greeting_message_ar,
        });
        setQuestionsEn(data.suggested_questions_en || []);
        setQuestionsAr(data.suggested_questions_ar || []);
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      await updateAdminChatbotSettings({
        chatbot_name: values.chatbot_name,
        greeting_message_en: values.greeting_message_en,
        greeting_message_ar: values.greeting_message_ar,
        suggested_questions_en: questionsEn,
        suggested_questions_ar: questionsAr,
      });

      message.success('Chatbot settings saved!');
    } catch {
      message.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addQuestionEn = () => {
    if (!newQuestionEn.trim()) return;
    setQuestionsEn((prev) => [...prev, newQuestionEn.trim()]);
    setNewQuestionEn('');
  };

  const addQuestionAr = () => {
    if (!newQuestionAr.trim()) return;
    setQuestionsAr((prev) => [...prev, newQuestionAr.trim()]);
    setNewQuestionAr('');
  };

  if (loading) {
    return (
      <PageWrapper>
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Space style={{ marginBottom: 24 }}>
        <RobotOutlined style={{ fontSize: 24, color: colors.primary }} />
        <Title level={3} style={{ margin: 0 }}>
          Chatbot Settings
        </Title>
      </Space>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Customize Rada, your AI wedding assistant that helps guests with questions.
      </Text>

      <Form form={form} layout="vertical">
        <StyledCard title="General">
          <Form.Item
            name="chatbot_name"
            label="Chatbot Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder="e.g., Rada" style={{ maxWidth: 300 }} />
          </Form.Item>
        </StyledCard>

        <StyledCard title="Greeting Messages">
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item name="greeting_message_en" label="English Greeting">
                <TextArea
                  rows={3}
                  placeholder="Hello! I'm Rada, your wedding assistant..."
                />
              </Form.Item>
            </Col>
          </Row>
        </StyledCard>

        <StyledCard title="Suggested Questions">
          <SectionLabel>English Questions</SectionLabel>
          <div style={{ marginBottom: 12 }}>
            {questionsEn.map((q, i) => (
              <QuestionTag
                key={i}
                closable
                onClose={() => setQuestionsEn((prev) => prev.filter((_, idx) => idx !== i))}
              >
                {q}
              </QuestionTag>
            ))}
          </div>
          <Space>
            <Input
              placeholder="Add a question..."
              value={newQuestionEn}
              onChange={(e) => setNewQuestionEn(e.target.value)}
              onPressEnter={addQuestionEn}
              style={{ width: 300 }}
            />
            <Button icon={<PlusOutlined />} onClick={addQuestionEn} disabled={!newQuestionEn.trim()}>
              Add
            </Button>
          </Space>

        </StyledCard>

        <Button
          type="primary"
          icon={<SaveOutlined />}
          size="large"
          loading={saving}
          onClick={handleSave}
          style={{ background: colors.primary, borderColor: colors.primary }}
        >
          Save Settings
        </Button>
      </Form>
    </PageWrapper>
  );
};

export default ChatbotSettingsPage;
