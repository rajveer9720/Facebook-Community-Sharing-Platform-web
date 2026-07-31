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
  verificationConfidence: number | null;
  verificationExplanation: string | null;
  duplicateProofDetected: boolean;
  duplicateUrlDetected: boolean;
  fraudRiskScore: number | null;
  flaggedForFraud: boolean;
  fraudSignals: string[];
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

export interface CreateProofUploadUrlRequest {
  fileName: string;
  contentType: string;
}

export interface CreateProofUploadUrlResponse {
  uploadUrl: string;
  proofUrl: string;
  expiresAt?: string;
}

export type ReviewDecision = 'APPROVE' | 'REJECT' | 'REQUEST_RESUBMISSION';

export interface ReviewSubmissionRequest {
  decision: ReviewDecision;
  note?: string;
}
