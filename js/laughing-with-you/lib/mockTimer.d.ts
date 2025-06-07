
export interface Timer {
  id: number;
  callback: Function;
  delay: number;
  args: any[];
  time: number;
  repeat: boolean;
}

/**
 * Mock timer for testing time-based functions
 */
export class MockTimer {
  currentTime: number;
  timers: Timer[];
  nextTimerId: number;
  
  constructor();
  
  /**
   * Install the mock timer
   */
  install(): void;
  
  /**
   * Uninstall the mock timer
   */
  uninstall(): void;
  
  /**
   * Advance time by a specified amount of ms
   */
  advanceTime(ms: number): void;
  
  /**
   * Run all pending timers
   */
  runAll(): void;
  
  /**
   * Run only pending timers that should execute before a specific time
   */
  runUntil(timestamp: number): void;
}

/**
 * Create and install a mock timer for testing
 */
export function useMockTimer(): MockTimer;
