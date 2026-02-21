import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { Form, Input, Button, Checkbox, message } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  QuestionCircleFilled,
  MinusOutlined,
  PlusOutlined,
  EditOutlined,
  HeartFilled,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  SkinOutlined,
  CoffeeOutlined,
} from '@ant-design/icons';
import confetti from 'canvas-confetti';
import dayjs from 'dayjs';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import { useGuestPortal } from '../../../context/GuestPortalContext';
import SectionHeader from '../../../components/guest/SectionHeader';
import type { ActivityWithRegistration } from '../../../types';

const { TextArea } = Input;

const SectionWrapper = styled.section`
  padding: 80px 24px;
  max-width: 720px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }

  @media (max-width: 480px) {
    padding: 48px 16px;
  }
`;

const CurrentStatusCard = styled(motion.div)<{ $status: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-radius: ${borderRadius.xl}px;
  margin-bottom: 32px;

  ${(props) => {
    switch (props.$status) {
      case 'confirmed':
        return `
          background: linear-gradient(135deg, #E5CEC0 0%, #D6C7B8 100%);
          border: 1px solid #B7A89A;
        `;
      case 'declined':
        return `
          background: linear-gradient(135deg, #EEE8DF 0%, #D6C7B8 100%);
          border: 1px solid #9A9187;
        `;
      default:
        return `
          background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.creamLight} 100%);
          border: 1px solid ${colors.borderGold};
        `;
    }
  }}

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatusIcon = styled.div<{ $status: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;

  ${(props) => {
    switch (props.$status) {
      case 'confirmed':
        return `background: ${colors.success}; color: white;`;
      case 'declined':
        return `background: ${colors.error}; color: white;`;
      default:
        return `background: ${colors.primary}; color: white;`;
    }
  }}
`;

const StatusText = styled.div``;

const StatusLabel = styled.div`
  font-size: 13px;
  color: ${colors.textSecondary};
  margin-bottom: 4px;
`;

const StatusValue = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 600;
  color: ${colors.secondary};
`;

const FormCard = styled(motion.div)`
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${shadows.lg};
  padding: 40px;

  @media (max-width: 768px) {
    padding: 32px 24px;
  }

  @media (max-width: 480px) {
    padding: 28px 20px;
  }
`;

const RSVPOptionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
`;

const RSVPOption = styled(motion.button)<{ $selected: boolean; $variant: 'accept' | 'decline' | 'maybe' }>`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 28px;
  border-radius: ${borderRadius.lg}px;
  border: 2px solid;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
  background: transparent;

  ${(props) => {
    const isSelected = props.$selected;
    switch (props.$variant) {
      case 'accept':
        return `
          border-color: ${isSelected ? colors.success : colors.creamDark};
          background: ${isSelected ? '#E5CEC0' : 'transparent'};
          box-shadow: ${isSelected ? '0 4px 12px rgba(76, 175, 80, 0.15)' : 'none'};
          &:hover { border-color: ${colors.success}; background: #E5CEC0; }
        `;
      case 'decline':
        return `
          border-color: ${isSelected ? colors.error : colors.creamDark};
          background: ${isSelected ? '#EEE8DF' : 'transparent'};
          box-shadow: ${isSelected ? '0 4px 12px rgba(244, 67, 54, 0.15)' : 'none'};
          &:hover { border-color: ${colors.error}; background: #EEE8DF; }
        `;
      case 'maybe':
        return `
          border-color: ${isSelected ? colors.warning : colors.creamDark};
          background: ${isSelected ? '#F3F1ED' : 'transparent'};
          box-shadow: ${isSelected ? '0 4px 12px rgba(255, 152, 0, 0.15)' : 'none'};
          &:hover { border-color: ${colors.warning}; background: #F3F1ED; }
        `;
    }
  }}

  @media (max-width: 480px) {
    padding: 20px 20px;
    gap: 16px;
  }
`;

const OptionIcon = styled.div<{ $variant: 'accept' | 'decline' | 'maybe'; $selected: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  transition: all 0.3s ease;
  flex-shrink: 0;

  ${(props) => {
    const bgOpacity = props.$selected ? 1 : 0.12;
    switch (props.$variant) {
      case 'accept':
        return `
          background: rgba(76, 175, 80, ${bgOpacity});
          color: ${props.$selected ? 'white' : colors.success};
        `;
      case 'decline':
        return `
          background: rgba(244, 67, 54, ${bgOpacity});
          color: ${props.$selected ? 'white' : colors.error};
        `;
      case 'maybe':
        return `
          background: rgba(255, 152, 0, ${bgOpacity});
          color: ${props.$selected ? 'white' : colors.warning};
        `;
    }
  }}

  @media (max-width: 480px) {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }
`;

const OptionText = styled.div`
  flex: 1;
`;

const OptionLabel = styled.div`
  font-size: 17px;
  font-weight: 600;
  color: ${colors.secondary};
  letter-spacing: 0.3px;
`;

const OptionArabic = styled.div`
  font-family: 'Amiri', serif;
  font-size: 14px;
  color: ${colors.textSecondary};
  margin-top: 2px;
`;

const OptionRadio = styled.div<{ $selected: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid ${(props) => (props.$selected ? colors.primary : colors.creamDark)};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &::after {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${colors.primary};
    transform: scale(${(props) => (props.$selected ? 1 : 0)});
    transition: transform 0.2s ease;
  }
`;

const FormSection = styled.div`
  margin-bottom: 32px;
`;

const FormSectionTitle = styled.h4`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.secondary};
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: 0.5px;
`;

const AttendeeCounter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 28px 24px;
  background: ${colors.creamLight};
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.creamDark};
`;

const CounterButton = styled.button<{ $disabled?: boolean }>`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid ${(props) => (props.$disabled ? colors.creamDark : colors.primary)};
  background: ${(props) => (props.$disabled ? colors.creamMedium : 'white')};
  color: ${(props) => (props.$disabled ? colors.textSecondary : colors.primary)};
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover:not(:disabled) {
    background: ${colors.primary};
    color: white;
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

const CounterValue = styled.div`
  min-width: 80px;
  text-align: center;
`;

const CounterNumber = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 42px;
  font-weight: 600;
  color: ${colors.secondary};
`;

const CounterLabel = styled.div`
  font-size: 12px;
  color: ${colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StyledForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 24px;
  }

  .ant-form-item-label > label {
    font-weight: 500;
    color: ${colors.textPrimary};
    font-size: 14px;
  }

  .ant-input,
  .ant-select-selector {
    border-radius: ${borderRadius.md}px !important;
    min-height: 48px !important;
    font-size: 15px !important;
  }

  .ant-input-lg {
    padding: 12px 16px !important;
  }

  .ant-select-lg .ant-select-selector {
    padding: 8px 16px !important;
  }

  textarea.ant-input {
    min-height: 100px !important;
    padding: 14px 16px !important;
  }
`;


const SubmitButton = styled(Button)`
  && {
    width: 100%;
    height: 60px;
    font-size: 17px;
    font-weight: 600;
    border-radius: ${borderRadius.lg}px;
    margin-top: 24px;
    box-shadow: 0 4px 16px rgba(183, 168, 154, 0.3);
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(183, 168, 154, 0.4);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }
`;

// Activity card styles
const ActivityCard = styled.div<{ $selected: boolean }>`
  border: 2px solid ${(props) => (props.$selected ? colors.primary : colors.creamDark)};
  border-radius: ${borderRadius.lg}px;
  padding: 20px;
  margin-bottom: 16px;
  background: ${(props) => (props.$selected ? colors.goldPale : 'white')};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: ${colors.primary};
    box-shadow: 0 2px 8px rgba(183, 168, 154, 0.15);
  }
`;

const ActivityHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const ActivityCheckbox = styled.div`
  padding-top: 2px;
`;

const ActivityInfo = styled.div`
  flex: 1;
`;

const ActivityName = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 17px;
  font-weight: 600;
  color: ${colors.secondary};
  margin-bottom: 8px;
`;

const ActivityMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 8px;
`;

const ActivityMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${colors.textSecondary};
`;

const ActivityDescription = styled.div`
  font-size: 14px;
  color: ${colors.textPrimary};
  margin-top: 8px;
  line-height: 1.5;
`;

const ActivityDetails = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${colors.creamDark};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActivityDetailRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
`;

const DetailIcon = styled.span`
  color: ${colors.primary};
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 1px;
`;

const DetailLabel = styled.span`
  color: ${colors.textSecondary};
  font-weight: 500;
  min-width: 80px;
`;

const DetailValue = styled.span`
  color: ${colors.textPrimary};
`;

const ColorDots = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
`;

const ColorDot = styled.div<{ $color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${(props) => props.$color};
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
`;

const NoActivitiesMessage = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: ${colors.textSecondary};
  font-size: 14px;
  background: ${colors.creamLight};
  border-radius: ${borderRadius.lg}px;
`;

// Success overlay
const SuccessOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
`;

const SuccessCard = styled(motion.div)`
  background: white;
  border-radius: ${borderRadius.xl}px;
  padding: 48px;
  text-align: center;
  max-width: 400px;
  margin: 20px;
  box-shadow: ${shadows.xl};
`;

const SuccessIcon = styled(motion.div)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.success} 0%, #9A9187 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 40px;
  color: white;
`;

const SuccessTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  color: ${colors.secondary};
  margin: 0 0 8px;
`;

const SuccessMessage = styled.p`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin: 0;
`;

type RSVPStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';

const RSVPSection: React.FC = () => {
  const { portalData, updateRSVP } = useGuestPortal();
  const [form] = Form.useForm();

  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('pending');
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (portalData?.guest) {
      const guest = portalData.guest;
      const guestData = guest as any;

      setRsvpStatus(guest.rsvp_status as RSVPStatus || 'pending');
      setAttendeeCount(guestData.number_of_attendees || guest.number_of_guests || 1);

      form.setFieldsValue({ phone: guest.phone || '' });

      // Handle both API formats: full_name or first_name/last_name
      let firstName = guest.first_name || '';
      let lastName = guest.last_name || '';
      if (guestData.full_name && !firstName && !lastName) {
        const nameParts = guestData.full_name.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }

      form.setFieldsValue({
        first_name: firstName,
        last_name: lastName,
        special_requests: guest.special_requests,
        song_requests: guestData.song_requests || '',
        notes_to_couple: guestData.notes_to_couple || '',
      });

      // Initialize selected activities from existing registrations
      if (portalData.activities) {
        const registered = new Set<string>();
        portalData.activities.forEach((act: any) => {
          if (act.is_registered) {
            registered.add(act.id);
          }
        });
        setSelectedActivities(registered);
      }

      setIsEditing(guest.rsvp_status === 'pending');
    }
  }, [portalData, form]);

  const handleRSVPChange = (status: RSVPStatus) => {
    setRsvpStatus(status);
  };

  const toggleActivity = (activityId: string) => {
    setSelectedActivities((prev) => {
      const next = new Set(prev);
      if (next.has(activityId)) {
        next.delete(activityId);
      } else {
        next.add(activityId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const data = {
        rsvp_status: rsvpStatus,
        number_of_attendees: rsvpStatus === 'declined' ? 0 : attendeeCount,
        phone: values.phone,
        special_requests: values.special_requests,
        song_requests: values.song_requests,
        notes_to_couple: values.notes_to_couple,
        activity_ids: rsvpStatus !== 'declined' ? Array.from(selectedActivities) : [],
      };

      await updateRSVP(data);

      // Show success animation
      if (rsvpStatus === 'confirmed') {
        setShowSuccess(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#B7A89A', '#7B756D', '#D6C7B8', '#E5CEC0'],
        });
        setTimeout(() => setShowSuccess(false), 3000);
      }

      setIsEditing(false);
    } catch (error) {
      // Form validation error
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = () => {
    switch (rsvpStatus) {
      case 'confirmed':
        return 'Joyfully Attending';
      case 'declined':
        return 'Regretfully Declined';
      case 'maybe':
        return 'Maybe Attending';
      default:
        return 'Awaiting Response';
    }
  };

  const formatDateTime = (dateTime: string) => {
    const d = dayjs(dateTime);
    return d.format('ddd, MMM D [at] h:mm A');
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  if (!portalData) return null;

  // Get activities that require signup
  const signupActivities = (portalData.activities || []).filter(
    (a: any) => a.requires_signup !== false
  );

  return (
    <SectionWrapper>
      <SectionHeader
        title="RSVP"
        arabicTitle="تأكيد الحضور"
        subtitle="Please let us know if you'll be joining us for our special day"
      />

      {!isEditing && rsvpStatus !== 'pending' && (
        <CurrentStatusCard
          $status={rsvpStatus}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatusInfo>
            <StatusIcon $status={rsvpStatus}>
              {rsvpStatus === 'confirmed' && <CheckCircleFilled />}
              {rsvpStatus === 'declined' && <CloseCircleFilled />}
              {rsvpStatus === 'maybe' && <QuestionCircleFilled />}
            </StatusIcon>
            <StatusText>
              <StatusLabel>Your Response</StatusLabel>
              <StatusValue>
                {getStatusLabel()}
                {rsvpStatus === 'confirmed' && ` - ${attendeeCount} guest${attendeeCount > 1 ? 's' : ''}`}
              </StatusValue>
            </StatusText>
          </StatusInfo>
          <Button
            icon={<EditOutlined />}
            onClick={() => setIsEditing(true)}
          >
            Edit Response
          </Button>
        </CurrentStatusCard>
      )}

      {(isEditing || rsvpStatus === 'pending') && (
        <FormCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* 1. RSVP Status Selection */}
          <RSVPOptionsWrapper>
            <RSVPOption
              $selected={rsvpStatus === 'confirmed'}
              $variant="accept"
              onClick={() => handleRSVPChange('confirmed')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <OptionIcon $variant="accept" $selected={rsvpStatus === 'confirmed'}>
                <CheckCircleFilled />
              </OptionIcon>
              <OptionText>
                <OptionLabel>Joyfully Accept</OptionLabel>
                <OptionArabic>سأحضر بكل سرور</OptionArabic>
              </OptionText>
              <OptionRadio $selected={rsvpStatus === 'confirmed'} />
            </RSVPOption>

            <RSVPOption
              $selected={rsvpStatus === 'maybe'}
              $variant="maybe"
              onClick={() => handleRSVPChange('maybe')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <OptionIcon $variant="maybe" $selected={rsvpStatus === 'maybe'}>
                <QuestionCircleFilled />
              </OptionIcon>
              <OptionText>
                <OptionLabel>Maybe</OptionLabel>
                <OptionArabic>ربما</OptionArabic>
              </OptionText>
              <OptionRadio $selected={rsvpStatus === 'maybe'} />
            </RSVPOption>

            <RSVPOption
              $selected={rsvpStatus === 'declined'}
              $variant="decline"
              onClick={() => handleRSVPChange('declined')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <OptionIcon $variant="decline" $selected={rsvpStatus === 'declined'}>
                <CloseCircleFilled />
              </OptionIcon>
              <OptionText>
                <OptionLabel>Regretfully Decline</OptionLabel>
                <OptionArabic>أعتذر عن الحضور</OptionArabic>
              </OptionText>
              <OptionRadio $selected={rsvpStatus === 'declined'} />
            </RSVPOption>
          </RSVPOptionsWrapper>

          {/* 2. Number of Attendees */}
          {rsvpStatus !== 'declined' && rsvpStatus !== 'pending' && (
            <FormSection>
              <FormSectionTitle>Number of Attendees</FormSectionTitle>
              <AttendeeCounter>
                <CounterButton
                  $disabled={attendeeCount <= 1}
                  onClick={() => setAttendeeCount(Math.max(1, attendeeCount - 1))}
                  disabled={attendeeCount <= 1}
                >
                  <MinusOutlined />
                </CounterButton>
                <CounterValue>
                  <CounterNumber>{attendeeCount}</CounterNumber>
                  <CounterLabel>Guest{attendeeCount > 1 ? 's' : ''}</CounterLabel>
                </CounterValue>
                <CounterButton
                  onClick={() => setAttendeeCount(attendeeCount + 1)}
                >
                  <PlusOutlined />
                </CounterButton>
              </AttendeeCounter>
            </FormSection>
          )}

          <StyledForm form={form} layout="vertical" requiredMark={false}>
            {/* 3. Contact Information - Hidden when declined */}
            {rsvpStatus !== 'declined' && (
            <FormSection>
              <FormSectionTitle>Your Information</FormSectionTitle>

              <Form.Item
                name="first_name"
                label="First Name"
                rules={[{ required: rsvpStatus !== 'declined', message: 'Please enter your first name' }]}
              >
                <Input placeholder="First name" size="large" />
              </Form.Item>

              <Form.Item
                name="last_name"
                label="Last Name"
                rules={[{ required: rsvpStatus !== 'declined', message: 'Please enter your last name' }]}
              >
                <Input placeholder="Last name" size="large" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: rsvpStatus !== 'declined', message: 'Please enter your phone number' }]}
              >
                <Input placeholder="Phone number" size="large" />
              </Form.Item>
            </FormSection>
            )}

            {/* 4. Activities Selection */}
            {rsvpStatus !== 'declined' && rsvpStatus !== 'pending' && signupActivities.length > 0 && (
              <FormSection>
                <FormSectionTitle>Activities & Events</FormSectionTitle>
                <p style={{ color: colors.textSecondary, fontSize: 14, marginTop: -12, marginBottom: 20 }}>
                  Select the activities you'd like to attend
                </p>
                {signupActivities.map((activity: any) => (
                  <ActivityCard
                    key={activity.id}
                    $selected={selectedActivities.has(activity.id)}
                    onClick={() => toggleActivity(activity.id)}
                  >
                    <ActivityHeader>
                      <ActivityCheckbox>
                        <Checkbox
                          checked={selectedActivities.has(activity.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleActivity(activity.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </ActivityCheckbox>
                      <ActivityInfo>
                        <ActivityName>{activity.activity_name || activity.title}</ActivityName>
                        <ActivityMeta>
                          {activity.date_time && (
                            <ActivityMetaItem>
                              <CalendarOutlined />
                              {formatDateTime(activity.date_time)}
                            </ActivityMetaItem>
                          )}
                          {activity.duration_minutes && (
                            <ActivityMetaItem>
                              <ClockCircleOutlined />
                              {formatDuration(activity.duration_minutes)}
                            </ActivityMetaItem>
                          )}
                          {activity.location && (
                            <ActivityMetaItem>
                              <EnvironmentOutlined />
                              {activity.location}
                            </ActivityMetaItem>
                          )}
                        </ActivityMeta>
                        {activity.description && (
                          <ActivityDescription>{activity.description}</ActivityDescription>
                        )}

                        {/* Per-activity dress code and food info */}
                        {(activity.dress_code_info || activity.dress_colors?.length > 0 || activity.food_description) && (
                          <ActivityDetails>
                            {activity.dress_code_info && (
                              <ActivityDetailRow>
                                <DetailIcon><SkinOutlined /></DetailIcon>
                                <DetailLabel>Dress Code:</DetailLabel>
                                <DetailValue>{activity.dress_code_info}</DetailValue>
                              </ActivityDetailRow>
                            )}
                            {activity.dress_colors?.length > 0 && (
                              <ActivityDetailRow>
                                <DetailIcon><SkinOutlined /></DetailIcon>
                                <DetailLabel>Colors:</DetailLabel>
                                <ColorDots>
                                  {activity.dress_colors.map((c: any, i: number) => (
                                    <ColorDot key={i} $color={c.hex || c} title={c.name || ''} />
                                  ))}
                                </ColorDots>
                              </ActivityDetailRow>
                            )}
                            {activity.food_description && (
                              <ActivityDetailRow>
                                <DetailIcon><CoffeeOutlined /></DetailIcon>
                                <DetailLabel>Food:</DetailLabel>
                                <DetailValue>{activity.food_description}</DetailValue>
                              </ActivityDetailRow>
                            )}
                            {activity.dietary_options?.length > 0 && (
                              <ActivityDetailRow>
                                <DetailIcon><CoffeeOutlined /></DetailIcon>
                                <DetailLabel>Dietary:</DetailLabel>
                                <DetailValue>{activity.dietary_options.join(', ')}</DetailValue>
                              </ActivityDetailRow>
                            )}
                          </ActivityDetails>
                        )}
                      </ActivityInfo>
                    </ActivityHeader>
                  </ActivityCard>
                ))}
              </FormSection>
            )}

            {rsvpStatus !== 'declined' && rsvpStatus !== 'pending' && signupActivities.length === 0 && (
              <FormSection>
                <FormSectionTitle>Activities & Events</FormSectionTitle>
                <NoActivitiesMessage>
                  No activities have been added yet. Check back later!
                </NoActivitiesMessage>
              </FormSection>
            )}

            {/* 5. Song Requests - Hidden when declined */}
            {rsvpStatus !== 'declined' && (
            <>
            <FormSection>
              <FormSectionTitle>Song Requests</FormSectionTitle>
              <Form.Item name="song_requests">
                <TextArea
                  placeholder="Enter your favorite songs for the DJ..."
                  rows={3}
                  style={{ resize: 'none' }}
                />
              </Form.Item>
            </FormSection>

            {/* 6. Notes to Couple */}
            <FormSection>
              <FormSectionTitle>Notes to the Couple</FormSectionTitle>
              <Form.Item name="notes_to_couple">
                <TextArea
                  placeholder="Share your wishes, memories, or special requests..."
                  rows={3}
                  style={{ resize: 'none' }}
                />
              </Form.Item>
            </FormSection>

            {/* 7. Special Requests */}
            <FormSection>
              <FormSectionTitle>Special Requests</FormSectionTitle>
              <Form.Item name="special_requests">
                <TextArea
                  placeholder="Any dietary requirements, accessibility needs, or other requests..."
                  rows={3}
                  style={{ resize: 'none' }}
                />
              </Form.Item>
            </FormSection>
            </>
            )}
          </StyledForm>

          {/* 8. Save Button */}
          <SubmitButton
            type="primary"
            size="large"
            loading={loading}
            onClick={handleSubmit}
            disabled={rsvpStatus === 'pending'}
            icon={<HeartFilled />}
          >
            {rsvpStatus === 'confirmed'
              ? "Confirm I'm Attending"
              : rsvpStatus === 'declined'
              ? 'Submit Response'
              : 'Select Your Response'}
          </SubmitButton>
        </FormCard>
      )}

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SuccessCard
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <SuccessIcon
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircleFilled />
              </SuccessIcon>
              <SuccessTitle>RSVP Confirmed!</SuccessTitle>
              <SuccessMessage>
                Thank you for confirming your attendance. We can't wait to celebrate with you!
              </SuccessMessage>
            </SuccessCard>
          </SuccessOverlay>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
};

export default RSVPSection;
