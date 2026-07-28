import { registerRoute } from '@/mocks/router';
import { analyticsOverview, campaigns, groups, submissions, users } from '@/mocks/db';
import type { AdminOverviewStats } from '@/types/analytics';

registerRoute('GET', '/analytics/overview', () => analyticsOverview);

registerRoute('GET', '/admin/overview', () => {
  const stats: AdminOverviewStats = {
    totalWorkers: users.filter((u) => u.role === 'WORKER').length,
    runningCampaigns: campaigns.filter((c) => c.status === 'ACTIVE').length,
    pendingReviews: submissions.filter((s) => s.status === 'PENDING' || s.status === 'MANUAL_REVIEW').length,
    uniqueGroups: groups.filter((g) => g.status === 'APPROVED').length,
  };
  return stats;
});
