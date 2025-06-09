#!/usr/bin/env bash
# docker-ci.sh - Run tests in a Docker container to closely mimic CI
# Usage: ./scripts/docker-ci.sh [jest|vitest|both]
# Updated for Node.js 18+ focus - June 9, 2025

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default to running both test frameworks
TEST_FRAMEWORK="${1:-both}"

echo -e "${BLUE}===== Running Tests in Docker CI Environment (Node.js 18) =====${NC}"
echo -e "${YELLOW}Test Framework: $TEST_FRAMEWORK${NC}"

# Build the Docker image
echo -e "${BLUE}Building Docker image for CI testing...${NC}"
docker build -t lwy-ci-image -f Dockerfile.ci .

# Run the tests in the container
echo -e "${BLUE}Running tests in Docker container...${NC}"
docker run --rm -it lwy-ci-image scripts/simple-ci.sh "$TEST_FRAMEWORK" "${@:2}"

echo -e "${GREEN}Docker CI test run complete!${NC}"
echo -e "${BLUE}Tip: For more detailed AsyncLocalStorage debugging, try:${NC}"
echo -e "  npm run test:als-debug"
