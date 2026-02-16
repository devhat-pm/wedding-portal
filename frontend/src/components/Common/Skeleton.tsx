import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { colors, borderRadius } from '../../styles/theme';

// Shimmer animation
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Base skeleton element
const SkeletonBase = styled.div<{ $animate?: boolean }>`
  background: linear-gradient(
    90deg,
    ${colors.creamDark} 25%,
    ${colors.creamMedium} 50%,
    ${colors.creamDark} 75%
  );
  background-size: 200% 100%;
  animation: ${(props) => (props.$animate ? shimmer : 'none')} 1.5s ease-in-out infinite;
  border-radius: ${borderRadius.sm}px;
`;

// ============================================
// Basic Skeleton Elements
// ============================================

interface SkeletonTextProps {
  width?: string | number;
  height?: number;
  className?: string;
  animate?: boolean;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  width = '100%',
  height = 16,
  className,
  animate = true,
}) => (
  <SkeletonBase
    $animate={animate}
    className={className}
    style={{
      width: typeof width === 'number' ? `${width}px` : width,
      height: `${height}px`,
    }}
  />
);

interface SkeletonCircleProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({
  size = 40,
  className,
  animate = true,
}) => (
  <SkeletonBase
    $animate={animate}
    className={className}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
    }}
  />
);

interface SkeletonRectProps {
  width?: string | number;
  height?: number;
  radius?: number;
  className?: string;
  animate?: boolean;
}

export const SkeletonRect: React.FC<SkeletonRectProps> = ({
  width = '100%',
  height = 100,
  radius = borderRadius.md,
  className,
  animate = true,
}) => (
  <SkeletonBase
    $animate={animate}
    className={className}
    style={{
      width: typeof width === 'number' ? `${width}px` : width,
      height: `${height}px`,
      borderRadius: `${radius}px`,
    }}
  />
);

// ============================================
// Card Skeleton
// ============================================

const CardWrapper = styled.div`
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${colors.borderGold};
  padding: 24px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

interface SkeletonCardProps {
  hasAvatar?: boolean;
  lines?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  hasAvatar = true,
  lines = 3,
  className,
}) => (
  <CardWrapper className={className}>
    <CardHeader>
      {hasAvatar && <SkeletonCircle size={48} />}
      <div style={{ flex: 1 }}>
        <SkeletonText width="60%" height={20} />
        <div style={{ marginTop: 8 }}>
          <SkeletonText width="40%" height={14} />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonText
          key={i}
          width={i === lines - 1 ? '70%' : '100%'}
          height={14}
        />
      ))}
    </CardContent>
  </CardWrapper>
);

// ============================================
// Stats Card Skeleton
// ============================================

const StatsWrapper = styled.div`
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${colors.borderGold};
  padding: 24px;
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const SkeletonStatsCard: React.FC<{ className?: string }> = ({ className }) => (
  <StatsWrapper className={className}>
    <StatsRow>
      <SkeletonCircle size={56} />
      <div style={{ flex: 1 }}>
        <SkeletonText width="40%" height={14} />
        <div style={{ marginTop: 12 }}>
          <SkeletonText width="60%" height={32} />
        </div>
      </div>
    </StatsRow>
  </StatsWrapper>
);

// ============================================
// Table Skeleton
// ============================================

const TableWrapper = styled.div`
  background: ${colors.cardBg};
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.borderGold};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  background: ${colors.creamDark};
  border-bottom: 1px solid ${colors.borderGold};
`;

const TableRow = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid ${colors.creamMedium};

  &:last-child {
    border-bottom: none;
  }
`;

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  className,
}) => (
  <TableWrapper className={className}>
    <TableHeader>
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonText key={i} width={`${100 / columns}%`} height={14} />
      ))}
    </TableHeader>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <TableRow key={rowIndex}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonText
            key={colIndex}
            width={`${100 / columns}%`}
            height={16}
          />
        ))}
      </TableRow>
    ))}
  </TableWrapper>
);

// ============================================
// List Skeleton
// ============================================

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: ${colors.cardBg};
  border-radius: ${borderRadius.md}px;
  border: 1px solid ${colors.borderGold};
`;

