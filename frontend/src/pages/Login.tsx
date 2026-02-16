import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/theme';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.tealDark} 100%)`,
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          style={{
            width: 420,
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: `2px solid ${colors.goldLight}`,
          }}
          bodyStyle={{ padding: 40 }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.goldDark})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CrownOutlined style={{ fontSize: 40, color: colors.white }} />
              </div>
            </motion.div>

            <Title
              level={2}
              style={{
                margin: 0,
                fontFamily: "'Playfair Display', serif",
                color: colors.secondary,
              }}
            >
              Welcome Back
            </Title>
            <Text
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: 18,
                color: colors.primary,
                display: 'block',
                marginTop: 8,
              }}
            >
              أهلاً وسهلاً
            </Text>
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Sign in to manage your wedding guests
            </Text>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: colors.gray[400] }} />}
                placeholder="Email address"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: colors.gray[400] }} />}
                placeholder="Password"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  borderRadius: 8,
                  height: 48,
                  fontWeight: 600,
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Don't have an account?{' '}
              <a
                onClick={() => navigate('/register')}
                style={{ color: colors.primary, fontWeight: 500 }}
              >
                Create Account
              </a>
            </Text>
          </div>
        </Card>
      </motion.div>

      {/* Decorative Elements */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent}, ${colors.primary})`,
        }}
      />
    </div>
  );
};

export default Login;
