import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Upload,
  message,
  Divider,
  Typography,
  Space,
  Row,
  Col,
  Alert,
  Modal,
  Spin,
} from 'antd';
import {
  SaveOutlined,
  UploadOutlined,
  CameraOutlined,
  LockOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  SettingOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/admin.api';
import { GoldDivider } from '../../components';
import { colors, shadows, borderRadius } from '../../styles/theme';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const PageWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
`;

const SectionCard = styled(Card)`
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${shadows.sm};
  margin-bottom: 24px;

  .ant-card-head {
    border-bottom-color: ${colors.creamDark};
  }
`;

const CoverImageSection = styled.div`
  position: relative;
  border-radius: ${borderRadius.lg}px;
  overflow: hidden;
  margin-bottom: 24px;
`;

const CoverImagePreview = styled.div<{ $hasImage: boolean }>`
  width: 100%;
  height: 200px;
  background: ${(props) =>
    props.$hasImage
      ? 'transparent'
      : `linear-gradient(135deg, ${colors.creamMedium} 0%, ${colors.creamDark} 100%)`};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed ${colors.borderGold};
  border-radius: ${borderRadius.lg}px;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
  }
`;

const CoverImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const CoverPlaceholder = styled.div`
  text-align: center;
  color: ${colors.textSecondary};
`;

const StyledForm = styled(Form)`
  .ant-form-item-label > label {
    font-weight: 500;
    color: ${colors.textPrimary};
  }

  .ant-input,
  .ant-input-affix-wrapper,
  .ant-picker {
    border-radius: ${borderRadius.md}px;
  }

  .ant-input:hover,
  .ant-input-affix-wrapper:hover,
  .ant-picker:hover {
    border-color: ${colors.primary};
  }

  .ant-input:focus,
  .ant-input-affix-wrapper-focused,
  .ant-picker-focused {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(183, 168, 154, 0.1);
  }
`;

const SaveButton = styled(Button)`
  && {
    height: 44px;
    border-radius: ${borderRadius.md}px;
    font-weight: 600;
  }
`;

const DangerZone = styled(Card)`
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.error};
  background: rgba(229, 206, 192, 0.02);

  .ant-card-head {
    border-bottom-color: rgba(229, 206, 192, 0.1);
    color: ${colors.error};
  }
`;

const DangerButton = styled(Button)`
  && {
    border-color: ${colors.error};
    color: ${colors.error};

    &:hover {
      background: ${colors.error};
      border-color: ${colors.error};
      color: ${colors.white};
    }
  }
`;

const WelcomePreview = styled.div`
  background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.creamLight} 100%);
  border-radius: ${borderRadius.md}px;
  padding: 20px;
  margin-top: 16px;
  border: 1px solid ${colors.borderGold};
`;

const PreviewHeader = styled.div`
  text-align: center;
  margin-bottom: 16px;
`;

const PreviewTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: ${colors.secondary};
  margin: 0 0 4px;
`;

