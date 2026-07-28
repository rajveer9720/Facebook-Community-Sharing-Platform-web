import { registerRoute } from '@/mocks/router';
import { MockApiError } from '@/mocks/errors';
import { requireSession, requireRole } from '@/mocks/session';
import { campaigns } from '@/mocks/db';
import { createId } from '@/utils/id';
import type { Campaign, CampaignStatus, CreateCampaignRequest } from '@/types/campaign';

registerRoute('GET', '/campaigns', ({ query }) => {
  const status = query.get('status') as CampaignStatus | null;
  return status ? campaigns.filter((c) => c.status === status) : campaigns;
});

registerRoute('GET', '/campaigns/:id', ({ params }) => {
  const campaign = campaigns.find((c) => c.id === params.id);
  if (!campaign) {
    throw new MockApiError(404, 'Campaign not found');
  }
  return campaign;
});

registerRoute('POST', '/campaigns', ({ body }) => {
  const session = requireSession();
  requireRole(session, 'ADMIN');
  const payload = body as CreateCampaignRequest;

  if (!payload.name?.trim()) {
    throw new MockApiError(400, 'Campaign name is required');
  }

  const campaign: Campaign = {
    id: createId('camp'),
    name: payload.name,
    category: payload.category,
    priority: payload.priority,
    status: 'DRAFT',
    instructions: payload.instructions,
    startDate: payload.startDate,
    endDate: payload.endDate,
    budgetMinor: payload.budgetMinor,
    rewardPerPostMinor: payload.rewardPerPostMinor,
    currency: 'GBP',
    maximumWorkers: payload.maximumWorkers,
    maximumPostsPerWorker: payload.maximumPostsPerWorker,
    dailyPostingLimit: payload.dailyPostingLimit,
    workersJoined: 0,
    createdAt: new Date().toISOString(),
  };
  campaigns.unshift(campaign);
  return campaign;
});
