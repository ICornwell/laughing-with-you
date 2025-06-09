# CI Testing Quick Reference (Node.js 18+)

## Common Commands

```bash
# Recommended CI simulation approach
npm run test:ci:simple

# AsyncLocalStorage debugging
npm run test:als-debug

# Docker-based simulation (for full isolation)
npm run test:docker

# Problem test debugging
npm run test:problem-tests

# AsyncLocalStorage diagnostics
npm run test:als-diagnostics
npm run test:als-trace

# CI-specific Jest config
npm run test:jest:ci-config
```

## AsyncLocalStorage Troubleshooting

1. **Initialization**:
   ```javascript
   if (!global.__appAls) {
     global.__appAls = new AsyncLocalStorage();
   }
   ```

2. **Robust store creation**:
   ```javascript
   try {
     als.enterWith(new Map([['key', 'value']]));
   } catch (e) {
     als.enterWith({ key: 'value' });
   }
   ```

3. **Get dependencies safely**:
   ```javascript
   const store = als.getStore();
   if (store instanceof Map) {
     return store.get('dependencies') || {};
   } else {
     return store?.dependencies || {};
   }
   ```

## CI vs. Local Differences

- **Node.js**: CI may use older Node.js versions
- **Read-only objects**: More properties are read-only in CI
- **Parallel execution**: Tests run in parallel in CI
- **Timeouts**: CI can be slower, requiring longer timeouts
- **Environment vars**: CI has different environment variables

## Recommended Patterns

- Use `runWithLocalDeps` with try/catch
- Add fallback mechanisms for ALS operations
- Use test wrappers (`itWithLocalDeps`, etc.)
- Clean up after tests
- Use robust-als.js utilities for maximum compatibility
