// Transaction metrics and time tracking types

export interface Metrics {
  complianceScore: number;
  regulatoryCompliance: {
    keyPoints: string[];
    complianceCoverage: number;
    riskExposures: { name: string; value: number }[];
  };
  legalHistoryScore: number;
  legalRecord: {
    judgmentsCount: number;
    litigationRisk: number;
    recentCases: number;
    pendingLitigation: number;
  };
  businessDurationScore: number;
  businessAge: {
    yearsInBusiness: number;
    industryPeerPercentile: number;
    stabilityRating: number;
    historicalConsistency: number;
  };
  industryReputationScore: number;
  reputation: {
    marketPerception: number;
    publicSentiment: number;
    customerSatisfaction: number;
    industryAwards: number;
  };
  businessStabilityScore: number;
  stability: {
    cashFlowConsistency: number;
    revenueGrowth: number;
    employeeRetention: number;
    marketPositionStrength: number;
  };
}

export interface TimeMetrics {
  createdAt: string;
  stageStartTimes: Record<string, string>;
  stageDurations: Record<string, number>;
  lastPageVisit: Record<string, string>;
  totalTimeSpent: Record<string, number>;
  totalTimeElapsed: number;
}

export interface TransactionTimeTracking {
  metrics: Metrics;
  timeMetrics: TimeMetrics;
}
