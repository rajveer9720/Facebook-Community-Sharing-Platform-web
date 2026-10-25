export interface AnalyticsCard {
  key: string;
  title: string;
  description: string;
  value: string;
  trend: string;
}

export interface CategoryPerformance {
  category: string;
  submissions: number;
  approvalRate: number;
}

export interface AnalyticsOverview {
  cards: AnalyticsCard[];
  categoryPerformance: CategoryPerformance[];
}

export interface AdminOverviewStats {
  totalWorkers: number;
  runningCampaigns: number;
  pendingReviews: number;
  uniqueGroups: number;
}
