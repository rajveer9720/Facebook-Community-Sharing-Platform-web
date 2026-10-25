export type GroupStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type GroupPrivacyType = 'PUBLIC' | 'PRIVATE' | 'HIDDEN' | string;
export type GroupModerationAction = 'APPROVE' | 'REJECT' | 'BLACKLIST' | 'UNBLACKLIST';

export interface FacebookGroup {
  id: string;
  name: string;
  category: string;
  country: string;
  url: string;
  language: string;
  privacyType: GroupPrivacyType;
  qualityScore: number;
  engagementScore: number;
  spamScore: number;
  blacklisted: boolean;
  cooldownHours: number;
  lastWorkerId: string | null;
  lastCampaignId: string | null;
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
  url: string;
  language: string;
  privacyType: GroupPrivacyType;
  memberCount: number;
}

export interface ModerateGroupRequest {
  action: GroupModerationAction;
  note?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  category?: string;
  country?: string;
  url?: string;
  language?: string;
  privacyType?: GroupPrivacyType;
  cooldownHours?: number;
  blacklisted?: boolean;
}

export interface GroupRecommendationsRequest {
  campaignId?: string;
  limit?: number;
}
