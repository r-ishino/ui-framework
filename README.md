# Sample UI Framework

A collection of reusable React components and utilities for internal applications.

## 📦 Packages

This monorepo contains the following packages:

- **[@sample/util](./packages/util)** - Framework-agnostic utility functions
- **[@sample/ui](./packages/ui)** - Reusable React UI components
- **[@sample/nextjs](./packages/nextjs)** - Next.js specific components and utilities
- **[sample-demo](./apps/demo)** - Demo application

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install dependencies
pnpm install
```

### Development

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint

# Format code
pnpm format

# Start demo app
cd apps/demo
pnpm dev
```

## 📚 Documentation

See [docs](./docs) for detailed documentation:

- [Overview](./docs/00-overview.md) - Project overview and architecture
- [Tasks](./docs/01-tasks.md) - Implementation tasks and roadmap
- [Release Strategy](./docs/02-release-strategy.md) - Release management with Changesets
- [pnpm vs Turbo](./docs/03-pnpm-vs-turbo.md) - Tool comparison and usage

## 🔧 Tech Stack

- **Language**: TypeScript (strict mode)
- **UI Library**: React 19
- **Framework**: Next.js 16 (demo app only)
- **Package Manager**: pnpm
- **Build Tool**: Turbo + tsup
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier
- **Styling**: linaria (CSS-in-JS)
- **Documentation**: Storybook 8 (@sample/ui only)
- **Version Management**: Changesets

## 📖 Usage

### Installing Packages

```bash
# Install in your Next.js project
pnpm add @sample/ui @sample/nextjs @sample/util
```

### Using Components

```tsx
import { Button } from '@sample/ui';
import { OptimizedImage } from '@sample/nextjs';
import { formatDate } from '@sample/util';

export default function MyPage() {
  return (
    <div>
      <Button>Click me</Button>
      <OptimizedImage src="/image.jpg" alt="Example" />
      <p>{formatDate(new Date())}</p>
    </div>
  );
}
```

## 🛠️ Development Workflow

### Adding a New Feature

1. Create a feature branch
   ```bash
   git checkout -b feature/new-component
   ```

2. Implement your changes

3. Add a changeset
   ```bash
   pnpm changeset
   ```

4. Commit and push
   ```bash
   git add .
   git commit -m "feat: add new component"
   git push origin feature/new-component
   ```

5. Create a pull request

### Releasing

Releases are automated via Changesets:

1. When PRs with changesets are merged, a "Version Packages" PR is automatically created
2. Review the PR to verify versions and CHANGELOG
3. Merge the "Version Packages" PR to publish to GitHub Packages

## 🏗️ Project Structure

```
.
├── apps/
│   └── demo/              # Demo Next.js application
├── packages/
│   ├── ui/                # UI components
│   ├── nextjs/            # Next.js utilities
│   └── util/              # Utility functions
├── docs/                  # Documentation
├── .changeset/            # Changesets configuration
├── turbo.json             # Turbo configuration
├── pnpm-workspace.yaml    # pnpm workspace configuration
└── package.json           # Root package configuration
```

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before contributing.

### Code Style

- Follow the ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

[MIT](./LICENSE)

## 🔗 Links

- [GitHub Repository](https://github.com/YOUR-ORG/ui-framework)
- [GitHub Packages](https://github.com/YOUR-ORG/ui-framework/packages)
- [Issue Tracker](https://github.com/YOUR-ORG/ui-framework/issues)
