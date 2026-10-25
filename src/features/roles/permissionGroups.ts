export interface PermissionGroupConfig {
  group: string;
  label: string;
  action: string;
  subject: string;
}

export const PERMISSION_GROUPS: PermissionGroupConfig[] = [
  { group: 'Campaigns', label: 'View campaigns', action: 'read', subject: 'Campaign' },
  { group: 'Campaigns', label: 'Create, edit & manage campaigns', action: 'manage', subject: 'Campaign' },
  { group: 'Groups', label: 'View approved groups', action: 'read', subject: 'Group' },
  { group: 'Groups', label: 'Moderate groups (approve / reject / blacklist)', action: 'moderate', subject: 'Group' },
  { group: 'Submissions', label: 'View worker submissions', action: 'read', subject: 'Submission' },
  { group: 'Submissions', label: 'Review submissions (approve / reject)', action: 'review', subject: 'Submission' },
  { group: 'Submissions', label: 'View fraud & risk signals', action: 'read', subject: 'FraudSignal' },
  { group: 'Wallet & finance', label: 'Review withdrawal requests', action: 'review', subject: 'Withdrawal' },
  { group: 'Wallet & finance', label: 'Release withdrawal payouts', action: 'complete', subject: 'Withdrawal' },
  { group: 'Wallet & finance', label: 'View budget & spend analytics', action: 'read', subject: 'FinanceAnalytics' },
  { group: 'Workers & staff', label: 'View worker directory & trust scores', action: 'read', subject: 'WorkerDirectory' },
  { group: 'Workers & staff', label: 'Flag / restrict a worker account', action: 'restrict', subject: 'Worker' },
  { group: 'Workers & staff', label: 'Manage staff accounts & roles', action: 'manage', subject: 'Staff' },
  { group: 'Platform', label: 'View audit log', action: 'read', subject: 'AuditLog' },
  { group: 'Platform', label: 'Configure system defaults', action: 'manage', subject: 'SystemConfig' },
];

export function permissionKey(action: string, subject: string): string {
  return `${action}:${subject}`;
}
