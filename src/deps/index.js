import realLogger from  '../logger.js';
import realPath from 'path';
import realDepSnapshot from '../depSnapshot.js';
import realE2e from '../e2e.js';
import realMockTimer from '../mockTimer.js';
import realResourceManager from  '../resourceManager.js';

import proxyLogger from  './logger.js';
import proxyPath from './path.js';
import proxyDepSnapshot from './snapshot.js';
import proxyE2e from './e2e.js';
import proxyMockTimer from './mockTimer.js';
import proxyResourceManager from './resourceManager.js';

// currently switched into test mode!
const useMocks = process.env.LWY_USE_DEP_PROXIES ?? true // set to false to use real dependencies

export const logger = useMocks ? proxyLogger : realLogger;
export const path = useMocks ? proxyPath : realPath;
export const depSnapshot = useMocks ? proxyDepSnapshot : realDepSnapshot;
export const e2e = useMocks ? proxyE2e : realE2e;
export const mockTimer = useMocks ? proxyMockTimer : realMockTimer;
export const resourceManager = useMocks ? proxyResourceManager : realResourceManager;

// console.log(`Using ${useMocks ? 'mock' : 'real'} dependencies for LWY: e2e: ${e2e}`);

 export default {
  allDeps: {
   logger,
   path,
   depSnapshot,
   e2e,
   resourceManager 
 }};