interface SkeletonListProps {
  items?: number;
  hasAvatar?: boolean;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  hasAvatar = true,
  className,
}) => (
  <ListWrapper className={className}>
    {Array.from({ length: items }).map((_, i) => (
      <ListItem key={i}>
        {hasAvatar && <SkeletonCircle size={40} />}
        <div style={{ flex: 1 }}>
          <SkeletonText width="60%" height={16} />
          <div style={{ marginTop: 8 }}>
            <SkeletonText width="40%" height={12} />
          </div>
        </div>
        <SkeletonRect width={80} height={32} radius={borderRadius.sm} />
      </ListItem>
    ))}
  </ListWrapper>
);

// ============================================
// Image Skeleton
// ============================================

interface SkeletonImageProps {
  width?: string | number;
  height?: number;
  aspectRatio?: string;
  className?: string;
}

export const SkeletonImage: React.FC<SkeletonImageProps> = ({
  width = '100%',
  height,
  aspectRatio = '16/9',
  className,
}) => (
  <SkeletonBase
    $animate
    className={className}
    style={{
      width: typeof width === 'number' ? `${width}px` : width,
      height: height ? `${height}px` : 'auto',
      aspectRatio: height ? 'auto' : aspectRatio,
      borderRadius: `${borderRadius.lg}px`,
    }}
  />
);

// ============================================
// Form Skeleton
// ============================================

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormField = styled.div``;

const FormLabel = styled.div`
  margin-bottom: 8px;
`;

interface SkeletonFormProps {
  fields?: number;
  className?: string;
}

export const SkeletonForm: React.FC<SkeletonFormProps> = ({
  fields = 4,
  className,
}) => (
  <FormWrapper className={className}>
    {Array.from({ length: fields }).map((_, i) => (
      <FormField key={i}>
        <FormLabel>
          <SkeletonText width="30%" height={14} />
        </FormLabel>
        <SkeletonRect width="100%" height={44} radius={borderRadius.md} />
      </FormField>
    ))}
    <SkeletonRect width={120} height={44} radius={borderRadius.md} />
  </FormWrapper>
);

// ============================================
// Guest Card Skeleton (specific to wedding app)
// ============================================

const GuestCardWrapper = styled.div`
  background: ${colors.cardBg};
  border-radius: ${borderRadius.xl}px;
  border: 1px solid ${colors.borderGold};
  padding: 20px;
`;

const GuestCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const GuestCardTags = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

export const SkeletonGuestCard: React.FC<{ className?: string }> = ({ className }) => (
  <GuestCardWrapper className={className}>
    <GuestCardHeader>
      <SkeletonCircle size={48} />
      <div style={{ flex: 1 }}>
        <SkeletonText width="70%" height={18} />
        <div style={{ marginTop: 6 }}>
          <SkeletonText width="50%" height={14} />
        </div>
      </div>
      <SkeletonRect width={70} height={28} radius={14} />
    </GuestCardHeader>
    <SkeletonText width="100%" height={14} />
    <GuestCardTags>
      <SkeletonRect width={60} height={24} radius={12} />
      <SkeletonRect width={50} height={24} radius={12} />
    </GuestCardTags>
  </GuestCardWrapper>
);

// ============================================
// Dashboard Skeleton
// ============================================

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

export const SkeletonDashboard: React.FC = () => (
  <>
    <DashboardGrid>
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonStatsCard key={i} />
      ))}
    </DashboardGrid>
    <SkeletonCard lines={5} />
  </>
);

// Export all components
export default {
  Text: SkeletonText,
  Circle: SkeletonCircle,
  Rect: SkeletonRect,
  Card: SkeletonCard,
  StatsCard: SkeletonStatsCard,
  Table: SkeletonTable,
  List: SkeletonList,
  Image: SkeletonImage,
  Form: SkeletonForm,
  GuestCard: SkeletonGuestCard,
  Dashboard: SkeletonDashboard,
};
