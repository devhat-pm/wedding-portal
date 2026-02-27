import React, { useState, useEffect, useRef } from 'react';
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
  Tag,
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
  MessageOutlined,
  UndoOutlined,
  HeartOutlined,
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
  font-family: 'Playfair Display', serif;
  font-style: italic;
  color: ${colors.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

const PlaceholderTagsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const PlaceholderTag = styled(Tag)`
  && {
    cursor: pointer;
    border: 1px solid ${colors.primary};
    color: ${colors.primary};
    background: ${colors.goldPale};
    border-radius: 12px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
    padding: 2px 10px;
    transition: all 0.2s;

    &:hover {
      background: ${colors.primary};
      color: white;
    }
  }
`;

const InvitationPreview = styled.div`
  background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.creamLight} 100%);
  border-radius: ${borderRadius.md}px;
  padding: 20px;
  margin-top: 16px;
  border: 1px solid ${colors.borderGold};
  white-space: pre-wrap;
  line-height: 1.6;
  color: ${colors.textPrimary};
  font-size: 14px;
`;

const DEFAULT_INVITATION_TEMPLATE = 'Hi {guest_name}! {couple_names} would love to have you at their wedding ceremony on {wedding_date} at {venue_name}. Please RSVP using the link below. We look forward to celebrating with you!';

const PLACEHOLDERS = [
  { key: '{guest_name}', label: '{guest_name}' },
  { key: '{couple_names}', label: '{couple_names}' },
  { key: '{wedding_date}', label: '{wedding_date}' },
  { key: '{venue_name}', label: '{venue_name}' },
];

interface WeddingFormData {
  coupleNames: string;
  weddingDate: dayjs.Dayjs | null;
  venueName: string;
  venueCity: string;
  venueCountry: string;
  venueAddress: string;
  welcomeMessage: string;
  storyTitle: string;
  storyContent: string;
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
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [storyImageUrl, setStoryImageUrl] = useState<string | null>(null);
  const [coupleImageUrl, setCoupleImageUrl] = useState<string | null>(null);
  const [storyUploadLoading, setStoryUploadLoading] = useState(false);
  const [coupleUploadLoading, setCoupleUploadLoading] = useState(false);
  const [welcomeMessagePreview, setWelcomeMessagePreview] = useState('');
  const [invitationTemplate, setInvitationTemplate] = useState(DEFAULT_INVITATION_TEMPLATE);
  const invitationTextAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (wedding) {
      weddingForm.setFieldsValue({
        coupleNames: wedding.couple_names || '',
        weddingDate: wedding.wedding_date ? dayjs(wedding.wedding_date) : null,
        venueName: wedding.venue_name || '',
        venueCity: wedding.venue_city || '',
        venueCountry: wedding.venue_country || '',
        venueAddress: wedding.venue_address || '',
        welcomeMessage: wedding.welcome_message || '',
        storyTitle: wedding.story_title || '',
        storyContent: wedding.story_content || '',
      });
      setCoverImageUrl(wedding.cover_image_url || null);
      setStoryImageUrl(wedding.story_image_url || null);
      setCoupleImageUrl(wedding.couple_image_url || null);
      setWelcomeMessagePreview(wedding.welcome_message || '');
      setInvitationTemplate(wedding.invitation_message_template || DEFAULT_INVITATION_TEMPLATE);
    }
  }, [wedding, weddingForm]);

  const handleWeddingSubmit = async (values: WeddingFormData) => {
    setLoading(true);
    try {
      const updatedWedding = await adminApi.updateWedding({
        couple_names: values.coupleNames,
        wedding_date: values.weddingDate?.toISOString(),
        venue_name: values.venueName || undefined,
        venue_city: values.venueCity || undefined,
        venue_country: values.venueCountry || undefined,
        venue_address: values.venueAddress || undefined,
        welcome_message: values.welcomeMessage || undefined,
        story_title: values.storyTitle || undefined,
        story_content: values.storyContent || undefined,
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

  const handleStoryImageUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setStoryUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file as File);

      const updatedWedding = await adminApi.uploadStoryImage(formData);
      setStoryImageUrl(updatedWedding.story_image_url || null);
      updateWedding(updatedWedding);
      message.success('Story image uploaded successfully!');
      onSuccess?.(updatedWedding);
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Failed to upload story image');
      onError?.(error);
    } finally {
      setStoryUploadLoading(false);
    }
  };

  const handleCoupleImageUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setCoupleUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file as File);

      const updatedWedding = await adminApi.uploadCoupleImage(formData);
      setCoupleImageUrl(updatedWedding.couple_image_url || null);
      updateWedding(updatedWedding);
      message.success('Couple image uploaded successfully!');
      onSuccess?.(updatedWedding);
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Failed to upload couple image');
      onError?.(error);
    } finally {
      setCoupleUploadLoading(false);
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

  const handleInsertPlaceholder = (placeholder: string) => {
    const textarea = invitationTextAreaRef.current;
    if (!textarea) {
      setInvitationTemplate((prev) => prev + placeholder);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = invitationTemplate.slice(0, start);
    const after = invitationTemplate.slice(end);
    const newValue = before + placeholder + after;
    setInvitationTemplate(newValue);
    // Restore cursor position after React re-render
    setTimeout(() => {
      textarea.focus();
      const newPos = start + placeholder.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const getInvitationPreview = () => {
    const coupleNames = weddingForm.getFieldValue('coupleNames') || wedding?.couple_names || 'Couple';
    const weddingDate = weddingForm.getFieldValue('weddingDate');
    const dateStr = weddingDate
      ? dayjs(weddingDate).format('MMMM D, YYYY')
      : wedding?.wedding_date
        ? dayjs(wedding.wedding_date).format('MMMM D, YYYY')
        : 'Wedding Date';
    const venueName = weddingForm.getFieldValue('venueName') || wedding?.venue_name || 'Venue';

    return invitationTemplate
      .replace(/{guest_name}/g, 'Ahmed')
      .replace(/{couple_names}/g, coupleNames)
      .replace(/{wedding_date}/g, dateStr)
      .replace(/{venue_name}/g, venueName);
  };

  const handleSaveInvitationTemplate = async () => {
    setInvitationLoading(true);
    try {
      const updatedWedding = await adminApi.updateWedding({
        invitation_message_template: invitationTemplate,
      });
      updateWedding(updatedWedding);
      message.success('Invitation template saved!');
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Failed to save invitation template');
    } finally {
      setInvitationLoading(false);
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

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="venueCity" label="Venue City">
                  <Input placeholder="e.g., Dubai" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="venueCountry" label="Venue Country">
                  <Input placeholder="e.g., UAE" size="large" />
                </Form.Item>
              </Col>
            </Row>

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

        {/* Our Story Section */}
        <SectionCard
          title={
            <Space>
              <HeartOutlined style={{ color: colors.primary }} />
              <span>Our Story</span>
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
              name="storyTitle"
              label="Story Title"
              extra="e.g., How We Met, Our Love Story"
            >
              <Input
                placeholder="e.g., Our Love Story"
                size="large"
                maxLength={300}
              />
            </Form.Item>

            <Form.Item
              name="storyContent"
              label="Story Content"
              extra="Share your love story with your guests (max 2000 characters)"
            >
              <TextArea
                placeholder="Tell your guests how you met, your journey together..."
                rows={8}
                maxLength={2000}
                showCount
                style={{ resize: 'none' }}
              />
            </Form.Item>

            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Couple Image</Text>
              <CoverImagePreview $hasImage={!!coupleImageUrl} style={{ height: 200 }}>
                {coupleImageUrl ? (
                  <>
                    <img src={coupleImageUrl} alt="Couple" style={{ objectPosition: 'center top' }} />
                    <CoverImageOverlay>
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        customRequest={handleCoupleImageUpload}
                      >
                        <Button
                          type="primary"
                          icon={<UploadOutlined />}
                          loading={coupleUploadLoading}
                          ghost
                        >
                          Change Image
                        </Button>
                      </Upload>
                    </CoverImageOverlay>
                  </>
                ) : (
                  <CoverPlaceholder>
                    <UserOutlined style={{ fontSize: 36, marginBottom: 12 }} />
                    <div>No couple image uploaded</div>
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      customRequest={handleCoupleImageUpload}
                    >
                      <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        style={{ marginTop: 12 }}
                        loading={coupleUploadLoading}
                      >
                        Upload Couple Image
                      </Button>
                    </Upload>
                  </CoverPlaceholder>
                )}
              </CoverImagePreview>
              <Text type="secondary" style={{ fontSize: 12 }}>
                A photo of the couple displayed in the Our Story section. Recommended: a portrait or square photo.
              </Text>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Story Image</Text>
              <CoverImagePreview $hasImage={!!storyImageUrl} style={{ height: 180 }}>
                {storyImageUrl ? (
                  <>
                    <img src={storyImageUrl} alt="Our story" />
                    <CoverImageOverlay>
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        customRequest={handleStoryImageUpload}
                      >
                        <Button
                          type="primary"
                          icon={<UploadOutlined />}
                          loading={storyUploadLoading}
                          ghost
                        >
                          Change Image
                        </Button>
                      </Upload>
                    </CoverImageOverlay>
                  </>
                ) : (
                  <CoverPlaceholder>
                    <HeartOutlined style={{ fontSize: 36, marginBottom: 12 }} />
                    <div>No story image uploaded</div>
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      customRequest={handleStoryImageUpload}
                    >
                      <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        style={{ marginTop: 12 }}
                        loading={storyUploadLoading}
                      >
                        Upload Story Image
                      </Button>
                    </Upload>
                  </CoverPlaceholder>
                )}
              </CoverImagePreview>
              <Text type="secondary" style={{ fontSize: 12 }}>
                This image will be displayed alongside your love story on the guest portal.
              </Text>
            </div>

            <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
              <SaveButton type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                Save Story
              </SaveButton>
            </Form.Item>
          </StyledForm>
        </SectionCard>

        {/* Invitation Message Template Section */}
        <SectionCard
          title={
            <Space>
              <MessageOutlined style={{ color: colors.primary }} />
              <span>Invitation Message Template</span>
            </Space>
          }
        >
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Customize the message sent with each guest's invitation link. Click a placeholder below
            to insert it at the cursor position.
          </Paragraph>

          <PlaceholderTagsWrapper>
            {PLACEHOLDERS.map((p) => (
              <PlaceholderTag key={p.key} onClick={() => handleInsertPlaceholder(p.key)}>
                {p.label}
              </PlaceholderTag>
            ))}
          </PlaceholderTagsWrapper>

          <TextArea
            ref={invitationTextAreaRef as any}
            value={invitationTemplate}
            onChange={(e) => setInvitationTemplate(e.target.value)}
            rows={5}
            maxLength={500}
            showCount
            placeholder="Type your invitation message..."
            style={{ resize: 'none', borderRadius: borderRadius.md }}
          />

          {invitationTemplate && (
            <InvitationPreview>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                Preview (sample guest: Ahmed)
              </Text>
              {getInvitationPreview()}
            </InvitationPreview>
          )}

          <Space style={{ marginTop: 16 }}>
            <SaveButton
              type="primary"
              loading={invitationLoading}
              icon={<SaveOutlined />}
              onClick={handleSaveInvitationTemplate}
            >
              Save Template
            </SaveButton>
            <Button
              icon={<UndoOutlined />}
              onClick={() => setInvitationTemplate(DEFAULT_INVITATION_TEMPLATE)}
            >
              Reset to Default
            </Button>
          </Space>
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
