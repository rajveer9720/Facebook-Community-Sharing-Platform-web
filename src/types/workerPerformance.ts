export interface WorkerPerformance {
  workerId: string;
  workerName?: string;
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
