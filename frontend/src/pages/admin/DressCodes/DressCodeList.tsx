import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Empty,
  Spin,
  message,
  Popconfirm,
  Collapse,
  Image,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  SkinOutlined,
  DownOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import DressCodeForm from './DressCodeForm';
import { GoldDivider } from '../../../components';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import type { DressCode } from '../../../types';
import * as dressCodesApi from '../../../services/dressCodes.api';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const PageWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const DressCodeCard = styled(motion.div)<{ $isDragging?: boolean }>`
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${(props) => (props.$isDragging ? shadows.lg : shadows.sm)};
  overflow: hidden;
  margin-bottom: 16px;
  opacity: ${(props) => (props.$isDragging ? 0.8 : 1)};

  &:hover {
    box-shadow: ${shadows.md};
    border-color: ${colors.primary};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${colors.creamLight};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const EventIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${borderRadius.lg}px;
  background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.goldLight} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: ${colors.primary};
`;

const EventInfo = styled.div``;

const EventName = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.secondary};
  margin: 0 0 4px;
`;

const EventDate = styled.span`
  font-size: 13px;
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ColorPalettePreview = styled.div`
  display: flex;
  gap: 4px;
`;

const ColorDot = styled.div<{ $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${(props) => props.$color};
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ExpandIcon = styled(DownOutlined)<{ $expanded: boolean }>`
  transition: transform 0.3s;
  transform: rotate(${(props) => (props.$expanded ? '180deg' : '0')});
  color: ${colors.textSecondary};
`;

const CardContent = styled(motion.div)`
  padding: 0 24px 24px;
  border-top: 1px solid ${colors.creamDark};
`;

const ContentSection = styled.div`
  margin-top: 20px;
`;

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.secondary};
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ColorPaletteFull = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const ColorItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ColorSwatch = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: ${borderRadius.md}px;
  background: ${(props) => props.$color};
  border: 3px solid white;
  box-shadow: ${shadows.md};
`;

const ColorName = styled.span`
  font-size: 12px;
  color: ${colors.textPrimary};
  text-align: center;
  max-width: 70px;
`;

const SuggestionCard = styled.div`
  background: ${colors.creamLight};
  border-radius: ${borderRadius.md}px;
  padding: 16px;
  border: 1px solid ${colors.creamDark};
`;

const InspirationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
`;

const InspirationImage = styled.div`
  border-radius: ${borderRadius.md}px;
  overflow: hidden;
  aspect-ratio: 1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid ${colors.creamDark};
`;

const EmptyStateWrapper = styled.div`
  padding: 60px 20px;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.creamLight} 0%, ${colors.creamMedium} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 48px;
  color: ${colors.primary};
`;

interface SortableDressCodeCardProps {
  dressCode: DressCode;
  onEdit: (dressCode: DressCode) => void;
  onDelete: (id: number) => void;
}

