import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Rate, Tag, Tooltip } from 'antd';
import {
  EnvironmentOutlined,
  PhoneOutlined,
  GlobalOutlined,
  WifiOutlined,
  CarOutlined,
  CoffeeOutlined,
  CheckCircleFilled,
  DownOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { colors, shadows, borderRadius } from '../../styles/theme';
import { getImageUrl } from '../../utils/helpers';
import type { SuggestedHotel } from '../../types';

interface HotelCardProps {
  hotel: SuggestedHotel;
  selected?: boolean;
  onSelect?: (hotel: SuggestedHotel) => void;
  onBook?: (hotel: SuggestedHotel) => void;
}

const CardWrapper = styled(motion.div)<{ $selected: boolean }>`
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  border: 2px solid ${(props) => (props.$selected ? colors.primary : colors.borderGold)};
  box-shadow: ${(props) => (props.$selected ? shadows.lg : shadows.sm)};
  overflow: hidden;
  transition: all 0.3s ease;

  ${(props) =>
    props.$selected &&
    `
    background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.cardBg} 100%);
  `}

  &:hover {
    box-shadow: ${shadows.md};
    transform: translateY(-2px);
  }
`;

const SelectedBadge = styled(motion.div)`
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${colors.primary};
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: ${shadows.md};
`;

const ImageSection = styled.div`
  position: relative;
  height: 180px;
  overflow: hidden;
`;

const HotelImage = styled.div<{ $imageUrl?: string }>`
  width: 100%;
  height: 100%;
  background: ${(props) =>
    props.$imageUrl
      ? `url(${props.$imageUrl}) center/cover no-repeat`
      : `linear-gradient(135deg, ${colors.creamMedium} 0%, ${colors.creamDark} 100%)`};
`;

const ImageOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    transparent 40%,
    rgba(0, 0, 0, 0.6) 100%
  );
`;

const ImageBadges = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const PriceBadge = styled.div<{ $range: string }>`
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 14px;
  backdrop-filter: blur(10px);

  ${(props) => {
    const ranges: Record<string, string> = {
      $: `background: rgba(76, 175, 80, 0.9); color: white;`,
      $$: `background: rgba(33, 150, 243, 0.9); color: white;`,
      $$$: `background: rgba(255, 152, 0, 0.9); color: white;`,
      $$$$: `background: rgba(183, 168, 154, 0.9); color: white;`,
      $$$$$: `background: rgba(156, 39, 176, 0.9); color: white;`,
    };
    return ranges[props.$range] || `background: rgba(0,0,0,0.6); color: white;`;
  }}
`;

const DistanceBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: ${colors.secondary};
`;

const ContentSection = styled.div`
  padding: 20px;
`;

const HotelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const HotelName = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.secondary};
  margin: 0 0 4px;
`;

const StarsWrapper = styled.div`
  .ant-rate {
    font-size: 14px;
  }
`;

const ExpandButton = styled(Button)`
  && {
    padding: 0;
    height: auto;
    color: ${colors.primary};
  }
`;

const ExpandIcon = styled(DownOutlined)<{ $expanded: boolean }>`
  transition: transform 0.3s ease;
  transform: rotate(${(props) => (props.$expanded ? '180deg' : '0')});
`;

const AmenitiesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
`;

const ExpandedContent = styled(motion.div)`
  border-top: 1px solid ${colors.creamDark};
  padding-top: 16px;
  margin-top: 16px;
`;

const Description = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${colors.textSecondary};
  margin: 0 0 16px;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
`;

const ContactItem = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${colors.textSecondary};
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: ${colors.primary};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const SelectButton = styled(Button)<{ $selected: boolean }>`
  && {
    flex: 1;
    height: 44px;
    font-weight: 600;
    border-radius: ${borderRadius.md}px;

    ${(props) =>
      props.$selected &&
      `
      background: ${colors.success};
      border-color: ${colors.success};
      &:hover {
        background: #3d8b40 !important;
        border-color: #3d8b40 !important;
      }
    `}
  }
`;

const BookButton = styled(Button)`
  && {
    height: 44px;
    font-weight: 600;
    border-radius: ${borderRadius.md}px;
  }
