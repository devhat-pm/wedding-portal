import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Radio,
  Row,
  Col,
  Tag,
} from 'antd';
import {
  CheckCircleFilled,
  EditOutlined,
  CoffeeOutlined,
  HeartOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import { useGuestPortal } from '../../../context/GuestPortalContext';
import SectionHeader from '../../../components/guest/SectionHeader';
import MenuDisplay from '../../../components/guest/MenuDisplay';
import type { DietaryOption } from '../../../types';

const { TextArea } = Input;

const SectionWrapper = styled.section`
  padding: 80px 24px;
  max-width: 920px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }

  @media (max-width: 480px) {
    padding: 48px 16px;
  }
`;

const MenusSection = styled.div`
  margin-bottom: 48px;
`;

const MenusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 28px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const PreferenceCard = styled(motion.div)`
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${shadows.lg};
  overflow: hidden;
  position: relative;
`;

const FoodDecoration = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 40px;
  opacity: 0.08;
`;

const PreferenceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.creamLight} 100%);
  border-bottom: 1px solid ${colors.borderGold};
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
`;

const HeaderText = styled.div``;

const HeaderLabel = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: ${colors.secondary};
  margin: 0;
`;


const PreferenceContent = styled.div`
  padding: 32px;

  @media (max-width: 768px) {
    padding: 28px 24px;
  }

  @media (max-width: 480px) {
    padding: 24px 20px;
  }
`;

const StyledForm = styled(Form)`
  .ant-form-item-label > label {
    font-weight: 500;
    color: ${colors.textPrimary};
  }

  .ant-input,
  .ant-select-selector {
    border-radius: ${borderRadius.md}px !important;
  }
`;

const FormSection = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FormSectionTitle = styled.h4`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.secondary};
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: 0.3px;

  svg {
    color: ${colors.primary};
    font-size: 17px;
  }
`;

const DietaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const DietaryCheckbox = styled(Checkbox)`
  && {
    width: 100%;
    padding: 16px 18px;
    background: ${colors.creamLight};
    border-radius: ${borderRadius.md}px;
    border: 1px solid ${colors.creamDark};
    margin: 0;
    transition: all 0.2s ease;
    font-size: 15px;

    &:hover {
      border-color: ${colors.borderGold};
      background: white;
    }

    &.ant-checkbox-wrapper-checked {
      background: ${colors.goldPale};
      border-color: ${colors.primary};
      box-shadow: 0 2px 8px rgba(183, 168, 154, 0.15);
    }

    .ant-checkbox {
      top: 0;
    }
  }
`;

const PortionWrapper = styled.div``;

const PortionOptions = styled(Radio.Group)`
  && {
    display: flex;
    gap: 12px;
    width: 100%;

    @media (max-width: 600px) {
      flex-direction: column;
    }
  }
`;

const PortionOption = styled(Radio.Button)`
  && {
    flex: 1;
    height: auto;
    padding: 20px;
    text-align: center;
    border-radius: ${borderRadius.lg}px !important;
    border: 2px solid ${colors.creamDark};
    background: ${colors.creamLight};
    transition: all 0.2s ease;

    &::before {
      display: none;
    }

    &:hover {
      border-color: ${colors.borderGold};
      background: white;
    }

    &.ant-radio-button-wrapper-checked {
      background: ${colors.goldPale};
      border-color: ${colors.primary};
      color: ${colors.secondary};
      box-shadow: 0 4px 12px rgba(183, 168, 154, 0.2);
    }
  }
`;

const PortionIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const PortionLabel = styled.div`
  font-weight: 600;
  color: ${colors.secondary};
`;

const PortionDesc = styled.div`
  font-size: 12px;
  color: ${colors.textSecondary};
  margin-top: 4px;
`;

const SubmitButton = styled(Button)`
  && {
    width: 100%;
    height: 60px;
    font-size: 17px;
    font-weight: 600;
    border-radius: ${borderRadius.lg}px;
    margin-top: 16px;
    box-shadow: 0 4px 16px rgba(183, 168, 154, 0.3);
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(183, 168, 154, 0.4);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }
`;

// Saved preferences display
const SavedPreferencesCard = styled(motion.div)`
  background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.creamLight} 100%);
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${colors.borderGold};
  padding: 32px;
  box-shadow: ${shadows.md};

  @media (max-width: 480px) {
    padding: 24px 20px;
  }
`;

const SavedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const SavedTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SavedIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${colors.success};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
`;

