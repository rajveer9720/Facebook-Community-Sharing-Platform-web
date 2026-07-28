export type GroupStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface FacebookGroup {
  id: string;
  name: string;
  category: string;
  country: string;
  qualityScore: number;
  cooldownHours: number;
  status: GroupStatus;
  memberCount: number;
}

export interface WorkerGroupLibraryEntry {
  id: string;
  groupId: string;
  group: FacebookGroup;
  timesUsed: number;
  lastPostedAt: string | null;
  availableAt: string | null;
}

export interface GroupCoverageStats {
  approvedGroups: number;
  pendingDiscoveries: number;
  uniqueGroupsCovered: number;
  duplicateGroupRate: number;
}

export interface CreateGroupDiscoveryRequest {
  name: string;
  category: string;
  country: string;
  memberCount: number;
}
