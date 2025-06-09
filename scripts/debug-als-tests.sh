#!/usr/bin/env bash
# debug-als-tests.sh - Run tests with enhanced AsyncLocalStorage debugging
# This script enables detailed logging of AsyncLocalStorage operations
# Updated for Node.js 18+ focus - June 9, 2025

set -e  # Exit on error

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Clear log files
mkdir -p logs
echo > logs/als-debug.log

echo -e "${BLUE}===== Running tests with AsyncLocalStorage debugging =====${NC}"

# Set environment variables for debugging
export DEBUG=true
export NODE_ENV=test
export CI=true
export NODE_OPTIONS="--trace-warnings --enable-source-maps"

# Default to running Jest tests if no arguments provided
TEST_TYPE="${1:-jest}"

case "$TEST_TYPE" in
  "jest")
    echo -e "${YELLOW}Running Jest tests with ALS debugging${NC}"
    NODE_OPTIONS="--require ./scripts/als-debug-patch.js" \
      npx jest --config=jest.config.cjs --runInBand --no-cache "${@:2}"
    ;;
  "vitest")
    echo -e "${YELLOW}Running Vitest tests with ALS debugging${NC}"
    NODE_OPTIONS="--require ./scripts/als-debug-patch.js" \
      npx vitest run --no-threads "${@:2}"
    ;;
  "snapshot")
    echo -e "${YELLOW}Running snapshot tests with ALS debugging${NC}"
    NODE_OPTIONS="--require ./scripts/als-debug-patch.js" \
      npx jest test/snapshot.test.js --config=jest.config.cjs --runInBand --no-cache
    ;;
  "signal")
    echo -e "${YELLOW}Running signal tests with ALS debugging${NC}"
    NODE_OPTIONS="--require ./scripts/als-debug-patch.js" \
      npx jest test/signalTesting.test.jest.js --config=jest.config.cjs --runInBand --no-cache
    ;;
  *)
    echo -e "${YELLOW}Invalid test type: ${TEST_TYPE}${NC}"
    echo "Usage: $0 [jest|vitest|snapshot|signal] [additional test args]"
    exit 1
    ;;
esac

echo -e "${GREEN}Tests completed. Debug logs available at: logs/als-debug.log${NC}"
echo -e "${BLUE}Showing last 10 log entries:${NC}"
tail -n 10 logs/als-debug.log
