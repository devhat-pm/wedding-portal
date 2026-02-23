import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Rate,
  Tag,
  Empty,
  Spin,
  message,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  GlobalOutlined,
  DragOutlined,
  BankOutlined,
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
import HotelForm from './HotelForm';
import { GoldDivider } from '../../../components';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import type { SuggestedHotel } from '../../../types';
import * as hotelsApi from '../../../services/hotels.api';
import { getImageUrl } from '../../../utils/helpers';

const { Title, Text, Paragraph } = Typography;

const PageWrapper = styled.div`
  max-width: 1200px;
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

const HotelCard = styled(motion.div)<{ $isDragging?: boolean }>`
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${(props) => (props.$isDragging ? shadows.lg : shadows.sm)};
  overflow: hidden;
  margin-bottom: 16px;
  opacity: ${(props) => (props.$isDragging ? 0.8 : 1)};
  cursor: grab;

  &:hover {
    box-shadow: ${shadows.md};
    border-color: ${colors.primary};
  }
`;

const HotelCardContent = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const HotelImage = styled.div<{ $imageUrl?: string }>`
  width: 200px;
  min-width: 200px;
  height: 150px;
  border-radius: ${borderRadius.lg}px;
  background: ${(props) =>
    props.$imageUrl
      ? `url(${props.$imageUrl}) center/cover no-repeat`
      : `linear-gradient(135deg, ${colors.creamMedium} 0%, ${colors.creamDark} 100%)`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.textSecondary};
  font-size: 32px;

  @media (max-width: 768px) {
    width: 100%;
    height: 180px;
  }
`;

const HotelInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const HotelName = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: ${colors.secondary};
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HotelMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 12px 0;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${colors.textSecondary};
  font-size: 13px;
`;

const AmenitiesWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const AmenityTag = styled(Tag)`
  && {
    border-radius: 12px;
    background: ${colors.goldPale};
    border-color: ${colors.borderGold};
    color: ${colors.primary};
  }
`;

const CardActions = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 20px 20px 0;
  min-width: 100px;

  @media (max-width: 768px) {
    flex-direction: row;
    padding: 0 20px 20px;
  }
`;

const DragHandle = styled.div`
  color: ${colors.textSecondary};
  cursor: grab;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    cursor: grabbing;
  }
`;

const PriceTag = styled(Tag)<{ $range: string }>`
  && {
    font-weight: 600;
    border-radius: 8px;
    padding: 4px 12px;
    font-size: 14px;

    ${(props) => {
      const ranges: Record<string, string> = {
        $: `background: #E5CEC0; color: #7B756D; border-color: #B7A89A;`,
        $$: `background: #EEE8DF; color: #7B756D; border-color: #D6C7B8;`,
        $$$: `background: #F3F1ED; color: #9A9187; border-color: #D6C7B8;`,
        $$$$: `background: #F3F1ED; color: #9A9187; border-color: #B7A89A;`,
        $$$$$: `background: ${colors.goldPale}; color: ${colors.primary}; border-color: ${colors.borderGold};`,
      };
      return ranges[props.$range] || '';
    }}
  }
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

interface SortableHotelCardProps {
  hotel: SuggestedHotel;
  onEdit: (hotel: SuggestedHotel) => void;
  onDelete: (id: number) => void;
}

