#!/usr/bin/env bash
# Debug problematic tests with ALS diagnostics
# Updated for Node.js 18+ focus - June 9, 2025

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Running problematic tests with verbose debugging =====${NC}"

# Enable debugging and verbose output
export DEBUG=true
export VERBOSE=true
export CI=true
export NODE_ENV=test

# Clear caches
echo -e "${YELLOW}Clearing caches...${NC}"
rm -rf node_modules/.cache 2>/dev/null || true

# Run the snapshot tests that have issues in CI
echo -e "${BLUE}===== Running snapshot.test.js with Jest =====${NC}"
NODE_OPTIONS="--no-warnings --unhandled-rejections=strict" \
node --trace-warnings node_modules/jest/bin/jest.js \
  --config=jest.config.cjs \
  --runInBand \
  --no-cache \
  --verbose \
  test/snapshot.test.js

echo -e "${BLUE}===== Running signalTesting.test.jest.js =====${NC}"
NODE_OPTIONS="--no-warnings --unhandled-rejections=strict" \
node --trace-warnings node_modules/jest/bin/jest.js \
  --config=jest.config.cjs \
  --runInBand \
  --no-cache \
  --verbose \
  test/signalTesting.test.jest.js

echo -e "${GREEN}Test run complete!${NC}"
echo -e "${BLUE}Recommended next steps:${NC}"
echo -e "1. Check test output for AsyncLocalStorage issues"
echo -e "2. Try running with full ALS debugging: npm run test:als-debug"
echo -e "3. For regular CI simulation: npm run test:ci:simple"
