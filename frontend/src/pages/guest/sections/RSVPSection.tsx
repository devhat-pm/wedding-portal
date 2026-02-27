import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { Form, Input, Button, message } from 'antd';
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

// ============================================
// Styled Components
// ============================================
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

const CurrentStatusCard = styled(motion.div)<{ $status: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-radius: ${borderRadius.xl}px;
  margin-bottom: 28px;

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
  padding: 32px;

  @media (max-width: 768px) {
    padding: 24px 20px;
  }

  @media (max-width: 480px) {
    padding: 20px 16px;
  }
`;

// ─── Per-Event RSVP Card (rich design) ───
const EventRSVPCard = styled(motion.div)`
  background: white;
  border: 1px solid ${colors.borderGold};
  border-radius: ${borderRadius.xl}px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: ${shadows.md};
`;

const EventCardHeader = styled.div`
  background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.creamMedium} 100%);
  padding: 22px 28px;
  border-bottom: 1px solid ${colors.borderGold};

  @media (max-width: 480px) {
    padding: 18px 20px;
  }
`;

const EventCardName = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 700;
  color: ${colors.secondary};
  margin: 0 0 6px;

  @media (max-width: 480px) {
    font-size: 19px;
  }
`;

const EventCardDescription = styled.p`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

const EventCardBody = styled.div`
  padding: 24px 28px;

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const EventDetailGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px 16px;
  margin-bottom: 24px;
  align-items: center;
`;

const EventDetailLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const EventDetailValue = styled.div`
  font-size: 14px;
  color: ${colors.textPrimary};
  font-weight: 500;
`;

const EventCardDivider = styled.div`
  height: 1px;
  background: ${colors.creamDark};
  margin-bottom: 20px;
`;

const EventResponsePrompt = styled.p`
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  color: ${colors.secondary};
  text-align: center;
  margin: 0 0 16px;
`;

const EventResponseRow = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const EventRadioButton = styled.button<{ $selected: boolean; $variant: 'attending' | 'declined' }>`
  flex: 1;
  padding: 16px;
  border-radius: ${borderRadius.lg}px;
  border: 2px solid;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s ease;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  ${(props) => {
    if (props.$variant === 'attending') {
      return props.$selected
        ? `
          border-color: ${colors.success};
          background: rgba(91, 122, 94, 0.1);
          color: ${colors.success};
          box-shadow: 0 2px 8px rgba(91, 122, 94, 0.2);
        `
        : `
          border-color: ${colors.creamDark};
          color: ${colors.textSecondary};
          &:hover { border-color: ${colors.success}; color: ${colors.success}; }
        `;
    }
    return props.$selected
      ? `
        border-color: ${colors.error};
        background: rgba(158, 91, 91, 0.08);
        color: ${colors.error};
        box-shadow: 0 2px 8px rgba(158, 91, 91, 0.15);
      `
      : `
        border-color: ${colors.creamDark};
        color: ${colors.textSecondary};
        &:hover { border-color: ${colors.error}; color: ${colors.error}; }
      `;
  }}
`;

// ─── Form Section Styles ───
const FormSection = styled.div`
  margin-bottom: 28px;
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

const FormSectionSubtitle = styled.p`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin: -12px 0 20px;
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

// ─── Guest Card Styles ───
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

// ─── Success Overlay ───
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
  margin: 28px 0;
`;

const MAX_GUESTS = 10;

