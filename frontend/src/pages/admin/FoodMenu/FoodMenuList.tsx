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
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CoffeeOutlined,
  CalendarOutlined,
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
import FoodMenuForm from './FoodMenuForm';
import { GoldDivider } from '../../../components';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import type { FoodMenu, DietaryOption } from '../../../types';
import * as foodMenuApi from '../../../services/foodMenu.api';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

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

const MenuCard = styled(motion.div)<{ $isDragging?: boolean }>`
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

const MenuCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  cursor: pointer;

  &:hover {
    background: ${colors.creamLight};
  }
`;

const MenuIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${borderRadius.lg}px;
  background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.creamMedium} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 16px;
  flex-shrink: 0;
`;

const MenuInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MenuName = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.secondary};
  margin: 0 0 8px;
`;

const MenuSummary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SummaryTag = styled(Tag)`
  && {
    border-radius: 12px;
    background: ${colors.creamLight};
    border-color: ${colors.creamDark};
    color: ${colors.textSecondary};
  }
`;

const DietaryTag = styled(Tag)`
  && {
    border-radius: 12px;
    background: ${colors.goldPale};
    border-color: ${colors.borderGold};
    color: ${colors.primary};
  }
`;

const CardActions = styled(Space)`
  flex-shrink: 0;
`;

const ExpandedContent = styled.div`
  padding: 0 20px 20px;
  border-top: 1px solid ${colors.creamDark};
`;

const CategorySection = styled.div`
  margin-top: 16px;

  &:first-of-type {
    margin-top: 0;
  }
`;

const CategoryTitle = styled.h4`
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  color: ${colors.primary};
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MenuItemsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 8px;
`;

const MenuItem = styled.div`
  padding: 8px 12px;
  background: ${colors.creamLight};
  border-radius: ${borderRadius.md}px;
  font-size: 13px;
`;

const MenuItemName = styled.span`
  color: ${colors.textPrimary};
  font-weight: 500;
`;

const MenuItemDescription = styled.span`
  color: ${colors.textSecondary};
  margin-left: 8px;
`;

const NotesSection = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: ${colors.goldPale};
  border-radius: ${borderRadius.md}px;
  font-size: 13px;
  color: ${colors.textSecondary};
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

const CATEGORY_INFO: Record<string, { label: string; icon: string }> = {
  starters: { label: 'Starters', icon: '🥗' },
  mains: { label: 'Main Courses', icon: '🍽️' },
  desserts: { label: 'Desserts', icon: '🍰' },
  beverages: { label: 'Beverages', icon: '🍹' },
};

const DIETARY_LABELS: Record<DietaryOption, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  halal: 'Halal',
  gluten_free: 'Gluten-Free',
  nut_free: 'Nut-Free',
  dairy_free: 'Dairy-Free',
};

interface SortableMenuCardProps {
  menu: FoodMenu;
  expanded: boolean;
  onToggle: () => void;
  onEdit: (menu: FoodMenu) => void;
  onDelete: (id: number) => void;
}

