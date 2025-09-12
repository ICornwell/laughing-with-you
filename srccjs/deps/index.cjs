const realLogger  = require( '../logger.cjs');
const realPath  = require('path');
const realDepSnapshot  = require('../depSnapshot.cjs');
const realE2e  = require('../e2e.cjs');
const realMockTimer  = require('../mockTimer.cjs');
const realResourceManager  = require( '../resourceManager.cjs');

const proxyLogger  = require( './logger.cjs');
const proxyPath  = require('./path.cjs');
const proxyDepSnapshot  = require('./snapshot.cjs');
const proxyE2e  = require('./e2e.cjs');
const proxyMockTimer  = require('./mockTimer.cjs');
const proxyResourceManager = require('./resourceManager.cjs');

// currently switched into test mode!
const useMocks = process.env.LWY_USE_DEP_PROXIES ?? true // set to false to use real dependencies

const logger = useMocks ? proxyLogger : realLogger;
const path = useMocks ? proxyPath : realPath;
const depSnapshot = useMocks ? proxyDepSnapshot : realDepSnapshot;
const e2e = useMocks ? proxyE2e : realE2e;
const mockTimer = useMocks ? proxyMockTimer : realMockTimer;
const resourceManager = useMocks ? proxyResourceManager : realResourceManager;

console.log(`Using ${useMocks ? 'mock' : 'real'} dependencies for LWY: e2e: ${e2e}`);

 module.exports = {
  allDeps: {
   logger,
   path,
   depSnapshot, 
   e2e,
   resourceManager,
   mockTimer
 }};