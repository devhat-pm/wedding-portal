import React from 'react';
import { Typography, Space, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  title: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  extra?: React.ReactNode;
}

const { Title, Text } = Typography;

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  extra,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ marginBottom: 24 }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          style={{ marginBottom: 8 }}
          items={breadcrumbs.map((item, index) => ({
            title: item.path ? (
              <Link to={item.path} style={{ color: '#B7A89A' }}>
                {item.title}
              </Link>
            ) : (
              <span style={{ color: '#7B756D' }}>{item.title}</span>
            ),
            key: index,
          }))}
        />
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <Space direction="vertical" size={4}>
          <Title
            level={2}
            style={{
              margin: 0,
              fontFamily: "'Playfair Display', serif",
              color: '#7B756D',
            }}
          >
            {title}
          </Title>
          {subtitle && (
            <Text style={{ color: '#9A9187', fontSize: 14 }}>{subtitle}</Text>
          )}
        </Space>

        {extra && <div>{extra}</div>}
      </div>

      <div
        style={{
          height: 2,
          background: 'linear-gradient(90deg, #B7A89A, transparent)',
          marginTop: 16,
          borderRadius: 1,
        }}
      />
    </motion.div>
  );
};

export default PageHeader;
