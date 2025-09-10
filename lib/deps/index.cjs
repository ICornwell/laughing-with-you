const realLogger  = require( '../logger.js');
const realPath  = require('path');
const realDepSnapshot  = require('../depSnapshot.js');
const realE2e  = require('../e2e.js');
const realMockTimer  = require('../mockTimer.js');
const realResourceManager  = require( '../resourceManager.js');

const proxyLogger  = require( './logger.js');
const proxyPath  = require('./path.js');
const proxyDepSnapshot  = require('./snapshot.js');
const proxyE2e  = require('./e2e.js');
const proxyMockTimer  = require('./mockTimer.js');
const proxyResourceManager = require('./resourceManager.js');

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