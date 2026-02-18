import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Button,
  Space,
  Typography,
  Descriptions,
  Tag,
  Timeline,
  Empty,
  Spin,
  message,
  Row,
  Col,
  Avatar,
  Divider,
  Switch,
  Form,
  Input,
  Select,
  DatePicker,
  List,
  Image,
  Badge,
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  CarOutlined,
  BankOutlined,
  SkinOutlined,
  CoffeeOutlined,
  CalendarOutlined,
  CameraOutlined,
  HistoryOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  TeamOutlined,
  HeartOutlined,
  ManOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { guestsApi } from '../../../services';
import GuestLinkCard from '../../../components/admin/GuestLinkCard';
import { GoldDivider } from '../../../components';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import type { Guest, RSVPStatus } from '../../../types';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const BackButton = styled(Button)`
  && {
    margin-bottom: 24px;
    color: ${colors.textSecondary};

    &:hover {
      color: ${colors.primary};
    }
  }
`;

const HeaderCard = styled(Card)`
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${shadows.md};
  margin-bottom: 24px;
  overflow: hidden;

  .ant-card-body {
    padding: 0;
  }
`;

const HeaderGradient = styled.div`
  background: linear-gradient(135deg, ${colors.secondary} 0%, ${colors.tealDark} 100%);
  padding: 32px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='none' stroke='%23B7A89A' stroke-width='0.5' opacity='0.1'/%3E%3C/svg%3E");
    background-size: 60px 60px;
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
`;

const GuestAvatar = styled(Avatar)`
  && {
    background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.goldDark} 100%);
    font-size: 36px;
    border: 3px solid rgba(255, 255, 255, 0.3);
  }
`;

const GuestInfo = styled.div`
  flex: 1;
  min-width: 200px;
`;

const GuestName = styled(Title)`
  && {
    color: ${colors.white};
    margin: 0 0 8px;
    font-family: 'Playfair Display', serif;
  }
`;

const RSVPBadge = styled(Tag)<{ $status: RSVPStatus }>`
  && {
    font-size: 14px;
    padding: 4px 16px;
    border-radius: 20px;
    border: none;
    font-weight: 600;

    ${(props) => {
      switch (props.$status) {
        case 'confirmed':
          return `
            background: ${colors.success};
            color: white;
          `;
        case 'declined':
          return `
            background: ${colors.error};
            color: white;
          `;
        default:
          return `
            background: ${colors.primary};
            color: white;
          `;
      }
    }}
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const LinkSection = styled.div`
  padding: 24px 32px;
  background: ${colors.creamLight};
  border-top: 1px solid ${colors.creamDark};
`;

const ContentCard = styled(Card)`
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${shadows.sm};

  .ant-card-body {
    padding: 0;
  }

  .ant-tabs-nav {
    padding: 0 24px;
    margin-bottom: 0;
  }

  .ant-tabs-tab {
    padding: 16px 0;
  }

  .ant-tabs-content-holder {
    padding: 24px;
  }
`;

const InfoCard = styled.div`
  background: ${colors.creamLight};
  border-radius: ${borderRadius.lg}px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid ${colors.creamDark};
`;

const InfoCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const InfoCardIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${borderRadius.md}px;
  background: ${(props) => `${props.$color}15`};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: ${(props) => props.$color};
`;

const TimelineCard = styled(Card)`
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.borderGold};

  .ant-timeline-item-content {
    padding-bottom: 16px;
  }
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
`;

const MediaItem = styled.div`
  border-radius: ${borderRadius.md}px;
  overflow: hidden;
  border: 1px solid ${colors.creamDark};
  aspect-ratio: 1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ActivityCard = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background: ${colors.creamLight};
  border-radius: ${borderRadius.md}px;
  margin-bottom: 12px;
  border: 1px solid ${colors.creamDark};

  &:last-child {
    margin-bottom: 0;
  }
`;

const ActivityIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${borderRadius.md}px;
  background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.goldLight} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${colors.primary};
  margin-right: 16px;
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const GuestDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      fetchGuest();
    }
  }, [id]);

  const fetchGuest = async () => {
    setLoading(true);
    try {
      const data = await guestsApi.getGuest(id!);
      setGuest(data);
      // Map backend fields to form fields
      const guestData = data as any;
      form.setFieldsValue({
        firstName: guestData.full_name?.split(' ')[0] || data.first_name,
        lastName: guestData.full_name?.split(' ').slice(1).join(' ') || data.last_name,
        email: data.email,
        phone: data.phone,
        country: guestData.country_of_origin || data.country,
        rsvpStatus: data.rsvp_status,
        numberOfGuests: guestData.number_of_attendees || data.number_of_guests,
        dietaryRestrictions: data.dietary_restrictions,
        notes: guestData.special_requests || data.notes,
      });
    } catch (error) {
      message.error('Failed to load guest details');
      navigate('/admin/guests');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // Map form fields to backend fields
      const updatedGuest = await guestsApi.updateGuest(id!, {
        full_name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email,
        phone: values.phone,
        country_of_origin: values.country,
        rsvp_status: values.rsvpStatus,
        number_of_attendees: values.numberOfGuests,
        special_requests: values.notes,
      } as any);

      setGuest(updatedGuest);
      setEditMode(false);
      message.success('Guest updated successfully!');
    } catch (error) {
      message.error('Failed to update guest');
    } finally {
      setSaving(false);
    }
  };

  const getRSVPIcon = (status: RSVPStatus) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleOutlined />;
      case 'declined':
        return <CloseCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  // Build activity timeline from real guest data
  const activityTimeline: { time: string; action: string; type: string }[] = [];
  if (guest) {
    const guestData = guest as any;
    if (guestData.created_at) {
      activityTimeline.push({ time: guestData.created_at, action: 'Guest added to system', type: 'access' });
    }
    if (guestData.last_portal_access) {
      activityTimeline.push({ time: guestData.last_portal_access, action: 'Portal accessed', type: 'access' });
    }
    if (guestData.rsvp_submitted_at) {
      activityTimeline.push({
        time: guestData.rsvp_submitted_at,
        action: `RSVP ${guestData.rsvp_status || 'submitted'} for ${guestData.number_of_attendees || 1} guest(s)`,
        type: 'rsvp',
      });
    }
    if (guestData.travel_info) {
      activityTimeline.push({ time: guestData.travel_info.updated_at || guestData.travel_info.created_at || guestData.rsvp_submitted_at || '', action: 'Travel information submitted', type: 'travel' });
    }
    if (guestData.hotel_info) {
      activityTimeline.push({ time: guestData.hotel_info.updated_at || guestData.hotel_info.created_at || '', action: 'Hotel preference saved', type: 'hotel' });
    }
  }
  activityTimeline.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  // Get activities from guest data (if available from API response)
  const guestAny = guest as any;
  const registeredActivities: any[] = (guestAny?.activity_registrations || guestAny?.activities || []).map((a: any) => ({
    name: a.activity_name || a.name || 'Activity',
    date: a.start_time ? dayjs(a.start_time).format('YYYY-MM-DD') : (a.date || ''),
    time: a.start_time ? dayjs(a.start_time).format('h:mm A') : (a.time || ''),
    location: a.location,
    number_of_participants: a.number_of_participants || 1,
    notes: a.notes,
  }));

  // Get media from guest data (if available from API response)
  const mediaUploads: { id: number; url: string; type: string }[] = (guestAny?.media_uploads || []).map((m: any) => ({
    id: m.id,
    url: m.file_url || m.thumbnail_url || m.url,
    type: m.file_type || m.media_type || 'image',
  }));

  if (loading) {
    return (
      <LoadingWrapper>
        <Spin size="large" />
      </LoadingWrapper>
    );
  }

  if (!guest) {
    return (
      <Empty description="Guest not found">
        <Button type="primary" onClick={() => navigate('/admin/guests')}>
          Back to Guest List
        </Button>
      </Empty>
    );
  }

  return (
    <PageWrapper>
      <BackButton type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/guests')}>
        Back to Guest List
      </BackButton>

      {/* Header Card */}
      <HeaderCard>
        <HeaderGradient>
          <HeaderContent>
            <GuestAvatar size={80} icon={<UserOutlined />}>
              {((guest as any).full_name || guest.first_name)?.charAt(0)}
            </GuestAvatar>

            <GuestInfo>
              <GuestName level={2}>
                {(guest as any).full_name || `${guest.first_name} ${guest.last_name}`}
              </GuestName>
              <Space wrap>
                <RSVPBadge $status={guest.rsvp_status}>
                  {getRSVPIcon(guest.rsvp_status)}{' '}
                  {guest.rsvp_status.charAt(0).toUpperCase() + guest.rsvp_status.slice(1)}
                </RSVPBadge>
                {((guest as any).number_of_attendees || guest.number_of_guests) > 0 && (
                  <Tag color="blue">
                    <TeamOutlined /> {(guest as any).number_of_attendees || guest.number_of_guests} guests
                  </Tag>
                )}
                {guest.is_vip && (
                  <Tag color="gold">
                    <HeartOutlined /> VIP
                  </Tag>
                )}
              </Space>
            </GuestInfo>

            <HeaderActions>
              {editMode ? (
                <>
                  <Button icon={<CloseOutlined />} onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  type="primary"
                  ghost
                  icon={<EditOutlined />}
                  onClick={() => setEditMode(true)}
                  style={{ borderColor: 'white', color: 'white' }}
                >
                  Edit Guest
                </Button>
              )}
            </HeaderActions>
          </HeaderContent>
        </HeaderGradient>

        <LinkSection>
          <GuestLinkCard
            guestName={(guest as any).full_name || `${guest.first_name} ${guest.last_name}`}
            uniqueToken={guest.unique_token}
          />
        </LinkSection>
      </HeaderCard>

      {/* Content Tabs */}
      <ContentCard>
        <Tabs defaultActiveKey="overview">
          {/* Overview Tab */}
          <TabPane
            tab={
              <span>
                <UserOutlined /> Overview
              </span>
            }
            key="overview"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Form form={form} layout="vertical" disabled={!editMode}>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item name="firstName" label="First Name">
                        <Input prefix={<UserOutlined />} size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="lastName" label="Last Name">
                        <Input size="large" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item name="email" label="Email">
                        <Input prefix={<MailOutlined />} size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="phone" label="Phone">
                        <Input prefix={<PhoneOutlined />} size="large" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item name="country" label="Country">
                        <Input prefix={<GlobalOutlined />} size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="rsvpStatus" label="RSVP Status">
                        <Select size="large">
                          <Option value="pending">Pending</Option>
                          <Option value="confirmed">Confirmed</Option>
                          <Option value="declined">Declined</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="numberOfGuests" label="Number of Guests">
                    <Input type="number" min={0} size="large" style={{ maxWidth: 200 }} />
                  </Form.Item>

                  <Form.Item name="dietaryRestrictions" label="Dietary Restrictions">
                    <Input.TextArea rows={2} placeholder="Any dietary restrictions..." />
                  </Form.Item>

                  <Form.Item name="notes" label="Admin Notes">
                    <Input.TextArea rows={3} placeholder="Internal notes about this guest..." />
                  </Form.Item>
                </Form>
              </Col>

              <Col xs={24} lg={8}>
                <TimelineCard title="Activity Timeline" size="small">
                  <Timeline
                    items={activityTimeline.map((item) => ({
                      color: colors.primary,
                      children: (
                        <div>
                          <Text strong>{item.action}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(item.time).format('MMM D, YYYY h:mm A')}
                          </Text>
                        </div>
                      ),
                    }))}
                  />
                </TimelineCard>
              </Col>
            </Row>
          </TabPane>

          {/* Travel Tab */}
          <TabPane
            tab={
              <span>
                <CarOutlined /> Travel
              </span>
            }
            key="travel"
          >
            {(guest as any).travel_info ? (
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <InfoCard>
                    <InfoCardHeader>
                      <InfoCardIcon $color={colors.primary}>
                        <CarOutlined />
                      </InfoCardIcon>
                      <div>
                        <Text strong>Arrival Details</Text>
                      </div>
                    </InfoCardHeader>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Flight/Train">
                        {(guest as any).travel_info.arrival_flight_number || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Date">
                        {(guest as any).travel_info.arrival_date
                          ? dayjs((guest as any).travel_info.arrival_date).format('MMM D, YYYY')
                          : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Time">
                        {(guest as any).travel_info.arrival_time || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Airport/Station">
                        {(guest as any).travel_info.arrival_airport || '-'}
                      </Descriptions.Item>
                    </Descriptions>
                  </InfoCard>
                </Col>

                <Col xs={24} md={12}>
                  <InfoCard>
                    <InfoCardHeader>
                      <InfoCardIcon $color={colors.primary}>
                        <CarOutlined />
                      </InfoCardIcon>
                      <div>
                        <Text strong>Departure Details</Text>
                      </div>
                    </InfoCardHeader>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Flight/Train">
                        {(guest as any).travel_info.departure_flight_number || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Date">
                        {(guest as any).travel_info.departure_date
                          ? dayjs((guest as any).travel_info.departure_date).format('MMM D, YYYY')
                          : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Time">
                        {(guest as any).travel_info.departure_time || '-'}
                      </Descriptions.Item>
                    </Descriptions>
                  </InfoCard>
                </Col>

                <Col xs={24}>
                  <Space wrap>
                    {(guest as any).travel_info.needs_pickup && (
                      <Tag color="gold" style={{ padding: '8px 16px' }}>
                        <CarOutlined /> Pickup Required
                      </Tag>
                    )}
                    {(guest as any).travel_info.needs_dropoff && (
                      <Tag color="gold" style={{ padding: '8px 16px' }}>
                        <CarOutlined /> Dropoff Required
                      </Tag>
                    )}
                  </Space>
                </Col>

                {((guest as any).travel_info.special_requests || (guest as any).travel_info.special_requirements) && (
                  <Col xs={24}>
                    <InfoCard>
                      <Text strong>Special Requests</Text>
                      <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                        {(guest as any).travel_info.special_requests || (guest as any).travel_info.special_requirements}
                      </Paragraph>
                    </InfoCard>
                  </Col>
                )}
              </Row>
            ) : (
              <Empty description="No travel information submitted yet" />
            )}
          </TabPane>

          {/* Hotel Tab */}
          <TabPane
            tab={
              <span>
                <BankOutlined /> Hotel
              </span>
            }
            key="hotel"
          >
            {(guest as any).hotel_info ? (
              <InfoCard>
                <InfoCardHeader>
                  <InfoCardIcon $color={colors.secondary}>
                    <BankOutlined />
                  </InfoCardIcon>
                  <div>
                    <Text strong>Accommodation Details</Text>
                  </div>
                </InfoCardHeader>
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                  <Descriptions.Item label="Hotel">
                    {(guest as any).hotel_info.hotel_name || 'Self-arranged'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Room Type">
                    {(guest as any).hotel_info.room_type || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Check-in">
                    {(guest as any).hotel_info.check_in_date
                      ? dayjs((guest as any).hotel_info.check_in_date).format('MMM D, YYYY')
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Check-out">
                    {(guest as any).hotel_info.check_out_date
                      ? dayjs((guest as any).hotel_info.check_out_date).format('MMM D, YYYY')
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Number of Rooms">
                    {(guest as any).hotel_info.number_of_rooms || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Booking Status">
                    <Tag color={(guest as any).hotel_info.is_booked ? 'green' : 'orange'}>
                      {(guest as any).hotel_info.is_booked ? 'Booked' : 'Pending'}
                    </Tag>
                  </Descriptions.Item>
                  {(guest as any).hotel_info.custom_hotel_address && (
                    <Descriptions.Item label="Address" span={2}>
                      {(guest as any).hotel_info.custom_hotel_address}
                    </Descriptions.Item>
                  )}
                  {(guest as any).hotel_info.booking_confirmation && (
                    <Descriptions.Item label="Booking Reference" span={2}>
                      {(guest as any).hotel_info.booking_confirmation}
                    </Descriptions.Item>
                  )}
                </Descriptions>
                {(guest as any).hotel_info.special_requests && (
                  <>
                    <Divider />
                    <Text strong>Special Requests: </Text>
                    <Text>{(guest as any).hotel_info.special_requests}</Text>
                  </>
                )}
              </InfoCard>
            ) : (
              <Empty description="No hotel information submitted yet" />
            )}
          </TabPane>

          {/* Dress Preferences Tab */}
          <TabPane
            tab={
              <span>
                <SkinOutlined /> Dress
              </span>
            }
            key="dress"
          >
            {(guest as any).dress_preferences && (guest as any).dress_preferences.length > 0 ? (
              (guest as any).dress_preferences.map((pref: any, index: number) => (
                <InfoCard key={index}>
                  <InfoCardHeader>
                    <InfoCardIcon $color={colors.primary}>
                      <SkinOutlined />
                    </InfoCardIcon>
                    <div>
                      <Text strong>{pref.event_name}</Text>
                    </div>
                  </InfoCardHeader>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Outfit Description">
                      {pref.planned_outfit_description || pref.outfit_choice || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Color Selected">
                      <Space>
                        {pref.color_choice && (
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 4,
                              background: pref.color_code || pref.color_choice || '#ccc',
                              border: '1px solid #ddd',
                            }}
                          />
                        )}
                        {pref.color_name || pref.color_choice || '-'}
                      </Space>
                    </Descriptions.Item>
                    {pref.needs_shopping_assistance && (
                      <Descriptions.Item label="Shopping Help">
                        <Tag color="blue">Needs Shopping Assistance</Tag>
                      </Descriptions.Item>
                    )}
                    {pref.notes && <Descriptions.Item label="Notes">{pref.notes}</Descriptions.Item>}
                  </Descriptions>
                </InfoCard>
              ))
            ) : (
              <Empty description="No dress preferences submitted yet" />
            )}
          </TabPane>

          {/* Food Preferences Tab */}
          <TabPane
            tab={
              <span>
                <CoffeeOutlined /> Food
              </span>
            }
            key="food"
          >
            {(guest as any).food_preferences ? (
              <InfoCard>
                <InfoCardHeader>
                  <InfoCardIcon $color={colors.primary}>
                    <CoffeeOutlined />
                  </InfoCardIcon>
                  <div>
                    <Text strong>Food Preferences</Text>
                  </div>
                </InfoCardHeader>
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                  <Descriptions.Item label="Meal Size">
                    {(guest as any).food_preferences.meal_size_preference || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dietary Restrictions">
                    {Array.isArray((guest as any).food_preferences.dietary_restrictions)
                      ? (guest as any).food_preferences.dietary_restrictions.join(', ')
                      : (guest as any).food_preferences.dietary_restrictions || 'None'}
                  </Descriptions.Item>
                  {(guest as any).food_preferences.cuisine_preferences && (
                    <Descriptions.Item label="Cuisine Preferences" span={2}>
                      {(guest as any).food_preferences.cuisine_preferences}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                {(guest as any).food_preferences.allergies && (
                  <>
                    <Divider />
                    <Text strong>Allergies: </Text>
                    <Text type="danger">{(guest as any).food_preferences.allergies}</Text>
                  </>
                )}

                {(guest as any).food_preferences.special_requests && (
                  <>
                    <Divider />
                    <Text strong>Special Requests: </Text>
                    <Text>{(guest as any).food_preferences.special_requests}</Text>
                  </>
                )}
              </InfoCard>
            ) : (
              <Empty description="No food preferences submitted yet" />
            )}
          </TabPane>

          {/* Activities Tab */}
          <TabPane
            tab={
              <span>
                <CalendarOutlined /> Activities
              </span>
            }
            key="activities"
          >
            {registeredActivities.length > 0 ? (
              registeredActivities.map((activity: any, index: number) => (
                <ActivityCard key={index}>
                  <ActivityIcon>
                    <CalendarOutlined />
                  </ActivityIcon>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ display: 'block' }}>
                      {activity.name}
                    </Text>
                    <Text type="secondary">
                      {activity.date && activity.time ? `${activity.date} at ${activity.time}` : activity.date || '-'}
                    </Text>
                    {activity.number_of_participants > 1 && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <TeamOutlined /> {activity.number_of_participants} participants
                        </Text>
                      </div>
                    )}
                    {activity.notes && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Note: {activity.notes}
                        </Text>
                      </div>
                    )}
                  </div>
                  <Tag color="green">Registered</Tag>
                </ActivityCard>
              ))
            ) : (
              <Empty description="No activities registered yet" />
            )}
          </TabPane>

          {/* Media Tab */}
          <TabPane
            tab={
              <span>
                <CameraOutlined /> Media
              </span>
            }
            key="media"
          >
            {mediaUploads.length > 0 ? (
              <>
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                  {mediaUploads.length} uploads from this guest
                </Text>
                <MediaGrid>
                  {mediaUploads.map((media) => (
                    <MediaItem key={media.id}>
                      <Image src={media.url} alt="Guest upload" />
                    </MediaItem>
                  ))}
                </MediaGrid>
              </>
            ) : (
              <Empty description="No media uploaded yet" />
            )}
          </TabPane>
        </Tabs>
      </ContentCard>
    </PageWrapper>
  );
};

export default GuestDetail;
