import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Typography,
  message,
  Checkbox,
  Collapse,
  Row,
  Col,
  Card,
} from 'antd';
import { PlusOutlined, DeleteOutlined, CoffeeOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { colors, borderRadius, shadows } from '../../../styles/theme';
import type { FoodMenu, MenuItem, DietaryOption } from '../../../types';

const { Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

interface FoodMenuFormProps {
  open: boolean;
  foodMenu?: FoodMenu | null;
  onClose: () => void;
  onSubmit: (data: Partial<FoodMenu>) => Promise<void>;
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

const CategoryCollapse = styled(Collapse)`
  && {
    background: transparent;
    border: none;

    .ant-collapse-item {
      border: 1px solid ${colors.borderGold};
      border-radius: ${borderRadius.lg}px !important;
      margin-bottom: 12px;
      overflow: hidden;
      background: ${colors.cardBg};

      &:last-child {
        border-radius: ${borderRadius.lg}px !important;
      }
    }

    .ant-collapse-header {
      font-weight: 600;
      color: ${colors.secondary};
      background: ${colors.creamLight};
    }

    .ant-collapse-content {
      border-top: 1px solid ${colors.creamDark};
    }

    .ant-collapse-content-box {
      padding: 16px;
    }
  }
`;

const MenuItemCard = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px;
  background: ${colors.creamLight};
  border-radius: ${borderRadius.md}px;
  margin-bottom: 12px;
  align-items: flex-start;

  &:last-child {
    margin-bottom: 0;
  }
`;

const MenuItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AddItemButton = styled(Button)`
  && {
    border-style: dashed;
    width: 100%;
    margin-top: 8px;
  }
`;

const DietaryCheckboxGroup = styled(Checkbox.Group)`
  && {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;

    .ant-checkbox-wrapper {
      margin-inline-start: 0;
    }
  }
`;

const CategoryIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${colors.goldPale};
  color: ${colors.primary};
  margin-right: 8px;
  font-size: 14px;
`;

const PreviewCard = styled(Card)`
  margin-top: 24px;
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.borderGold};
`;

const PreviewCategory = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const PreviewCategoryTitle = styled.h5`
  font-family: 'Playfair Display', serif;
  color: ${colors.primary};
  margin: 0 0 8px;
  font-size: 14px;
`;

const PreviewItem = styled.div`
  padding-left: 16px;
  margin-bottom: 4px;
  color: ${colors.textPrimary};
  font-size: 13px;
`;

type MenuCategory = 'starters' | 'mains' | 'desserts' | 'beverages';

interface MenuItemInput {
  id: string;
  name: string;
  description: string;
}

interface MenuItemsByCategory {
  starters: MenuItemInput[];
  mains: MenuItemInput[];
  desserts: MenuItemInput[];
  beverages: MenuItemInput[];
}

const CATEGORIES: { key: MenuCategory; label: string; icon: string }[] = [
  { key: 'starters', label: 'Starters', icon: '🥗' },
  { key: 'mains', label: 'Main Courses', icon: '🍽️' },
  { key: 'desserts', label: 'Desserts', icon: '🍰' },
  { key: 'beverages', label: 'Beverages', icon: '🍹' },
];

const DIETARY_OPTIONS: { value: DietaryOption; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'gluten_free', label: 'Gluten-Free' },
  { value: 'nut_free', label: 'Nut-Free' },
  { value: 'dairy_free', label: 'Dairy-Free' },
];

const FoodMenuForm: React.FC<FoodMenuFormProps> = ({ open, foodMenu, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItemsByCategory>({
    starters: [],
    mains: [],
    desserts: [],
    beverages: [],
  });
  const [dietaryOptions, setDietaryOptions] = useState<DietaryOption[]>([]);
  const [activeCategories, setActiveCategories] = useState<string[]>(['starters', 'mains']);

  useEffect(() => {
    if (foodMenu) {
      form.setFieldsValue({
        event_name: foodMenu.event_name,
        notes: foodMenu.notes,
      });

      // Parse existing menu items into categories
      const categorizedItems: MenuItemsByCategory = {
        starters: [],
        mains: [],
        desserts: [],
        beverages: [],
      };

      foodMenu.menu_items?.forEach((item, index) => {
        const category = (item.category as MenuCategory) || 'mains';
        if (categorizedItems[category]) {
          categorizedItems[category].push({
            id: `${index}`,
            name: item.name,
            description: item.description || '',
          });
        }
      });

      setMenuItems(categorizedItems);
      setDietaryOptions(foodMenu.dietary_options || []);
    } else {
      form.resetFields();
      setMenuItems({
        starters: [],
        mains: [],
        desserts: [],
        beverages: [],
      });
      setDietaryOptions([]);
    }
    setActiveCategories(['starters', 'mains']);
  }, [foodMenu, form, open]);

  const handleAddItem = (category: MenuCategory) => {
    setMenuItems((prev) => ({
      ...prev,
      [category]: [
        ...prev[category],
        { id: Date.now().toString(), name: '', description: '' },
      ],
    }));
  };

  const handleRemoveItem = (category: MenuCategory, id: string) => {
    setMenuItems((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item.id !== id),
    }));
  };

  const handleItemChange = (
    category: MenuCategory,
    id: string,
    field: 'name' | 'description',
    value: string
  ) => {
    setMenuItems((prev) => ({
      ...prev,
      [category]: prev[category].map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Flatten menu items
      const allItems: MenuItem[] = [];
      CATEGORIES.forEach(({ key }) => {
        menuItems[key].forEach((item) => {
          if (item.name.trim()) {
            allItems.push({
              name: item.name,
              description: item.description || undefined,
              category: key,
            });
          }
        });
      });

      const data: Partial<FoodMenu> = {
        event_name: values.event_name,
        menu_items: allItems,
        dietary_options: dietaryOptions,
        notes: values.notes,
      };

      await onSubmit(data);
      message.success(foodMenu ? 'Menu updated!' : 'Menu added!');
      onClose();
    } catch (error) {
      // Validation error
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setMenuItems({
      starters: [],
      mains: [],
      desserts: [],
      beverages: [],
    });
    setDietaryOptions([]);
    onClose();
  };

  const getTotalItems = () => {
    return Object.values(menuItems).reduce((sum, items) => sum + items.filter(i => i.name.trim()).length, 0);
  };

  return (
    <StyledModal
      title={foodMenu ? 'Edit Food Menu' : 'Add Food Menu'}
      open={open}
      onCancel={handleClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {foodMenu ? 'Save Changes' : 'Add Menu'}
        </Button>,
      ]}
    >
      <StyledForm form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="event_name"
          label="Event Name"
          rules={[{ required: true, message: 'Please enter event name' }]}
        >
          <Input
            placeholder="e.g., Wedding Reception Dinner, Henna Night Buffet"
            size="large"
          />
        </Form.Item>

        <SectionTitle>Menu Items</SectionTitle>
        <CategoryCollapse
          activeKey={activeCategories}
          onChange={(keys) => setActiveCategories(keys as string[])}
        >
          {CATEGORIES.map(({ key, label, icon }) => (
            <Panel
              key={key}
              header={
                <span>
                  <CategoryIcon>{icon}</CategoryIcon>
                  {label}
                  {menuItems[key].length > 0 && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      ({menuItems[key].filter(i => i.name.trim()).length} items)
                    </Text>
                  )}
                </span>
              }
            >
              {menuItems[key].map((item) => (
                <MenuItemCard key={item.id}>
                  <MenuItemInfo>
                    <Row gutter={12}>
                      <Col xs={24} md={12}>
                        <Input
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) => handleItemChange(key, item.id, 'name', e.target.value)}
                        />
                      </Col>
                      <Col xs={24} md={12}>
                        <Input
                          placeholder="Description (optional)"
                          value={item.description}
                          onChange={(e) => handleItemChange(key, item.id, 'description', e.target.value)}
                        />
                      </Col>
                    </Row>
                  </MenuItemInfo>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveItem(key, item.id)}
                  />
                </MenuItemCard>
              ))}
              <AddItemButton
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => handleAddItem(key)}
              >
                Add {label.replace(/s$/, '')}
              </AddItemButton>
            </Panel>
          ))}
        </CategoryCollapse>

        <SectionTitle>Dietary Options Available</SectionTitle>
        <DietaryCheckboxGroup
          value={dietaryOptions}
          onChange={(values) => setDietaryOptions(values as DietaryOption[])}
        >
          {DIETARY_OPTIONS.map((option) => (
            <Checkbox key={option.value} value={option.value}>
              {option.label}
            </Checkbox>
          ))}
        </DietaryCheckboxGroup>

        <Form.Item name="notes" label="Additional Notes" style={{ marginTop: 24 }}>
          <TextArea
            placeholder="Any additional notes about the menu or dining arrangements..."
            rows={3}
          />
        </Form.Item>

        {getTotalItems() > 0 && (
          <PreviewCard size="small" title="Menu Preview">
            {CATEGORIES.map(({ key, label }) => {
              const items = menuItems[key].filter(i => i.name.trim());
              if (items.length === 0) return null;
              return (
                <PreviewCategory key={key}>
                  <PreviewCategoryTitle>{label}</PreviewCategoryTitle>
                  {items.map((item) => (
                    <PreviewItem key={item.id}>
                      • {item.name}
                      {item.description && (
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          — {item.description}
                        </Text>
                      )}
                    </PreviewItem>
                  ))}
                </PreviewCategory>
              );
            })}
          </PreviewCard>
        )}
      </StyledForm>
    </StyledModal>
  );
};

export default FoodMenuForm;
