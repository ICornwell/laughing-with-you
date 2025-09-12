#!/usr/bin/env bash
# verify-types.sh - Verify TypeScript definitions for testing utilities
# Created: June 9, 2025

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Verifying TypeScript Definitions =====${NC}"

# Check if TypeScript is installed
if ! command -v tsc &> /dev/null; then
    echo -e "${YELLOW}TypeScript not found, installing temporarily...${NC}"
    npm install -g typescript
fi

# Create a temporary TypeScript file to verify the types
TMP_DIR=$(mktemp -d -p .)
echo -e "${BLUE}Creating temporary TypeScript test file...${NC}"
echo -e "${BLUE} current dir: $(pwd)${NC}"
echo -e "${BLUE} tmp dir: $TMP_DIR${NC}"
cat > "$TMP_DIR/type-test.ts" << 'EOF'
// Test TypeScript definitions for robust-als.d.ts
import { 
  createRobustALS, 
  runWithRobustALS, 
  getDepsRobustly, 
  setDepsRobustly 
} from '../test/vitest/testUtils/robust-als.js';

// Test createRobustALS
const als = createRobustALS();

// Test runWithRobustALS
async function testRunWithRobustALS() {
  const result: string = await runWithRobustALS({ key: 'value' }, async () => {
    return 'test';
  });
  console.log(result);
}

// Test getDepsRobustly
const deps = getDepsRobustly();
console.log(deps);

// Test setDepsRobustly
setDepsRobustly({ key: 'new value' });

// Test TypeScript definitions for als-utils.d.ts
import {
  ensureALSInitialized,
  withALS,
  describeWithALS,
  cleanupALS
} from '../test/vitest/testUtils/als-utils.js';

// Test ensureALSInitialized
const initialDeps = ensureALSInitialized({ key: 'value' });
console.log(initialDeps);

// Test withALS
const testFn = (x: string) => x.toUpperCase();
const wrappedTestFn = withALS(testFn, { key: 'value' });
console.log(wrappedTestFn('test'));

// Test describeWithALS
describeWithALS('Test suite', { key: 'value' }, () => {
  // Test definitions
});

// Test describeWithALS overload
describeWithALS('Test suite', () => {
  // Test definitions
});

// Test cleanupALS
cleanupALS();
EOF

# Create a tsconfig file
cat > "$TMP_DIR/tsconfig.json" << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "*": ["*"]
    }
  },
  "include": ["type-test.ts"]
}
EOF

# Verify the TypeScript definitions
echo -e "${BLUE}Checking TypeScript definitions...${NC}"
cd "$TMP_DIR" && tsc --noEmit

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ TypeScript definitions are valid!${NC}"
else
  echo -e "${RED}❌ TypeScript definitions have errors.${NC}"
  exit 1
fi

# Clean up
rm -rf "$TMP_DIR"

echo -e "${GREEN}TypeScript verification complete!${NC}"