const SavedLabel = styled.span`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.secondary};
`;

const SavedContent = styled.div`
  display: grid;
  gap: 16px;
`;

const SavedSection = styled.div`
  padding: 16px;
  background: white;
  border-radius: ${borderRadius.md}px;
`;

const SavedSectionTitle = styled.div`
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${colors.textSecondary};
  margin-bottom: 8px;
`;

const SavedTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SavedTag = styled(Tag)`
  && {
    border-radius: 20px;
    padding: 4px 12px;
    background: ${colors.goldPale};
    border-color: ${colors.borderGold};
    color: ${colors.primary};
  }
`;

const SavedText = styled.div`
  font-size: 14px;
  color: ${colors.textPrimary};
`;

const DIETARY_OPTIONS: { value: DietaryOption; label: string; icon: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'halal', label: 'Halal', icon: '🍖' },
  { value: 'gluten_free', label: 'Gluten-Free', icon: '🌾' },
  { value: 'dairy_free', label: 'Dairy-Free', icon: '🥛' },
  { value: 'nut_free', label: 'Nut-Free', icon: '🥜' },
];

const PORTION_OPTIONS = [
  { value: 'light', label: 'Light', desc: 'Smaller portions', icon: '🥗' },
  { value: 'regular', label: 'Regular', desc: 'Standard portions', icon: '🍽️' },
  { value: 'large', label: 'Large', desc: 'Generous portions', icon: '🍲' },
];

interface FoodFormData {
  dietary_restrictions: DietaryOption[];
  allergies: string;
  cuisine_preferences: string;
  meal_size_preference: string;
  special_requests: string;
}

