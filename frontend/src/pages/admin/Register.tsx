import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Steps,
  DatePicker,
  message,
  Space,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  HeartOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { adminApi } from '../../services/admin.api';
import { ArabicPattern } from '../../components';
import { colors, shadows, borderRadius } from '../../styles/theme';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${colors.secondary} 0%, ${colors.tealDark} 100%);
  padding: 24px;
  position: relative;
  overflow: hidden;
`;

const PatternOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  opacity: 0.1;
`;

const ContentWrapper = styled(motion.div)`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 600px;
`;

const StyledCard = styled(Card)`
  border-radius: ${borderRadius.xl}px;
  box-shadow: ${shadows.xl};
  border: 2px solid ${colors.goldLight};
  background: ${colors.cardBg};
  overflow: hidden;

  .ant-card-body {
    padding: 40px;
  }

  @media (max-width: 600px) {
    .ant-card-body {
      padding: 24px 20px;
    }
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const HeaderIcon = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.goldDark} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: ${colors.white};
  font-size: 30px;
`;

const StyledSteps = styled(Steps)`
  margin-bottom: 40px;

  .ant-steps-item-title {
    font-size: 13px !important;
  }

  .ant-steps-item-finish .ant-steps-item-icon {
    background: ${colors.success};
    border-color: ${colors.success};
  }

  .ant-steps-item-process .ant-steps-item-icon {
    background: ${colors.primary};
    border-color: ${colors.primary};
  }

  @media (max-width: 576px) {
    .ant-steps-item-title {
      display: none;
    }
  }
`;

const StepContent = styled(motion.div)`
  min-height: 300px;
`;

const StyledForm = styled(Form)`
  .ant-input-affix-wrapper,
  .ant-input,
  .ant-picker {
    border-radius: ${borderRadius.md}px;
    border-color: ${colors.creamDark};

    &:hover, &:focus {
      border-color: ${colors.primary};
    }
  }

  .ant-input-affix-wrapper-focused,
  .ant-picker-focused {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(183, 168, 154, 0.1);
  }

  .ant-form-item-label > label {
    font-weight: 500;
    color: ${colors.textPrimary};
  }
`;

const PreviewCard = styled.div`
  background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.creamLight} 100%);
  border-radius: ${borderRadius.lg}px;
  padding: 24px;
  border: 1px solid ${colors.borderGold};
  margin-top: 16px;
`;

const PreviewTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  color: ${colors.secondary};
  text-align: center;
  margin: 0 0 8px;
`;

const PreviewDate = styled.p`
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  color: ${colors.primary};
  text-align: center;
  margin: 0 0 16px;
`;

const PreviewMessage = styled.div`
  font-style: italic;
  color: ${colors.textSecondary};
  text-align: center;
  line-height: 1.6;
  padding: 16px;
  background: ${colors.white};
  border-radius: ${borderRadius.md}px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 32px;
`;

const PrimaryButton = styled(Button)`
  && {
    height: 46px;
    border-radius: ${borderRadius.md}px;
    font-weight: 600;
    flex: 1;
  }
`;

const SecondaryButton = styled(Button)`
  && {
    height: 46px;
    border-radius: ${borderRadius.md}px;
    border-color: ${colors.creamDark};
    color: ${colors.textSecondary};

    &:hover {
      border-color: ${colors.primary};
      color: ${colors.primary};
    }
  }
`;

const BackToLogin = styled.div`
  text-align: center;
  margin-top: 24px;

  a {
    color: ${colors.primary};
    font-weight: 500;

    &:hover {
      color: ${colors.goldDark};
    }
  }
`;

const BottomAccent = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, ${colors.primary}, ${colors.accent}, ${colors.primary});
  z-index: 10;
`;

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  groomName: string;
  brideName: string;
  weddingDate: dayjs.Dayjs | null;
  venueName: string;
  venueAddress: string;
  welcomeMessage: string;
}

const stepTitles = ['Account', 'Wedding', 'Message'];

