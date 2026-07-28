import { registerRoute } from '@/mocks/router';
import { readSession } from '@/mocks/session';
import { achievements, leaderboard } from '@/mocks/db';

registerRoute('GET', '/leaderboard', () => {
  const session = readSession();
  return leaderboard.map((entry) => ({
    ...entry,
    isCurrentWorker: session?.user.id === entry.workerId,
  }));
});

registerRoute('GET', '/leaderboard/achievements', () => achievements);
