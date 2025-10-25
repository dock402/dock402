# Contributing to Dock402

Thank you for your interest in contributing to Dock402! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/dock402.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `pnpm install`

## Development Workflow

### Running Tests

```bash
pnpm test
```

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
pnpm lint:fix
```

### Building

```bash
pnpm build
```

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Run `pnpm format` before committing
- Ensure all tests pass
- Add tests for new features

## Commit Messages

Use clear and descriptive commit messages:

```
feat: add solana support
fix: resolve payment verification issue
docs: update quickstart guide
test: add tests for payment handler
```

## Pull Request Process

1. Update documentation for any changes
2. Add tests for new features
3. Ensure all tests pass
4. Update the README if needed
5. Create a pull request with a clear description

## Adding Support for New Chains

When adding support for a new blockchain:

1. Add the network type to `src/types/x402-protocol.ts`
2. Create chain-specific types if needed
3. Update transaction builder in `src/client/`
4. Add payment handler logic in `src/server/`
5. Update documentation
6. Add tests

## Reporting Issues

- Use GitHub Issues
- Provide a clear description
- Include reproduction steps
- Add relevant logs or screenshots

## Questions?

- Twitter: [@dock402](https://x.com/dock402)
- GitHub Discussions: [github.com/dock402/dock402/discussions](https://github.com/dock402/dock402/discussions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

