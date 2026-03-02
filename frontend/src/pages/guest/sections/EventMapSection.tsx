import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import {
  EnvironmentOutlined,
  CalendarOutlined,
  CompassOutlined,
  ClockCircleOutlined,
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

const MapFrame = styled.div`
  margin-bottom: 28px;
  border-radius: ${borderRadius.xxl}px;
  overflow: hidden;
  border: 2px solid ${colors.borderGold};
  box-shadow: ${shadows.lg};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${colors.primary}, ${colors.goldPale}, ${colors.primary});
    z-index: 1;
  }
`;

const MapIframe = styled.iframe`
  width: 100%;
  height: 380px;
  border: none;
  display: block;

  @media (max-width: 768px) {
    height: 280px;
  }
`;

const LocationsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

const LocationCard = styled(motion.a)`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: white;
  border: 1.5px solid ${colors.borderGold};
  border-radius: ${borderRadius.xl}px;
  padding: 22px 24px;
  text-decoration: none;
  color: inherit;
  transition: all 0.25s ease;
  box-shadow: ${shadows.sm};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, ${colors.primary}, ${colors.goldPale});
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover {
    border-color: ${colors.primary};
    box-shadow: ${shadows.md};
    transform: translateY(-2px);
    color: inherit;

    &::before {
      opacity: 1;
    }
  }

  @media (max-width: 480px) {
    padding: 18px 16px;
    flex-direction: column;
    gap: 12px;
  }
`;

const LocationIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.goldPale}, ${colors.creamMedium});
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
  color: ${colors.secondary};
  box-shadow: 0 2px 8px rgba(183, 168, 154, 0.15);
`;

const LocationContent = styled.div`
  flex: 1;
`;

const LocationName = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.secondary};
  margin: 0 0 8px;
  font-weight: 600;
`;

const LocationMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 6px;
`;

const LocationDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${colors.textSecondary};

  .anticon {
    color: ${colors.primary};
    font-size: 13px;
  }
`;

const MapLink = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${colors.primary};
  margin-top: 6px;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: color 0.2s;

  &:hover {
    color: ${colors.goldDark};
  }
`;

const EventMapSection: React.FC = () => {
  const { portalData } = useGuestPortal();

  if (!portalData) return null;

  const activities = (portalData.activities || []) as any[];
  // Only show main wedding events (requires signup/registration), not "things to do"
  const locatedActivities = activities.filter(
    (a: any) => (a.location || (a.latitude && a.longitude)) && a.requires_signup !== false
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

      <MapFrame>
        <MapIframe
          src={embedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          title="Event locations map"
        />
      </MapFrame>

      <LocationsGrid>
        {locatedActivities.map((activity: any, index: number) => (
          <LocationCard
            key={activity.id || index}
            href={getMapUrl(activity)}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <LocationIconWrapper>
              <EnvironmentOutlined />
            </LocationIconWrapper>
            <LocationContent>
              <LocationName>{activity.activity_name}</LocationName>
              <LocationMeta>
                {activity.location && (
                  <LocationDetail>
                    <EnvironmentOutlined />
                    {activity.location}
                  </LocationDetail>
                )}
                {activity.date_time && (
                  <LocationDetail>
                    <CalendarOutlined />
                    {dayjs(activity.date_time).format('MMM D, YYYY')}
                  </LocationDetail>
                )}
                {activity.date_time && (
                  <LocationDetail>
                    <ClockCircleOutlined />
                    {dayjs(activity.date_time).format('h:mm A')}
                  </LocationDetail>
                )}
              </LocationMeta>
              <MapLink>
                <CompassOutlined />
                Open in Google Maps
              </MapLink>
            </LocationContent>
          </LocationCard>
        ))}
      </LocationsGrid>
    </SectionWrapper>
  );
};

export default EventMapSection;
