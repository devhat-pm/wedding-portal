import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Form,
  Input,
  Switch,
  Button,
  DatePicker,
  TimePicker,
  AutoComplete,
  Space,
  Card,
  Row,
  Col,
} from 'antd';
import {
  CheckCircleFilled,
  EditOutlined,
  SendOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import { useGuestPortal } from '../../../context/GuestPortalContext';
import SectionHeader from '../../../components/guest/SectionHeader';

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

const FormCard = styled(motion.div)`
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${shadows.lg};
  padding: 40px;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 32px 24px;
  }

  @media (max-width: 480px) {
    padding: 28px 20px;
  }
`;

const AirplaneDecoration = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 48px;
  opacity: 0.08;
  transform: rotate(-20deg);
`;

const ToggleSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: ${colors.creamLight};
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.creamDark};
  margin-bottom: 32px;

  @media (max-width: 480px) {
    padding: 20px 16px;
  }
`;

const ToggleLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ToggleIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${colors.goldPale};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${colors.primary};
`;

const ToggleText = styled.div``;

const ToggleTitle = styled.div`
  font-weight: 600;
  color: ${colors.secondary};
  font-size: 15px;
`;

const ToggleArabic = styled.div`
  font-family: 'Amiri', serif;
  font-size: 13px;
  color: ${colors.textSecondary};
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

  .ant-picker-large .ant-picker-input > input {
    font-size: 15px !important;
  }

  textarea.ant-input {
    min-height: 100px !important;
    padding: 14px 16px !important;
  }
`;

const FormSection = styled.div`
  margin-bottom: 32px;
`;

const FormSectionTitle = styled.h4`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${colors.secondary};
  margin: 0 0 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: 0.5px;

  svg {
    color: ${colors.primary};
    font-size: 18px;
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
  position: relative;
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

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

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

const InfoFullWidth = styled(InfoItem)`
  grid-column: 1 / -1;
`;

const PickupBadge = styled.div<{ $needs: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  margin-top: 12px;

  ${(props) =>
    props.$needs
      ? `
    background: ${colors.success};
    color: white;
  `
      : `
    background: ${colors.creamMedium};
    color: ${colors.textSecondary};
  `}
`;

// Airline suggestions
const MAJOR_AIRLINES = [
  'Emirates',
  'Etihad Airways',
  'Qatar Airways',
  'Saudi Arabian Airlines (Saudia)',
  'Gulf Air',
  'Kuwait Airways',
  'Oman Air',
  'flydubai',
  'Air Arabia',
  'Royal Jordanian',
  'EgyptAir',
  'Turkish Airlines',
  'British Airways',
  'Lufthansa',
  'Air France',
  'KLM',
  'American Airlines',
  'Delta Air Lines',
  'United Airlines',
  'Singapore Airlines',
  'Cathay Pacific',
];

interface TravelFormData {
  airline?: string;
  flight_number?: string;
  departure_city?: string;
  departure_date?: dayjs.Dayjs;
  departure_time?: dayjs.Dayjs;
  arrival_date?: dayjs.Dayjs;
  arrival_time?: dayjs.Dayjs;
  arrival_airport?: string;
  terminal?: string;
  pickup_notes?: string;
  travel_notes?: string;
}

const TravelSection: React.FC = () => {
  const { portalData, updateTravelInfo, sectionCompletion } = useGuestPortal();
  const [form] = Form.useForm();

  const [isFlightTravel, setIsFlightTravel] = useState(true);
  const [needsPickup, setNeedsPickup] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [airlineOptions, setAirlineOptions] = useState<{ value: string }[]>([]);

  useEffect(() => {
    if (portalData?.travel_info) {
      const travel = portalData.travel_info;
      setIsEditing(false);
      setNeedsPickup(travel.needs_pickup || false);

      // Populate form with existing data
      form.setFieldsValue({
        airline: travel.arrival_flight_number?.split(' ')[0],
        flight_number: travel.arrival_flight_number,
        departure_city: travel.special_requirements, // Using this field for demo
        arrival_date: travel.arrival_date ? dayjs(travel.arrival_date) : undefined,
        arrival_time: travel.arrival_time ? dayjs(travel.arrival_time, 'HH:mm') : undefined,
        arrival_airport: travel.arrival_airport,
      });
    } else {
      setIsEditing(true);
    }
  }, [portalData, form]);

  const disabledDate = (current: dayjs.Dayjs) => {
    return current && current.isBefore(dayjs().startOf('day'));
  };

  const handleAirlineSearch = (searchText: string) => {
    const filtered = MAJOR_AIRLINES.filter((airline) =>
      airline.toLowerCase().includes(searchText.toLowerCase())
    ).map((airline) => ({ value: airline }));
    setAirlineOptions(filtered);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const data = {
        arrival_date: values.arrival_date?.format('YYYY-MM-DD'),
        arrival_time: values.arrival_time?.format('HH:mm'),
        arrival_flight_number: values.flight_number,
        arrival_airport: values.arrival_airport,
        departure_date: values.departure_date?.format('YYYY-MM-DD'),
        departure_time: values.departure_time?.format('HH:mm'),
        needs_pickup: needsPickup,
        special_requirements: isFlightTravel
          ? `${values.departure_city || ''} | Terminal: ${values.terminal || 'N/A'} | Pickup Notes: ${values.pickup_notes || 'N/A'}`
          : values.travel_notes,
      };

      await updateTravelInfo(data);
      setIsEditing(false);
    } catch (error) {
      // Validation error
    } finally {
      setLoading(false);
    }
  };

  const getSavedInfo = () => {
    const travel = portalData?.travel_info;
    if (!travel) return null;

    const parts = travel.special_requirements?.split(' | ') || [];
    const departureCity = parts[0] || '';
    const terminal = parts[1]?.replace('Terminal: ', '') || '';

    return {
      flightNumber: travel.arrival_flight_number,
      departureCity,
      arrivalDate: travel.arrival_date,
      arrivalTime: travel.arrival_time,
      arrivalAirport: travel.arrival_airport,
      terminal,
      needsPickup: travel.needs_pickup,
    };
  };

  if (!portalData) return null;

  const savedInfo = getSavedInfo();

  return (
    <SectionWrapper>
      <SectionHeader
        title="Arrival Information"
        arabicTitle="معلومات الوصول"
        subtitle="Let us know your travel plans so we can help coordinate your arrival"
        icon={<span style={{ fontSize: 24 }}>✈️</span>}
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
              <SavedLabel>Arrival Details Saved</SavedLabel>
            </SavedInfoTitle>
            <Button
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          </SavedInfoHeader>

          <InfoGrid>
            {savedInfo.flightNumber && (
              <InfoItem>
                <InfoLabel>Flight Number</InfoLabel>
                <InfoValue>{savedInfo.flightNumber}</InfoValue>
              </InfoItem>
            )}
            {savedInfo.departureCity && (
              <InfoItem>
                <InfoLabel>Departing From</InfoLabel>
                <InfoValue>{savedInfo.departureCity}</InfoValue>
              </InfoItem>
            )}
            {savedInfo.arrivalDate && (
              <InfoItem>
                <InfoLabel>Arrival Date</InfoLabel>
                <InfoValue>
                  {dayjs(savedInfo.arrivalDate).format('MMMM D, YYYY')}
                </InfoValue>
              </InfoItem>
            )}
            {savedInfo.arrivalTime && (
              <InfoItem>
                <InfoLabel>Arrival Time</InfoLabel>
                <InfoValue>{savedInfo.arrivalTime}</InfoValue>
              </InfoItem>
            )}
            {savedInfo.arrivalAirport && (
              <InfoFullWidth>
                <InfoLabel>Arrival Airport</InfoLabel>
                <InfoValue>{savedInfo.arrivalAirport}</InfoValue>
              </InfoFullWidth>
            )}
          </InfoGrid>

          <PickupBadge $needs={savedInfo.needsPickup || false}>
            <CarOutlined />
            {savedInfo.needsPickup
              ? 'Airport pickup requested'
              : 'No airport pickup needed'}
          </PickupBadge>
        </SavedInfoCard>
      ) : (
        <FormCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AirplaneDecoration>✈️</AirplaneDecoration>

          <ToggleSection>
            <ToggleLabel>
              <ToggleIcon>✈️</ToggleIcon>
              <ToggleText>
                <ToggleTitle>Are you arriving by flight?</ToggleTitle>
                <ToggleArabic>هل ستصل بالطائرة؟</ToggleArabic>
              </ToggleText>
            </ToggleLabel>
            <Switch
              checked={isFlightTravel}
              onChange={setIsFlightTravel}
            />
          </ToggleSection>

          <StyledForm form={form} layout="vertical" requiredMark={false}>
            <AnimatePresence mode="wait">
              {isFlightTravel ? (
                <motion.div
                  key="flight"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormSection>
                    <FormSectionTitle>
                      <SendOutlined />
                      Flight Details
                    </FormSectionTitle>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="airline"
                          label="Airline"
                          rules={[{ required: true, message: 'Please enter airline' }]}
                        >
                          <AutoComplete
                            options={airlineOptions}
                            onSearch={handleAirlineSearch}
                            placeholder="e.g., Emirates"
                            size="large"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="flight_number"
                          label="Flight Number"
                          rules={[{ required: true, message: 'Please enter flight number' }]}
                        >
                          <Input placeholder="e.g., EK 123" size="large" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="departure_city"
                      label="Departure City"
                      rules={[{ required: true, message: 'Please enter departure city' }]}
                    >
                      <Input
                        prefix={<EnvironmentOutlined style={{ color: colors.textSecondary }} />}
                        placeholder="e.g., London, UK"
                        size="large"
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item name="departure_date" label="Departure Date">
                          <DatePicker
                            style={{ width: '100%' }}
                            size="large"
                            format="MMMM D, YYYY"
                            disabledDate={disabledDate}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="departure_time" label="Departure Time">
                          <TimePicker
                            style={{ width: '100%' }}
                            size="large"
                            format="h:mm A"
                            use12Hours
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </FormSection>

                  <FormSection>
                    <FormSectionTitle>
                      <EnvironmentOutlined />
                      Arrival Details
                    </FormSectionTitle>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="arrival_date"
                          label="Arrival Date"
                          rules={[{ required: true, message: 'Please select arrival date' }]}
                        >
                          <DatePicker
                            style={{ width: '100%' }}
                            size="large"
                            format="MMMM D, YYYY"
                            disabledDate={disabledDate}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="arrival_time"
                          label="Arrival Time"
                          rules={[{ required: true, message: 'Please select arrival time' }]}
                        >
                          <TimePicker
                            style={{ width: '100%' }}
                            size="large"
                            format="h:mm A"
                            use12Hours
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} md={16}>
                        <Form.Item
                          name="arrival_airport"
                          label="Arrival Airport"
                          rules={[{ required: true, message: 'Please enter arrival airport' }]}
                        >
                          <Input
                            placeholder="e.g., Dubai International Airport (DXB)"
                            size="large"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="terminal" label="Terminal (Optional)">
                          <Input placeholder="e.g., T3" size="large" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </FormSection>

                  <ToggleSection>
                    <ToggleLabel>
                      <ToggleIcon>
                        <CarOutlined />
                      </ToggleIcon>
                      <ToggleText>
                        <ToggleTitle>Do you need airport pickup?</ToggleTitle>
                        <ToggleArabic>هل تحتاج توصيل من المطار؟</ToggleArabic>
                      </ToggleText>
                    </ToggleLabel>
                    <Switch
                      checked={needsPickup}
                      onChange={setNeedsPickup}
                    />
                  </ToggleSection>

                  <AnimatePresence>
                    {needsPickup && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Form.Item name="pickup_notes" label="Pickup Notes">
                          <TextArea
                            placeholder="Any special requirements for pickup (number of passengers, luggage, etc.)"
                            rows={3}
                            style={{ resize: 'none' }}
                          />
                        </Form.Item>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="other"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormSection>
                    <FormSectionTitle>
                      <CarOutlined />
                      Travel Details
                    </FormSectionTitle>

                    <Form.Item
                      name="travel_notes"
                      label="How are you traveling?"
                      rules={[{ required: true, message: 'Please describe your travel plans' }]}
                    >
                      <TextArea
                        placeholder="Please describe your travel plans (driving, train, already in the city, etc.)"
                        rows={4}
                        style={{ resize: 'none' }}
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item name="arrival_date" label="Expected Arrival Date">
                          <DatePicker
                            style={{ width: '100%' }}
                            size="large"
                            format="MMMM D, YYYY"
                            disabledDate={disabledDate}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="arrival_time" label="Expected Arrival Time">
                          <TimePicker
                            style={{ width: '100%' }}
                            size="large"
                            format="h:mm A"
                            use12Hours
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </FormSection>
                </motion.div>
              )}
            </AnimatePresence>

            <SubmitButton
              type="primary"
              size="large"
              loading={loading}
              onClick={handleSubmit}
              icon={<CheckCircleFilled />}
            >
              Save Arrival Information
            </SubmitButton>
          </StyledForm>
        </FormCard>
      )}
    </SectionWrapper>
  );
};

export default TravelSection;
