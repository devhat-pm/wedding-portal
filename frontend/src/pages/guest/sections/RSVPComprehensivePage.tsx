import React from 'react';
import styled from '@emotion/styled';
import RSVPSection from './RSVPSection';
import EventMapSection from './EventMapSection';
import OurStorySection from './OurStorySection';
import ThingsToDoSection from './ThingsToDoSection';
import GoldDivider from '../../../components/Common/GoldDivider';

const PageWrapper = styled.div`
  padding-bottom: 24px;
`;

const DividerWrapper = styled.div`
  max-width: 780px;
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 480px) {
    padding: 0 16px;
  }
`;

const RSVPComprehensivePage: React.FC = () => {
  return (
    <PageWrapper>
      <RSVPSection />
      <DividerWrapper>
        <GoldDivider variant="ornamental" margin="8px 0" />
      </DividerWrapper>
      <OurStorySection />
      <DividerWrapper>
        <GoldDivider variant="floral" margin="8px 0" />
      </DividerWrapper>
      <EventMapSection />
      <DividerWrapper>
        <GoldDivider variant="diamond" margin="8px 0" />
      </DividerWrapper>
      <ThingsToDoSection />
    </PageWrapper>
  );
};

export default RSVPComprehensivePage;
