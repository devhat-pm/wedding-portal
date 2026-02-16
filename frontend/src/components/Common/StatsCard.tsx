import React from 'react';
import { Card, Statistic, Typography } from 'antd';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: number;
  prefix?: React.ReactNode;
  suffix?: string;
  color?: string;
  trend?: number;
  loading?: boolean;
}

const { Text } = Typography;

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  color = '#B7A89A',
  trend,
  loading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        hoverable
        style={{
          borderRadius: 16,
          border: '1px solid #D6C7B8',
          boxShadow: '0 4px 12px rgba(183, 168, 154, 0.1)',
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Statistic
          title={
            <Text style={{ color: '#9A9187', fontSize: 14 }}>{title}</Text>
          }
          value={value}
          prefix={prefix}
          suffix={suffix}
          loading={loading}
          valueStyle={{
            color: color,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 600,
          }}
        />
        {trend !== undefined && (
          <div style={{ marginTop: 8 }}>
            <Text
              style={{
                color: trend >= 0 ? '#7B756D' : '#9A9187',
                fontSize: 12,
              }}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
            </Text>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default StatsCard;
