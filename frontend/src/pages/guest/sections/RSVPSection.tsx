import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { Form, Input, Button, Checkbox, message } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  HeartFilled,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  SkinOutlined,
  CoffeeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import confetti from 'canvas-confetti';
import dayjs from 'dayjs';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import { useGuestPortal } from '../../../context/GuestPortalContext';
import SectionHeader from '../../../components/guest/SectionHeader';

const { TextArea } = Input;

// ============================================
// Types
// ============================================
interface PartyMember {
  first_name: string;
  last_name: string;
  phone: string;
}

type RSVPStatus = 'pending' | 'confirmed' | 'declined';

// ============================================
// Styled Components
// ============================================
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

const RSVPQuestion = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  color: ${colors.secondary};
  text-align: center;
  margin: 0 0 28px;
`;

const RSVPOptionsWrapper = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 40px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const RSVPOption = styled(motion.button)<{ $selected: boolean; $variant: 'accept' | 'decline' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 28px 24px;
  border-radius: ${borderRadius.lg}px;
  border: 2px solid;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  flex: 1;
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
    }
  }}
`;

const OptionIcon = styled.div<{ $variant: 'accept' | 'decline'; $selected: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  transition: all 0.3s ease;

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
    }
  }}
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

const StyledForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 16px;
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

  textarea.ant-input {
    min-height: 100px !important;
    padding: 14px 16px !important;
  }
`;

// Guest Card styles
const GuestCardWrapper = styled(motion.div)`
  border: 1px solid ${colors.borderGold};
  border-radius: ${borderRadius.lg}px;
  padding: 20px;
  margin-bottom: 16px;
  background: ${colors.creamLight};
  position: relative;
`;

const GuestCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const GuestCardLabel = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  font-weight: 600;
  color: ${colors.secondary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GuestCardNumber = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${colors.primary};
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-family: inherit;
`;

const GuestFieldsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const GuestFieldFull = styled.div`
  grid-column: 1 / -1;

  @media (max-width: 480px) {
    grid-column: auto;
  }
`;

const AddGuestButton = styled(Button)`
  && {
    width: 100%;
    height: 52px;
    border: 2px dashed ${colors.borderGold};
    border-radius: ${borderRadius.lg}px;
    color: ${colors.primary};
    font-weight: 500;
    font-size: 15px;
    background: transparent;
    margin-bottom: 8px;

    &:hover {
      border-color: ${colors.primary};
      color: ${colors.primary};
      background: ${colors.goldPale};
    }
  }
`;

const MaxGuestsNote = styled.div`
  text-align: center;
  font-size: 13px;
  color: ${colors.textSecondary};
  margin-top: 4px;
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

const SuccessIconWrapper = styled(motion.div)`
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

const Divider = styled.div`
  height: 1px;
  background: ${colors.creamDark};
  margin: 32px 0;
`;

const MAX_GUESTS = 10;

