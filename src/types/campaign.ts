import type { MoneyMinor } from './common';

export const CAMPAIGN_CATEGORIES = [
  'Crypto',
  'Business',
  'Investment',
  'Trading',
  'Finance',
  'Technology',
  'Jobs',
  'MLM',
] as const;

export type CampaignCategory = (typeof CAMPAIGN_CATEGORIES)[number];
export type CampaignPriority = 'Normal' | 'High' | 'Urgent';
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

export interface Campaign {
  id: string;
  name: string;
  category: CampaignCategory;
  priority: CampaignPriority;
  status: CampaignStatus;
  instructions: string;
  mediaVariants: {
    mediaUrl: string;
    mediaType: 'IMAGE' | 'VIDEO';
    caption: string;
  }[];
  verificationSettings: {
    screenshotRequired: boolean;
    facebookPostUrlRequired: boolean;
    groupNameRequired: boolean;
    manualReviewRequired: boolean;
    aiVerificationEnabled: boolean;
    autoApprovalEnabled: boolean;
  };
  startDate: string;
  endDate: string;
  budgetMinor: MoneyMinor;
  spentMinor: MoneyMinor;
  remainingBudgetMinor: MoneyMinor;
  rewardPerPostMinor: MoneyMinor;
  currency: string;
  maximumWorkers: number;
  maximumPostsPerWorker: number;
  dailyPostingLimit: number;
  workersJoined: number;
  endingSoonNotifiedAt: string | null;
  archivedAt: string | null;
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
  mediaVariants: {
    mediaUrl: string;
    mediaType: 'IMAGE' | 'VIDEO';
    caption: string;
  }[];
  screenshotRequired: boolean;
  facebookPostUrlRequired: boolean;
  groupNameRequired: boolean;
  manualReviewRequired: boolean;
  aiVerificationEnabled: boolean;
  autoApprovalEnabled: boolean;
}

export interface CampaignMediaUploadResponse {
  mediaUrl: string;
  objectKey: string;
}

export interface CampaignAssignment {
  id: string;
  campaignId: string;
  workerId: string;
  claimedAt: string;
  postsCompletedToday: number;
}