const SortableDressCodeCard: React.FC<SortableDressCodeCardProps> = ({
  dressCode,
  onEdit,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dressCode.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <DressCodeCard $isDragging={isDragging}>
        <CardHeader onClick={() => setExpanded(!expanded)} {...attributes} {...listeners}>
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

          <Space size={16}>
            {dressCode.color_palette && dressCode.color_palette.length > 0 && (
              <ColorPalettePreview>
                {dressCode.color_palette.slice(0, 4).map((color, index) => (
                  <ColorDot key={index} $color={color.color_code || color.hex || '#ccc'} />
                ))}
                {dressCode.color_palette.length > 4 && (
                  <Tag>+{dressCode.color_palette.length - 4}</Tag>
                )}
              </ColorPalettePreview>
            )}
            <ExpandIcon $expanded={expanded} />
          </Space>
        </CardHeader>

        {expanded && (
          <CardContent
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {dressCode.theme_description && (
              <ContentSection>
                <Paragraph style={{ marginBottom: 0 }}>{dressCode.theme_description}</Paragraph>
              </ContentSection>
            )}

            {dressCode.color_palette && dressCode.color_palette.length > 0 && (
              <ContentSection>
                <SectionTitle>Color Palette</SectionTitle>
                <ColorPaletteFull>
                  {dressCode.color_palette.map((color, index) => (
                    <ColorItem key={index}>
                      <ColorSwatch $color={color.color_code || color.hex || '#ccc'} />
                      <ColorName>{color.color_name || color.name || ''}</ColorName>
                    </ColorItem>
                  ))}
                </ColorPaletteFull>
              </ContentSection>
            )}

            <ContentSection>
              <Row gutter={16}>
                {dressCode.men_suggestions && (
                  <Col xs={24} md={12}>
                    <SuggestionCard>
                      <SectionTitle>
                        <ManOutlined style={{ color: colors.secondary }} />
                        For Men
                      </SectionTitle>
                      <Paragraph style={{ marginBottom: 0, fontSize: 13 }}>
                        {dressCode.men_suggestions}
                      </Paragraph>
                    </SuggestionCard>
                  </Col>
                )}
                {dressCode.women_suggestions && (
                  <Col xs={24} md={12}>
                    <SuggestionCard>
                      <SectionTitle>
                        <WomanOutlined style={{ color: colors.accent }} />
                        For Women
                      </SectionTitle>
                      <Paragraph style={{ marginBottom: 0, fontSize: 13 }}>
                        {dressCode.women_suggestions}
                      </Paragraph>
                    </SuggestionCard>
                  </Col>
                )}
              </Row>
            </ContentSection>

            {dressCode.inspiration_images && dressCode.inspiration_images.length > 0 && (
              <ContentSection>
                <SectionTitle>Inspiration</SectionTitle>
                <InspirationGrid>
                  <Image.PreviewGroup>
                    {dressCode.inspiration_images.map((url, index) => (
                      <InspirationImage key={index}>
                        <Image src={url} alt={`Inspiration ${index + 1}`} />
                      </InspirationImage>
                    ))}
                  </Image.PreviewGroup>
                </InspirationGrid>
              </ContentSection>
            )}

            {dressCode.notes && (
              <ContentSection>
                <Text type="secondary">{dressCode.notes}</Text>
              </ContentSection>
            )}

            <CardActions>
              <Button icon={<EditOutlined />} onClick={() => onEdit(dressCode)}>
                Edit
              </Button>
              <Popconfirm
                title="Delete this dress code?"
                onConfirm={() => onDelete(dressCode.id)}
                okText="Delete"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Popconfirm>
            </CardActions>
          </CardContent>
        )}
      </DressCodeCard>
    </div>
  );
};

const DressCodeList: React.FC = () => {
  const [dressCodes, setDressCodes] = useState<DressCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDressCode, setEditingDressCode] = useState<DressCode | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchDressCodes();
  }, []);

  const fetchDressCodes = async () => {
    setLoading(true);
    try {
      const data = await dressCodesApi.getDressCodes();
      setDressCodes(data);
    } catch (error) {
      message.error('Failed to load dress codes');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setDressCodes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleEdit = (dressCode: DressCode) => {
    setEditingDressCode(dressCode);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await dressCodesApi.deleteDressCode(String(id));
      setDressCodes((prev) => prev.filter((d) => d.id !== id));
      message.success('Dress code deleted');
    } catch (error) {
      message.error('Failed to delete dress code');
    }
  };

  const handleFormSubmit = async (data: Partial<DressCode>) => {
    try {
      if (editingDressCode) {
        const updated = await dressCodesApi.updateDressCode(String(editingDressCode.id), data as any);
        setDressCodes((prev) =>
          prev.map((d) => (d.id === editingDressCode.id ? updated : d))
        );
        message.success('Dress code updated');
      } else {
        const created = await dressCodesApi.createDressCode(data as any);
        setDressCodes((prev) => [...prev, created]);
        message.success('Dress code added');
      }
    } catch (error) {
      message.error(editingDressCode ? 'Failed to update dress code' : 'Failed to add dress code');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingDressCode(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <PageWrapper>
      <PageHeader>
        <div>
          <Title level={2} style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>
            <SkinOutlined style={{ marginRight: 12, color: colors.primary }} />
            Dress Codes
          </Title>
          <Text type="secondary">
            Define dress codes and color palettes for each event
          </Text>
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          Add Dress Code
        </Button>
      </PageHeader>

      <GoldDivider text={`${dressCodes.length} Events`} variant="simple" margin="0 0 24px 0" />

      {dressCodes.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={dressCodes.map((d) => d.id)}
            strategy={verticalListSortingStrategy}
          >
            {dressCodes.map((dressCode) => (
              <SortableDressCodeCard
                key={dressCode.id}
                dressCode={dressCode}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <Card>
          <EmptyStateWrapper>
            <EmptyStateIcon>
              <SkinOutlined />
            </EmptyStateIcon>
            <Title level={4} style={{ color: colors.secondary }}>
              No Dress Codes Yet
            </Title>
            <Paragraph type="secondary" style={{ maxWidth: 400, margin: '0 auto 24px' }}>
              Create dress codes with color palettes to guide your guests on what to wear.
            </Paragraph>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
              Add First Dress Code
            </Button>
          </EmptyStateWrapper>
        </Card>
      )}

      <DressCodeForm
        open={formOpen}
        dressCode={editingDressCode}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />
    </PageWrapper>
  );
};

export default DressCodeList;
