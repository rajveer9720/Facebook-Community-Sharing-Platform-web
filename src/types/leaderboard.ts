export type LeaderboardPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';

export interface LeaderboardEntry {
  rank: number;
  workerId: string;
  workerName: string;
  approvedPosts: number;
  earningsMinor: number;
  isCurrentWorker: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string | null;
}