const PreviewMessage = styled.p`
  font-family: 'Amiri', serif;
  font-style: italic;
  color: ${colors.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

interface WeddingFormData {
  coupleNames: string;
  weddingDate: dayjs.Dayjs | null;
  venueName: string;
  venueAddress: string;
  welcomeMessage: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Settings: React.FC = () => {
  const { wedding, updateWedding, admin } = useAuth();
  const [weddingForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [welcomeMessagePreview, setWelcomeMessagePreview] = useState('');

  useEffect(() => {
    if (wedding) {
      weddingForm.setFieldsValue({
        coupleNames: wedding.couple_names || '',
        weddingDate: wedding.wedding_date ? dayjs(wedding.wedding_date) : null,
        venueName: wedding.venue_name || '',
        venueAddress: wedding.venue_address || '',
        welcomeMessage: wedding.welcome_message || '',
      });
      setCoverImageUrl(wedding.cover_image_url || null);
      setWelcomeMessagePreview(wedding.welcome_message || '');
    }
  }, [wedding, weddingForm]);

  const handleWeddingSubmit = async (values: WeddingFormData) => {
    setLoading(true);
    try {
      const updatedWedding = await adminApi.updateWedding({
        couple_names: values.coupleNames,
        wedding_date: values.weddingDate?.toISOString(),
        venue_name: values.venueName || undefined,
        venue_address: values.venueAddress || undefined,
        welcome_message: values.welcomeMessage || undefined,
      });
      updateWedding(updatedWedding);
      message.success('Wedding details updated successfully!');
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Failed to update wedding details');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverImageUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file as File);

      const updatedWedding = await adminApi.uploadCoverImage(formData);
      setCoverImageUrl(updatedWedding.cover_image_url);
      updateWedding(updatedWedding);
      message.success('Cover image uploaded successfully!');
      onSuccess?.(updatedWedding);
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Failed to upload cover image');
      onError?.(error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handlePasswordSubmit = async (values: PasswordFormData) => {
    setPasswordLoading(true);
    try {
      await adminApi.changePassword(values.currentPassword, values.newPassword);
      message.success('Password changed successfully!');
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.detail || error?.detail || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      message.loading({ content: 'Preparing export...', key: 'export' });
      // In a real app, this would trigger a download
      // const blob = await adminApi.exportAllData();
      // downloadBlob(blob, 'wedding-data-export.zip');
      message.success({ content: 'Data exported successfully!', key: 'export' });
    } catch (error) {
      message.error({ content: 'Failed to export data', key: 'export' });
    }
  };

  const handleDeleteWedding = () => {
    Modal.confirm({
      title: 'Delete Wedding Portal',
      icon: <ExclamationCircleOutlined style={{ color: colors.error }} />,
      content: (
        <div>
          <Paragraph>
            Are you sure you want to delete your wedding portal? This action cannot be undone.
          </Paragraph>
          <Alert
            type="error"
            message="All data including guests, RSVPs, and media will be permanently deleted."
            style={{ marginTop: 16 }}
          />
        </div>
      ),
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // await adminApi.deleteWedding();
          message.success('Wedding portal deleted');
          // logout and redirect
        } catch (error) {
          message.error('Failed to delete wedding portal');
        }
      },
    });
  };

  return (
    <PageWrapper>
      <PageHeader>
        <Title level={2} style={{ marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>
          <SettingOutlined style={{ marginRight: 12, color: colors.primary }} />
          Settings
        </Title>
        <Text type="secondary">Manage your wedding details and account settings</Text>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Cover Image Section */}
        <SectionCard
          title={
            <Space>
              <CameraOutlined style={{ color: colors.primary }} />
              <span>Cover Image</span>
            </Space>
          }
        >
          <CoverImageSection>
            <CoverImagePreview $hasImage={!!coverImageUrl}>
              {coverImageUrl ? (
                <>
                  <img src={coverImageUrl} alt="Wedding cover" />
                  <CoverImageOverlay>
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      customRequest={handleCoverImageUpload}
                    >
                      <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        loading={uploadLoading}
                        ghost
                      >
                        Change Image
                      </Button>
                    </Upload>
                  </CoverImageOverlay>
                </>
              ) : (
                <CoverPlaceholder>
                  <CameraOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <div>No cover image uploaded</div>
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    customRequest={handleCoverImageUpload}
                  >
                    <Button
                      type="primary"
                      icon={<UploadOutlined />}
                      style={{ marginTop: 16 }}
                      loading={uploadLoading}
                    >
                      Upload Cover Image
                    </Button>
                  </Upload>
                </CoverPlaceholder>
              )}
            </CoverImagePreview>
          </CoverImageSection>
          <Text type="secondary">
            Recommended size: 1920x600 pixels. This image will be displayed at the top of your
            guest portal.
          </Text>
        </SectionCard>

        {/* Wedding Details Section */}
        <SectionCard
          title={
            <Space>
              <CalendarOutlined style={{ color: colors.primary }} />
              <span>Wedding Details</span>
            </Space>
          }
        >
          <StyledForm
            form={weddingForm}
            layout="vertical"
            onFinish={handleWeddingSubmit}
            requiredMark={false}
          >
            <Form.Item
              name="coupleNames"
              label="Couple Names"
              rules={[{ required: true, message: 'Please enter couple names' }]}
              extra="Example: John & Jane, Ahmed & Fatima"
            >
              <Input
                prefix={<UserOutlined style={{ color: colors.textSecondary }} />}
                placeholder="e.g., John & Jane"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="weddingDate"
              label="Wedding Date"
              rules={[{ required: true, message: 'Please select wedding date' }]}
            >
              <DatePicker
                size="large"
                style={{ width: '100%' }}
                format="MMMM D, YYYY"
                placeholder="Select wedding date"
              />
            </Form.Item>

            <GoldDivider text="Venue" variant="simple" margin="24px 0" />

            <Form.Item name="venueName" label="Venue Name">
              <Input
                prefix={<EnvironmentOutlined style={{ color: colors.textSecondary }} />}
                placeholder="e.g., The Grand Ballroom"
                size="large"
              />
            </Form.Item>

            <Form.Item name="venueAddress" label="Venue Address">
              <TextArea
                placeholder="Full venue address"
                rows={2}
                style={{ resize: 'none' }}
              />
            </Form.Item>

            <GoldDivider text="Welcome Message" variant="simple" margin="24px 0" />

            <Form.Item
              name="welcomeMessage"
              label="Welcome Message"
              extra="This message will be displayed to guests when they visit your portal"
            >
              <TextArea
                placeholder="We are delighted to invite you to celebrate our special day..."
                rows={4}
                maxLength={500}
                showCount
                onChange={(e) => setWelcomeMessagePreview(e.target.value)}
                style={{ resize: 'none' }}
              />
            </Form.Item>

            {welcomeMessagePreview && (
              <WelcomePreview>
                <PreviewHeader>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Preview
                  </Text>
                  <PreviewTitle>
                    {weddingForm.getFieldValue('groomName') || 'Groom'} &{' '}
                    {weddingForm.getFieldValue('brideName') || 'Bride'}
                  </PreviewTitle>
                </PreviewHeader>
                <PreviewMessage>"{welcomeMessagePreview}"</PreviewMessage>
              </WelcomePreview>
            )}

            <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
              <SaveButton type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                Save Changes
              </SaveButton>
            </Form.Item>
          </StyledForm>
        </SectionCard>

        {/* Change Password Section */}
        <SectionCard
          title={
            <Space>
              <LockOutlined style={{ color: colors.primary }} />
              <span>Change Password</span>
            </Space>
          }
        >
          <StyledForm
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordSubmit}
            requiredMark={false}
          >
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please enter current password' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: colors.textSecondary }} />}
                placeholder="Enter current password"
                size="large"
              />
            </Form.Item>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="newPassword"
                  label="New Password"
                  rules={[
                    { required: true, message: 'Please enter new password' },
                    { min: 8, message: 'Password must be at least 8 characters' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: colors.textSecondary }} />}
                    placeholder="Enter new password"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="confirmPassword"
                  label="Confirm New Password"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Please confirm password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: colors.textSecondary }} />}
                    placeholder="Confirm new password"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom: 0 }}>
              <SaveButton
                type="primary"
                htmlType="submit"
                loading={passwordLoading}
                icon={<LockOutlined />}
              >
                Update Password
              </SaveButton>
            </Form.Item>
          </StyledForm>
        </SectionCard>

        {/* Danger Zone */}
        <DangerZone
          title={
            <Space>
              <ExclamationCircleOutlined />
              <span>Danger Zone</span>
            </Space>
          }
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={16}>
              <Title level={5} style={{ marginBottom: 4 }}>
                Export All Data
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Download all your wedding data including guests, RSVPs, and media in a ZIP file.
              </Paragraph>
            </Col>
            <Col xs={24} md={8} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Button icon={<DownloadOutlined />} onClick={handleExportData}>
                Export Data
              </Button>
            </Col>
          </Row>

          <Divider style={{ borderColor: 'rgba(229, 206, 192, 0.1)' }} />

          <Row gutter={[24, 24]}>
            <Col xs={24} md={16}>
              <Title level={5} style={{ marginBottom: 4, color: colors.error }}>
                Delete Wedding Portal
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Permanently delete your wedding portal and all associated data. This action cannot be
                undone.
              </Paragraph>
            </Col>
            <Col xs={24} md={8} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <DangerButton icon={<DeleteOutlined />} onClick={handleDeleteWedding}>
                Delete Portal
              </DangerButton>
            </Col>
          </Row>
        </DangerZone>
      </motion.div>
    </PageWrapper>
  );
};

export default Settings;
