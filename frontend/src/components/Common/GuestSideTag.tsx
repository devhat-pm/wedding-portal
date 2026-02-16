import { Tag } from 'antd';
import type { GuestSide } from '../../types';
import { getGuestSideLabel, getGuestSideColor } from '../../utils/helpers';

interface GuestSideTagProps {
  side: GuestSide;
}

const GuestSideTag: React.FC<GuestSideTagProps> = ({ side }) => {
  return (
    <Tag
      style={{
        borderRadius: 4,
        padding: '2px 10px',
        backgroundColor: `${getGuestSideColor(side)}15`,
        borderColor: getGuestSideColor(side),
        color: getGuestSideColor(side),
      }}
    >
      {getGuestSideLabel(side)}
    </Tag>
  );
};

export default GuestSideTag;
