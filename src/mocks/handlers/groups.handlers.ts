import { registerRoute } from '@/mocks/router';
import { MockApiError } from '@/mocks/errors';
import { requireSession, requireRole } from '@/mocks/session';
import { groups, workerGroupLibrary } from '@/mocks/db';
import { createId } from '@/utils/id';
import type { CreateGroupDiscoveryRequest, FacebookGroup, GroupCoverageStats, GroupStatus } from '@/types/group';

registerRoute('GET', '/groups', ({ query }) => {
  const status = query.get('status') as GroupStatus | null;
  return status ? groups.filter((g) => g.status === status) : groups;
});

registerRoute('GET', '/groups/coverage', () => {
  const approvedGroups = groups.filter((g) => g.status === 'APPROVED').length;
  const pendingDiscoveries = groups.filter((g) => g.status === 'PENDING').length;
  const stats: GroupCoverageStats = {
    approvedGroups,
    pendingDiscoveries,
    uniqueGroupsCovered: approvedGroups,
    duplicateGroupRate: 0,
  };
  return stats;
});

registerRoute('GET', '/groups/library', () => workerGroupLibrary);

registerRoute('POST', '/groups', ({ body }) => {
  const session = requireSession();
  requireRole(session, 'WORKER');
  const payload = body as CreateGroupDiscoveryRequest;

  if (!payload.name?.trim()) {
    throw new MockApiError(400, 'Group name is required');
  }

  const group: FacebookGroup = {
    id: createId('grp'),
    name: payload.name,
    category: payload.category,
    country: payload.country,
    qualityScore: 0,
    cooldownHours: 48,
    status: 'PENDING',
    memberCount: payload.memberCount,
  };
  groups.unshift(group);
  return group;
});
