import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Form,
  Input,
  Button,
  DatePicker,
  Radio,
  Row,
  Col,
  Space,
} from 'antd';
import {
  CheckCircleFilled,
  EditOutlined,
  BankOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import { useGuestPortal } from '../../../context/GuestPortalContext';
import SectionHeader from '../../../components/guest/SectionHeader';
import HotelCard from '../../../components/guest/HotelCard';
import type { SuggestedHotel } from '../../../types';

const { TextArea } = Input;

const SectionWrapper = styled.section`
  padding: 80px 24px;
  max-width: 920px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }

  @media (max-width: 480px) {
    padding: 48px 16px;
  }
`;

const OptionSelector = styled.div`
  margin-bottom: 40px;
`;

const StyledRadioGroup = styled(Radio.Group)`
  && {
    display: flex;
    gap: 16px;
    width: 100%;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }
`;

const OptionCard = styled.label<{ $selected: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 28px;
  background: ${(props) => (props.$selected ? colors.goldPale : colors.cardBg)};
  border: 2px solid ${(props) => (props.$selected ? colors.primary : colors.borderGold)};
  border-radius: ${borderRadius.xl}px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${(props) => (props.$selected ? '0 4px 16px rgba(183, 168, 154, 0.2)' : shadows.sm)};

  &:hover {
    border-color: ${colors.primary};
    box-shadow: ${shadows.md};
  }

  .ant-radio {
    display: none;
  }

  @media (max-width: 480px) {
    padding: 20px;
    gap: 16px;
  }
`;

const OptionIcon = styled.div<{ $selected: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: ${borderRadius.lg}px;
  background: ${(props) =>
    props.$selected
      ? colors.primary
      : `linear-gradient(135deg, ${colors.creamLight} 0%, ${colors.creamMedium} 100%)`};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${(props) => (props.$selected ? 'white' : colors.primary)};
  transition: all 0.3s ease;
`;

const OptionText = styled.div`
  flex: 1;
`;

const OptionTitle = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  font-weight: 600;
  color: ${colors.secondary};
  margin-bottom: 4px;
`;

const OptionDescription = styled.div`
  font-size: 13px;
  color: ${colors.textSecondary};
`;

const OptionCheck = styled.div<{ $selected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${(props) => (props.$selected ? colors.primary : colors.creamDark)};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  ${(props) =>
    props.$selected &&
    `
    background: ${colors.primary};
    border-color: ${colors.primary};
    color: white;
  `}
`;

const HotelsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 28px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
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

const FormSectionTitle = styled.h4`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.secondary};
  margin: 0 0 28px;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: 0.5px;

  svg {
    color: ${colors.primary};
    font-size: 18px;
  }
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
  .ant-picker,
  .ant-select-selector {
    border-radius: ${borderRadius.md}px !important;
    min-height: 48px !important;
    font-size: 15px !important;
  }

  .ant-input-lg,
  .ant-picker-large {
    padding: 12px 16px !important;
  }

  textarea.ant-input {
    min-height: 90px !important;
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
    margin-top: 16px;
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

// Saved info display
const SavedInfoCard = styled(motion.div)`
  background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.creamLight} 100%);
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${colors.borderGold};
  padding: 32px;
  box-shadow: ${shadows.md};

  @media (max-width: 480px) {
    padding: 24px 20px;
  }
`;

const SavedInfoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const SavedInfoTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SavedIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${colors.success};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
`;

const SavedLabel = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.secondary};
`;

const SelectedHotelCard = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: ${borderRadius.lg}px;
  margin-bottom: 16px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const SelectedHotelImage = styled.div<{ $imageUrl?: string }>`
  width: 100px;
  height: 80px;
  border-radius: ${borderRadius.md}px;
  background: ${(props) =>
    props.$imageUrl
      ? `url(${props.$imageUrl}) center/cover no-repeat`
      : colors.creamMedium};
  flex-shrink: 0;
`;

const SelectedHotelInfo = styled.div`
  flex: 1;
`;

const SelectedHotelName = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  font-weight: 600;
  color: ${colors.secondary};
  margin-bottom: 4px;
`;

