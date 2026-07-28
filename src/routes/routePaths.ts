export const ROUTES = {
  home: '/',
  login: '/login',
  worker: {
    root: '/worker',
    campaigns: '/worker/campaigns',
    submissions: '/worker/submissions',
    groups: '/worker/groups',
    wallet: '/worker/wallet',
    leaderboard: '/worker/leaderboard',
  },
  admin: {
    root: '/admin',
    campaigns: '/admin/campaigns',
    newCampaign: '/admin/campaigns/new',
    review: '/admin/review',
    groups: '/admin/groups',
    withdrawals: '/admin/withdrawals',
    analytics: '/admin/analytics',
  },
} as const;
