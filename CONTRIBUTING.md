# Contributing to Sample UI Framework

Thank you for your interest in contributing to the Sample UI Framework!

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Getting Started

1. Clone the repository

   ```bash
   git clone https://github.com/YOUR-ORG/ui-framework.git
   cd ui-framework
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Build all packages

   ```bash
   pnpm build
   ```

4. Run tests
   ```bash
   pnpm test
   ```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:

- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Test additions or updates

### 2. Make Your Changes

- Write clear, concise code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Run Quality Checks

```bash
# Format code
pnpm format

# Lint
pnpm lint

# Type check
pnpm type-check

# Test
pnpm test
```

### 4. Add a Changeset

If your changes affect the public API:

```bash
pnpm changeset
```

Follow the prompts to:

1. Select which packages are affected
2. Choose the version bump type (major/minor/patch)
3. Write a clear description of the changes

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add new button variant"
```

Commit message format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions or updates
- `chore:` - Maintenance tasks

### 6. Push and Create a Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Code Style Guidelines

### TypeScript

- Use strict TypeScript settings
- Avoid `any` - use proper types
- Use `type` for object types, `interface` for extendable contracts
- Prefer `const` over `let`, avoid `var`

### React

- Use functional components with hooks
- Use descriptive component and prop names
- Keep components small and focused
- Extract reusable logic into custom hooks

### Testing

- Write tests for all new features
- Aim for >80% code coverage
- Use descriptive test names
- Test edge cases and error conditions

### Documentation

- Add JSDoc comments for public APIs
- Update README files when adding new features
- Create Storybook stories for UI components
- Keep examples up to date

## Package-Specific Guidelines

### @sample/util

- Keep functions pure and side-effect free
- Add comprehensive unit tests
- Document all parameters and return types

### @sample/ui

- Follow accessibility best practices (ARIA, keyboard navigation)
- Create Storybook stories for each component
- Test with React Testing Library
- Consider responsive design

### @sample/nextjs

- Optimize for Next.js App Router
- Use Next.js built-in optimizations
- Test with Next.js environment

## Pull Request Process

1. **Create PR**: Open a pull request with a clear title and description
2. **CI Checks**: Ensure all CI checks pass
3. **Code Review**: Wait for review from maintainers
4. **Address Feedback**: Make requested changes if any
5. **Merge**: Once approved, maintainers will merge your PR

## Release Process

Releases are automated:

1. PRs with changesets are merged to `main`
2. Changesets bot creates a "Version Packages" PR
3. Maintainers review and merge the version PR
4. Packages are automatically published to GitHub Packages

## Questions?

If you have questions, please:

- Check the [documentation](./docs)
- Open an [issue](https://github.com/YOUR-ORG/ui-framework/issues)
- Ask in pull request comments

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers
- Focus on the code, not the person
- Follow the project's guidelines

Thank you for contributing!
