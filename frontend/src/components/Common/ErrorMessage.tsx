import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Button } from 'antd';
import {
  ReloadOutlined,
  HomeOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  WifiOutlined,
  LockOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { colors } from '../../styles/theme';

type ErrorType =
  | 'error'
  | 'warning'
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'validation'
  | 'server';

type ErrorVariant = 'inline' | 'card' | 'full-page';

interface ErrorMessageProps {
  type?: ErrorType;
  variant?: ErrorVariant;
  title?: string;
  message?: string;
  details?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  retryLabel?: string;
  showRetry?: boolean;
  showHome?: boolean;
  showDetails?: boolean;
  className?: string;
}

const errorConfig = {
  error: {
    icon: <CloseCircleOutlined />,
    color: colors.error,
    defaultTitle: 'An error occurred',
    defaultMessage: 'Something went wrong. Please try again.',
  },
  warning: {
    icon: <WarningOutlined />,
    color: colors.warning,
    defaultTitle: 'Warning',
    defaultMessage: 'There was an issue that needs your attention.',
  },
  network: {
    icon: <WifiOutlined />,
    color: colors.error,
    defaultTitle: 'Connection error',
    defaultMessage: 'Unable to connect. Please check your internet connection.',
  },
  unauthorized: {
    icon: <LockOutlined />,
    color: colors.warning,
    defaultTitle: 'Session expired',
    defaultMessage: 'Please log in again to continue.',
  },
  forbidden: {
    icon: <LockOutlined />,
    color: colors.error,
    defaultTitle: 'Access denied',
    defaultMessage: "You don't have permission to access this resource.",
  },
  'not-found': {
    icon: <SearchOutlined />,
    color: colors.textSecondary,
    defaultTitle: 'Not found',
    defaultMessage: 'The requested resource could not be found.',
  },
  validation: {
    icon: <ExclamationCircleOutlined />,
    color: colors.warning,
    defaultTitle: 'Invalid input',
    defaultMessage: 'Please check your input and try again.',
  },
  server: {
    icon: <CloseCircleOutlined />,
    color: colors.error,
    defaultTitle: 'Server error',
    defaultMessage: 'The server encountered an error. Please try again later.',
  },
};

// Inline variant styles
const InlineWrapper = styled(motion.div)<{ $color: string }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: ${(props) => props.$color}10;
  border: 1px solid ${(props) => props.$color}30;
  border-radius: 8px;
  border-left: 4px solid ${(props) => props.$color};
`;

const InlineIcon = styled.span<{ $color: string }>`
  font-size: 18px;
  color: ${(props) => props.$color};
  flex-shrink: 0;
  margin-top: 2px;
`;

const InlineContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const InlineTitle = styled.div`
  font-weight: 600;
  color: ${colors.secondary};
  margin-bottom: 4px;
`;

const InlineMessage = styled.div`
  color: ${colors.textSecondary};
  font-size: 14px;
  line-height: 1.5;
`;

const InlineActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

// Card variant styles
const CardWrapper = styled(motion.div)`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 32px;
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
`;

const CardIconWrapper = styled.div<{ $color: string }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${(props) => props.$color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;

  .anticon {
    font-size: 28px;
    color: ${(props) => props.$color};
  }
`;

const CardTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: ${colors.secondary};
  margin-bottom: 12px;
`;

const CardMessage = styled.p`
  color: ${colors.textSecondary};
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const CardActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

// Full page variant styles
const FullPageWrapper = styled(motion.div)`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, ${colors.cream} 0%, ${colors.creamDark} 100%);
`;

const FullPageCard = styled.div`
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 48px 32px;
  text-align: center;
`;

const ArabicDecoration = styled.div`
  position: absolute;
  width: 120px;
  height: 120px;
  opacity: 0.05;

  &.top-left {
    top: 0;
    left: 0;
    border-top: 3px solid ${colors.gold};
    border-left: 3px solid ${colors.gold};
  }

  &.bottom-right {
    bottom: 0;
    right: 0;
    border-bottom: 3px solid ${colors.gold};
    border-right: 3px solid ${colors.gold};
  }
`;

const FullPageIconWrapper = styled.div<{ $color: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${(props) => props.$color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;

  .anticon {
    font-size: 36px;
    color: ${(props) => props.$color};
  }
`;

const FullPageTitle = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  color: ${colors.secondary};
  margin-bottom: 16px;
`;

const FullPageMessage = styled.p`
  color: ${colors.textSecondary};
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 32px;
`;

const FullPageActions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Details = styled.details`
  margin-top: 16px;
  padding: 12px;
  background: ${colors.cream};
  border-radius: 8px;
  text-align: left;

  summary {
    cursor: pointer;
    color: ${colors.textSecondary};
    font-size: 13px;

    &:hover {
      color: ${colors.primary};
    }
  }

  pre {
    margin-top: 8px;
    font-size: 12px;
    color: ${colors.error};
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  type = 'error',
  variant = 'inline',
  title,
  message,
  details,
  onRetry,
  onGoHome,
  onGoBack,
  retryLabel = 'Try Again',
  showRetry = true,
  showHome = false,
  showDetails = false,
  className,
}) => {
  const config = errorConfig[type];
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  // Inline variant
  if (variant === 'inline') {
    return (
      <InlineWrapper
        className={className}
        $color={config.color}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <InlineIcon $color={config.color}>{config.icon}</InlineIcon>
        <InlineContent>
          <InlineTitle>{displayTitle}</InlineTitle>
          <InlineMessage>{displayMessage}</InlineMessage>
          {(showRetry || showDetails) && (
            <InlineActions>
              {showRetry && (
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={handleRetry}
                >
                  {retryLabel}
                </Button>
              )}
            </InlineActions>
          )}
          {showDetails && details && (
            <Details>
              <summary>Show details</summary>
              <pre>{details}</pre>
            </Details>
          )}
        </InlineContent>
      </InlineWrapper>
    );
  }

  // Card variant
  if (variant === 'card') {
    return (
      <CardWrapper
        className={className}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <CardIconWrapper $color={config.color}>{config.icon}</CardIconWrapper>
        <CardTitle>{displayTitle}</CardTitle>
        <CardMessage>{displayMessage}</CardMessage>
        <CardActions>
          {showRetry && (
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRetry}
              style={{ background: colors.primary, borderColor: colors.primary }}
            >
              {retryLabel}
            </Button>
          )}
          {showHome && (
            <Button icon={<HomeOutlined />} onClick={handleGoHome}>
              Go Home
            </Button>
          )}
        </CardActions>
        {showDetails && details && (
          <Details>
            <summary>Technical details</summary>
            <pre>{details}</pre>
          </Details>
        )}
      </CardWrapper>
    );
  }

  // Full page variant
  return (
    <FullPageWrapper
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <FullPageCard style={{ position: 'relative', overflow: 'hidden' }}>
        <ArabicDecoration className="top-left" />
        <ArabicDecoration className="bottom-right" />
        <FullPageIconWrapper $color={config.color}>
          {config.icon}
        </FullPageIconWrapper>
        <FullPageTitle>{displayTitle}</FullPageTitle>
        <FullPageMessage>{displayMessage}</FullPageMessage>
        <FullPageActions>
          {showRetry && (
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              size="large"
              onClick={handleRetry}
              style={{ background: colors.primary, borderColor: colors.primary }}
            >
              {retryLabel}
            </Button>
          )}
          {showHome && (
            <Button icon={<HomeOutlined />} size="large" onClick={handleGoHome}>
              Go Home
            </Button>
          )}
          {onGoBack && (
            <Button size="large" onClick={handleGoBack}>
              Go Back
            </Button>
          )}
        </FullPageActions>
        {showDetails && details && (
          <Details>
            <summary>Technical details</summary>
            <pre>{details}</pre>
          </Details>
        )}
      </FullPageCard>
    </FullPageWrapper>
  );
};

/**
 * Pre-configured error messages for common scenarios
 */
export const NetworkError: React.FC<Partial<ErrorMessageProps>> = (props) => (
  <ErrorMessage type="network" showRetry {...props} />
);

export const UnauthorizedError: React.FC<Partial<ErrorMessageProps>> = (props) => (
  <ErrorMessage
    type="unauthorized"
    showRetry={false}
    onRetry={() => (window.location.href = '/admin/login')}
    retryLabel="Log In"
    {...props}
  />
);

export const NotFoundError: React.FC<Partial<ErrorMessageProps>> = (props) => (
  <ErrorMessage type="not-found" showHome {...props} />
);

export const ForbiddenError: React.FC<Partial<ErrorMessageProps>> = (props) => (
  <ErrorMessage type="forbidden" showHome {...props} />
);

export const ServerError: React.FC<Partial<ErrorMessageProps>> = (props) => (
  <ErrorMessage type="server" showRetry {...props} />
);

export const ValidationError: React.FC<Partial<ErrorMessageProps>> = (props) => (
  <ErrorMessage type="validation" showRetry={false} {...props} />
);

export default ErrorMessage;
