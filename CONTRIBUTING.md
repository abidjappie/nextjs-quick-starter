# Contributing to Next.js Quick Starter

Thank you for your interest in contributing! This document provides guidelines and best practices for contributing to this project.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Run tests and linting: `biome check --write`
7. Commit your changes: `git commit -m "feat: your feature description"`
8. Push to your fork: `git push origin feature/your-feature-name`
9. Open a Pull Request

## 📋 Prerequisites

- Node.js 24 LTS
- pnpm (required package manager)
- Basic understanding of Next.js, React, and TypeScript

## 🎯 Development Guidelines

### Code Style

- **Package Manager**: Always use `pnpm`, never `npm` or `yarn`
- **Formatting**: Use Biome (tabs, double quotes)
- **TypeScript**: Enable strict mode, avoid `any` types
- **Comments**: Write clear JSDoc comments for functions

## 🧪 Testing

- Write unit tests for utility functions
- Test Zod schemas with valid and invalid inputs
- Test server actions with validation
- Test API routes thoroughly

## 📝 Commit Messages

Follow the Conventional Commits specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add user authentication with Zod validation
fix: resolve database connection timeout
docs: update README with new environment variables
```

## 🔍 Code Review

Your PR will be reviewed for:

- Code quality and style (Biome checks)
- TypeScript type safety
- Following project conventions
- Clear and descriptive commit messages
- Documentation updates if needed

## 🐛 Reporting Issues

When reporting issues, please include:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, OS, etc.)
- Relevant code snippets or error messages

## 💡 Feature Requests

We welcome feature requests! Please:

- Check if the feature already exists or is planned
- Describe the feature and its benefits
- Provide examples or use cases
- Consider implementation details

## 🙏 Thank You

Thank you for contributing to Next.js Quick Starter! Your efforts help make this project better for everyone.

