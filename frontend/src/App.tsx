import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import { ErrorBoundary } from './components/Common';
import { weddingTheme } from './styles/theme';
import './styles/global.css';

// Create React Query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Main Application Component
 *
 * Provider hierarchy:
 * 1. ErrorBoundary - Catches runtime errors
 * 2. QueryClientProvider - React Query for data fetching
 * 3. ConfigProvider - Ant Design theming
 * 4. AntApp - Ant Design app context (for message, notification, modal)
 * 5. BrowserRouter - React Router
 * 6. AuthProvider - Authentication state
 */
function App() {
  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={weddingTheme}>
          <AntApp>
            <BrowserRouter>
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            </BrowserRouter>
          </AntApp>
        </ConfigProvider>

        {/* React Query Devtools - only in development */}
        {import.meta.env.DEV && (
          <ReactQueryDevtools
            initialIsOpen={false}
            position="bottom"
            buttonPosition="bottom-right"
          />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
