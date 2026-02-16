import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Button,
  Space,
  Typography,
  message,
  Upload,
  ColorPicker,
  Row,
  Col,
  Card,
  Popconfirm,
} from 'antd';
import type { Color } from 'antd/es/color-picker';
import { PlusOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { colors, borderRadius, shadows } from '../../../styles/theme';
import type { DressCode, ColorPaletteItem } from '../../../types';

const { Text } = Typography;
const { TextArea } = Input;

interface DressCodeFormProps {
  open: boolean;
  dressCode?: DressCode | null;
  onClose: () => void;
  onSubmit: (data: Partial<DressCode>) => Promise<void>;
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
  .ant-select-selector {
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

const ColorPaletteWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
`;

const ColorItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${colors.creamLight};
  border-radius: ${borderRadius.md}px;
  border: 1px solid ${colors.creamDark};
`;

const ColorSwatch = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: ${borderRadius.sm}px;
  background: ${(props) => props.$color};
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: ${shadows.sm};
`;

const ColorName = styled.span`
  font-size: 13px;
  color: ${colors.textPrimary};
  min-width: 80px;
`;

const AddColorButton = styled(Button)`
  && {
    border-style: dashed;
    height: 50px;
  }
`;

const ColorInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${colors.goldPale};
  border-radius: ${borderRadius.md}px;
  margin-bottom: 16px;
`;

const ImageUploadWrapper = styled.div`
  .ant-upload-list-picture-card {
    .ant-upload-list-item-container {
      width: 120px !important;
      height: 120px !important;
    }
  }
`;

const PreviewSection = styled(Card)`
  margin-top: 24px;
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.borderGold};
`;

const PreviewPalette = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const PreviewSwatch = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${borderRadius.md}px;
  background: ${(props) => props.$color};
  border: 2px solid white;
  box-shadow: ${shadows.sm};
`;

interface ColorPaletteItemInput {
  id: string;
  color: string;
  name: string;
}

const DressCodeForm: React.FC<DressCodeFormProps> = ({ open, dressCode, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [colorPalette, setColorPalette] = useState<ColorPaletteItemInput[]>([]);
  const [showColorInput, setShowColorInput] = useState(false);
  const [newColor, setNewColor] = useState('#B7A89A');
  const [newColorName, setNewColorName] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (dressCode) {
      form.setFieldsValue({
        event_name: dressCode.event_name,
        event_date: dressCode.event_date ? dayjs(dressCode.event_date) : null,
        theme_description: dressCode.theme_description,
        men_suggestions: dressCode.men_suggestions,
        women_suggestions: dressCode.women_suggestions,
        notes: dressCode.notes,
      });
      setColorPalette(
        dressCode.color_palette?.map((c, i) => ({
          id: `${i}`,
          color: c.color_code,
          name: c.color_name,
        })) || []
      );
      setFileList(
        dressCode.inspiration_images?.map((url, i) => ({
          uid: `${i}`,
          name: `image-${i}`,
          status: 'done',
          url,
        })) || []
      );
    } else {
      form.resetFields();
      setColorPalette([]);
      setFileList([]);
    }
    setShowColorInput(false);
    setNewColor('#B7A89A');
    setNewColorName('');
  }, [dressCode, form, open]);

  const handleAddColor = () => {
    if (!newColorName.trim()) {
      message.warning('Please enter a color name');
      return;
    }
    setColorPalette((prev) => [
      ...prev,
      { id: Date.now().toString(), color: newColor, name: newColorName },
    ]);
    setNewColor('#B7A89A');
    setNewColorName('');
    setShowColorInput(false);
  };

  const handleRemoveColor = (id: string) => {
    setColorPalette((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const data: Partial<DressCode> = {
        event_name: values.event_name,
        event_date: values.event_date?.format('YYYY-MM-DD'),
        theme_description: values.theme_description,
        men_suggestions: values.men_suggestions,
        women_suggestions: values.women_suggestions,
        notes: values.notes,
        color_palette: colorPalette.map((c) => ({
          color_code: c.color,
          color_name: c.name,
        })),
        inspiration_images: fileList.map((f) => f.url || f.response?.url).filter(Boolean),
      };

      await onSubmit(data);
      message.success(dressCode ? 'Dress code updated!' : 'Dress code added!');
      onClose();
    } catch (error) {
      // Validation error
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setColorPalette([]);
    setFileList([]);
    onClose();
  };

  return (
    <StyledModal
      title={dressCode ? 'Edit Dress Code' : 'Add Dress Code'}
      open={open}
      onCancel={handleClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {dressCode ? 'Save Changes' : 'Add Dress Code'}
        </Button>,
      ]}
    >
      <StyledForm form={form} layout="vertical" requiredMark={false}>
        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Form.Item
              name="event_name"
              label="Event Name"
              rules={[{ required: true, message: 'Please enter event name' }]}
            >
              <Input placeholder="e.g., Henna Night, Wedding Ceremony" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="event_date" label="Event Date">
              <DatePicker style={{ width: '100%' }} size="large" format="MMMM D, YYYY" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="theme_description" label="Theme Description">
          <TextArea
            placeholder="Describe the dress code theme (e.g., Elegant Traditional, Black Tie, etc.)"
            rows={2}
          />
        </Form.Item>

        <SectionTitle>Color Palette</SectionTitle>
        <ColorPaletteWrapper>
          {colorPalette.map((item) => (
            <ColorItem key={item.id}>
              <ColorSwatch $color={item.color} />
              <ColorName>{item.name}</ColorName>
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleRemoveColor(item.id)}
              />
            </ColorItem>
          ))}
          {!showColorInput && (
            <AddColorButton
              icon={<PlusOutlined />}
              onClick={() => setShowColorInput(true)}
            >
              Add Color
            </AddColorButton>
          )}
        </ColorPaletteWrapper>

        {showColorInput && (
          <ColorInputRow>
            <ColorPicker
              value={newColor}
              onChange={(color: Color) => setNewColor(color.toHexString())}
            />
            <Input
              placeholder="Color name (e.g., Rose Gold)"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              style={{ width: 200 }}
              onPressEnter={handleAddColor}
            />
            <Button type="primary" onClick={handleAddColor}>
              Add
            </Button>
            <Button onClick={() => setShowColorInput(false)}>Cancel</Button>
          </ColorInputRow>
        )}

        <SectionTitle>Dress Suggestions</SectionTitle>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="men_suggestions" label="For Men">
              <TextArea
                placeholder="e.g., Traditional Kandura in white or cream, formal dress shoes..."
                rows={4}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="women_suggestions" label="For Women">
              <TextArea
                placeholder="e.g., Floor-length gown in palette colors, elegant jewelry..."
                rows={4}
              />
            </Form.Item>
          </Col>
        </Row>

        <SectionTitle>Inspiration Images</SectionTitle>
        <ImageUploadWrapper>
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            multiple
          >
            {fileList.length < 6 && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </ImageUploadWrapper>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Add up to 6 inspiration images for your guests
        </Text>

        <Form.Item name="notes" label="Additional Notes" style={{ marginTop: 24 }}>
          <TextArea placeholder="Any additional notes or instructions..." rows={2} />
        </Form.Item>

        {colorPalette.length > 0 && (
          <PreviewSection size="small" title="Preview">
            <PreviewPalette>
              {colorPalette.map((item) => (
                <div key={item.id} style={{ textAlign: 'center' }}>
                  <PreviewSwatch $color={item.color} />
                  <Text style={{ display: 'block', fontSize: 11, marginTop: 4 }}>
                    {item.name}
                  </Text>
                </div>
              ))}
            </PreviewPalette>
          </PreviewSection>
        )}
      </StyledForm>
    </StyledModal>
  );
};

export default DressCodeForm;
