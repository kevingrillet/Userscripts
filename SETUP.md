# Setup Instructions

## Initial Setup

After cloning this repository, follow these steps:

### 1. Install Dependencies

```bash
npm install
```

This will install:

- ESLint for JavaScript linting
- Markdownlint for Markdown linting
- Husky for Git hooks
- Lint-staged for running linters on staged files

### 2. Verify Setup

Run the linters to make sure everything is working:

```bash
npm run lint
```

### 3. Test Pre-Commit Hook

The pre-commit hook should now be active. Try making a commit to verify it works.

## Available Commands

### Linting

```bash
# Run all linters
npm run lint

# Run JavaScript linter only
npm run lint:js

# Run Markdown linter only
npm run lint:md

# Auto-fix all issues
npm run lint:fix

# Auto-fix JavaScript issues
npm run lint:js:fix

# Auto-fix Markdown issues
npm run lint:md:fix
```

## Troubleshooting

### Hooks Not Running

If the pre-commit hook doesn't run automatically:

```bash
npm run prepare
```

### Permission Issues (Unix/Mac)

If you get permission errors on Unix/Mac:

```bash
chmod +x .husky/pre-commit
```

### Fresh Install

To completely reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

## More Information

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contributing guidelines.