const FoodSection: React.FC = () => {
  const { portalData, updateFoodPreference } = useGuestPortal();
  const [form] = Form.useForm();

  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryOption[]>([]);
  const [portionSize, setPortionSize] = useState<string>('regular');

  useEffect(() => {
    if (portalData?.food_preference) {
      const pref = portalData.food_preference;
      setIsEditing(false);
      setDietaryRestrictions(pref.dietary_restrictions as DietaryOption[] || []);
      setPortionSize(pref.meal_size_preference || 'regular');

      form.setFieldsValue({
        allergies: pref.allergies,
        cuisine_preferences: pref.cuisine_preferences,
        special_requests: pref.special_requests,
      });
    } else {
      setIsEditing(true);
    }
  }, [portalData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const data = {
        dietary_restrictions: dietaryRestrictions,
        allergies: values.allergies,
        cuisine_preferences: values.cuisine_preferences,
        meal_size_preference: portionSize,
        special_requests: values.special_requests,
      };

      await updateFoodPreference(data);
      setIsEditing(false);
    } catch (error) {
      // Validation error
    } finally {
      setLoading(false);
    }
  };

  const handleDietaryChange = (option: DietaryOption, checked: boolean) => {
    if (checked) {
      setDietaryRestrictions((prev) => [...prev, option]);
    } else {
      setDietaryRestrictions((prev) => prev.filter((d) => d !== option));
    }
  };

  if (!portalData) return null;

  const food_menus = portalData.food_menus || [];
  const food_preference = portalData.food_preference;

  return (
    <SectionWrapper>
      <SectionHeader
        title="Food Preferences"
        subtitle="View the menu and share your dietary preferences"
        icon={<CoffeeOutlined />}
      />

      {/* Menu Display */}
      {food_menus.length > 0 && (
        <MenusSection>
          <MenusGrid>
            {food_menus.map((menu) => (
              <MenuDisplay key={menu.id} menu={menu} />
            ))}
          </MenusGrid>
        </MenusSection>
      )}

      {/* Preference Form or Saved Display */}
      {!isEditing && food_preference ? (
        <SavedPreferencesCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SavedHeader>
            <SavedTitle>
              <SavedIcon>
                <CheckCircleFilled />
              </SavedIcon>
              <SavedLabel>Food Preferences Saved</SavedLabel>
            </SavedTitle>
            <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </SavedHeader>

          <SavedContent>
            {dietaryRestrictions.length > 0 && (
              <SavedSection>
                <SavedSectionTitle>Dietary Requirements</SavedSectionTitle>
                <SavedTags>
                  {dietaryRestrictions.map((diet) => {
                    const option = DIETARY_OPTIONS.find((o) => o.value === diet);
                    return (
                      <SavedTag key={diet}>
                        {option?.icon} {option?.label || diet}
                      </SavedTag>
                    );
                  })}
                </SavedTags>
              </SavedSection>
            )}

            {food_preference.allergies && (
              <SavedSection>
                <SavedSectionTitle>Allergies</SavedSectionTitle>
                <SavedText>{food_preference.allergies}</SavedText>
              </SavedSection>
            )}

            {food_preference.cuisine_preferences && (
              <SavedSection>
                <SavedSectionTitle>Cuisine Preferences</SavedSectionTitle>
                <SavedText>{food_preference.cuisine_preferences}</SavedText>
              </SavedSection>
            )}

            <SavedSection>
              <SavedSectionTitle>Portion Size</SavedSectionTitle>
              <SavedTags>
                <SavedTag>
                  {PORTION_OPTIONS.find((p) => p.value === portionSize)?.icon}{' '}
                  {PORTION_OPTIONS.find((p) => p.value === portionSize)?.label}
                </SavedTag>
              </SavedTags>
            </SavedSection>

            {food_preference.special_requests && (
              <SavedSection>
                <SavedSectionTitle>Special Requests</SavedSectionTitle>
                <SavedText>{food_preference.special_requests}</SavedText>
              </SavedSection>
            )}
          </SavedContent>
        </SavedPreferencesCard>
      ) : (
        <PreferenceCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FoodDecoration>🍽️</FoodDecoration>

          <PreferenceHeader>
            <HeaderTitle>
              <HeaderIcon>
                <HeartOutlined />
              </HeaderIcon>
              <HeaderText>
                <HeaderLabel>Your Food Preferences</HeaderLabel>
              </HeaderText>
            </HeaderTitle>
          </PreferenceHeader>

          <PreferenceContent>
            <StyledForm form={form} layout="vertical" requiredMark={false}>
              <FormSection>
                <FormSectionTitle>
                  <CoffeeOutlined />
                  Dietary Requirements
                </FormSectionTitle>
                <DietaryGrid>
                  {DIETARY_OPTIONS.map((option) => (
                    <DietaryCheckbox
                      key={option.value}
                      checked={dietaryRestrictions.includes(option.value)}
                      onChange={(e) =>
                        handleDietaryChange(option.value, e.target.checked)
                      }
                    >
                      {option.icon} {option.label}
                    </DietaryCheckbox>
                  ))}
                </DietaryGrid>
              </FormSection>

              <FormSection>
                <FormSectionTitle>
                  <WarningOutlined />
                  Allergies
                </FormSectionTitle>
                <Form.Item name="allergies">
                  <TextArea
                    placeholder="Please list any food allergies (e.g., shellfish, eggs, soy)"
                    rows={2}
                    style={{ resize: 'none' }}
                  />
                </Form.Item>
              </FormSection>

              <FormSection>
                <FormSectionTitle>
                  <HeartOutlined />
                  Cuisine Preferences
                </FormSectionTitle>
                <Form.Item name="cuisine_preferences">
                  <TextArea
                    placeholder="What cuisines do you enjoy most? (e.g., Middle Eastern, Mediterranean, Indian)"
                    rows={2}
                    style={{ resize: 'none' }}
                  />
                </Form.Item>
              </FormSection>

              <FormSection>
                <FormSectionTitle>Portion Size Preference</FormSectionTitle>
                <PortionWrapper>
                  <PortionOptions
                    value={portionSize}
                    onChange={(e) => setPortionSize(e.target.value)}
                  >
                    {PORTION_OPTIONS.map((option) => (
                      <PortionOption key={option.value} value={option.value}>
                        <PortionIcon>{option.icon}</PortionIcon>
                        <PortionLabel>{option.label}</PortionLabel>
                        <PortionDesc>{option.desc}</PortionDesc>
                      </PortionOption>
                    ))}
                  </PortionOptions>
                </PortionWrapper>
              </FormSection>

              <FormSection>
                <FormSectionTitle>Special Requests</FormSectionTitle>
                <Form.Item name="special_requests">
                  <TextArea
                    placeholder="Any other dietary needs or special requests..."
                    rows={3}
                    style={{ resize: 'none' }}
                  />
                </Form.Item>
              </FormSection>

              <SubmitButton
                type="primary"
                size="large"
                loading={loading}
                onClick={handleSubmit}
                icon={<CheckCircleFilled />}
              >
                Save Food Preferences
              </SubmitButton>
            </StyledForm>
          </PreferenceContent>
        </PreferenceCard>
      )}
    </SectionWrapper>
  );
};

export default FoodSection;
