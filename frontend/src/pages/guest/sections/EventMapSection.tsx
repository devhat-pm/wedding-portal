import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import {
  EnvironmentOutlined,
  CalendarOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGuestPortal } from '../../../context/GuestPortalContext';
import SectionHeader from '../../../components/guest/SectionHeader';
import { colors, shadows, borderRadius } from '../../../styles/theme';

const SectionWrapper = styled.section`
  padding: 48px 24px;
  max-width: 780px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 40px 20px;
  }

  @media (max-width: 480px) {
    padding: 32px 16px;
  }
`;

const LocationCard = styled(motion.a)`
  display: block;
  background: ${colors.cardBg};
  border: 1px solid ${colors.borderGold};
  border-radius: ${borderRadius.lg}px;
  padding: 20px 24px;
  margin-bottom: 16px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  box-shadow: ${shadows.sm};

  &:hover {
    border-color: ${colors.primary};
    box-shadow: ${shadows.md};
    transform: translateY(-2px);
    color: inherit;
  }

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const LocationName = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.secondary};
  margin: 0 0 8px;
`;

const LocationDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${colors.textSecondary};
  margin-bottom: 4px;
`;

const MapLink = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${colors.primary};
  margin-top: 8px;
  font-weight: 500;
`;

const MapContainer = styled.div`
  margin-bottom: 24px;
  border-radius: ${borderRadius.lg}px;
  overflow: hidden;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${shadows.sm};
`;

const MapIframe = styled.iframe`
  width: 100%;
  height: 400px;
  border: none;
  display: block;

  @media (max-width: 768px) {
    height: 280px;
  }
`;

const EventMapSection: React.FC = () => {
  const { portalData } = useGuestPortal();

  if (!portalData) return null;

  const activities = (portalData.activities || []) as any[];
  const locatedActivities = activities.filter(
    (a: any) => a.location || (a.latitude && a.longitude)
  );

  if (locatedActivities.length === 0) return null;

  const getMapUrl = (activity: any) => {
    if (activity.latitude && activity.longitude) {
      return `https://www.google.com/maps?q=${activity.latitude},${activity.longitude}`;
    }
    if (activity.location) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`;
    }
    return '#';
  };

  // Build embed URL: prefer coordinates, fall back to location text
  const coordActivity = locatedActivities.find(
    (a: any) => a.latitude && a.longitude
  );
  const embedQuery = coordActivity
    ? `${coordActivity.latitude},${coordActivity.longitude}`
    : encodeURIComponent(locatedActivities[0]?.location || '');
  const embedUrl = `https://maps.google.com/maps?q=${embedQuery}&z=12&output=embed`;

  return (
    <SectionWrapper>
      <SectionHeader
        title="Event Locations"
        subtitle="Find your way to each event"
        icon={<EnvironmentOutlined />}
      />

      <MapContainer>
        <MapIframe
          src={embedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          title="Event locations map"
        />
      </MapContainer>

      {locatedActivities.map((activity: any, index: number) => (
        <LocationCard
          key={activity.id || index}
          href={getMapUrl(activity)}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <LocationName>{activity.activity_name}</LocationName>

          {activity.location && (
            <LocationDetail>
              <EnvironmentOutlined style={{ color: colors.primary }} />
              {activity.location}
            </LocationDetail>
          )}

          {activity.date_time && (
            <LocationDetail>
              <CalendarOutlined style={{ color: colors.primary }} />
              {dayjs(activity.date_time).format('MMM D, YYYY h:mm A')}
            </LocationDetail>
          )}

          <MapLink>
            <CompassOutlined />
            Open in Google Maps
          </MapLink>
        </LocationCard>
      ))}
    </SectionWrapper>
  );
};

export default EventMapSection;