const Register: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    groomName: '',
    brideName: '',
    weddingDate: null,
    venueName: '',
    venueAddress: '',
    welcomeMessage: '',
  });
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const updateFormData = (values: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...values }));
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      updateFormData(values);

      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit({ ...formData, ...values });
      }
    } catch (error) {
      // Validation failed
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await adminApi.register({
        admin_email: data.email,
        admin_password: data.password,
        couple_names: `${data.groomName} & ${data.brideName}`,
        wedding_date: data.weddingDate?.toISOString(),
        venue_name: data.venueName || undefined,
        venue_address: data.venueAddress || undefined,
        welcome_message: data.welcomeMessage || undefined,
      });

      message.success('Wedding portal created successfully! Please sign in.');
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Registration failed. Please try again.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepContent
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
              initialValue={formData.email}
            >
              <Input
                prefix={<MailOutlined style={{ color: colors.textSecondary }} />}
                placeholder="your@email.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter a password' },
                { min: 8, message: 'Password must be at least 8 characters' },
              ]}
              initialValue={formData.password}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: colors.textSecondary }} />}
                placeholder="Create a secure password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
              initialValue={formData.confirmPassword}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: colors.textSecondary }} />}
                placeholder="Confirm your password"
                size="large"
              />
            </Form.Item>
          </StepContent>
        );

      case 1:
        return (
          <StepContent
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Space style={{ width: '100%' }} direction="vertical" size={0}>
              <div style={{ display: 'flex', gap: 16 }}>
                <Form.Item
                  name="groomName"
                  label="Groom's Name"
                  rules={[{ required: true, message: 'Required' }]}
                  initialValue={formData.groomName}
                  style={{ flex: 1 }}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: colors.textSecondary }} />}
                    placeholder="Groom's name"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="brideName"
                  label="Bride's Name"
                  rules={[{ required: true, message: 'Required' }]}
                  initialValue={formData.brideName}
                  style={{ flex: 1 }}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: colors.textSecondary }} />}
                    placeholder="Bride's name"
                    size="large"
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="weddingDate"
                label="Wedding Date"
                rules={[{ required: true, message: 'Please select your wedding date' }]}
                initialValue={formData.weddingDate}
              >
                <DatePicker
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="Select wedding date"
                  format="MMMM D, YYYY"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                  suffixIcon={<CalendarOutlined style={{ color: colors.primary }} />}
                />
              </Form.Item>

              <Form.Item
                name="venueName"
                label="Venue Name (Optional)"
                initialValue={formData.venueName}
              >
                <Input
                  prefix={<EnvironmentOutlined style={{ color: colors.textSecondary }} />}
                  placeholder="e.g., The Grand Ballroom"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="venueAddress"
                label="Venue Address (Optional)"
                initialValue={formData.venueAddress}
              >
                <Input
                  prefix={<EnvironmentOutlined style={{ color: colors.textSecondary }} />}
                  placeholder="Full venue address"
                  size="large"
                />
              </Form.Item>
            </Space>
          </StepContent>
        );

      case 2:
        return (
          <StepContent
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Form.Item
              name="welcomeMessage"
              label="Welcome Message (Optional)"
              initialValue={formData.welcomeMessage}
              extra="This message will be shown to guests on your wedding portal"
            >
              <TextArea
                placeholder="We are delighted to invite you to celebrate our special day with us..."
                rows={4}
                maxLength={500}
                showCount
                style={{ resize: 'none' }}
              />
            </Form.Item>

            <PreviewCard>
              <Text
                type="secondary"
                style={{ display: 'block', textAlign: 'center', marginBottom: 16, fontSize: 12 }}
              >
                Preview
              </Text>
              <PreviewTitle>
                {formData.groomName || 'Groom'} & {formData.brideName || 'Bride'}
              </PreviewTitle>
              <PreviewDate>
                {formData.weddingDate
                  ? formData.weddingDate.format('MMMM D, YYYY')
                  : 'Wedding Date'}
              </PreviewDate>
              <PreviewMessage>
                {form.getFieldValue('welcomeMessage') ||
                  formData.welcomeMessage ||
                  'Your welcome message will appear here...'}
              </PreviewMessage>
            </PreviewCard>
          </StepContent>
        );

      default:
        return null;
    }
  };

  return (
    <PageWrapper>
      <PatternOverlay>
        <ArabicPattern variant="stars" color={colors.goldLight} opacity={0.15} />
      </PatternOverlay>

      <ContentWrapper
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <StyledCard>
          <HeaderSection>
            <HeaderIcon>
              <HeartOutlined />
            </HeaderIcon>
            <Title
              level={2}
              style={{
                margin: 0,
                fontFamily: "'Playfair Display', serif",
                color: colors.secondary,
              }}
            >
              Create Your Wedding Portal
            </Title>
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Set up your personalized guest management system
            </Text>
          </HeaderSection>

          <StyledSteps
            current={currentStep}
            items={stepTitles.map((title, index) => ({
              title,
              icon:
                index === 0 ? (
                  <UserOutlined />
                ) : index === 1 ? (
                  <CalendarOutlined />
                ) : (
                  <FileTextOutlined />
                ),
            }))}
          />

          <StyledForm form={form} layout="vertical" requiredMark={false}>
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          </StyledForm>

          <ButtonGroup>
            {currentStep > 0 && (
              <SecondaryButton onClick={handleBack} icon={<ArrowLeftOutlined />}>
                Back
              </SecondaryButton>
            )}
            <PrimaryButton
              type="primary"
              onClick={handleNext}
              loading={loading}
              icon={currentStep === 2 ? <CheckCircleOutlined /> : <ArrowRightOutlined />}
              style={{ marginLeft: currentStep === 0 ? 'auto' : 0 }}
            >
              {currentStep === 2 ? 'Create Portal' : 'Continue'}
            </PrimaryButton>
          </ButtonGroup>

          <BackToLogin>
            <Text type="secondary">Already have an account? </Text>
            <Link to="/login">Sign in</Link>
          </BackToLogin>
        </StyledCard>
      </ContentWrapper>

      <BottomAccent />
    </PageWrapper>
  );
};

export default Register;
