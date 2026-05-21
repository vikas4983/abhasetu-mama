import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@app/layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PageLoader } from '@components/feedback/PageLoader';
import DirectoryPage from '@pages/DirectoryPage';

const HomePage = lazy(() => import('@pages/HomePage'));
const HealthPage = lazy(() => import('@pages/HealthPage'));
const AppointmentsPage = lazy(() => import('@pages/AppointmentsPage'));
const BookConsultationPage = lazy(() => import('@pages/BookConsultationPage'));
const RecordsPage = lazy(() => import('@pages/RecordsPage'));
const DigitalLockerPage = lazy(() => import('@pages/DigitalLockerPage'));
const HealthAtmPage = lazy(() => import('@pages/HealthAtmPage'));
const LiveDashboardPage = lazy(() => import('@pages/LiveDashboardPage'));
const TelemedicinePage = lazy(() => import('@pages/TelemedicinePage'));
const TelemedicineRoomPage = lazy(() => import('@pages/TelemedicineRoomPage'));
const ServicePage = lazy(() => import('@pages/ServicePage'));
const NotificationsPage = lazy(() => import('@pages/NotificationsPage'));
const ProfilePage = lazy(() => import('@pages/ProfilePage'));
const SettingsPage = lazy(() => import('@pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'));

const withSuspense = (element: JSX.Element) => <Suspense fallback={<PageLoader />}>{element}</Suspense>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: withSuspense(<NotFoundPage />),
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'health', element: withSuspense(<HealthPage />) },
          { path: 'appointments', element: withSuspense(<AppointmentsPage />) },
          { path: 'book-consultation', element: withSuspense(<BookConsultationPage />) },
          { path: 'records', element: withSuspense(<RecordsPage />) },
          { path: 'digital-locker', element: withSuspense(<DigitalLockerPage />) },
          { path: 'health-atm', element: withSuspense(<HealthAtmPage />) },
          { path: 'live-dashboard', element: withSuspense(<LiveDashboardPage />) },
          { path: 'telemedicine', element: withSuspense(<TelemedicinePage />) },
          { path: 'telemedicine-room', element: withSuspense(<TelemedicineRoomPage />) },
          { path: 'quick-access', element: <DirectoryPage type="quick" /> },
          { path: 'marketplace', element: <DirectoryPage type="marketplace" /> },
          { path: 'compliance', element: <DirectoryPage type="compliance" /> },
          { path: 'insights', element: <DirectoryPage type="insights" /> },
          { path: 'more', element: <DirectoryPage type="more" /> },
          { path: 'services/:serviceId', element: withSuspense(<ServicePage />) },
          { path: 'notifications', element: withSuspense(<NotificationsPage />) },
          { path: 'profile', element: withSuspense(<ProfilePage />) },
          { path: 'settings', element: withSuspense(<SettingsPage />) },
        ],
      },
      { path: '404', element: withSuspense(<NotFoundPage />) },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
]);
