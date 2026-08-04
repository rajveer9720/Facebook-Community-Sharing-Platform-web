export interface WorkerPerformance {
  workerId: number;
  workerName?: string;
  email?: string;
  approvalRate: number;
  rejectionRate: number;
  duplicateRate: number;
  averageCompletionMinutes: number;
  qualityScore: number;
  trustScore: number;
  fraudRiskScore: number;
  isFlagged: boolean;
  flaggedReason: string | null;
  tier: string;
  activeDays: number;
}

export interface AdminWorkerPerformanceResponse {
  items: WorkerPerformance[];
}
