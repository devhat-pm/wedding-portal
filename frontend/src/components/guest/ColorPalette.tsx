import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Tooltip, message } from 'antd';
import { CheckOutlined, CopyOutlined } from '@ant-design/icons';
import { colors, shadows } from '../../styles/theme';

interface ColorItem {
  color_code: string;
  color_name: string;
}

interface ColorPaletteProps {
  colors: ColorItem[];
  selectedColor?: string;
  onColorSelect?: (color: ColorItem) => void;
  size?: 'small' | 'medium' | 'large';
  showNames?: boolean;
  interactive?: boolean;
}

const PaletteWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
`;

const ColorItemWrapper = styled(motion.div)<{ $size: string; $interactive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: ${(props) => (props.$interactive ? 'pointer' : 'default')};
`;

const ColorCircle = styled(motion.div)<{
  $color: string;
  $size: string;
  $selected: boolean;
  $interactive: boolean;
}>`
  border-radius: 50%;
  position: relative;
  box-shadow: ${shadows.md};
  transition: all 0.3s ease;

  ${(props) => {
    switch (props.$size) {
      case 'small':
        return 'width: 40px; height: 40px;';
      case 'large':
        return 'width: 72px; height: 72px;';
      default:
        return 'width: 56px; height: 56px;';
    }
  }}

  background: ${(props) => props.$color};
  border: 4px solid ${(props) => (props.$selected ? colors.primary : 'white')};

  ${(props) =>
    props.$selected &&
    `
    box-shadow: 0 0 0 3px ${colors.primary}, ${shadows.md};
  `}

  ${(props) =>
    props.$interactive &&
    `
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 0 0 3px ${colors.borderGold}, ${shadows.lg};
    }
  `}
`;

const SelectedCheck = styled(motion.div)`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const ColorName = styled.span<{ $size: string }>`
  font-size: ${(props) => (props.$size === 'small' ? '11px' : '13px')};
  color: ${colors.textPrimary};
  text-align: center;
  font-weight: 500;
  max-width: ${(props) => {
    switch (props.$size) {
      case 'small':
        return '50px';
      case 'large':
        return '90px';
      default:
        return '70px';
    }
  }};
`;

const CopyHint = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${colors.textSecondary};
`;

const ColorPalette: React.FC<ColorPaletteProps> = ({
  colors: colorItems,
  selectedColor,
  onColorSelect,
  size = 'medium',
  showNames = true,
  interactive = true,
}) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleClick = (item: ColorItem) => {
    if (onColorSelect) {
      onColorSelect(item);
    }
  };

  const handleCopy = async (e: React.MouseEvent, hexCode: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(hexCode);
      setCopiedColor(hexCode);
      message.success(`Copied ${hexCode}`);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      message.error('Failed to copy');
    }
  };

  return (
    <PaletteWrapper>
      {colorItems.map((item, index) => {
        const isSelected = selectedColor === item.color_code;
        const isCopied = copiedColor === item.color_code;

        return (
          <Tooltip
            key={index}
            title={
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600 }}>{item.color_name}</div>
                <CopyHint>
                  {isCopied ? (
                    <>
                      <CheckOutlined /> Copied!
                    </>
                  ) : (
                    <>
                      <CopyOutlined /> {item.color_code} (click to copy)
                    </>
                  )}
                </CopyHint>
              </div>
            }
          >
            <ColorItemWrapper
              $size={size}
              $interactive={interactive}
              onClick={() => handleClick(item)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <ColorCircle
                $color={item.color_code}
                $size={size}
                $selected={isSelected}
                $interactive={interactive}
                onClick={(e) => handleCopy(e, item.color_code)}
                whileHover={interactive ? { scale: 1.1 } : undefined}
                whileTap={interactive ? { scale: 0.95 } : undefined}
              >
                {isSelected && (
                  <SelectedCheck
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <CheckOutlined />
                  </SelectedCheck>
                )}
              </ColorCircle>
              {showNames && (
                <ColorName $size={size}>{item.color_name}</ColorName>
              )}
            </ColorItemWrapper>
          </Tooltip>
        );
      })}
    </PaletteWrapper>
  );
};

export default ColorPalette;
