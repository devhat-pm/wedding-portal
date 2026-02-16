import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import styled from '@emotion/styled';
import { Button, Result } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import { colors } from '../../styles/theme';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, ${colors.cream} 0%, ${colors.creamDark} 100%);
`;

const ErrorCard = styled.div`
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 48px;
  text-align: center;
`;

const ArabicPattern = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: ${colors.primaryLight};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid ${colors.primary};
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.5;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const ErrorIcon = styled.span`
  font-size: 36px;
  color: ${colors.primary};
`;

const ErrorTitle = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  color: ${colors.secondary};
  margin-bottom: 16px;
`;

const ErrorMessage = styled.p`
  color: ${colors.textSecondary};
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 32px;
`;

const ErrorDetails = styled.details`
  text-align: left;
  margin-top: 24px;
  padding: 16px;
  background: ${colors.cream};
  border-radius: 8px;
  border: 1px solid ${colors.creamDark};

  summary {
    cursor: pointer;
    color: ${colors.textSecondary};
    font-weight: 500;
    margin-bottom: 8px;

    &:hover {
      color: ${colors.primary};
    }
  }

  pre {
    overflow-x: auto;
    font-size: 12px;
    color: ${colors.error};
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

/**
 * Error Boundary component that catches JavaScript errors in child components.
 * Displays a friendly error message with retry option.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = false } = this.props;

    if (hasError) {
      // Custom fallback provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <ErrorContainer>
          <ErrorCard>
            <ArabicPattern>
              <ErrorIcon>!</ErrorIcon>
            </ArabicPattern>
            <ErrorTitle>Something went wrong</ErrorTitle>
            <ErrorMessage>
              We apologize for the inconvenience. An unexpected error occurred.
              Please try refreshing the page or return to the home page.
            </ErrorMessage>
            <ButtonGroup>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                size="large"
                onClick={this.handleRetry}
                style={{
                  background: colors.primary,
                  borderColor: colors.primary,
                }}
              >
                Try Again
              </Button>
              <Button
                icon={<HomeOutlined />}
                size="large"
                onClick={this.handleGoHome}
              >
                Go Home
              </Button>
            </ButtonGroup>

            {showDetails && error && (
              <ErrorDetails>
                <summary>Technical Details (for developers)</summary>
                <pre>
                  <strong>Error:</strong> {error.toString()}
                  {'\n\n'}
                  <strong>Stack Trace:</strong>
                  {'\n'}
                  {errorInfo?.componentStack || error.stack}
                </pre>
              </ErrorDetails>
            )}
          </ErrorCard>
        </ErrorContainer>
      );
    }

    return children;
  }
}

/**
 * Higher-order component to wrap a component with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `WithErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithErrorBoundary;
}

/**
 * Simple error boundary for inline components (like cards, sections)
 */
export const InlineErrorBoundary: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <Result
            status="error"
            title="Failed to load"
            subTitle="This section couldn't be displayed"
            extra={
              <Button
                onClick={() => window.location.reload()}
                type="primary"
                style={{ background: colors.primary, borderColor: colors.primary }}
              >
                Refresh Page
              </Button>
            }
          />
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