`;

// Amenity icons mapping
const AMENITY_ICONS: Record<string, { icon: React.ReactNode; label: string }> = {
  wifi: { icon: <WifiOutlined />, label: 'Free WiFi' },
  parking: { icon: <CarOutlined />, label: 'Parking' },
  pool: { icon: '🏊', label: 'Swimming Pool' },
  spa: { icon: '💆', label: 'Spa' },
  restaurant: { icon: <CoffeeOutlined />, label: 'Restaurant' },
  gym: { icon: '🏋️', label: 'Fitness Center' },
  'beach access': { icon: '🏖️', label: 'Beach Access' },
  'room service': { icon: '🛎️', label: 'Room Service' },
  bar: { icon: '🍸', label: 'Bar' },
  concierge: { icon: '🎩', label: 'Concierge' },
};

const getAmenityIcon = (amenity: string) => {
  const key = amenity.toLowerCase();
  return AMENITY_ICONS[key] || { icon: '✓', label: amenity };
};

const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  selected = false,
  onSelect,
  onBook,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleSelect = () => {
    if (onSelect) {
      onSelect(hotel);
    }
  };

  const handleBook = () => {
    if (hotel.booking_url) {
      window.open(hotel.booking_url, '_blank');
    }
    if (onBook) {
      onBook(hotel);
    }
  };

  return (
    <CardWrapper
      $selected={selected}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <ImageSection>
        <HotelImage $imageUrl={getImageUrl(hotel.image_url)} />
        <ImageOverlay />

        <AnimatePresence>
          {selected && (
            <SelectedBadge
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <CheckCircleFilled /> Selected
            </SelectedBadge>
          )}
        </AnimatePresence>

        <ImageBadges>
          {hotel.distance_from_venue && (
            <DistanceBadge>
              <EnvironmentOutlined />
              {hotel.distance_from_venue}
            </DistanceBadge>
          )}
          {hotel.price_range && (
            <PriceBadge $range={hotel.price_range}>
              {hotel.price_range}
            </PriceBadge>
          )}
        </ImageBadges>
      </ImageSection>

      <ContentSection>
        <HotelHeader>
          <div>
            <HotelName>{hotel.name}</HotelName>
            {hotel.star_rating && (
              <StarsWrapper>
                <Rate disabled defaultValue={hotel.star_rating} allowHalf />
              </StarsWrapper>
            )}
          </div>
          <ExpandButton type="text" onClick={() => setExpanded(!expanded)}>
            <ExpandIcon $expanded={expanded} />
          </ExpandButton>
        </HotelHeader>

        {hotel.amenities && hotel.amenities.length > 0 && (
          <AmenitiesRow>
            {hotel.amenities.slice(0, 6).map((amenity) => {
              const { icon, label } = getAmenityIcon(amenity);
              return (
                <Tooltip key={amenity} title={label}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: colors.creamLight,
                      border: `1px solid ${colors.creamDark}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      color: colors.primary,
                    }}
                  >
                    {icon}
                  </div>
                </Tooltip>
              );
            })}
            {hotel.amenities.length > 6 && (
              <Tag style={{ borderRadius: 20, height: 36, lineHeight: '34px' }}>
                +{hotel.amenities.length - 6}
              </Tag>
            )}
          </AmenitiesRow>
        )}

        <AnimatePresence>
          {expanded && (
            <ExpandedContent
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {hotel.description && (
                <Description>{hotel.description}</Description>
              )}

              <ContactInfo>
                {hotel.phone && (
                  <ContactItem href={`tel:${hotel.phone}`}>
                    <PhoneOutlined /> {hotel.phone}
                  </ContactItem>
                )}
                {hotel.website && (
                  <ContactItem
                    href={hotel.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GlobalOutlined /> Visit Website
                  </ContactItem>
                )}
              </ContactInfo>

              {hotel.address && (
                <ContactItem
                  href={`https://maps.google.com/?q=${encodeURIComponent(hotel.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginBottom: 16 }}
                >
                  <EnvironmentOutlined /> {hotel.address}
                </ContactItem>
              )}
            </ExpandedContent>
          )}
        </AnimatePresence>

        <ActionButtons>
          <SelectButton
            type={selected ? 'primary' : 'default'}
            $selected={selected}
            onClick={handleSelect}
            icon={selected ? <CheckCircleFilled /> : null}
          >
            {selected ? 'Selected' : 'Select This Hotel'}
          </SelectButton>
          {hotel.booking_url && (
            <BookButton onClick={handleBook} icon={<ExportOutlined />}>
              Book
            </BookButton>
          )}
        </ActionButtons>
      </ContentSection>
    </CardWrapper>
  );
};

export default HotelCard;
