import React from 'react';
import RSVPSection from './RSVPSection';
import EventMapSection from './EventMapSection';
import OurStorySection from './OurStorySection';
import ThingsToDoSection from './ThingsToDoSection';

const RSVPComprehensivePage: React.FC = () => {
  return (
    <>
      <RSVPSection />
      <OurStorySection />
      <EventMapSection />
      <ThingsToDoSection />
    </>
  );
};

export default RSVPComprehensivePage;
