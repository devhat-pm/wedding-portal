import React from 'react';
import { Empty, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

const { Title, Text } = Typography;

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data',
  description = 'There is no data to display at the moment.',
  icon,
  actionText,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        textAlign: 'center',
      }}
    >
      {icon || (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={null}
          style={{ marginBottom: 16 }}
        />
      )}

      <Title
        level={4}
        style={{
          margin: 0,
          marginBottom: 8,
          color: '#7B756D',
          fontFamily: "'Playfair Display', serif",
        }}
      >
        {title}
      </Title>

      <Text
        style={{
          color: '#9A9187',
          marginBottom: actionText ? 24 : 0,
          maxWidth: 400,
        }}
      >
        {description}
      </Text>

      {actionText && onAction && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAction}
          style={{
            borderRadius: 8,
            height: 40,
          }}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
