import type { AuthUser } from '@/types/user';
import type { Campaign } from '@/types/campaign';
import type { FacebookGroup, WorkerGroupLibraryEntry } from '@/types/group';
import type { Submission } from '@/types/submission';
import type { Wallet, Withdrawal } from '@/types/wallet';
import type { LeaderboardEntry, Achievement } from '@/types/leaderboard';
import type { AnalyticsOverview } from '@/types/analytics';

export interface MockCredential {
  userId: string;
  email: string;
  password: string;
}

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) => hoursAgo(d * 24);
const daysFromNow = (d: number) => new Date(now + d * 24 * 60 * 60 * 1000).toISOString();

export const users: AuthUser[] = [
  { id: 'user_admin_1', email: 'admin@example.com', firstName: 'John', lastName: 'Admin', role: 'ADMIN' },
  { id: 'user_worker_1', email: 'worker@example.com', firstName: 'Jane', lastName: 'Worker', role: 'WORKER' },
  { id: 'user_worker_2', email: 'worker2@example.com', firstName: 'Sam', lastName: 'Roberts', role: 'WORKER' },
];

export const credentials: MockCredential[] = [
  { userId: 'user_admin_1', email: 'admin@example.com', password: 'Admin@12345' },
  { userId: 'user_worker_1', email: 'worker@example.com', password: 'Worker@12345' },
  { userId: 'user_worker_2', email: 'worker2@example.com', password: 'Worker@12345' },
];

export const groups: FacebookGroup[] = [
  {
    id: 'grp_1',
    name: 'UK Technology Professionals',
    category: 'Technology',
    country: 'United Kingdom',
    qualityScore: 88,
    cooldownHours: 72,
    status: 'APPROVED',
    memberCount: 45210,
  },
  {
    id: 'grp_2',
    name: 'Digital Innovation Community',
    category: 'Technology',
    country: 'United Kingdom',
    qualityScore: 84,
    cooldownHours: 72,
    status: 'APPROVED',
    memberCount: 31875,
  },
  {
    id: 'grp_3',
    name: 'Global Tech Founders Network',
    category: 'Technology',
    country: 'United States',
    qualityScore: 0,
    cooldownHours: 48,
    status: 'PENDING',
    memberCount: 18420,
  },
];

export const workerGroupLibrary: WorkerGroupLibraryEntry[] = [
  {
    id: 'wgl_1',
    groupId: 'grp_1',
    group: groups[0],
    timesUsed: 7,
    lastPostedAt: daysAgo(2),
    availableAt: hoursAgo(-24),
  },
  {
    id: 'wgl_2',
    groupId: 'grp_2',
    group: groups[1],
    timesUsed: 4,
    lastPostedAt: daysAgo(5),
    availableAt: null,
  },
];

export const campaigns: Campaign[] = [
  {
    id: 'camp_1',
    name: 'Technology Community Awareness',
    category: 'Technology',
    priority: 'High',
    status: 'ACTIVE',
    instructions:
      'Share the campaign post in approved technology groups. Include the official caption and campaign link. One post per group per cooldown window.',
    startDate: daysAgo(3),
    endDate: daysFromNow(30),
    budgetMinor: 500000,
    rewardPerPostMinor: 250,
    currency: 'GBP',
    maximumWorkers: 100,
    maximumPostsPerWorker: 5,
    dailyPostingLimit: 2,
    workersJoined: 24,
    createdAt: daysAgo(3),
  },
  {
    id: 'camp_2',
    name: 'Small Business Spotlight',
    category: 'Business',
    priority: 'Normal',
    status: 'ACTIVE',
    instructions:
      'Post the business spotlight graphic with the provided caption in relevant business or entrepreneurship groups.',
    startDate: daysAgo(10),
    endDate: daysFromNow(14),
    budgetMinor: 300000,
    rewardPerPostMinor: 200,
    currency: 'GBP',
    maximumWorkers: 60,
    maximumPostsPerWorker: 3,
    dailyPostingLimit: 1,
    workersJoined: 41,
    createdAt: daysAgo(10),
  },
  {
    id: 'camp_3',
    name: 'Personal Finance Tips Series',
    category: 'Finance',
    priority: 'Normal',
    status: 'PAUSED',
    instructions: 'Share weekly personal finance tips in personal finance and budgeting groups only.',
    startDate: daysAgo(20),
    endDate: daysFromNow(5),
    budgetMinor: 200000,
    rewardPerPostMinor: 180,
    currency: 'GBP',
    maximumWorkers: 40,
    maximumPostsPerWorker: 4,
    dailyPostingLimit: 1,
    workersJoined: 12,
    createdAt: daysAgo(20),
  },
];

