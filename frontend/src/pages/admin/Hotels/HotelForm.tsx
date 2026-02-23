import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Rate,
  Upload,
  Button,
  Typography,
  message,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  LinkOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import styled from '@emotion/styled';
import { colors, borderRadius } from '../../../styles/theme';
import type { SuggestedHotel } from '../../../types';
import * as hotelsApi from '../../../services/hotels.api';
import { getImageUrl } from '../../../utils/helpers';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface HotelFormProps {
  open: boolean;
  hotel?: SuggestedHotel | null;
  onClose: () => void;
  onSubmit: (data: Partial<SuggestedHotel>) => Promise<void>;
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
    max-height: 70vh;
    overflow-y: auto;
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
  .ant-input-number,
  .ant-select-selector,
  .ant-input-affix-wrapper {
    height: 44px !important;
    border-radius: 6px !important;
    border: 1px solid #D6C7B8 !important;
    font-size: 14px;
  }

  .ant-input:hover,
  .ant-input-number:hover,
  .ant-select-selector:hover,
  .ant-input-affix-wrapper:hover {
    border-color: ${colors.primary} !important;
  }

  .ant-input:focus,
  .ant-input-number:focus,
  .ant-select-focused .ant-select-selector,
  .ant-input-affix-wrapper-focused {
    border-color: ${colors.primary} !important;
    box-shadow: 0 0 0 2px rgba(183, 168, 154, 0.1) !important;
  }

  .ant-input-affix-wrapper {
    padding: 0 12px;

    .ant-input {
      height: auto !important;
      border: none !important;
      box-shadow: none !important;
    }

    .ant-input-prefix {
      margin-right: 10px;
      color: ${colors.textSecondary};
    }
  }

  .ant-select-selector {
    display: flex;
    align-items: center;
  }

  .ant-textarea {
    height: auto !important;
    min-height: 80px !important;
    padding: 12px !important;
  }
`;

const ImageUploadWrapper = styled.div`
  .ant-upload-list-item-container {
    width: 104px !important;
    height: 104px !important;
  }
`;

const amenitiesList = [
  'WiFi',
  'Pool',
  'Spa',
  'Restaurant',
  'Bar',
  'Parking',
  'Gym',
  'Room Service',
  'Airport Shuttle',
  'Business Center',
  'Concierge',
  'Laundry',
  'Beach Access',
  'Kids Club',
  'Pet Friendly',
];

const priceRanges = ['$', '$$', '$$$', '$$$$', '$$$$$'];

const HotelForm: React.FC<HotelFormProps> = ({ open, hotel, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (hotel) {
      // Map backend fields to frontend form fields
      const hotelData = hotel as any;
      form.setFieldsValue({
        name: hotelData.hotel_name || hotel.name,
        address: hotel.address,
        phone: hotel.phone,
        website: hotelData.website_url || hotel.website,
        booking_url: hotelData.booking_link || hotel.booking_url,
        distance_from_venue: hotel.distance_from_venue,
        price_range: hotel.price_range,
        star_rating: hotel.star_rating,
        description: hotel.description,
        amenities: hotel.amenities || [],
      });
      // Load all existing images - store original URL in response for submission
      const urls = hotelData.image_urls || (hotel.image_url ? [hotel.image_url] : []);
      setFileList(
        urls.map((url: string, i: number) => ({
          uid: String(-1 - i),
          name: `hotel-image-${i}`,
          status: 'done' as const,
          url: getImageUrl(url) || url,
          response: { url }, // keep original relative URL
        }))
      );
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [hotel, form, open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Upload any new files and collect all URLs
      const imageUrls: string[] = [];
      for (const file of fileList) {
        if (file.originFileObj) {
          // New file - upload it
          try {
            const result = await hotelsApi.uploadHotelImage(file.originFileObj);
            imageUrls.push(result.url);
          } catch {
            message.error('Failed to upload image');
            setLoading(false);
            return;
          }
        } else if (file.response?.url) {
          // Existing image - use original relative URL
          imageUrls.push(file.response.url);
        } else if (file.url) {
          imageUrls.push(file.url);
        }
      }

      // Map frontend fields to backend schema
      const data: any = {
        hotel_name: values.name,
        address: values.address,
        phone: values.phone,
        website_url: values.website,
        booking_link: values.booking_url,
        distance_from_venue: values.distance_from_venue,
        price_range: values.price_range,
        star_rating: values.star_rating,
        description: values.description,
        amenities: values.amenities,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      };

      await onSubmit(data);
      message.success(hotel ? 'Hotel updated successfully!' : 'Hotel added successfully!');
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
    onClose();
  };

  return (
    <StyledModal
      title={hotel ? 'Edit Hotel' : 'Add New Hotel'}
      open={open}
      onCancel={handleClose}
      centered
      destroyOnClose
      width={700}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {hotel ? 'Save Changes' : 'Add Hotel'}
        </Button>,
      ]}
    >
      <StyledForm form={form} layout="vertical" requiredMark={false}>
        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Form.Item
              name="name"
              label="Hotel Name"
              rules={[{ required: true, message: 'Please enter hotel name' }]}
            >
              <Input placeholder="e.g., The Grand Palace Hotel" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="star_rating" label="Star Rating">
              <Rate allowHalf />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="address" label="Address">
          <Input
            prefix={<EnvironmentOutlined />}
            placeholder="Full hotel address"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="phone" label="Phone Number">
              <Input
                prefix={<PhoneOutlined />}
                placeholder="+1 234 567 8900"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="website" label="Website">
              <Input
                prefix={<GlobalOutlined />}
                placeholder="https://hotel-website.com"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="booking_url" label="Booking Link">
          <Input
            prefix={<LinkOutlined />}
            placeholder="Direct booking URL for guests"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="distance_from_venue" label="Distance from Venue">
              <Input placeholder="e.g., 5 minutes drive, 2 km" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="price_range" label="Price Range">
              <Select placeholder="Select price range">
                {priceRanges.map((range) => (
                  <Option key={range} value={range}>
                    {range} {range === '$' ? '(Budget)' : range === '$$$$$' ? '(Luxury)' : ''}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="amenities" label="Amenities">
          <Select
            mode="multiple"
            placeholder="Select amenities"
            maxTagCount={5}
          >
            {amenitiesList.map((amenity) => (
              <Option key={amenity} value={amenity}>
                {amenity}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea
            placeholder="Brief description of the hotel..."
            rows={3}
            maxLength={500}
            showCount
            className="ant-textarea"
          />
        </Form.Item>

        <Form.Item label="Hotel Images" style={{ marginBottom: 0 }}>
          <ImageUploadWrapper>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              multiple
              maxCount={5}
            >
              {fileList.length < 5 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </ImageUploadWrapper>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Add up to 5 images. Recommended size: 800x600 pixels
          </Text>
        </Form.Item>
      </StyledForm>
    </StyledModal>
  );
};

export default HotelForm;