// ============================================
// Component
// ============================================
const RSVPSection: React.FC = () => {
  const { portalData, updateRSVP } = useGuestPortal();
  const [form] = Form.useForm();

  const [eventResponses, setEventResponses] = useState<Record<string, 'attending' | 'declined'>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [partyMembers, setPartyMembers] = useState<PartyMember[]>([
    { first_name: '', last_name: '', phone: '' },
  ]);

  // Derived values
  const signupActivities = (portalData?.activities || []).filter(
    (a: any) => a.requires_signup !== false
  );
  const attendingIds = signupActivities
    .filter((a: any) => eventResponses[a.id] === 'attending')
    .map((a: any) => a.id as string);
  const attendingAnyEvent = attendingIds.length > 0;
  const allDeclined =
    signupActivities.length > 0 &&
    signupActivities.every((a: any) => eventResponses[a.id] === 'declined');
  const hasResponded =
    signupActivities.length > 0 &&
    signupActivities.every((a: any) => eventResponses[a.id] !== undefined);
  const derivedRsvpStatus = hasResponded
    ? attendingAnyEvent
      ? 'confirmed'
      : 'declined'
    : 'pending';

  useEffect(() => {
    if (portalData?.guest) {
      const guest = portalData.guest;
      const guestData = guest as any;

      // Load party members from API or derive from guest name
      if (guestData.party_members && Array.isArray(guestData.party_members) && guestData.party_members.length > 0) {
        setPartyMembers(guestData.party_members.map((m: any) => ({
          first_name: m.first_name || '',
          last_name: m.last_name || '',
          phone: m.phone || '',
        })));
      } else {
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

      // Reconstruct eventResponses from existing registrations
      const status = guest.rsvp_status;
      if (status === 'confirmed' || status === 'declined') {
        const responses: Record<string, 'attending' | 'declined'> = {};
        (portalData.activities || []).forEach((act: any) => {
          if (act.requires_signup !== false) {
            responses[act.id] = act.is_registered ? 'attending' : 'declined';
          }
        });
        setEventResponses(responses);
        setIsEditing(false);
      } else {
        setEventResponses({});
        setIsEditing(true);
      }
    }
  }, [portalData, form]);

  const setEventResponse = (activityId: string, response: 'attending' | 'declined') => {
    setEventResponses((prev) => ({ ...prev, [activityId]: response }));
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
    if (index === 0) return;
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
      if (attendingAnyEvent) {
        if (!validatePartyMembers()) return;
      }

      if (allDeclined) {
        await form.validateFields();
      }

      setLoading(true);

      const rsvpStatus = attendingAnyEvent ? 'confirmed' : 'declined';

      const data: any = {
        rsvp_status: rsvpStatus,
        activity_ids: attendingIds,
      };

      if (attendingAnyEvent) {
        data.party_members = partyMembers.map((m) => ({
          first_name: m.first_name.trim(),
          last_name: m.last_name.trim(),
          phone: m.phone.trim(),
        }));
        data.number_of_attendees = partyMembers.length;
        data.phone = partyMembers[0]?.phone || undefined;
      } else {
        data.number_of_attendees = 0;
        data.party_members = [];
        const values = form.getFieldsValue();
        data.notes_to_couple = values.notes_to_couple || undefined;
      }

      await updateRSVP(data);

      if (attendingAnyEvent) {
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
    if (derivedRsvpStatus === 'confirmed') {
      const count = attendingIds.length;
      return `Attending ${count} event${count !== 1 ? 's' : ''} \u00b7 ${partyMembers.length} guest${partyMembers.length !== 1 ? 's' : ''}`;
    }
    if (derivedRsvpStatus === 'declined') return 'Declined';
    return 'Awaiting Response';
  };

  if (!portalData) return null;

  return (
    <SectionWrapper>
      <SectionHeader
        title="RSVP"
        subtitle="Please let us know if you'll be joining us"
      />

      {/* Current Status Display (when not editing) */}
      {!isEditing && derivedRsvpStatus !== 'pending' && (
        <CurrentStatusCard
          $status={derivedRsvpStatus}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatusInfo>
            <StatusIcon $status={derivedRsvpStatus}>
              {derivedRsvpStatus === 'confirmed' && <CheckCircleFilled />}
              {derivedRsvpStatus === 'declined' && <CloseCircleFilled />}
            </StatusIcon>
            <StatusText>
              <StatusLabel>Your Response</StatusLabel>
              <StatusValue>{getStatusLabel()}</StatusValue>
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
      {(isEditing || derivedRsvpStatus === 'pending') && (
        <FormCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Per-Event RSVP Cards */}
          {signupActivities.map((activity: any, index: number) => (
            <EventRSVPCard
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <EventCardHeader>
                <EventCardName>{activity.activity_name || activity.title}</EventCardName>
                {activity.description && (
                  <EventCardDescription>{activity.description}</EventCardDescription>
                )}
              </EventCardHeader>
              <EventCardBody>
                <EventDetailGrid>
                  {activity.date_time && (
                    <>
                      <EventDetailLabel><CalendarOutlined /> Date</EventDetailLabel>
                      <EventDetailValue>{dayjs(activity.date_time).format('dddd, MMMM D, YYYY')}</EventDetailValue>
                    </>
                  )}
                  {activity.date_time && (
                    <>
                      <EventDetailLabel><ClockCircleOutlined /> Time</EventDetailLabel>
                      <EventDetailValue>{dayjs(activity.date_time).format('h:mm A')}</EventDetailValue>
                    </>
                  )}
                  {activity.location && (
                    <>
                      <EventDetailLabel><EnvironmentOutlined /> Venue</EventDetailLabel>
                      <EventDetailValue>{activity.location}</EventDetailValue>
                    </>
                  )}
                  {activity.dress_code_info && (
                    <>
                      <EventDetailLabel><SkinOutlined /> Dress Code</EventDetailLabel>
                      <EventDetailValue>{activity.dress_code_info}</EventDetailValue>
                    </>
                  )}
                </EventDetailGrid>
                <EventCardDivider />
                <EventResponsePrompt>Will you be joining us?</EventResponsePrompt>
                <EventResponseRow>
                  <EventRadioButton
                    $selected={eventResponses[activity.id] === 'attending'}
                    $variant="attending"
                    onClick={() => setEventResponse(activity.id, 'attending')}
                    type="button"
                  >
                    <CheckCircleFilled /> I will be attending
                  </EventRadioButton>
                  <EventRadioButton
                    $selected={eventResponses[activity.id] === 'declined'}
                    $variant="declined"
                    onClick={() => setEventResponse(activity.id, 'declined')}
                    type="button"
                  >
                    <CloseCircleFilled /> Regretfully decline
                  </EventRadioButton>
                </EventResponseRow>
              </EventCardBody>
            </EventRSVPCard>
          ))}

          {/* Party Details (when attending any event) */}
          <AnimatePresence mode="wait">
            {attendingAnyEvent && (
              <motion.div
                key="party-flow"
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
                  <FormSectionSubtitle>
                    Please provide details for everyone attending
                  </FormSectionSubtitle>

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
                      Add Another Guest
                    </AddGuestButton>
                  ) : (
                    <MaxGuestsNote>Maximum {MAX_GUESTS} guests allowed</MaxGuestsNote>
                  )}
                </FormSection>
              </motion.div>
            )}

            {/* Decline Message (when all events declined) */}
            {allDeclined && (
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
            disabled={!hasResponded}
            icon={<HeartFilled />}
          >
            {attendingAnyEvent
              ? 'Submit RSVP'
              : allDeclined
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
