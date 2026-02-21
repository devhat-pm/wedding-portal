import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute, PublicRoute, GuestRoute } from '../components/auth';
import { LoadingScreen, AdminLayout } from '../components';

// Lazy load pages for better performance
const AdminLogin = lazy(() => import('../pages/admin/Login'));
// Register page removed – admin accounts are created via API only
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminSettings = lazy(() => import('../pages/admin/Settings'));
const GuestList = lazy(() => import('../pages/admin/Guests/GuestList'));
const GuestDetail = lazy(() => import('../pages/admin/Guests/GuestDetail'));
const HotelList = lazy(() => import('../pages/admin/Hotels/HotelList'));
const ActivityList = lazy(() => import('../pages/admin/Activities/ActivityList'));
const MediaGallery = lazy(() => import('../pages/admin/Media/MediaGallery'));
const ChatbotSettingsPage = lazy(() => import('../pages/admin/Chatbot/ChatbotSettingsPage'));
const ChatbotAnalytics = lazy(() => import('../pages/admin/Chatbot/ChatbotAnalytics'));
const GuestPortal = lazy(() => import('../pages/guest/GuestPortal'));
const NotFound = lazy(() => import('../pages/NotFound'));
const InvalidLink = lazy(() => import('../pages/InvalidLink'));

// Landing page component
const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // For now, redirect to admin if logged in, otherwise show login
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/admin/login" replace />;
};

// Admin layout wrapper with auth context
// Note: AdminLayout uses React Router's <Outlet /> internally for nested routes
const AdminLayoutWrapper: React.FC = () => {
  const { wedding, admin } = useAuth();

  return (
    <AdminLayout
      weddingName={wedding?.couple_names || 'Wedding Portal'}
      adminEmail={admin?.email || ''}
    />
  );
};

// Suspense wrapper for lazy-loaded pages
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingScreen message="Loading..." fullScreen />}>
    {children}
  </Suspense>
);

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ============================================ */}
      {/* PUBLIC ROUTES                               */}
      {/* ============================================ */}

      {/* Landing page */}
      <Route path="/" element={<LandingPage />} />

      {/* Admin Login */}
      <Route
        path="/admin/login"
        element={
          <PublicRoute>
            <SuspenseWrapper>
              <AdminLogin />
            </SuspenseWrapper>
          </PublicRoute>
        }
      />

      {/* Legacy routes - redirect to login */}
      <Route path="/login" element={<Navigate to="/admin/login" replace />} />
      <Route path="/register" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/register" element={<Navigate to="/admin/login" replace />} />

      {/* ============================================ */}
      {/* GUEST PORTAL ROUTES                         */}
      {/* ============================================ */}

      {/* Guest Portal with token */}
      <Route
        path="/guest/:token"
        element={
          <GuestRoute>
            <SuspenseWrapper>
              <GuestPortal />
            </SuspenseWrapper>
          </GuestRoute>
        }
      />

      {/* Invalid link page */}
      <Route
        path="/invalid-link"
        element={
          <SuspenseWrapper>
            <InvalidLink />
          </SuspenseWrapper>
        }
      />

      {/* ============================================ */}
      {/* PROTECTED ADMIN ROUTES                      */}
      {/* ============================================ */}

      {/* Admin routes with layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayoutWrapper />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - default admin page */}
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />

        {/* Guest Management */}
        <Route path="guests" element={<GuestList />} />
        <Route path="guests/:id" element={<GuestDetail />} />

        {/* Content Management */}
        <Route path="hotels" element={<HotelList />} />
        <Route path="activities" element={<ActivityList />} />
        <Route path="media" element={<MediaGallery />} />

        {/* Chatbot */}
        <Route path="chatbot" element={<ChatbotSettingsPage />} />
        <Route path="chatbot/analytics" element={<ChatbotAnalytics />} />

        {/* Settings */}
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Legacy admin routes - redirect to new structure */}
      <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/guests" element={<Navigate to="/admin/guests" replace />} />
      <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />

      {/* ============================================ */}
      {/* CATCH-ALL / 404                             */}
      {/* ============================================ */}

      <Route
        path="*"
        element={
          <SuspenseWrapper>
            <NotFound />
          </SuspenseWrapper>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
