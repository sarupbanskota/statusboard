export type PipelineStage = {
  id: string;
  label: string;
  status: "complete" | "active" | "pending" | "failed";
  detail: string;
  completedAt?: string;
};

export type SubCheck = {
  name: string;
  status: "pass" | "fail" | "warn";
  evidence?: string;
};

export type QualityCheck = {
  id: string;
  name: string;
  description: string;
  category: "integration" | "eval" | "functional";
  status: "pass" | "fail" | "warn";
  severity: "critical" | "warning";
  durationMs?: number;
  detail?: string;
  subChecks?: SubCheck[];
  logUrl?: string;
  checkedAt: string;
};

export type DayHistory = {
  date: string;
  drafted: boolean;
  checksPassed: boolean | null;
  posted: boolean;
};

export type DoneTodayBotData = {
  pipeline: PipelineStage[];
  qualityChecks: QualityCheck[];
  historyWeek: DayHistory[];
  historyMonth: DayHistory[];
  lastCheckedAt: string;
};

// Verifier result format (from verifier/results/*.json)
export type VerifierCheck = {
  checkId: string;
  name: string;
  passed: boolean;
  severity: "critical" | "warning";
  message: string;
  durationMs: number;
};

export type VerifierResult = {
  id: string;
  agentId: string;
  timestamp: string;
  inputs: {
    dateFor: string;
    rawData: Record<string, unknown>;
  };
  output: {
    draft: string;
    status: string;
  };
  metadata: {
    model: string;
    collectorCounts: Record<string, number>;
  };
  verification: {
    verdict: "pass" | "warn" | "fail";
    score: number;
    checks: VerifierCheck[];
    verifiedAt: string;
    totalDurationMs: number;
    tokenUsage: { inputTokens: number; outputTokens: number };
  };
};

// Health endpoint response from Railway
export type HealthResponse = {
  status: string;
  draftState: string | null;
  dateFor: string | null;
  sourcesCompleted: string[];
  sinceTimestamp: string | null;
  untilTimestamp: string | null;
  threadTs: string | null;
};
