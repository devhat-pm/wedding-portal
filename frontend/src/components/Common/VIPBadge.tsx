import React from 'react';
import { CrownOutlined } from '@ant-design/icons';

interface VIPBadgeProps {
  size?: 'small' | 'default';
}

const VIPBadge: React.FC<VIPBadgeProps> = ({ size = 'default' }) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: 'linear-gradient(135deg, #B7A89A, #9A9187)',
        color: '#FFFFFF',
        padding: size === 'small' ? '1px 6px' : '2px 8px',
        borderRadius: 4,
        fontSize: size === 'small' ? 10 : 12,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      <CrownOutlined style={{ fontSize: size === 'small' ? 10 : 12 }} />
      VIP
    </span>
  );
};

export default VIPBadge;
