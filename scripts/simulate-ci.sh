#!/usr/bin/env bash
# simulate-ci.sh - Run tests in an environment that mimics CI for Node.js 18+
# Usage: ./scripts/simulate-ci.sh [jest|vitest|both]
# Last updated: June 9, 2025

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}Error: Node.js 18 or higher is required (detected v$NODE_VERSION)${NC}"
  exit 1
fi
echo -e "${GREEN}Using Node.js version: $(node -v)${NC}"

# Default to running both test frameworks
TEST_FRAMEWORK="${1:-both}"

echo -e "${BLUE}===== Simulating CI Environment =====${NC}"
echo -e "${YELLOW}Test Framework: $TEST_FRAMEWORK${NC}"

# Create temporary clean environment
echo -e "${BLUE}Creating clean environment...${NC}"
rm -rf node_modules/.cache 2>/dev/null || true
npm cache verify >/dev/null

# Set CI environment variables
export CI=true
export NODE_ENV=test
export JEST_WORKER_ID=1  # Force Jest to think it's running in a worker

# Function to run Jest tests in CI-like conditions
run_jest_tests() {
  echo -e "${BLUE}===== Running Jest Tests in CI Simulation =====${NC}"
  
  # Run Jest with special flags
  echo -e "${YELLOW}Running Jest with limited permissions...${NC}"
  
  # Use CI-specific config file
  NODE_OPTIONS="--no-warnings --unhandled-rejections=strict" \
  node node_modules/jest/bin/jest.js \
    --config=jest.config.ci.cjs \
    --runInBand \
    --no-cache \
    --silent=false \
    --verbose "$@"
  
  jest_result=$?
  if [ $jest_result -eq 0 ]; then
    echo -e "${GREEN}Jest tests passed in CI simulation!${NC}"
  else
    echo -e "${RED}Jest tests failed in CI simulation.${NC}"
  fi
  return $jest_result
}

# Function to run Vitest tests in CI-like conditions
run_vitest_tests() {
  echo -e "${BLUE}===== Running Vitest Tests in CI Simulation =====${NC}"
  
  # Vitest doesn't support frozen-intrinsics, use other CI-like settings
  echo -e "${YELLOW}Running Vitest with CI configuration...${NC}"
  
  # Run with no-watch and single thread
  NODE_OPTIONS="--no-warnings --unhandled-rejections=strict" \
  npx vitest run \
    --no-watch \
    --no-threads \
    --reporter verbose \
    "$@"
  
  vitest_result=$?
  if [ $vitest_result -eq 0 ]; then
    echo -e "${GREEN}Vitest tests passed in CI simulation!${NC}"
  else
    echo -e "${RED}Vitest tests failed in CI simulation.${NC}"
  fi
  return $vitest_result
}

# Run specified test framework(s)
case $TEST_FRAMEWORK in
  "jest")
    run_jest_tests "${@:2}"
    exit $?
    ;;
  "vitest")
    run_vitest_tests "${@:2}"
    exit $?
    ;;
  "both")
    echo -e "${BLUE}Running both Jest and Vitest tests${NC}"
    run_jest_tests "${@:2}"
    jest_exit=$?
    run_vitest_tests "${@:2}"
    vitest_exit=$?
    
    # Return non-zero if either one failed
    if [ $jest_exit -ne 0 ] || [ $vitest_exit -ne 0 ]; then
      echo -e "${RED}CI simulation detected test failures${NC}"
      exit 1
    else
      echo -e "${GREEN}All tests passed in CI simulation!${NC}"
      exit 0
    fi
    ;;
  *)
    echo -e "${RED}Invalid test framework: $TEST_FRAMEWORK${NC}"
    echo "Usage: $0 [jest|vitest|both] [additional test args]"
    exit 1
    ;;
esac
