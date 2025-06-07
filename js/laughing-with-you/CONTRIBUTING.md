# Contributing to laughing-with-you

Thank you for your interest in contributing to this project! Here are some guidelines to help you get started.

## Getting Started

1. **Fork the Repository**: Start by forking the repository on GitHub.

2. **Clone Your Fork**: 
   ```bash
   git clone git@github.com:YOUR_USERNAME/laughing-with-you.git
   cd laughing-with-you
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run Tests**:
   ```bash
   npm test
   ```

## Development Workflow

1. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**: Implement your feature or bug fix.

3. **Write Tests**: Add tests that cover your changes.

4. **Run Tests**: Make sure all tests pass.
   ```bash
   npm test
   ```

5. **Commit Your Changes**:
   ```bash
   git commit -m "Add feature: your feature name"
   ```

6. **Push to GitHub**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**: Go to the repository on GitHub and create a pull request from your fork.

## Code Style

- Use standard JavaScript style.
- Follow the existing code patterns.
- Add JSDoc comments to all public functions.

## Project Structure

- `src/`: Source code
  - `jest/`: Jest-specific wrappers
  - `vite/`: Vitest-specific wrappers
- `examples/`: Example usage
- `test/`: Test files
- `scripts/`: Build scripts

## Testing

This project uses Vitest for testing. Run tests with:

```bash
npm test
```

For test coverage:

```bash
npm run test:coverage
```

## Pull Request Guidelines

- Keep your changes focused on a single feature or bug fix.
- Write descriptive commit messages.
- Include tests that cover your changes.
- Update documentation if necessary.
- Make sure all tests pass before submitting.

## License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT license.
