
export interface AnalyticsCallData {
  args: any[];
  result: any;
  duration: number;
}

export interface AnalyticsStats {
  count: number;
  totalTime: number;
  samples: AnalyticsCallData[];
}

export interface AnalyticsResult {
  [key: string]: {
    calls: number;
    avgTime: number;
    totalTime: number;
    samples: AnalyticsCallData[];
  }
}

export interface Analytics {
  calls: Map<string, AnalyticsStats>;
  recordCall(name: string, prop: string, args: any[], result: any, duration: number): void;
  getStats(): AnalyticsResult;
  reset(): void;
}

export interface RecordCallsResult {
  getStats(): AnalyticsResult;
  reset(): void;
}

/**
 * Record function calls for analytics
 */
export function recordCalls(name: string, methodNames?: string[]): RecordCallsResult;

export const analytics: Analytics;
