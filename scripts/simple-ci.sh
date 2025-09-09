#!/usr/bin/env bash
# simple-ci.sh - Primary CI simulation tool for Node.js 18+
# This script is the recommended approach for simulating CI environments
# Updated for Node.js 18+ focus - June 9, 2025

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default to running both test frameworks
TEST_FRAMEWORK="${1:-both}"

echo -e "${BLUE}===== Simple CI Environment Simulation =====${NC}"
echo -e "${YELLOW}Test Framework: $TEST_FRAMEWORK${NC}"

# Create temporary clean environment
echo -e "${BLUE}Creating clean environment...${NC}"
rm -rf node_modules/.cache 2>/dev/null || true
npm cache verify >/dev/null

# Set CI environment variables
export CI=true
export NODE_ENV=test
export JEST_WORKER_ID=1

# Function to run Jest tests with minimal configuration
run_jest_tests() {
  echo -e "${BLUE}===== Running Jest Tests in Simple CI Simulation =====${NC}"
  
  # Run Jest with minimal configuration (no extra reporters)
  NODE_OPTIONS="--no-warnings --unhandled-rejections=strict" \
  node node_modules/jest/bin/jest.js \
    --config=jest.config.cjs \
    --no-cache \
    --runInBand \
    --verbose "$@"

  LWY_USE_DEP_PROXIES=1
  
  jest_result=$?
  if [ $jest_result -eq 0 ]; then
    echo -e "${GREEN}Jest tests passed in simple CI simulation!${NC}"
  else
    echo -e "${RED}Jest tests failed in simple CI simulation.${NC}"
  fi
  return $jest_result
}

# Function to run Vitest tests in CI-like conditions
run_vitest_tests() {
  echo -e "${BLUE}===== Running Vitest Tests in Simple CI Simulation =====${NC}"
  
  NODE_OPTIONS="--no-warnings --unhandled-rejections=strict" \
  npx vitest run \
    --no-watch \
    --reporter verbose \
    "$@"

  LWY_USE_DEP_PROXIES=1

  vitest_result=$?
  if [ $vitest_result -eq 0 ]; then
    echo -e "${GREEN}Vitest tests passed in simple CI simulation!${NC}"
  else
    echo -e "${RED}Vitest tests failed in simple CI simulation.${NC}"
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
      echo -e "${RED}Simple CI simulation detected test failures${NC}"
      exit 1
    else
      echo -e "${GREEN}All tests passed in simple CI simulation!${NC}"
      exit 0
    fi
    ;;
  *)
    echo -e "${RED}Invalid test framework: $TEST_FRAMEWORK${NC}"
    echo "Usage: $0 [jest|vitest|both] [additional test args]"
    exit 1
    ;;
esac
