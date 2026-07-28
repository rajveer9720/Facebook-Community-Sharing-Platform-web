import type { MoneyMinor } from './common';

export type CampaignCategory = 'Technology' | 'Business' | 'Finance' | 'Jobs';
export type CampaignPriority = 'Normal' | 'High' | 'Urgent';
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export interface Campaign {
  id: string;
  name: string;
  category: CampaignCategory;
  priority: CampaignPriority;
  status: CampaignStatus;
  instructions: string;
  startDate: string;
  endDate: string;
  budgetMinor: MoneyMinor;
  rewardPerPostMinor: MoneyMinor;
  currency: string;
  maximumWorkers: number;
  maximumPostsPerWorker: number;
  dailyPostingLimit: number;
  workersJoined: number;
  createdAt: string;
}

export interface CreateCampaignRequest {
  name: string;
  category: CampaignCategory;
  priority: CampaignPriority;
  startDate: string;
  endDate: string;
  budgetMinor: MoneyMinor;
  rewardPerPostMinor: MoneyMinor;
  maximumWorkers: number;
  maximumPostsPerWorker: number;
  dailyPostingLimit: number;
  instructions: string;
}

export interface CampaignAssignment {
  id: string;
  campaignId: string;
  workerId: string;
  claimedAt: string;
  postsCompletedToday: number;
}
