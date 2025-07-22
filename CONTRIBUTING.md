# Contributing to LukAI

Thank you for your interest in contributing to LukAI! We welcome contributions from the community and are excited to work with you.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- PostgreSQL (for backend development)

### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/lukai.git
   cd lukai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   cp apps/backend/.env.example apps/backend/.env.local
   cp apps/mobile/.env.example apps/mobile/.env.local
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## Project Structure

LukAI is organized as a monorepo with the following structure:

- `apps/` - Applications (web, mobile, backend)
- `packages/` - Shared packages (ui, types, config)
- `ee/` - Enterprise features (commercial license)
- `docs/` - Documentation

## How to Contribute

### Reporting Issues

1. Check if the issue already exists in our [GitHub Issues](https://github.com/lukai/lukai/issues)
2. Use our issue templates when creating new issues
3. Provide clear reproduction steps for bugs
4. Include relevant environment information

### Suggesting Features

1. Check our [roadmap](https://github.com/lukai/lukai/projects) first
2. Open a feature request issue
3. Discuss the feature with maintainers before implementing
4. Consider if the feature belongs in the open-source core or enterprise edition

### Pull Requests

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow our coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```

4. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing new feature"
   ```
   
   Follow [Conventional Commits](https://conventionalcommits.org/) format:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Coding Standards

### General Guidelines

- Write clear, readable code
- Add comments for complex logic
- Follow existing code patterns
- Keep functions small and focused
- Use TypeScript for type safety

### Code Style

We use Prettier for code formatting and ESLint for linting:

```bash
npm run format  # Format code
npm run lint    # Check for linting errors
```

### Testing

- Write tests for new features
- Update tests when modifying existing code
- Aim for good test coverage
- Use descriptive test names

```bash
npm run test           # Run all tests
npm run test -- --watch # Run tests in watch mode
```

## License Boundaries

**Important**: LukAI uses a dual licensing model:

### Open Source (AGPLv3)
- All code outside `/ee` directory
- Contributions to core features
- Bug fixes and improvements

### Commercial License
- Code in `/ee` directory
- Enterprise-only features
- Requires commercial license agreement

**Do not**:
- Add enterprise features to the open-source core
- Import commercial code into AGPLv3 code
- Mix license boundaries

## Documentation

- Update README.md for significant changes
- Add JSDoc comments for public APIs
- Update type definitions when needed
- Create examples for new features

## Review Process

1. **Automated Checks**: All PRs must pass CI/CD checks
2. **Code Review**: Maintainers will review your code
3. **Testing**: Ensure all tests pass
4. **Documentation**: Verify documentation is updated

## Getting Help

- **Discord**: Join our community at [discord.gg/lukai](https://discord.gg/lukai)
- **Discussions**: Use [GitHub Discussions](https://github.com/lukai/lukai/discussions)
- **Email**: Reach out to contributors@lukai.com

## Recognition

We value all contributions! Contributors will be:
- Listed in our README
- Mentioned in release notes
- Invited to our contributor Discord channel

## Development Tips

### Working with the Monorepo

- Use `npm run dev` to start all services
- Each app has its own development server
- Shared packages are automatically linked
- Changes to packages trigger rebuilds

### Debugging

- Use browser dev tools for frontend issues
- Use VS Code debugger for backend issues
- Check logs in the terminal when running `npm run dev`

### Performance

- Use React DevTools for frontend performance
- Monitor backend API response times
- Consider mobile performance for React Native changes

## Frequently Asked Questions

**Q: How do I add a new shared package?**
A: Use `npx turbo gen workspace --name @lukai/package-name`

**Q: Can I contribute enterprise features?**
A: Enterprise features require a commercial license agreement. Contact us first.

**Q: How do I report security issues?**
A: Email security@lukai.com with security-related issues.

**Q: What if my PR is rejected?**
A: Don't worry! We'll provide feedback. You can always iterate and resubmit.

---

Thank you for contributing to LukAI! Together, we're building the future of AI-powered scheduling. 🚀 