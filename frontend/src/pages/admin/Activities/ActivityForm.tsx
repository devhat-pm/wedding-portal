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
  Checkbox,
  Tag,
  Radio,
} from 'antd';
import {
  PlusOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  SkinOutlined,
  CoffeeOutlined,
  CalendarOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { colors, borderRadius } from '../../../styles/theme';
import type { Activity } from '../../../types';
import * as activitiesApi from '../../../services/activities.api';
import { getImageUrl } from '../../../utils/helpers';

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
  display: flex;
  align-items: center;
  gap: 8px;

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

const ColorPaletteWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const ColorItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: ${colors.creamLight};
  border-radius: ${borderRadius.md}px;
  border: 1px solid ${colors.creamDark};
`;

const ColorSwatch = styled.div<{ $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${(props) => props.$color};
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
`;

const ColorName = styled.span`
  font-size: 13px;
  color: ${colors.textPrimary};
`;

const AddColorRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Halal',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Kosher',
  'Seafood-Free',
];

type ActivityType = 'main_event' | 'things_to_do';

const ActivityForm: React.FC<ActivityFormProps> = ({ open, activity, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [activityType, setActivityType] = useState<ActivityType>('main_event');
  const [hasCapacityLimit, setHasCapacityLimit] = useState(false);
  const [dressColors, setDressColors] = useState<Array<{ name: string; hex: string }>>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#B7A89A');
  const [selectedDietaryOptions, setSelectedDietaryOptions] = useState<string[]>([]);

  useEffect(() => {
    if (activity) {
      const startTime = activity.start_time ? dayjs(activity.start_time) : null;
      const endTime = activity.end_time ? dayjs(activity.end_time) : null;

      // Determine activity type from requires_signup
      const isMainEvent = activity.requires_signup !== false;
      setActivityType(isMainEvent ? 'main_event' : 'things_to_do');

      form.setFieldsValue({
        title: activity.title || activity.activity_name,
        description: activity.description,
        date: startTime,
        start_time: startTime,
        end_time: endTime,
        location: activity.location,
        max_participants: activity.max_participants,
        notes: activity.notes,
        dress_code_info: activity.dress_code_info,
        food_description: activity.food_description,
        latitude: activity.latitude,
        longitude: activity.longitude,
      });
      setHasCapacityLimit(!!activity.max_participants);
      setFileList(
        activity.image_url
          ? [{ uid: '0', name: 'image', status: 'done', url: getImageUrl(activity.image_url) || activity.image_url, response: { url: activity.image_url } }]
          : []
      );
      setDressColors(activity.dress_colors || []);
      setSelectedDietaryOptions(activity.dietary_options || []);
    } else {
      form.resetFields();
      setFileList([]);
      setActivityType('main_event');
      setHasCapacityLimit(false);
      setDressColors([]);
      setSelectedDietaryOptions([]);
    }
  }, [activity, form, open]);

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setDressColors((prev) => [...prev, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
    setNewColorHex('#B7A89A');
  };

  const handleRemoveColor = (index: number) => {
    setDressColors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Upload image file if a new file was selected (originFileObj exists)
      let imageUrl = fileList[0]?.response?.url || fileList[0]?.url || undefined;
      if (fileList[0]?.originFileObj) {
        try {
          const result = await activitiesApi.uploadActivityImage(fileList[0].originFileObj);
          imageUrl = result.url;
        } catch {
          message.error('Failed to upload image');
          setLoading(false);
          return;
        }
      }

      const date = values.date?.format('YYYY-MM-DD');
      const startTimeStr = values.start_time?.format('HH:mm:ss');
      const endTimeStr = values.end_time?.format('HH:mm:ss');

      const isMainEvent = activityType === 'main_event';

      const data: Partial<Activity> = {
        title: values.title,
        description: values.description,
        start_time: date && startTimeStr ? `${date}T${startTimeStr}` : undefined,
        end_time: date && endTimeStr ? `${date}T${endTimeStr}` : undefined,
        location: values.location,
        max_participants: isMainEvent && hasCapacityLimit ? values.max_participants : undefined,
        requires_signup: isMainEvent,
        notes: values.notes,
        image_url: imageUrl,
        dress_code_info: values.dress_code_info || undefined,
        dress_colors: dressColors.length > 0 ? dressColors : undefined,
        food_description: values.food_description || undefined,
        dietary_options: selectedDietaryOptions.length > 0 ? selectedDietaryOptions : undefined,
        latitude: values.latitude || undefined,
        longitude: values.longitude || undefined,
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
    setActivityType('main_event');
    setHasCapacityLimit(false);
    setDressColors([]);
    setSelectedDietaryOptions([]);
    onClose();
  };

  return (
    <StyledModal
      title={activity ? 'Edit Activity' : 'Add Activity'}
      open={open}
      onCancel={handleClose}
      destroyOnClose
      maskClosable
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
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: 'block', marginBottom: 12 }}>Activity Type</Text>
          <Radio.Group
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="large"
            style={{ width: '100%', display: 'flex' }}
          >
            <Radio.Button value="main_event" style={{ flex: 1, textAlign: 'center' }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              Main Event
            </Radio.Button>
            <Radio.Button value="things_to_do" style={{ flex: 1, textAlign: 'center' }}>
              <CompassOutlined style={{ marginRight: 8 }} />
              Things to Do
            </Radio.Button>
          </Radio.Group>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
            {activityType === 'main_event'
              ? 'Main events appear on the RSVP page for guest registration.'
              : 'Things to Do are informational - shown as suggestions, no registration needed.'}
          </Text>
        </div>

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

        <Row gutter={16}>
          <Col xs={12}>
            <Form.Item name="latitude" label="Latitude">
              <InputNumber
                min={-90}
                max={90}
                step={0.0001}
                style={{ width: '100%' }}
                placeholder="e.g., 25.2048"
              />
            </Form.Item>
          </Col>
          <Col xs={12}>
            <Form.Item name="longitude" label="Longitude">
              <InputNumber
                min={-180}
                max={180}
                step={0.0001}
                style={{ width: '100%' }}
                placeholder="e.g., 55.2708"
              />
            </Form.Item>
          </Col>
        </Row>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 24, marginTop: -16 }}>
          Tip: Right-click on Google Maps and click the coordinates to copy them
        </Text>

        {activityType === 'main_event' && (
          <>
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
          </>
        )}

        {/* Dress Code Section */}
        <SectionTitle><SkinOutlined /> Dress Code</SectionTitle>
        <Form.Item name="dress_code_info" label="Dress Code Description">
          <TextArea
            placeholder="e.g., Smart casual, Traditional attire, Black tie..."
            rows={2}
          />
        </Form.Item>

        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Color Palette</Text>
          {dressColors.length > 0 && (
            <ColorPaletteWrapper>
              {dressColors.map((color, index) => (
                <ColorItem key={index}>
                  <ColorSwatch $color={color.hex} />
                  <ColorName>{color.name}</ColorName>
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveColor(index)}
                    style={{ color: colors.textSecondary, padding: '0 4px' }}
                  />
                </ColorItem>
              ))}
            </ColorPaletteWrapper>
          )}
          <AddColorRow>
            <Input
              placeholder="Color name"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              style={{ width: 160 }}
              onPressEnter={handleAddColor}
            />
            <Input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              style={{ width: 50, padding: 2, height: 32 }}
            />
            <Button onClick={handleAddColor} icon={<PlusOutlined />} disabled={!newColorName.trim()}>
              Add
            </Button>
          </AddColorRow>
        </div>

        {/* Food Section */}
        <SectionTitle><CoffeeOutlined /> Food & Dining</SectionTitle>
        <Form.Item name="food_description" label="Food Description">
          <TextArea
            placeholder="e.g., Buffet dinner with live cooking stations, Seated 5-course meal..."
            rows={2}
          />
        </Form.Item>

        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Dietary Options Available</Text>
          <Checkbox.Group
            value={selectedDietaryOptions}
            onChange={(values) => setSelectedDietaryOptions(values as string[])}
          >
            <Row gutter={[8, 8]}>
              {DIETARY_OPTIONS.map((option) => (
                <Col key={option} xs={12} sm={8}>
                  <Checkbox value={option}>{option}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </div>

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
