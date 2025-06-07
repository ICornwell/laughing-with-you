
/**
 * Signal handler for coordinating asynchronous tests
 */
export interface SignalHandler {
  wait(signalName: string, timeout?: number): Promise<any>;
  signal(signalName: string, value?: any): any;
  createWaiter(signalName: string, timeout?: number): Promise<any>;
  reset(): void;
}

/**
 * Create a signal-based test environment
 */
export function createSignalTestEnv(): SignalHandler;

/**
 * Create a test that waits for a specific signal before completing
 */
export function createSignalTest(
  testFn: (...args: any[]) => Promise<any>, 
  signalName: string, 
  timeout?: number
): (...args: any[]) => Promise<any>;
