import type { MoneyMinor } from './common';

export type SubmissionStatus = 'PENDING' | 'MANUAL_REVIEW' | 'APPROVED' | 'REJECTED';

export interface Submission {
  id: string;
  campaignId: string;
  campaignName: string;
  workerId: string;
  workerName: string;
  groupId: string;
  groupName: string;
  status: SubmissionStatus;
  proofUrl: string;
  caption: string;
  rewardMinor: MoneyMinor;
  submittedAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export interface CreateSubmissionRequest {
  campaignId: string;
  groupId: string;
  proofUrl: string;
  caption: string;
}

export type ReviewDecision = 'APPROVE' | 'REJECT' | 'REQUEST_RESUBMISSION';

export interface ReviewSubmissionRequest {
  decision: ReviewDecision;
  note?: string;
}
