import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  InputNumber,
  Button,
  Space,
  Typography,
  message,
  Switch,
  Row,
  Col,
  Upload,
} from 'antd';
import { PlusOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { colors, borderRadius } from '../../../styles/theme';
import type { Activity } from '../../../types';

const { Text } = Typography;
const { TextArea } = Input;

interface ActivityFormProps {
  open: boolean;
  activity?: Activity | null;
  onClose: () => void;
  onSubmit: (data: Partial<Activity>) => Promise<void>;
}

const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: ${borderRadius.xl}px;
    overflow: hidden;
  }

  .ant-modal-header {
    border-bottom: 1px solid ${colors.creamDark};
    padding: 20px 24px;
  }

  .ant-modal-body {
    padding: 24px;
    max-height: 75vh;
    overflow-y: auto;
  }

  .ant-modal-footer {
    border-top: 1px solid ${colors.creamDark};
    padding: 16px 24px;
  }
`;

const StyledForm = styled(Form)`
  .ant-form-item-label > label {
    font-weight: 500;
    color: ${colors.textPrimary};
  }

  .ant-input,
  .ant-picker,
  .ant-select-selector,
  .ant-input-number {
    border-radius: ${borderRadius.md}px !important;
  }
`;

const SectionTitle = styled.h4`
  font-family: 'Playfair Display', serif;
  color: ${colors.secondary};
  margin: 24px 0 16px;
  font-size: 16px;

  &:first-of-type {
    margin-top: 0;
  }
`;

const ImageUploadWrapper = styled.div`
  .ant-upload-list-picture-card {
    .ant-upload-list-item-container {
      width: 120px !important;
      height: 120px !important;
    }
  }
`;

const CapacityInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: ${colors.goldPale};
  border-radius: ${borderRadius.md}px;
  margin-top: 8px;
`;

const ActivityForm: React.FC<ActivityFormProps> = ({ open, activity, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [hasCapacityLimit, setHasCapacityLimit] = useState(false);

  useEffect(() => {
    if (activity) {
      const startTime = activity.start_time ? dayjs(activity.start_time) : null;
      const endTime = activity.end_time ? dayjs(activity.end_time) : null;

      form.setFieldsValue({
        title: activity.title,
        description: activity.description,
        date: startTime,
        start_time: startTime,
        end_time: endTime,
        location: activity.location,
        max_participants: activity.max_participants,
        notes: activity.notes,
      });
      setHasCapacityLimit(!!activity.max_participants);
      setFileList(
        activity.image_url
          ? [{ uid: '0', name: 'image', status: 'done', url: activity.image_url }]
          : []
      );
    } else {
      form.resetFields();
      setFileList([]);
      setHasCapacityLimit(false);
    }
  }, [activity, form, open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const date = values.date?.format('YYYY-MM-DD');
      const startTimeStr = values.start_time?.format('HH:mm:ss');
      const endTimeStr = values.end_time?.format('HH:mm:ss');

      const data: Partial<Activity> = {
        title: values.title,
        description: values.description,
        start_time: date && startTimeStr ? `${date}T${startTimeStr}` : undefined,
        end_time: date && endTimeStr ? `${date}T${endTimeStr}` : undefined,
        location: values.location,
        max_participants: hasCapacityLimit ? values.max_participants : undefined,
        notes: values.notes,
        image_url: fileList[0]?.url || fileList[0]?.response?.url,
      };

      await onSubmit(data);
      message.success(activity ? 'Activity updated!' : 'Activity added!');
      onClose();
    } catch (error) {
      // Validation error
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setFileList([]);
    setHasCapacityLimit(false);
    onClose();
  };

  return (
    <StyledModal
      title={activity ? 'Edit Activity' : 'Add Activity'}
      open={open}
      onCancel={handleClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {activity ? 'Save Changes' : 'Add Activity'}
        </Button>,
      ]}
    >
      <StyledForm form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="title"
          label="Activity Title"
          rules={[{ required: true, message: 'Please enter activity title' }]}
        >
          <Input placeholder="e.g., Henna Night, Beach Party, City Tour" size="large" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea
            placeholder="Describe the activity for your guests..."
            rows={3}
          />
        </Form.Item>

        <SectionTitle>Date & Time</SectionTitle>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <DatePicker style={{ width: '100%' }} size="large" format="MMMM D, YYYY" />
            </Form.Item>
          </Col>
          <Col xs={12} md={8}>
            <Form.Item
              name="start_time"
              label="Start Time"
              rules={[{ required: true, message: 'Please select start time' }]}
            >
              <TimePicker style={{ width: '100%' }} size="large" format="h:mm A" use12Hours />
            </Form.Item>
          </Col>
          <Col xs={12} md={8}>
            <Form.Item name="end_time" label="End Time">
              <TimePicker style={{ width: '100%' }} size="large" format="h:mm A" use12Hours />
            </Form.Item>
          </Col>
        </Row>

        <SectionTitle>Location</SectionTitle>
        <Form.Item name="location" label="Venue / Location">
          <Input
            prefix={<EnvironmentOutlined style={{ color: colors.textSecondary }} />}
            placeholder="e.g., Grand Ballroom, Burj Al Arab, Desert Camp"
            size="large"
          />
        </Form.Item>

        <SectionTitle>Capacity</SectionTitle>
        <Space>
          <Switch
            checked={hasCapacityLimit}
            onChange={setHasCapacityLimit}
          />
          <Text>Limit number of participants</Text>
        </Space>

        {hasCapacityLimit && (
          <>
            <Form.Item
              name="max_participants"
              label="Maximum Participants"
              style={{ marginTop: 16 }}
              rules={[
                { required: hasCapacityLimit, message: 'Please enter max participants' },
              ]}
            >
              <InputNumber
                min={1}
                max={1000}
                style={{ width: 200 }}
                size="large"
                placeholder="e.g., 50"
              />
            </Form.Item>
            <CapacityInfo>
              <ClockCircleOutlined style={{ color: colors.primary }} />
              <Text type="secondary" style={{ fontSize: 13 }}>
                Guests will only be able to register if spots are available
              </Text>
            </CapacityInfo>
          </>
        )}

        <SectionTitle>Activity Image</SectionTitle>
        <ImageUploadWrapper>
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList.slice(-1))}
            beforeUpload={() => false}
            maxCount={1}
          >
            {fileList.length === 0 && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </ImageUploadWrapper>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Add an image to showcase the activity (optional)
        </Text>

        <Form.Item name="notes" label="Additional Notes" style={{ marginTop: 24 }}>
          <TextArea placeholder="Any additional notes or instructions..." rows={2} />
        </Form.Item>
      </StyledForm>
    </StyledModal>
  );
};

export default ActivityForm;
