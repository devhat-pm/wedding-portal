import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Form,
  Input,
  Button,
  Switch,
  Collapse,
  Image,
  Row,
  Col,
  Select,
} from 'antd';
import {
  CheckCircleFilled,
  EditOutlined,
  SkinOutlined,
  ManOutlined,
  WomanOutlined,
  CalendarOutlined,
  DownOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import { useGuestPortal } from '../../../context/GuestPortalContext';
import SectionHeader from '../../../components/guest/SectionHeader';
import ColorPalette from '../../../components/guest/ColorPalette';
import type { DressCode, ColorPaletteItem } from '../../../types';

const { TextArea } = Input;
const { Panel } = Collapse;

const SectionWrapper = styled.section`
  padding: 80px 24px;
  max-width: 820px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }

  @media (max-width: 480px) {
    padding: 48px 16px;
  }
`;

const DressCodeCard = styled(motion.div)`
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${shadows.lg};
  overflow: hidden;
  margin-bottom: 28px;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${shadows.xl};
  }
`;

const FabricDecoration = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 40px;
  opacity: 0.08;
`;

const CardHeader = styled.div<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px;
  cursor: pointer;
  background: ${(props) =>
    props.$expanded
      ? `linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.creamLight} 100%)`
      : 'transparent'};
  transition: all 0.3s ease;

  &:hover {
    background: ${colors.creamLight};
  }

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const EventIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${borderRadius.lg}px;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.goldDark} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
`;

const EventInfo = styled.div``;

const EventName = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: ${colors.secondary};
  margin: 0 0 4px;
`;

const EventDate = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${colors.textSecondary};
`;

const ExpandIcon = styled(DownOutlined)<{ $expanded: boolean }>`
  transition: transform 0.3s ease;
  transform: rotate(${(props) => (props.$expanded ? '180deg' : '0')});
  color: ${colors.textSecondary};
  font-size: 16px;
`;

const CardContent = styled(motion.div)`
  padding: 0 28px 28px;

  @media (max-width: 480px) {
    padding: 0 20px 20px;
  }
`;

const ContentSection = styled.div`
  margin-bottom: 28px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  font-family: 'Playfair Display', serif;
  font-size: 17px;
  color: ${colors.secondary};
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: 0.3px;
`;

const ThemeDescription = styled.p`
  font-size: 15px;
  line-height: 1.7;
  color: ${colors.textPrimary};
  margin: 0;
  padding: 16px;
  background: ${colors.creamLight};
  border-radius: ${borderRadius.md}px;
  border-left: 3px solid ${colors.primary};
`;

const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const SuggestionCard = styled.div<{ $gender: 'men' | 'women' }>`
  padding: 24px;
  background: ${colors.creamLight};
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.creamDark};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${colors.borderGold};
    box-shadow: ${shadows.sm};
  }
`;

const SuggestionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const SuggestionIcon = styled.div<{ $gender: 'men' | 'women' }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: ${(props) =>
    props.$gender === 'men' ? '#EEE8DF' : '#F3F1ED'};
  color: ${(props) => (props.$gender === 'men' ? '#7B756D' : '#9A9187')};
`;

const SuggestionTitle = styled.span`
  font-weight: 600;
  color: ${colors.secondary};
`;

const SuggestionText = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${colors.textPrimary};
  margin: 0;
`;

const InspirationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
`;

const InspirationImage = styled.div`
  border-radius: ${borderRadius.md}px;
  overflow: hidden;
  aspect-ratio: 1;
  background: ${colors.creamMedium};

  .ant-image {
    width: 100%;
    height: 100%;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DressCodeNotes = styled.div`
  padding: 16px;
  background: ${colors.goldPale};
  border-radius: ${borderRadius.md}px;
  font-size: 14px;
  color: ${colors.textSecondary};
  font-style: italic;
`;

// Preference form
const PreferenceCard = styled(motion.div)`
  background: linear-gradient(135deg, ${colors.creamLight} 0%, white 100%);
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.borderGold};
  padding: 28px;
  margin-top: 28px;

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const PreferenceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const PreferenceTitle = styled.h4`
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  color: ${colors.secondary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
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

const AssistanceToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: ${colors.goldPale};
  border-radius: ${borderRadius.md}px;
  margin-bottom: 16px;
`;

const AssistanceText = styled.div``;

const AssistanceTitle = styled.div`
  font-weight: 500;
  color: ${colors.secondary};
  font-size: 14px;
`;

const AssistanceDesc = styled.div`
  font-size: 12px;
  color: ${colors.textSecondary};
`;

const SubmitButton = styled(Button)`
  && {
    width: 100%;
    height: 56px;
    font-size: 16px;
    font-weight: 600;
    border-radius: ${borderRadius.lg}px;
    margin-top: 8px;
    box-shadow: 0 4px 12px rgba(183, 168, 154, 0.25);
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(183, 168, 154, 0.35);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }
`;

// Saved preference display
const SavedPreference = styled.div`
  padding: 16px;
  background: white;
  border-radius: ${borderRadius.md}px;
  border: 1px solid ${colors.creamDark};
`;

const SavedRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SavedLabel = styled.span`
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${colors.textSecondary};
`;

const SavedValue = styled.span`
  font-size: 14px;
  color: ${colors.textPrimary};
  text-align: right;
  max-width: 60%;
`;

const ColorBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: ${(props) => props.$color}20;
  border: 1px solid ${(props) => props.$color};
  border-radius: 20px;
  font-size: 12px;

  &::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${(props) => props.$color};
  }
`;

interface DressCodePreference {
  dressCodeId: number;
  outfitDescription?: string;
  selectedColor?: ColorPaletteItem;
  needsAssistance?: boolean;
  notes?: string;
}

const DressCodeSection: React.FC = () => {
  const { portalData, updateDressPreference } = useGuestPortal();
  const [form] = Form.useForm();

  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set([1]));
  const [editingPreferences, setEditingPreferences] = useState<Set<number>>(new Set());
  const [preferences, setPreferences] = useState<Record<number, DressCodePreference>>({});
  const [selectedColors, setSelectedColors] = useState<Record<number, ColorPaletteItem>>({});
  const [needsAssistance, setNeedsAssistance] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!portalData) return;

    const prefs: Record<number, DressCodePreference> = {};

    // Read preferences from dress_codes[].guest_preference (backend embeds them there)
    if (portalData.dress_codes) {
      portalData.dress_codes.forEach((dc: any) => {
        const pref = dc.guest_preference;
        if (pref) {
          prefs[dc.id] = {
            dressCodeId: dc.id,
            outfitDescription: pref.planned_outfit_description,
            needsAssistance: pref.needs_shopping_assistance,
            notes: pref.notes,
          };
          if (pref.color_choice) {
            setSelectedColors((prev) => ({
              ...prev,
              [dc.id]: {
                color_code: pref.color_choice,
                color_name: pref.color_choice,
              },
            }));
          }
          setNeedsAssistance((prev) => ({
            ...prev,
            [dc.id]: pref.needs_shopping_assistance,
          }));
        }
      });
    }

    // Also check legacy dress_preferences array (fallback)
    if (portalData.dress_preferences) {
      portalData.dress_preferences.forEach((pref: any) => {
        if (!prefs[pref.dress_code_id]) {
          prefs[pref.dress_code_id] = {
            dressCodeId: pref.dress_code_id,
            outfitDescription: pref.planned_outfit_description,
            needsAssistance: pref.needs_shopping_assistance,
            notes: pref.notes,
          };
          if (pref.color_choice) {
            setSelectedColors((prev) => ({
              ...prev,
              [pref.dress_code_id]: {
                color_code: pref.color_choice,
                color_name: pref.color_choice,
              },
            }));
          }
          setNeedsAssistance((prev) => ({
            ...prev,
            [pref.dress_code_id]: pref.needs_shopping_assistance,
          }));
        }
      });
    }

    setPreferences(prefs);
  }, [portalData]);

  const toggleCard = (id: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleColorSelect = (dressCodeId: number, color: ColorPaletteItem) => {
    setSelectedColors((prev) => ({ ...prev, [dressCodeId]: color }));
  };

  const handleSavePreference = async (dressCodeId: number) => {
    try {
      const values = await form.validateFields([
        `outfit_${dressCodeId}`,
        `notes_${dressCodeId}`,
      ]);

      setLoading((prev) => ({ ...prev, [dressCodeId]: true }));

      const data = {
        planned_outfit_description: values[`outfit_${dressCodeId}`],
        color_choice: selectedColors[dressCodeId]?.color_code,
        needs_shopping_assistance: needsAssistance[dressCodeId] || false,
        notes: values[`notes_${dressCodeId}`],
      };

      await updateDressPreference(dressCodeId, data);

      setPreferences((prev) => ({
        ...prev,
        [dressCodeId]: {
          dressCodeId,
          outfitDescription: data.planned_outfit_description,
          selectedColor: selectedColors[dressCodeId],
          needsAssistance: data.needs_shopping_assistance,
          notes: data.notes,
        },
      }));

      setEditingPreferences((prev) => {
        const next = new Set(prev);
        next.delete(dressCodeId);
        return next;
      });
    } catch (error) {
      // Validation error
    } finally {
      setLoading((prev) => ({ ...prev, [dressCodeId]: false }));
    }
  };

  const startEditing = (dressCodeId: number) => {
    const pref = preferences[dressCodeId];
    if (pref) {
      form.setFieldsValue({
        [`outfit_${dressCodeId}`]: pref.outfitDescription,
        [`notes_${dressCodeId}`]: pref.notes,
      });
    }
    setEditingPreferences((prev) => new Set(prev).add(dressCodeId));
  };

  if (!portalData) return null;

  const { dress_codes } = portalData;

  return (
    <SectionWrapper>
      <SectionHeader
        title="Dress Code"
        arabicTitle="قواعد اللباس"
        subtitle="View the dress code for each event and let us know your outfit plans"
        icon={<SkinOutlined />}
      />

      {dress_codes.map((dressCode) => {
        const isExpanded = expandedCards.has(dressCode.id);
        const hasPref = !!preferences[dressCode.id];
        const isEditing = editingPreferences.has(dressCode.id) || !hasPref;

        return (
          <DressCodeCard
            key={dressCode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FabricDecoration>👗</FabricDecoration>

            <CardHeader
              $expanded={isExpanded}
              onClick={() => toggleCard(dressCode.id)}
            >
              <HeaderLeft>
                <EventIcon>
                  <SkinOutlined />
                </EventIcon>
                <EventInfo>
                  <EventName>{dressCode.event_name}</EventName>
                  {dressCode.event_date && (
                    <EventDate>
                      <CalendarOutlined />
                      {dayjs(dressCode.event_date).format('MMMM D, YYYY')}
                    </EventDate>
                  )}
                </EventInfo>
              </HeaderLeft>
              <ExpandIcon $expanded={isExpanded} />
            </CardHeader>

            <AnimatePresence>
              {isExpanded && (
                <CardContent
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {dressCode.theme_description && (
                    <ContentSection>
                      <ThemeDescription>
                        {dressCode.theme_description}
                      </ThemeDescription>
                    </ContentSection>
                  )}

                  {dressCode.color_palette && dressCode.color_palette.length > 0 && (
                    <ContentSection>
                      <SectionTitle>Color Palette</SectionTitle>
                      <ColorPalette
                        colors={dressCode.color_palette}
                        selectedColor={selectedColors[dressCode.id]?.color_code || selectedColors[dressCode.id]?.hex}
                        onColorSelect={(color) =>
                          handleColorSelect(dressCode.id, {
                            ...color,
                            color_code: color.color_code || color.hex,
                            color_name: color.color_name || color.name,
                          })
                        }
                        size="medium"
                        interactive={isEditing}
                      />
                    </ContentSection>
                  )}

                  {(dressCode.men_suggestions || dressCode.women_suggestions) && (
                    <ContentSection>
                      <SectionTitle>What to Wear</SectionTitle>
                      <SuggestionsGrid>
                        {dressCode.men_suggestions && (
                          <SuggestionCard $gender="men">
                            <SuggestionHeader>
                              <SuggestionIcon $gender="men">
                                <ManOutlined />
                              </SuggestionIcon>
                              <SuggestionTitle>For Men</SuggestionTitle>
                            </SuggestionHeader>
                            <SuggestionText>
                              {dressCode.men_suggestions}
                            </SuggestionText>
                          </SuggestionCard>
                        )}
                        {dressCode.women_suggestions && (
                          <SuggestionCard $gender="women">
                            <SuggestionHeader>
                              <SuggestionIcon $gender="women">
                                <WomanOutlined />
                              </SuggestionIcon>
                              <SuggestionTitle>For Women</SuggestionTitle>
                            </SuggestionHeader>
                            <SuggestionText>
                              {dressCode.women_suggestions}
                            </SuggestionText>
                          </SuggestionCard>
                        )}
                      </SuggestionsGrid>
                    </ContentSection>
                  )}

                  {dressCode.inspiration_images &&
                    dressCode.inspiration_images.length > 0 && (
                      <ContentSection>
                        <SectionTitle>
                          <PictureOutlined /> Inspiration
                        </SectionTitle>
                        <InspirationGrid>
                          <Image.PreviewGroup>
                            {dressCode.inspiration_images.map((url, index) => (
                              <InspirationImage key={index}>
                                <Image
                                  src={url}
                                  alt={`Inspiration ${index + 1}`}
                                />
                              </InspirationImage>
                            ))}
                          </Image.PreviewGroup>
                        </InspirationGrid>
                      </ContentSection>
                    )}

                  {dressCode.notes && (
                    <ContentSection>
                      <DressCodeNotes>{dressCode.notes}</DressCodeNotes>
                    </ContentSection>
                  )}

                  {/* Preference Form/Display */}
                  <PreferenceCard>
                    <PreferenceHeader>
                      <PreferenceTitle>
                        <CheckCircleFilled
                          style={{ color: hasPref ? colors.success : colors.textSecondary }}
                        />
                        Your Outfit Choice
                      </PreferenceTitle>
                      {hasPref && !isEditing && (
                        <Button
                          icon={<EditOutlined />}
                          size="small"
                          onClick={() => startEditing(dressCode.id)}
                        >
                          Edit
                        </Button>
                      )}
                    </PreferenceHeader>

                    {isEditing ? (
                      <StyledForm form={form} layout="vertical" requiredMark={false}>
                        <Form.Item
                          name={`outfit_${dressCode.id}`}
                          label="What are you planning to wear?"
                        >
                          <TextArea
                            placeholder="Describe your planned outfit (e.g., Navy blue suit with gold tie, Black evening gown)"
                            rows={3}
                            style={{ resize: 'none' }}
                          />
                        </Form.Item>

                        {dressCode.color_palette &&
                          dressCode.color_palette.length > 0 && (
                            <Form.Item label="Your color choice from the palette">
                              <Select
                                placeholder="Select a color"
                                value={selectedColors[dressCode.id]?.color_name || selectedColors[dressCode.id]?.name}
                                onChange={(value) => {
                                  const color = dressCode.color_palette?.find(
                                    (c) => (c.color_name || c.name) === value
                                  );
                                  if (color) handleColorSelect(dressCode.id, {
                                    ...color,
                                    color_code: color.color_code || color.hex,
                                    color_name: color.color_name || color.name,
                                  });
                                }}
                                options={dressCode.color_palette.map((c) => ({
                                  value: c.color_name || c.name,
                                  label: (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span
                                        style={{
                                          width: 16,
                                          height: 16,
                                          borderRadius: '50%',
                                          background: c.color_code || c.hex,
                                          border: '1px solid rgba(0,0,0,0.1)',
                                        }}
                                      />
                                      {c.color_name || c.name}
                                    </span>
                                  ),
                                }))}
                              />
                            </Form.Item>
                          )}

                        <AssistanceToggle>
                          <AssistanceText>
                            <AssistanceTitle>
                              Need help finding an outfit?
                            </AssistanceTitle>
                            <AssistanceDesc>
                              We can provide shopping assistance
                            </AssistanceDesc>
                          </AssistanceText>
                          <Switch
                            checked={needsAssistance[dressCode.id] || false}
                            onChange={(checked) =>
                              setNeedsAssistance((prev) => ({
                                ...prev,
                                [dressCode.id]: checked,
                              }))
                            }
                          />
                        </AssistanceToggle>

                        <Form.Item name={`notes_${dressCode.id}`} label="Additional Notes">
                          <TextArea
                            placeholder="Any other notes about your outfit..."
                            rows={2}
                            style={{ resize: 'none' }}
                          />
                        </Form.Item>

                        <SubmitButton
                          type="primary"
                          loading={loading[dressCode.id]}
                          onClick={() => handleSavePreference(dressCode.id)}
                          icon={<CheckCircleFilled />}
                        >
                          Save Outfit Preference
                        </SubmitButton>
                      </StyledForm>
                    ) : (
                      <SavedPreference>
                        {preferences[dressCode.id]?.outfitDescription && (
                          <SavedRow>
                            <SavedLabel>Planned Outfit</SavedLabel>
                            <SavedValue>
                              {preferences[dressCode.id]?.outfitDescription}
                            </SavedValue>
                          </SavedRow>
                        )}
                        {selectedColors[dressCode.id] && (
                          <SavedRow>
                            <SavedLabel>Color Choice</SavedLabel>
                            <ColorBadge $color={selectedColors[dressCode.id].color_code || selectedColors[dressCode.id].hex || '#ccc'}>
                              {selectedColors[dressCode.id].color_name || selectedColors[dressCode.id].name || ''}
                            </ColorBadge>
                          </SavedRow>
                        )}
                        <SavedRow>
                          <SavedLabel>Shopping Assistance</SavedLabel>
                          <SavedValue>
                            {needsAssistance[dressCode.id] ? 'Yes, please' : 'Not needed'}
                          </SavedValue>
                        </SavedRow>
                        {preferences[dressCode.id]?.notes && (
                          <SavedRow>
                            <SavedLabel>Notes</SavedLabel>
                            <SavedValue>
                              {preferences[dressCode.id]?.notes}
                            </SavedValue>
                          </SavedRow>
                        )}
                      </SavedPreference>
                    )}
                  </PreferenceCard>
                </CardContent>
              )}
            </AnimatePresence>
          </DressCodeCard>
        );
      })}
    </SectionWrapper>
  );
};

export default DressCodeSection;
