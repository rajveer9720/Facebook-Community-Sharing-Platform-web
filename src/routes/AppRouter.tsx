import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PermissionRoute } from './PermissionRoute';
import { ROUTES } from './routePaths';

import HomePage from '@/pages/HomePage';
import LoginPage from '@/features/auth/LoginPage';
import WorkerDashboardPage from '@/features/dashboard/WorkerDashboardPage';
import WorkerProfilePage from '@/features/profile/pages/WorkerProfilePage';
import AdminDashboardPage from '@/features/dashboard/AdminDashboardPage';
import AdminWorkersPage from '@/features/workerPerformance/pages/AdminWorkersPage';
import AdminRolesPage from '@/features/roles/pages/AdminRolesPage';
import WorkerCampaignsPage from '@/features/campaigns/pages/WorkerCampaignsPage';
import AdminCampaignsPage from '@/features/campaigns/pages/AdminCampaignsPage';
import NewCampaignPage from '@/features/campaigns/pages/NewCampaignPage';
import EditCampaignPage from '@/features/campaigns/pages/EditCampaignPage';
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
          {
            element: <PermissionRoute action="read" subject="WorkerDirectory" />,
            children: [{ path: ROUTES.admin.workers, element: <AdminWorkersPage /> }],
          },
          {
            element: <PermissionRoute action="manage" subject="Staff" />,
            children: [{ path: ROUTES.admin.roles, element: <AdminRolesPage /> }],
          },
          {
            element: <PermissionRoute action="read" subject="Campaign" />,
            children: [{ path: ROUTES.admin.campaigns, element: <AdminCampaignsPage /> }],
          },
          {
            element: <PermissionRoute action="manage" subject="Campaign" />,
            children: [
              { path: ROUTES.admin.newCampaign, element: <NewCampaignPage /> },
              { path: ROUTES.admin.editCampaign, element: <EditCampaignPage /> },
            ],
          },
          {
            element: <PermissionRoute action="read" subject="Submission" />,
            children: [{ path: ROUTES.admin.review, element: <ReviewQueuePage /> }],
          },
          {
            element: <PermissionRoute action="read" subject="Group" />,
            children: [{ path: ROUTES.admin.groups, element: <AdminGroupsPage /> }],
          },
          {
            element: <PermissionRoute action="review" subject="Withdrawal" />,
            children: [{ path: ROUTES.admin.withdrawals, element: <WithdrawalsPage /> }],
          },
          {
            element: <PermissionRoute action="read" subject="FinanceAnalytics" />,
            children: [{ path: ROUTES.admin.analytics, element: <AnalyticsPage /> }],
          },
          {
            element: <PermissionRoute action="read" subject="FraudSignal" />,
            children: [{ path: ROUTES.admin.fraud, element: <FraudDetectionPage /> }],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.home} replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