// ============================================
// Component
// ============================================
const RSVPSection: React.FC = () => {
  const { portalData, updateRSVP } = useGuestPortal();
  const [form] = Form.useForm();

  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('pending');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [partyMembers, setPartyMembers] = useState<PartyMember[]>([
    { first_name: '', last_name: '', phone: '' },
  ]);

  useEffect(() => {
    if (portalData?.guest) {
      const guest = portalData.guest;
      const guestData = guest as any;

      const status = guest.rsvp_status as RSVPStatus;
      // Map 'maybe' to 'pending' for legacy data
      setRsvpStatus(status === 'maybe' ? 'pending' : (status || 'pending'));

      // Load party members from API or derive from guest name
      if (guestData.party_members && Array.isArray(guestData.party_members) && guestData.party_members.length > 0) {
        setPartyMembers(guestData.party_members.map((m: any) => ({
          first_name: m.first_name || '',
          last_name: m.last_name || '',
          phone: m.phone || '',
        })));
      } else {
        // Pre-fill first guest with the main guest's name
        let firstName = guest.first_name || '';
        let lastName = guest.last_name || '';
        if (guestData.full_name && !firstName && !lastName) {
          const nameParts = guestData.full_name.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }
        setPartyMembers([{
          first_name: firstName,
          last_name: lastName,
          phone: guest.phone || '',
        }]);
      }

      // Set form fields for decline message
      form.setFieldsValue({
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

      setIsEditing(guest.rsvp_status === 'pending' || guest.rsvp_status === 'maybe');
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

  const updatePartyMember = (index: number, field: keyof PartyMember, value: string) => {
    setPartyMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addPartyMember = () => {
    if (partyMembers.length >= MAX_GUESTS) return;
    setPartyMembers((prev) => [...prev, { first_name: '', last_name: '', phone: '' }]);
  };

  const removePartyMember = (index: number) => {
    if (index === 0) return; // Cannot remove first guest
    setPartyMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const validatePartyMembers = (): boolean => {
    for (let i = 0; i < partyMembers.length; i++) {
      const m = partyMembers[i];
      if (!m.first_name.trim() || !m.last_name.trim()) {
        message.error(`Please fill in the name for Guest ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (rsvpStatus === 'confirmed') {
        if (!validatePartyMembers()) return;
      }

      if (rsvpStatus === 'declined') {
        await form.validateFields();
      }

      setLoading(true);

      const data: any = {
        rsvp_status: rsvpStatus,
        activity_ids: rsvpStatus === 'confirmed' ? Array.from(selectedActivities) : [],
      };

      if (rsvpStatus === 'confirmed') {
        data.party_members = partyMembers.map((m) => ({
          first_name: m.first_name.trim(),
          last_name: m.last_name.trim(),
          phone: m.phone.trim(),
        }));
        data.number_of_attendees = partyMembers.length;
        // Use the first party member's phone as the main guest phone
        data.phone = partyMembers[0]?.phone || undefined;
      } else {
        data.number_of_attendees = 0;
        data.party_members = [];
        const values = form.getFieldsValue();
        data.notes_to_couple = values.notes_to_couple || undefined;
      }

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
        return 'Attending';
      case 'declined':
        return 'Declined';
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
        subtitle="Please let us know if you'll be joining us"
      />

      {/* Current Status Display (when not editing) */}
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
            </StatusIcon>
            <StatusText>
              <StatusLabel>Your Response</StatusLabel>
              <StatusValue>
                {getStatusLabel()}
                {rsvpStatus === 'confirmed' && ` - ${partyMembers.length} guest${partyMembers.length > 1 ? 's' : ''}`}
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

      {/* RSVP Form */}
      {(isEditing || rsvpStatus === 'pending') && (
        <FormCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Step 1: Accept or Decline */}
          <RSVPQuestion>Will you be attending?</RSVPQuestion>
          <RSVPOptionsWrapper>
            <RSVPOption
              $selected={rsvpStatus === 'confirmed'}
              $variant="accept"
              onClick={() => handleRSVPChange('confirmed')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <OptionIcon $variant="accept" $selected={rsvpStatus === 'confirmed'}>
                <CheckCircleFilled />
              </OptionIcon>
              <OptionLabel>Accept</OptionLabel>
              <OptionArabic>سأحضر</OptionArabic>
            </RSVPOption>

            <RSVPOption
              $selected={rsvpStatus === 'declined'}
              $variant="decline"
              onClick={() => handleRSVPChange('declined')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <OptionIcon $variant="decline" $selected={rsvpStatus === 'declined'}>
                <CloseCircleFilled />
              </OptionIcon>
              <OptionLabel>Decline</OptionLabel>
              <OptionArabic>أعتذر</OptionArabic>
            </RSVPOption>
          </RSVPOptionsWrapper>

          {/* Step 2 (Accept): Add Guests */}
          <AnimatePresence mode="wait">
            {rsvpStatus === 'confirmed' && (
              <motion.div
                key="accept-flow"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Divider />
                <FormSection>
                  <FormSectionTitle>
                    <UserOutlined /> Your Party
                  </FormSectionTitle>

                  {partyMembers.map((member, index) => (
                    <GuestCardWrapper
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <GuestCardHeader>
                        <GuestCardLabel>
                          <GuestCardNumber>{index + 1}</GuestCardNumber>
                          Guest {index + 1}
                        </GuestCardLabel>
                        {index > 0 && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removePartyMember(index)}
                            size="small"
                          >
                            Remove
                          </Button>
                        )}
                      </GuestCardHeader>

                      <GuestFieldsRow>
                        <div>
                          <Input
                            placeholder="First Name *"
                            value={member.first_name}
                            onChange={(e) => updatePartyMember(index, 'first_name', e.target.value)}
                            size="large"
                            status={!member.first_name.trim() && rsvpStatus === 'confirmed' ? undefined : undefined}
                          />
                        </div>
                        <div>
                          <Input
                            placeholder="Last Name *"
                            value={member.last_name}
                            onChange={(e) => updatePartyMember(index, 'last_name', e.target.value)}
                            size="large"
                          />
                        </div>
                        <GuestFieldFull>
                          <Input
                            placeholder="Phone Number"
                            value={member.phone}
                            onChange={(e) => updatePartyMember(index, 'phone', e.target.value)}
                            size="large"
                          />
                        </GuestFieldFull>
                      </GuestFieldsRow>
                    </GuestCardWrapper>
                  ))}

                  {partyMembers.length < MAX_GUESTS ? (
                    <AddGuestButton
                      icon={<PlusOutlined />}
                      onClick={addPartyMember}
                    >
                      Add Guest
                    </AddGuestButton>
                  ) : (
                    <MaxGuestsNote>Maximum {MAX_GUESTS} guests allowed</MaxGuestsNote>
                  )}
                </FormSection>

                {/* Step 3 (Accept): Select Activities */}
                {signupActivities.length > 0 && (
                  <>
                    <Divider />
                    <FormSection>
                      <FormSectionTitle>
                        <CalendarOutlined /> Which events will you attend?
                      </FormSectionTitle>
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
                  </>
                )}
              </motion.div>
            )}

            {/* Decline Flow: Optional message */}
            {rsvpStatus === 'declined' && (
              <motion.div
                key="decline-flow"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Divider />
                <StyledForm form={form} layout="vertical" requiredMark={false}>
                  <FormSection>
                    <FormSectionTitle>Message for the Couple (Optional)</FormSectionTitle>
                    <Form.Item name="notes_to_couple">
                      <TextArea
                        placeholder="Share your wishes or a message..."
                        rows={3}
                        style={{ resize: 'none' }}
                      />
                    </Form.Item>
                  </FormSection>
                </StyledForm>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <SubmitButton
            type="primary"
            size="large"
            loading={loading}
            onClick={handleSubmit}
            disabled={rsvpStatus === 'pending'}
            icon={<HeartFilled />}
          >
            {rsvpStatus === 'confirmed'
              ? 'Submit RSVP'
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
              <SuccessIconWrapper
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircleFilled />
              </SuccessIconWrapper>
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
