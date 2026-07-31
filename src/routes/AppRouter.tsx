import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTES } from './routePaths';

import HomePage from '@/pages/HomePage';
import LoginPage from '@/features/auth/LoginPage';
import WorkerDashboardPage from '@/features/dashboard/WorkerDashboardPage';
import WorkerProfilePage from '@/features/profile/pages/WorkerProfilePage';
import AdminDashboardPage from '@/features/dashboard/AdminDashboardPage';
import WorkerCampaignsPage from '@/features/campaigns/pages/WorkerCampaignsPage';
import AdminCampaignsPage from '@/features/campaigns/pages/AdminCampaignsPage';
import NewCampaignPage from '@/features/campaigns/pages/NewCampaignPage';
import WorkerGroupsPage from '@/features/groups/pages/WorkerGroupsPage';
import AdminGroupsPage from '@/features/groups/pages/AdminGroupsPage';
import WorkerSubmissionsPage from '@/features/submissions/pages/WorkerSubmissionsPage';
import ReviewQueuePage from '@/features/submissions/pages/ReviewQueuePage';
import WalletPage from '@/features/wallet/pages/WalletPage';
import WithdrawalsPage from '@/features/wallet/pages/WithdrawalsPage';
import LeaderboardPage from '@/features/leaderboard/pages/LeaderboardPage';
import AnalyticsPage from '@/features/analytics/pages/AnalyticsPage';
import WorkerNotificationsPage from '@/features/notifications/pages/WorkerNotificationsPage';
import FraudDetectionPage from '@/features/fraud/pages/FraudDetectionPage';

const router = createBrowserRouter([
  { path: ROUTES.home, element: <HomePage /> },
  { path: ROUTES.login, element: <LoginPage audience="ALL" /> },
  { path: ROUTES.loginWorker, element: <LoginPage audience="WORKER" /> },
  { path: ROUTES.loginAdmin, element: <LoginPage audience="ADMIN" /> },
  {
    element: <ProtectedRoute allowedRole="WORKER" />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.worker.root, element: <WorkerDashboardPage /> },
          { path: ROUTES.worker.profile, element: <WorkerProfilePage /> },
          { path: ROUTES.worker.campaigns, element: <WorkerCampaignsPage /> },
          { path: ROUTES.worker.submissions, element: <WorkerSubmissionsPage /> },
          { path: ROUTES.worker.groups, element: <WorkerGroupsPage /> },
          { path: ROUTES.worker.wallet, element: <WalletPage /> },
          { path: ROUTES.worker.notifications, element: <WorkerNotificationsPage /> },
          { path: ROUTES.worker.leaderboard, element: <LeaderboardPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRole="ADMIN" />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.admin.root, element: <AdminDashboardPage /> },
          { path: ROUTES.admin.campaigns, element: <AdminCampaignsPage /> },
          { path: ROUTES.admin.newCampaign, element: <NewCampaignPage /> },
          { path: ROUTES.admin.review, element: <ReviewQueuePage /> },
          { path: ROUTES.admin.groups, element: <AdminGroupsPage /> },
          { path: ROUTES.admin.withdrawals, element: <WithdrawalsPage /> },
          { path: ROUTES.admin.analytics, element: <AnalyticsPage /> },
          { path: ROUTES.admin.fraud, element: <FraudDetectionPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.home} replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