const SortableMenuCard: React.FC<SortableMenuCardProps> = ({
  menu,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: menu.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Group items by category
  const groupedItems = menu.menu_items?.reduce((acc, item) => {
    const category = item.category || 'mains';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof menu.menu_items>) || {};

  const totalItems = menu.menu_items?.length || 0;
  const categoryCount = Object.keys(groupedItems).length;

  return (
    <div ref={setNodeRef} style={style}>
      <MenuCard $isDragging={isDragging}>
        <MenuCardHeader onClick={onToggle} {...attributes} {...listeners}>
          <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
            <MenuIcon>🍽️</MenuIcon>
            <MenuInfo>
              <MenuName>{menu.event_name}</MenuName>
              <MenuSummary>
                <SummaryTag>{totalItems} items</SummaryTag>
                <SummaryTag>{categoryCount} categories</SummaryTag>
                {menu.dietary_options?.slice(0, 3).map((option) => (
                  <DietaryTag key={option}>{DIETARY_LABELS[option]}</DietaryTag>
                ))}
                {menu.dietary_options && menu.dietary_options.length > 3 && (
                  <DietaryTag>+{menu.dietary_options.length - 3} more</DietaryTag>
                )}
              </MenuSummary>
            </MenuInfo>
          </div>
          <CardActions>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(menu);
              }}
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete this menu?"
              description="This action cannot be undone."
              onConfirm={() => onDelete(menu.id)}
              okText="Delete"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
              >
                Delete
              </Button>
            </Popconfirm>
          </CardActions>
        </MenuCardHeader>

        {expanded && (
          <ExpandedContent>
            {Object.entries(CATEGORY_INFO).map(([key, { label, icon }]) => {
              const items = groupedItems[key];
              if (!items || items.length === 0) return null;
              return (
                <CategorySection key={key}>
                  <CategoryTitle>
                    <span>{icon}</span> {label}
                  </CategoryTitle>
                  <MenuItemsList>
                    {items.map((item, index) => (
                      <MenuItem key={index}>
                        <MenuItemName>{item.name}</MenuItemName>
                        {item.description && (
                          <MenuItemDescription>— {item.description}</MenuItemDescription>
                        )}
                      </MenuItem>
                    ))}
                  </MenuItemsList>
                </CategorySection>
              );
            })}

            {menu.notes && (
              <NotesSection>
                <strong>Notes:</strong> {menu.notes}
              </NotesSection>
            )}
          </ExpandedContent>
        )}
      </MenuCard>
    </div>
  );
};

const FoodMenuList: React.FC = () => {
  const [menus, setMenus] = useState<FoodMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<FoodMenu | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const data = await foodMenuApi.getFoodMenus();
      setMenus(data);
    } catch (error) {
      message.error('Failed to load menus');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMenus((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleToggleExpand = (id: number) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleEdit = (menu: FoodMenu) => {
    setEditingMenu(menu);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await foodMenuApi.deleteFoodMenu(String(id));
      setMenus((prev) => prev.filter((m) => m.id !== id));
      message.success('Menu deleted');
    } catch (error) {
      message.error('Failed to delete menu');
    }
  };

  const handleFormSubmit = async (data: Partial<FoodMenu>) => {
    try {
      if (editingMenu) {
        const updated = await foodMenuApi.updateFoodMenu(String(editingMenu.id), data as any);
        setMenus((prev) =>
          prev.map((m) => (m.id === editingMenu.id ? updated : m))
        );
        message.success('Menu updated');
      } else {
        const created = await foodMenuApi.createFoodMenu(data as any);
        setMenus((prev) => [...prev, created]);
        message.success('Menu added');
      }
    } catch (error) {
      message.error(editingMenu ? 'Failed to update menu' : 'Failed to add menu');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingMenu(null);
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
            <CoffeeOutlined style={{ marginRight: 12, color: colors.primary }} />
            Food Menus
          </Title>
          <Text type="secondary">
            Create and manage menus for your wedding events
          </Text>
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          Add Menu
        </Button>
      </PageHeader>

      <GoldDivider text={`${menus.length} Menus`} variant="simple" margin="0 0 24px 0" />

      {menus.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={menus.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            {menus.map((menu) => (
              <SortableMenuCard
                key={menu.id}
                menu={menu}
                expanded={expandedMenus.has(menu.id)}
                onToggle={() => handleToggleExpand(menu.id)}
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
              <CoffeeOutlined />
            </EmptyStateIcon>
            <Title level={4} style={{ color: colors.secondary }}>
              No Menus Added Yet
            </Title>
            <Paragraph type="secondary" style={{ maxWidth: 400, margin: '0 auto 24px' }}>
              Create food menus for your wedding events to help guests know what to expect.
            </Paragraph>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
              Add First Menu
            </Button>
          </EmptyStateWrapper>
        </Card>
      )}

      <FoodMenuForm
        open={formOpen}
        foodMenu={editingMenu}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />
    </PageWrapper>
  );
};

export default FoodMenuList;