export const submissions: Submission[] = [
  {
    id: 'sub_1',
    campaignId: 'camp_1',
    campaignName: 'Technology Community Awareness',
    workerId: 'user_worker_1',
    workerName: 'Jane Worker',
    groupId: 'grp_1',
    groupName: 'UK Technology Professionals',
    status: 'APPROVED',
    proofUrl: 'https://facebook.com/groups/uktech/posts/1001',
    caption: 'Excited to share this with the community!',
    rewardMinor: 250,
    submittedAt: daysAgo(4),
    reviewedAt: daysAgo(3),
    reviewNote: null,
  },
  {
    id: 'sub_2',
    campaignId: 'camp_1',
    campaignName: 'Technology Community Awareness',
    workerId: 'user_worker_1',
    workerName: 'Jane Worker',
    groupId: 'grp_2',
    groupName: 'Digital Innovation Community',
    status: 'MANUAL_REVIEW',
    proofUrl: 'https://facebook.com/groups/digitalinnovation/posts/2002',
    caption: 'Sharing today’s update with the group.',
    rewardMinor: 250,
    submittedAt: hoursAgo(6),
    reviewedAt: null,
    reviewNote: null,
  },
  {
    id: 'sub_3',
    campaignId: 'camp_1',
    campaignName: 'Technology Community Awareness',
    workerId: 'user_worker_2',
    workerName: 'Sam Roberts',
    groupId: 'grp_1',
    groupName: 'UK Technology Professionals',
    status: 'PENDING',
    proofUrl: 'https://facebook.com/groups/uktech/posts/1050',
    caption: 'Posted the campaign update.',
    rewardMinor: 250,
    submittedAt: hoursAgo(1),
    reviewedAt: null,
    reviewNote: null,
  },
  {
    id: 'sub_4',
    campaignId: 'camp_2',
    campaignName: 'Small Business Spotlight',
    workerId: 'user_worker_2',
    workerName: 'Sam Roberts',
    groupId: 'grp_2',
    groupName: 'Digital Innovation Community',
    status: 'REJECTED',
    proofUrl: 'https://facebook.com/groups/digitalinnovation/posts/2090',
    caption: 'Shared the spotlight graphic.',
    rewardMinor: 0,
    submittedAt: daysAgo(6),
    reviewedAt: daysAgo(5),
    reviewNote: 'Caption did not match the approved campaign copy. Please resubmit with the exact wording.',
  },
];

export const wallets: Record<string, Wallet> = {
  user_worker_1: {
    workerId: 'user_worker_1',
    availableMinor: 1250,
    pendingMinor: 250,
    withdrawalHoldMinor: 0,
    totalMinor: 1500,
    currency: 'GBP',
  },
  user_worker_2: {
    workerId: 'user_worker_2',
    availableMinor: 500,
    pendingMinor: 250,
    withdrawalHoldMinor: 0,
    totalMinor: 750,
  currency: 'GBP',
  },
};

export const withdrawals: Withdrawal[] = [
  {
    id: 'wd_1',
    workerId: 'user_worker_1',
    worker: { firstName: 'Jane', lastName: 'Worker', email: 'worker@example.com' },
    amountMinor: 1000,
    currency: 'GBP',
    paymentMethod: 'Bank transfer',
    paymentDetails: { accountReference: 'Sort code / account on file' },
    status: 'PENDING',
    requestedAt: hoursAgo(5),
  },
  {
    id: 'wd_2',
    workerId: 'user_worker_2',
    worker: { firstName: 'Sam', lastName: 'Roberts', email: 'worker2@example.com' },
    amountMinor: 500,
    currency: 'GBP',
    paymentMethod: 'PayPal',
    paymentDetails: { accountReference: 'PayPal on file' },
    status: 'APPROVED',
    requestedAt: daysAgo(2),
  },
];

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, workerId: 'user_worker_1', workerName: 'Jane Worker', approvedPosts: 34, earningsMinor: 8500, isCurrentWorker: true },
  { rank: 2, workerId: 'user_worker_2', workerName: 'Sam Roberts', approvedPosts: 21, earningsMinor: 5200, isCurrentWorker: false },
];

export const achievements: Achievement[] = [
  { id: 'ach_1', title: 'First approved post', description: 'Get your first submission approved', unlockedAt: daysAgo(12) },
  { id: 'ach_2', title: '10 approved posts', description: 'Reach 10 approved submissions', unlockedAt: daysAgo(6) },
  { id: 'ach_3', title: '50 approved posts', description: 'Reach 50 approved submissions', unlockedAt: null },
];

export function registerPendingReward(workerId: string, amountMinor: number): void {
  const wallet = wallets[workerId];
  if (!wallet) return;
  wallet.pendingMinor += amountMinor;
  wallet.totalMinor += amountMinor;
}

export function approvePendingReward(workerId: string, amountMinor: number): void {
  const wallet = wallets[workerId];
  if (!wallet) return;
  wallet.pendingMinor = Math.max(0, wallet.pendingMinor - amountMinor);
  wallet.availableMinor += amountMinor;
}

export function rejectPendingReward(workerId: string, amountMinor: number): void {
  const wallet = wallets[workerId];
  if (!wallet) return;
  wallet.pendingMinor = Math.max(0, wallet.pendingMinor - amountMinor);
  wallet.totalMinor = Math.max(0, wallet.totalMinor - amountMinor);
}

export const analyticsOverview: AnalyticsOverview = {
  cards: [
    { key: 'performance', title: 'Performance overview', description: 'Submissions, approval rate and reward spend trends', value: '1,284 submissions', trend: '+12% vs last week' },
    { key: 'quality', title: 'Worker quality scores', description: 'Distribution of worker trust and accuracy scores', value: 'Avg score 82', trend: '+3 pts vs last month' },
    { key: 'coverage', title: 'Coverage & heatmaps', description: 'Unique group coverage and posting concentration', value: '482 unique groups', trend: '96% unique' },
    { key: 'planner', title: 'AI campaign planner', description: 'Recommended budget and group allocation', value: '6 suggestions ready', trend: 'Updated today' },
    { key: 'risk', title: 'Fraud risk', description: 'Duplicate content, bot patterns and rapid submission flags', value: '3 flagged workers', trend: '-1 vs last week' },
    { key: 'category', title: 'Category performance', description: 'Approval rate and volume by campaign category', value: '4 categories tracked', trend: 'Technology leading' },
  ],
  categoryPerformance: [
    { category: 'Technology', submissions: 612, approvalRate: 0.91 },
    { category: 'Business', submissions: 341, approvalRate: 0.86 },
    { category: 'Finance', submissions: 198, approvalRate: 0.79 },
    { category: 'Jobs', submissions: 133, approvalRate: 0.88 },
  ],
};
