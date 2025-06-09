# CI Environment Testing Tools (Node.js 18+)

This directory contains tools for simulating CI environments and diagnosing issues that appear only in CI.
All tools are designed for Node.js 18 and above.

## CI Simulation Scripts

- **simple-ci.sh**: Primary CI simulation tool (recommended for everyday use)
- **docker-ci.sh**: Runs tests in an isolated Docker container for full environment isolation
- **debug-problem-tests.sh**: Runs problematic tests with verbose debugging enabled

## AsyncLocalStorage Diagnostic Tools

- **als-ci-diagnostics.js**: Diagnoses AsyncLocalStorage behavior differences
- **als-initialization-trace.js**: Traces AsyncLocalStorage instantiation across modules
- **als-patch.js**: Patches AsyncLocalStorage for better cross-environment compatibility
- **als-debug-patch.js**: Enhanced debugging for AsyncLocalStorage operations

## Usage

```bash
# Basic CI simulation with your local Node.js
npm run test:ci

# Run problematic tests with verbose debugging
npm run test:problem-tests

# Test with Node.js 16 in Docker
npm run test:node16

# Full Docker simulation (most accurate)
npm run test:docker

# Run AsyncLocalStorage diagnostics
npm run test:als-diagnostics

# Trace AsyncLocalStorage initialization
node scripts/als-initialization-trace.js
```

## Configuration Files

- **jest.config.ci.cjs**: Jest configuration optimized for CI environments
- **setup-jest-ci.js**: Special setup file for CI environments

## Documentation

For detailed information on simulating CI environments, see [CI-SIMULATION.md](../docs/CI-SIMULATION.md).