const SelectedHotelMeta = styled.div`
  font-size: 13px;
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  padding: 12px;
  background: white;
  border-radius: ${borderRadius.md}px;
`;

const InfoLabel = styled.div`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${colors.textSecondary};
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${colors.secondary};
`;

const NoHotelsMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: ${colors.creamLight};
  border-radius: ${borderRadius.xl}px;
  border: 1px dashed ${colors.borderGold};
  margin-bottom: 24px;
`;

type AccommodationType = 'suggested' | 'own';

interface HotelFormData {
  hotel_name?: string;
  address?: string;
  floor_number?: string;
  room_number?: string;
  check_in_date?: dayjs.Dayjs;
  check_out_date?: dayjs.Dayjs;
  notes?: string;
}

const HotelSection: React.FC = () => {
  const { portalData, updateHotelPreference } = useGuestPortal();
  const [form] = Form.useForm();

  const [accommodationType, setAccommodationType] = useState<AccommodationType>('suggested');
  const [selectedHotel, setSelectedHotel] = useState<SuggestedHotel | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Backend returns hotel_info, fallback to hotel_preference for compatibility
    const pref = portalData?.hotel_info || portalData?.hotel_preference;
    if (pref) {
      setIsEditing(false);

      if (pref.suggested_hotel_id) {
        setAccommodationType('suggested');
        const hotel = portalData?.suggested_hotels.find(
          (h) => h.id === pref.suggested_hotel_id
        );
        if (hotel) setSelectedHotel(hotel);
      } else {
        setAccommodationType('own');
      }

      form.setFieldsValue({
        hotel_name: pref.custom_hotel_name,
        address: pref.custom_hotel_address,
        check_in_date: pref.check_in_date ? dayjs(pref.check_in_date) : undefined,
        check_out_date: pref.check_out_date ? dayjs(pref.check_out_date) : undefined,
        room_number: pref.room_type, // Using room_type for room number
        notes: pref.special_requests,
      });
    } else {
      setIsEditing(true);
    }
  }, [portalData, form]);

  const handleHotelSelect = (hotel: SuggestedHotel) => {
    setSelectedHotel(hotel);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const data = {
        suggested_hotel_id: accommodationType === 'suggested' ? selectedHotel?.id : undefined,
        custom_hotel_name:
          accommodationType === 'own' ? values.hotel_name : selectedHotel?.name,
        custom_hotel_address:
          accommodationType === 'own' ? values.address : selectedHotel?.address,
        check_in_date: values.check_in_date?.format('YYYY-MM-DD'),
        check_out_date: values.check_out_date?.format('YYYY-MM-DD'),
        room_type: values.room_number,
        special_requests: values.notes,
      };

      await updateHotelPreference(data);
      setIsEditing(false);
    } catch (error) {
      // Validation error
    } finally {
      setLoading(false);
    }
  };

  if (!portalData) return null;

  const { suggested_hotels } = portalData;
  // Backend returns hotel_info, fallback to hotel_preference for compatibility
  const hotel_preference = portalData.hotel_info || portalData.hotel_preference;

  // Get saved info for display
  const getSavedHotelInfo = () => {
    if (!hotel_preference) return null;

    const hotel = selectedHotel || suggested_hotels.find(
      (h) => h.id === hotel_preference.suggested_hotel_id
    );

    return {
      hotel,
      hotelName: hotel?.name || hotel_preference.custom_hotel_name,
      address: hotel?.address || hotel_preference.custom_hotel_address,
      checkIn: hotel_preference.check_in_date,
      checkOut: hotel_preference.check_out_date,
      roomNumber: hotel_preference.room_type,
      notes: hotel_preference.special_requests,
    };
  };

  const savedInfo = getSavedHotelInfo();

  return (
    <SectionWrapper>
      <SectionHeader
        title="Accommodation"
        arabicTitle="الإقامة"
        subtitle="Let us know where you'll be staying during the wedding"
        icon={<BankOutlined />}
      />

      {!isEditing && savedInfo ? (
        <SavedInfoCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SavedInfoHeader>
            <SavedInfoTitle>
              <SavedIcon>
                <CheckCircleFilled />
              </SavedIcon>
              <SavedLabel>Accommodation Saved</SavedLabel>
            </SavedInfoTitle>
            <Button
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          </SavedInfoHeader>

          {savedInfo.hotel && (
            <SelectedHotelCard>
              <SelectedHotelImage $imageUrl={savedInfo.hotel.image_url} />
              <SelectedHotelInfo>
                <SelectedHotelName>{savedInfo.hotel.name}</SelectedHotelName>
                {savedInfo.hotel.address && (
                  <SelectedHotelMeta>
                    <EnvironmentOutlined /> {savedInfo.hotel.address}
                  </SelectedHotelMeta>
                )}
              </SelectedHotelInfo>
            </SelectedHotelCard>
          )}

          {!savedInfo.hotel && savedInfo.hotelName && (
            <SelectedHotelCard>
              <SelectedHotelImage />
              <SelectedHotelInfo>
                <SelectedHotelName>{savedInfo.hotelName}</SelectedHotelName>
                {savedInfo.address && (
                  <SelectedHotelMeta>
                    <EnvironmentOutlined /> {savedInfo.address}
                  </SelectedHotelMeta>
                )}
              </SelectedHotelInfo>
            </SelectedHotelCard>
          )}

          <InfoGrid>
            {savedInfo.checkIn && (
              <InfoItem>
                <InfoLabel>Check-in</InfoLabel>
                <InfoValue>
                  {dayjs(savedInfo.checkIn).format('MMMM D, YYYY')}
                </InfoValue>
              </InfoItem>
            )}
            {savedInfo.checkOut && (
              <InfoItem>
                <InfoLabel>Check-out</InfoLabel>
                <InfoValue>
                  {dayjs(savedInfo.checkOut).format('MMMM D, YYYY')}
                </InfoValue>
              </InfoItem>
            )}
            {savedInfo.roomNumber && (
              <InfoItem>
                <InfoLabel>Room Number</InfoLabel>
                <InfoValue>{savedInfo.roomNumber}</InfoValue>
              </InfoItem>
            )}
          </InfoGrid>

          {savedInfo.notes && (
            <InfoItem style={{ marginTop: 12 }}>
              <InfoLabel>Notes</InfoLabel>
              <InfoValue>{savedInfo.notes}</InfoValue>
            </InfoItem>
          )}
        </SavedInfoCard>
      ) : (
        <>
          <OptionSelector>
            <StyledRadioGroup
              value={accommodationType}
              onChange={(e) => {
                setAccommodationType(e.target.value);
                setSelectedHotel(null);
              }}
            >
              <OptionCard $selected={accommodationType === 'suggested'}>
                <Radio value="suggested" />
                <OptionIcon $selected={accommodationType === 'suggested'}>
                  <BankOutlined />
                </OptionIcon>
                <OptionText>
                  <OptionTitle>Choose from Suggested Hotels</OptionTitle>
                  <OptionDescription>
                    Select from hotels near the venue with special rates
                  </OptionDescription>
                </OptionText>
                <OptionCheck $selected={accommodationType === 'suggested'}>
                  {accommodationType === 'suggested' && <CheckCircleFilled />}
                </OptionCheck>
              </OptionCard>

              <OptionCard $selected={accommodationType === 'own'}>
                <Radio value="own" />
                <OptionIcon $selected={accommodationType === 'own'}>
                  <HomeOutlined />
                </OptionIcon>
                <OptionText>
                  <OptionTitle>I Have My Own Accommodation</OptionTitle>
                  <OptionDescription>
                    Staying with family, friends, or another hotel
                  </OptionDescription>
                </OptionText>
                <OptionCheck $selected={accommodationType === 'own'}>
                  {accommodationType === 'own' && <CheckCircleFilled />}
                </OptionCheck>
              </OptionCard>
            </StyledRadioGroup>
          </OptionSelector>

          <AnimatePresence mode="wait">
            {accommodationType === 'suggested' && (
              <motion.div
                key="suggested"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {suggested_hotels.length > 0 ? (
                  <HotelsGrid>
                    {suggested_hotels.map((hotel) => (
                      <HotelCard
                        key={hotel.id}
                        hotel={hotel}
                        selected={selectedHotel?.id === hotel.id}
                        onSelect={handleHotelSelect}
                      />
                    ))}
                  </HotelsGrid>
                ) : (
                  <NoHotelsMessage>
                    <BankOutlined
                      style={{ fontSize: 48, color: colors.primary, marginBottom: 16 }}
                    />
                    <div
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 18,
                        color: colors.secondary,
                        marginBottom: 8,
                      }}
                    >
                      No Suggested Hotels Available
                    </div>
                    <div style={{ color: colors.textSecondary }}>
                      Please select "I Have My Own Accommodation" to enter your hotel details
                    </div>
                  </NoHotelsMessage>
                )}

                {selectedHotel && (
                  <FormCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <FormSectionTitle>
                      <CalendarOutlined />
                      Stay Details for {selectedHotel.name}
                    </FormSectionTitle>

                    <StyledForm form={form} layout="vertical" requiredMark={false}>
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="check_in_date"
                            label="Check-in Date"
                            rules={[{ required: true, message: 'Please select check-in date' }]}
                          >
                            <DatePicker
                              style={{ width: '100%' }}
                              size="large"
                              format="MMMM D, YYYY"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="check_out_date"
                            label="Check-out Date"
                            rules={[{ required: true, message: 'Please select check-out date' }]}
                          >
                            <DatePicker
                              style={{ width: '100%' }}
                              size="large"
                              format="MMMM D, YYYY"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item name="room_number" label="Room Number (if known)">
                            <Input placeholder="e.g., Room 1205" size="large" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item name="notes" label="Additional Notes">
                        <TextArea
                          placeholder="Any special requests or notes..."
                          rows={3}
                          style={{ resize: 'none' }}
                        />
                      </Form.Item>

                      <SubmitButton
                        type="primary"
                        size="large"
                        loading={loading}
                        onClick={handleSubmit}
                        icon={<CheckCircleFilled />}
                      >
                        Save Accommodation Details
                      </SubmitButton>
                    </StyledForm>
                  </FormCard>
                )}
              </motion.div>
            )}

            {accommodationType === 'own' && (
              <motion.div
                key="own"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <FormCard>
                  <FormSectionTitle>
                    <HomeOutlined />
                    Your Accommodation Details
                  </FormSectionTitle>

                  <StyledForm form={form} layout="vertical" requiredMark={false}>
                    <Form.Item
                      name="hotel_name"
                      label="Hotel / Accommodation Name"
                      rules={[{ required: true, message: 'Please enter accommodation name' }]}
                    >
                      <Input
                        placeholder="e.g., Marriott Downtown, Family Home"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item name="address" label="Address">
                      <TextArea
                        placeholder="Full address of your accommodation"
                        rows={2}
                        style={{ resize: 'none' }}
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item name="floor_number" label="Floor Number">
                          <Input placeholder="e.g., 12th floor" size="large" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="room_number" label="Room/Apartment Number">
                          <Input placeholder="e.g., Room 1205" size="large" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="check_in_date"
                          label="Check-in Date"
                          rules={[{ required: true, message: 'Please select check-in date' }]}
                        >
                          <DatePicker
                            style={{ width: '100%' }}
                            size="large"
                            format="MMMM D, YYYY"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="check_out_date"
                          label="Check-out Date"
                          rules={[{ required: true, message: 'Please select check-out date' }]}
                        >
                          <DatePicker
                            style={{ width: '100%' }}
                            size="large"
                            format="MMMM D, YYYY"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name="notes" label="Additional Notes">
                      <TextArea
                        placeholder="Any other details about your accommodation..."
                        rows={3}
                        style={{ resize: 'none' }}
                      />
                    </Form.Item>

                    <SubmitButton
                      type="primary"
                      size="large"
                      loading={loading}
                      onClick={handleSubmit}
                      icon={<CheckCircleFilled />}
                    >
                      Save Accommodation Details
                    </SubmitButton>
                  </StyledForm>
                </FormCard>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </SectionWrapper>
  );
};

export default HotelSection;
