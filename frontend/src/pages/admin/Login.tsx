import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';
import { ArabicPattern } from '../../components';
import { colors, shadows, borderRadius } from '../../styles/theme';

const { Title, Text } = Typography;

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
  max-width: 440px;
`;

const StyledCard = styled(Card)`
  border-radius: ${borderRadius.xl}px;
  box-shadow: ${shadows.xl};
  border: 2px solid ${colors.goldLight};
  background: ${colors.cardBg};
  overflow: hidden;

  .ant-card-body {
    padding: 48px 40px;
  }

  @media (max-width: 480px) {
    .ant-card-body {
      padding: 32px 24px;
    }
  }
`;

const LogoContainer = styled(motion.div)`
  text-align: center;
  margin-bottom: 32px;
`;

const WeddingRingsLogo = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  position: relative;
`;

const Ring = styled.div<{ $position: 'left' | 'right' }>`
  width: 50px;
  height: 50px;
  border: 4px solid ${colors.primary};
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${(props) => (props.$position === 'left' ? 'left: 15px;' : 'right: 15px;')}

  &::before {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    background: ${colors.primary};
    border-radius: 50%;
    top: -2px;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const ArabicCalligraphy = styled.div`
  font-family: 'Amiri', serif;
  font-size: 28px;
  color: ${colors.primary};
  margin-bottom: 8px;
  direction: rtl;
`;

const WelcomeTitle = styled(Title)`
  && {
    margin: 0;
    font-family: 'Playfair Display', serif;
    color: ${colors.secondary};
    font-size: 28px;
  }
`;

const SubtitleText = styled(Text)`
  display: block;
  margin-top: 8px;
  color: ${colors.textSecondary};
`;

const StyledForm = styled(Form)`
  .ant-input-affix-wrapper {
    border-radius: ${borderRadius.md}px;
    border-color: ${colors.creamDark};
    padding: 12px 16px;

    &:hover, &:focus, &.ant-input-affix-wrapper-focused {
      border-color: ${colors.primary};
      box-shadow: 0 0 0 2px rgba(183, 168, 154, 0.1);
    }
  }

  .ant-input {
    font-size: 15px;
  }

  .ant-form-item-label > label {
    font-weight: 500;
    color: ${colors.textPrimary};
  }
`;

const LoginButton = styled(Button)`
  && {
    height: 50px;
    border-radius: ${borderRadius.md}px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.goldDark} 100%);
    border: none;

    &:hover {
      background: linear-gradient(135deg, ${colors.goldDark} 0%, ${colors.primary} 100%);
    }
  }
`;

const StyledDivider = styled(Divider)`
  && {
    color: ${colors.textSecondary};
    font-size: 13px;

    &::before, &::after {
      border-color: ${colors.creamDark};
    }
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 24px;

  a {
    color: ${colors.primary};
    font-weight: 600;

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

const FloatingOrnament = styled(motion.div)<{ $position: 'topLeft' | 'bottomRight' }>`
  position: absolute;
  width: 200px;
  height: 200px;
  opacity: 0.1;

  ${(props) =>
    props.$position === 'topLeft'
      ? `
        top: -50px;
        left: -50px;
      `
      : `
        bottom: -50px;
        right: -50px;
      `}
`;

const OrnamentSVG = () => (
  <svg viewBox="0 0 200 200" fill="none">
    <path
      d="M100 0L200 100L100 200L0 100L100 0Z"
      stroke={colors.goldLight}
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M100 20L180 100L100 180L20 100L100 20Z"
      stroke={colors.goldLight}
      strokeWidth="1"
      fill="none"
    />
    <circle cx="100" cy="100" r="30" stroke={colors.goldLight} strokeWidth="1" fill="none" />
  </svg>
);

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
    <PageWrapper>
      <PatternOverlay>
        <ArabicPattern variant="geometric" color={colors.goldLight} opacity={0.15} />
      </PatternOverlay>

      <FloatingOrnament
        $position="topLeft"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <OrnamentSVG />
      </FloatingOrnament>

      <FloatingOrnament
        $position="bottomRight"
        initial={{ rotate: 360 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <OrnamentSVG />
      </FloatingOrnament>

      <ContentWrapper
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <StyledCard>
          <LogoContainer
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <WeddingRingsLogo>
              <Ring $position="left" />
              <Ring $position="right" />
            </WeddingRingsLogo>
            <ArabicCalligraphy>أهلاً وسهلاً</ArabicCalligraphy>
            <WelcomeTitle level={2}>Welcome Back</WelcomeTitle>
            <SubtitleText>Sign in to manage your wedding guests</SubtitleText>
          </LogoContainer>

          <StyledForm
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: colors.textSecondary }} />}
                placeholder="Enter your email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: colors.textSecondary }} />}
                placeholder="Enter your password"
                size="large"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
              <LoginButton
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </LoginButton>
            </Form.Item>
          </StyledForm>

          <StyledDivider>or</StyledDivider>

          <RegisterLink>
            <Text type="secondary">Don't have an account? </Text>
            <Link to="/register">Create your wedding portal</Link>
          </RegisterLink>
        </StyledCard>
      </ContentWrapper>

      <BottomAccent />
    </PageWrapper>
  );
};

export default Login;