const SortableHotelCard: React.FC<SortableHotelCardProps> = ({ hotel, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: hotel.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <HotelCard $isDragging={isDragging}>
        <HotelCardContent>
          <DragHandle {...attributes} {...listeners}>
            <DragOutlined style={{ fontSize: 20 }} />
          </DragHandle>

          <HotelImage $imageUrl={getImageUrl(hotel.image_url)}>
            {!hotel.image_url && <BankOutlined />}
          </HotelImage>

          <HotelInfo>
            <HotelName>
              {hotel.name}
              {hotel.star_rating && <Rate disabled defaultValue={hotel.star_rating} allowHalf />}
            </HotelName>

            {hotel.description && (
              <Paragraph
                type="secondary"
                ellipsis={{ rows: 2 }}
                style={{ marginBottom: 8 }}
              >
                {hotel.description}
              </Paragraph>
            )}

            <HotelMeta>
              {hotel.distance_from_venue && (
                <MetaItem>
                  <EnvironmentOutlined />
                  {hotel.distance_from_venue}
                </MetaItem>
              )}
              {hotel.phone && (
                <MetaItem>
                  <PhoneOutlined />
                  {hotel.phone}
                </MetaItem>
              )}
              {hotel.website && (
                <MetaItem>
                  <GlobalOutlined />
                  <a href={hotel.website} target="_blank" rel="noopener noreferrer">
                    Website
                  </a>
                </MetaItem>
              )}
              {hotel.price_range && <PriceTag $range={hotel.price_range}>{hotel.price_range}</PriceTag>}
            </HotelMeta>

            {hotel.amenities && hotel.amenities.length > 0 && (
              <AmenitiesWrapper>
                {hotel.amenities.slice(0, 5).map((amenity) => (
                  <AmenityTag key={amenity}>{amenity}</AmenityTag>
                ))}
                {hotel.amenities.length > 5 && (
                  <AmenityTag>+{hotel.amenities.length - 5} more</AmenityTag>
                )}
              </AmenitiesWrapper>
            )}
          </HotelInfo>

          <CardActions>
            <Space direction="vertical" size={8}>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(hotel)}
              >
                Edit
              </Button>
              <Popconfirm
                title="Delete this hotel?"
                description="This action cannot be undone."
                onConfirm={() => onDelete(hotel.id)}
                okText="Delete"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" danger icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Popconfirm>
            </Space>
          </CardActions>
        </HotelCardContent>
      </HotelCard>
    </div>
  );
};

const HotelList: React.FC = () => {
  const [hotels, setHotels] = useState<SuggestedHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<SuggestedHotel | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const data = await hotelsApi.getHotels();
      setHotels(data);
    } catch (error) {
      message.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setHotels((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        hotelsApi.reorderHotels(newOrder.map((h) => String(h.id))).catch(() => {
          message.error('Failed to save new order');
        });
        return newOrder;
      });
    }
  };

  const handleEdit = (hotel: SuggestedHotel) => {
    setEditingHotel(hotel);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await hotelsApi.deleteHotel(String(id));
      setHotels((prev) => prev.filter((h) => h.id !== id));
      message.success('Hotel deleted');
    } catch (error) {
      message.error('Failed to delete hotel');
    }
  };

  const handleFormSubmit = async (data: Partial<SuggestedHotel>) => {
    try {
      if (editingHotel) {
        const updated = await hotelsApi.updateHotel(String(editingHotel.id), data as any);
        setHotels((prev) =>
          prev.map((h) => (h.id === editingHotel.id ? updated : h))
        );
        message.success('Hotel updated');
      } else {
        const created = await hotelsApi.createHotel(data as any);
        setHotels((prev) => [...prev, created]);
        message.success('Hotel added');
      }
    } catch (error) {
      message.error(editingHotel ? 'Failed to update hotel' : 'Failed to add hotel');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingHotel(null);
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
            <BankOutlined style={{ marginRight: 12, color: colors.primary }} />
            Suggested Hotels
          </Title>
          <Text type="secondary">
            Add and manage hotel recommendations for your guests
          </Text>
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          Add Hotel
        </Button>
      </PageHeader>

      <GoldDivider text={`${hotels.length} Hotels`} variant="simple" margin="0 0 24px 0" />

      {hotels.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={hotels.map((h) => h.id)} strategy={verticalListSortingStrategy}>
            {hotels.map((hotel) => (
              <SortableHotelCard
                key={hotel.id}
                hotel={hotel}
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
              <BankOutlined />
            </EmptyStateIcon>
            <Title level={4} style={{ color: colors.secondary }}>
              No Hotels Added Yet
            </Title>
            <Paragraph type="secondary" style={{ maxWidth: 400, margin: '0 auto 24px' }}>
              Add hotel recommendations to help your guests find the perfect accommodation.
            </Paragraph>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
              Add First Hotel
            </Button>
          </EmptyStateWrapper>
        </Card>
      )}

      <HotelForm
        open={formOpen}
        hotel={editingHotel}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />
    </PageWrapper>
  );
};

export default HotelList;
