import { Tag } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { RSVPStatus } from '../../types';
import { getRSVPStatusLabel } from '../../utils/helpers';

interface RSVPTagProps {
  status: RSVPStatus;
  size?: 'small' | 'default';
}

const RSVPTag: React.FC<RSVPTagProps> = ({ status, size = 'default' }) => {
  const getTagConfig = () => {
    switch (status) {
      case 'confirmed':
        return {
          color: 'success',
          icon: <CheckCircleOutlined />,
        };
      case 'pending':
        return {
          color: 'warning',
          icon: <ClockCircleOutlined />,
        };
      case 'declined':
        return {
          color: 'error',
          icon: <CloseCircleOutlined />,
        };
      default:
        return {
          color: 'default',
          icon: null,
        };
    }
  };

  const config = getTagConfig();

  return (
    <Tag
      color={config.color}
      icon={config.icon}
      style={{
        borderRadius: 4,
        padding: size === 'small' ? '0 6px' : '2px 10px',
        fontSize: size === 'small' ? 11 : 12,
      }}
    >
      {getRSVPStatusLabel(status)}
    </Tag>
  );
};

export default RSVPTag;
