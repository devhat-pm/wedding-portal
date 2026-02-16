import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Tag } from 'antd';
import { colors, shadows, borderRadius } from '../../styles/theme';
import type { FoodMenu, MenuItem, DietaryOption } from '../../types';

interface MenuDisplayProps {
  menu: FoodMenu;
  compact?: boolean;
}

const MenuCard = styled(motion.div)`
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${shadows.md};
  overflow: hidden;
  position: relative;
`;

const MenuPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(135deg, ${colors.secondary} 0%, #1a1a2e 100%);
  opacity: 0.05;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20L20 0z' fill='%23B7A89A' fill-opacity='0.15'/%3E%3C/svg%3E");
  }
`;

const MenuHeader = styled.div`
  position: relative;
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid ${colors.borderGold};
  background: linear-gradient(
    180deg,
    ${colors.goldPale} 0%,
    ${colors.cardBg} 100%
  );
`;

const EventName = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  color: ${colors.secondary};
  margin: 0 0 8px;
`;

const MenuDivider = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 8px 0;
`;

const DividerLine = styled.div`
  width: 40px;
  height: 1px;
  background: ${colors.borderGold};
`;

const DividerOrnament = styled.div`
  font-size: 14px;
  color: ${colors.primary};
`;

const DietaryTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
`;

const DietaryTag = styled(Tag)`
  && {
    border-radius: 20px;
    background: ${colors.goldPale};
    border-color: ${colors.borderGold};
    color: ${colors.primary};
    font-size: 11px;
  }
`;

const MenuContent = styled.div`
  padding: 24px;
`;

const CategorySection = styled.div`
  margin-bottom: 28px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const CategoryIcon = styled.span`
  font-size: 20px;
`;

const CategoryTitle = styled.h4`
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  color: ${colors.primary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const CategoryLine = styled.div`
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    ${colors.borderGold} 0%,
    transparent 100%
  );
`;

const MenuItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MenuItemRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const ItemDot = styled.span`
  color: ${colors.primary};
  font-size: 8px;
  margin-top: 6px;
`;

const ItemContent = styled.div`
  flex: 1;
`;

const ItemName = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: ${colors.textPrimary};
`;

const ItemDescription = styled.span`
  font-size: 13px;
  color: ${colors.textSecondary};
  font-style: italic;
  margin-left: 8px;

  &::before {
    content: '— ';
  }
`;

const MenuNotes = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: ${colors.creamLight};
  border-radius: ${borderRadius.md}px;
  border-left: 3px solid ${colors.primary};
  font-size: 13px;
  color: ${colors.textSecondary};
  font-style: italic;
`;

// Category icons and labels
const CATEGORY_CONFIG: Record<string, { icon: string; label: string }> = {
  starters: { icon: '🥗', label: 'Starters' },
  mains: { icon: '🍽️', label: 'Main Courses' },
  desserts: { icon: '🍰', label: 'Desserts' },
  beverages: { icon: '🍹', label: 'Beverages' },
};

const DIETARY_LABELS: Record<DietaryOption, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  halal: 'Halal',
  gluten_free: 'Gluten-Free',
  nut_free: 'Nut-Free',
  dairy_free: 'Dairy-Free',
};

const MenuDisplay: React.FC<MenuDisplayProps> = ({ menu, compact: _compact = false }) => {
  // Group items by category
  const groupedItems = menu.menu_items?.reduce((acc, item) => {
    const category = item.category || 'mains';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>) || {};

  const categoryOrder = ['starters', 'mains', 'desserts', 'beverages'];

  return (
    <MenuCard
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <MenuPattern />

      <MenuHeader>
        <EventName>{menu.event_name}</EventName>
        <MenuDivider>
          <DividerLine />
          <DividerOrnament>✦</DividerOrnament>
          <DividerLine />
        </MenuDivider>

        {menu.dietary_options && menu.dietary_options.length > 0 && (
          <DietaryTags>
            {menu.dietary_options.map((option) => (
              <DietaryTag key={option}>
                {DIETARY_LABELS[option] || option}
              </DietaryTag>
            ))}
          </DietaryTags>
        )}
      </MenuHeader>

      <MenuContent>
        {categoryOrder.map((categoryKey) => {
          const items = groupedItems[categoryKey];
          if (!items || items.length === 0) return null;

          const config = CATEGORY_CONFIG[categoryKey] || {
            icon: '🍽️',
            label: categoryKey,
          };

          return (
            <CategorySection key={categoryKey}>
              <CategoryHeader>
                <CategoryIcon>{config.icon}</CategoryIcon>
                <CategoryTitle>{config.label}</CategoryTitle>
                <CategoryLine />
              </CategoryHeader>

              <MenuItems>
                {items.map((item, index) => (
                  <MenuItemRow key={index}>
                    <ItemDot>●</ItemDot>
                    <ItemContent>
                      <ItemName>{item.name}</ItemName>
                      {item.description && (
                        <ItemDescription>{item.description}</ItemDescription>
                      )}
                    </ItemContent>
                  </MenuItemRow>
                ))}
              </MenuItems>
            </CategorySection>
          );
        })}

        {menu.notes && <MenuNotes>{menu.notes}</MenuNotes>}
      </MenuContent>
    </MenuCard>
  );
};

export default MenuDisplay;
