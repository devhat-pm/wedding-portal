import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { MailOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';
import { colors, shadows, borderRadius, fonts } from '../../styles/theme';

const { Text } = Typography;

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

const Page = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: ${colors.background};

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

/* ---------- Left – decorative panel ---------- */

const BrandPanel = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 48px;
  background: linear-gradient(160deg, #7B756D 0%, #9A9187 50%, #B7A89A 100%);
  overflow: hidden;

  @media (max-width: 900px) {
    display: none;
  }
`;

const BrandBg = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.06;
  background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23fff' stroke-width='0.8'%3E%3Ccircle cx='40' cy='40' r='30'/%3E%3Ccircle cx='40' cy='40' r='18'/%3E%3Cpath d='M40 10L70 40L40 70L10 40Z'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 80px 80px;
`;

const BrandContent = styled(motion.div)`
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 380px;
`;

const BrandIcon = styled.div`
  width: 72px;
  height: 72px;
  margin: 0 auto 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  line-height: 1;
  color: #fff;
`;

const BrandTitle = styled.h1`
  font-family: ${fonts.heading};
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 12px;
  letter-spacing: -0.02em;
  line-height: 1.25;
`;

const BrandSub = styled.p`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 40px;
  line-height: 1.6;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeatureItem = styled(motion.li)`
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  line-height: 1.5;
`;

const FeatureDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${colors.accent};
  flex-shrink: 0;
`;

/* ---------- Right – form panel ---------- */

const FormPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 48px;
  background: #fff;

  @media (max-width: 480px) {
    padding: 40px 24px;
  }
`;

const FormWrapper = styled(motion.div)`
  width: 100%;
  max-width: 400px;
`;

const MobileHeader = styled.div`
  display: none;
  text-align: center;
  margin-bottom: 32px;

  @media (max-width: 900px) {
    display: block;
  }
`;

const MobileLogo = styled.div`
  width: 52px;
  height: 52px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
`;

const FormHeading = styled.h2`
  font-family: ${fonts.heading};
  font-size: 28px;
  font-weight: 600;
  color: ${colors.secondary};
  margin: 0 0 6px;
  letter-spacing: -0.01em;
`;

const FormSubtext = styled(Text)`
  && {
    display: block;
    color: ${colors.textSecondary};
    font-size: 15px;
    margin-bottom: 36px;
  }
`;

const StyledForm = styled(Form)`
  .ant-form-item-label > label {
    font-weight: 500;
    font-size: 13px;
    color: ${colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .ant-input-affix-wrapper {
    border-radius: ${borderRadius.md}px;
    border: 1.5px solid ${colors.creamDark};
    padding: 12px 16px;
    background: ${colors.background};
    transition: all 0.2s ease;

    &:hover {
      border-color: ${colors.primary};
    }

    &:focus,
    &.ant-input-affix-wrapper-focused {
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px rgba(183, 168, 154, 0.12);
      background: #fff;
    }
  }

  .ant-input {
    font-size: 15px;
    background: transparent;
  }
`;

const SubmitButton = styled(Button)`
  && {
    height: 52px;
    border-radius: ${borderRadius.md}px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.02em;
    background: ${colors.secondary};
    border: none;
    box-shadow: 0 4px 14px rgba(123, 117, 109, 0.25);
    transition: all 0.25s ease;

    &:hover {
      background: ${colors.tealDark} !important;
      box-shadow: 0 6px 20px rgba(123, 117, 109, 0.35);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }
`;

const Footer = styled.div`
  margin-top: 48px;
  text-align: center;
  color: ${colors.textSecondary};
  font-size: 12px;
  opacity: 0.6;
`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const features = [
  'Manage RSVPs and guest lists in real time',
  'Track travel, hotels, and dietary preferences',
  'Share photos and coordinate activities',
  'AI-powered assistant for guest questions',
];

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [form] = Form.useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      {/* ---------- Left panel ---------- */}
      <BrandPanel>
        <BrandBg />
        <BrandContent
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <BrandIcon>&#9829;</BrandIcon>
          <BrandTitle>Wedding Guest Management</BrandTitle>
          <BrandSub>
            Everything you need to organise your perfect day — guests, RSVPs,
            travel, and more — all in one place.
          </BrandSub>

          <FeatureList>
            {features.map((f, i) => (
              <FeatureItem
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
              >
                <FeatureDot />
                {f}
              </FeatureItem>
            ))}
          </FeatureList>
        </BrandContent>
      </BrandPanel>

      {/* ---------- Right panel ---------- */}
      <FormPanel>
        <FormWrapper
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <MobileHeader>
            <MobileLogo>&#9829;</MobileLogo>
          </MobileHeader>

          <FormHeading>Welcome back</FormHeading>
          <FormSubtext>Sign in to your wedding dashboard</FormSubtext>

          <StyledForm
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: colors.textSecondary, fontSize: 16 }} />}
                placeholder="you@example.com"
                size="large"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: colors.textSecondary, fontSize: 16 }} />}
                placeholder="Enter your password"
                size="large"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <SubmitButton
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                icon={!loading ? <ArrowRightOutlined /> : undefined}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </SubmitButton>
            </Form.Item>
          </StyledForm>

          <Footer>Wedding Guest Management System</Footer>
        </FormWrapper>
      </FormPanel>
    </Page>
  );
};

export default Login;
