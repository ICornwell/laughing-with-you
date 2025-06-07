#!/usr/bin/env bash
# filepath: /home/ian/js/laughing-with-you/scripts/run-als-diagnostics.sh

echo "=== Running ALS Diagnostics ==="
echo ""

echo "=== 1. Running with Jest (default - isolated processes) ==="
NODE_OPTIONS="--no-warnings" npx jest test/als-diagnostics.test.js --verbose

echo ""
echo "=== 2. Running with Jest (runInBand - sequential in single process) ==="
NODE_OPTIONS="--no-warnings" npx jest test/als-diagnostics.test.js --runInBand --verbose

echo ""
echo "=== 3. Running with Vitest ==="
npx vitest run test/als-diagnostics.test.js --no-threads

echo ""
echo "=== ALS Diagnostics Complete ==="
