import React, { useState } from 'react';
import { Modal, Form, Input, Button, Typography, message, Row, Col } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import styled from '@emotion/styled';
import { guestsApi } from '../../../services';
import GuestLinkCard from '../../../components/admin/GuestLinkCard';
import { useAuth } from '../../../context/AuthContext';
import { colors, borderRadius } from '../../../styles/theme';
import type { Guest } from '../../../types';

const { Text, Title } = Typography;

interface AddGuestModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (guest: Guest) => void;
}

const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 12px;
    overflow: hidden;
  }

  .ant-modal-header {
    border-bottom: 1px solid ${colors.creamDark};
    padding: 20px 24px;

    .ant-modal-title {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      color: ${colors.secondary};
    }
  }

  .ant-modal-body {
    padding: 24px;
  }

  .ant-modal-footer {
    border-top: 1px solid ${colors.creamDark};
    padding: 16px 24px;

    .ant-btn {
      height: 40px;
      padding: 0 24px;
      border-radius: ${borderRadius.md}px;
    }

    .ant-btn-default {
      border-color: ${colors.creamDark};

      &:hover {
        border-color: ${colors.primary};
        color: ${colors.primary};
      }
    }

    .ant-btn-primary {
      background: ${colors.primary};
      border-color: ${colors.primary};

      &:hover {
        background: ${colors.goldDark};
        border-color: ${colors.goldDark};
      }
    }
  }
`;

const StyledForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 20px;
  }

  .ant-form-item-label > label {
    font-weight: 500;
    color: ${colors.textPrimary};
    font-size: 14px;
  }

  .ant-input,
  .ant-input-affix-wrapper {
    height: 44px;
    border-radius: 6px;
    border: 1px solid #D6C7B8;
    font-size: 14px;

    &:hover {
      border-color: ${colors.primary};
    }

    &:focus, &.ant-input-affix-wrapper-focused {
      border-color: ${colors.primary};
      box-shadow: 0 0 0 2px rgba(183, 168, 154, 0.1);
    }
  }

  .ant-input-affix-wrapper {
    padding: 0 12px;

    .ant-input {
      height: auto;
      border: none;
      box-shadow: none;

      &:focus {
        box-shadow: none;
      }
    }

    .ant-input-prefix {
      margin-right: 10px;
      color: ${colors.textSecondary};
    }
  }
`;

const SuccessContainer = styled(motion.div)`
  text-align: center;
  padding: 20px 0;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.success} 0%, #9A9187 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: white;
  font-size: 40px;
`;

const SuccessTitle = styled(Title)`
  && {
    color: ${colors.secondary};
    margin-bottom: 8px;
  }
`;

const GuestNameDisplay = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  color: ${colors.primary};
  margin-bottom: 24px;
`;

interface FormValues {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  country?: string;
}

const AddGuestModal: React.FC<AddGuestModalProps> = ({ open, onClose, onSuccess }) => {
  const { wedding } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [createdGuest, setCreatedGuest] = useState<Guest | null>(null);
  const [step, setStep] = useState<'form' | 'success'>('form');

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      // Map frontend fields to backend schema
      const guest = await guestsApi.createGuest({
        full_name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email,
        phone: values.phone,
        country_of_origin: values.country,
      } as any);
      setCreatedGuest(guest);
      setStep('success');
      onSuccess(guest);
      message.success('Guest added successfully!');
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Failed to add guest');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setCreatedGuest(null);
    setStep('form');
    onClose();
  };

  const handleAddAnother = () => {
    form.resetFields();
    setCreatedGuest(null);
    setStep('form');
  };

  return (
    <StyledModal
      title={step === 'form' ? 'Add New Guest' : null}
      open={open}
      onCancel={handleClose}
      centered
      destroyOnClose
      width={520}
      footer={
        step === 'form'
          ? [
              <Button key="cancel" onClick={handleClose}>
                Cancel
              </Button>,
              <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
                Add Guest
              </Button>,
            ]
          : [
              <Button key="another" onClick={handleAddAnother}>
                Add Another Guest
              </Button>,
              <Button key="done" type="primary" onClick={handleClose}>
                Done
              </Button>,
            ]
      }
    >
      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <StyledForm
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[{ required: true, message: 'First name is required' }]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="First name"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[{ required: true, message: 'Last name is required' }]}
                  >
                    <Input placeholder="Last name" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email"
                label="Email Address"
                rules={[{ type: 'email', message: 'Please enter a valid email' }]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="guest@email.com (optional)"
                />
              </Form.Item>

              <Form.Item name="phone" label="Phone Number">
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="+1 234 567 8900 (optional)"
                />
              </Form.Item>

              <Form.Item name="country" label="Country" style={{ marginBottom: 0 }}>
                <Input
                  prefix={<GlobalOutlined />}
                  placeholder="Country (optional)"
                />
              </Form.Item>
            </StyledForm>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <SuccessContainer>
              <SuccessIcon>
                <CheckCircleOutlined />
              </SuccessIcon>
              <SuccessTitle level={4}>Guest Added Successfully!</SuccessTitle>
              <GuestNameDisplay>
                {(createdGuest as any)?.full_name || `${createdGuest?.first_name} ${createdGuest?.last_name}`}
              </GuestNameDisplay>

              {createdGuest && (
                <GuestLinkCard
                  guestName={(createdGuest as any)?.full_name || `${createdGuest.first_name} ${createdGuest.last_name}`}
                  uniqueToken={createdGuest.unique_token}
                  wedding={wedding}
                />
              )}

              <Text
                type="secondary"
                style={{ display: 'block', marginTop: 16, fontSize: 13 }}
              >
                Share this link with the guest to let them RSVP and provide their details.
              </Text>
            </SuccessContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </StyledModal>
  );
};

export default AddGuestModal;
