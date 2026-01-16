# Husky Git Hooks

This directory contains Git hooks managed by [Husky](https://typicode.github.io/husky/).

## Pre-Commit Hook

The `pre-commit` hook runs automatically before each commit and:

1. Runs **lint-staged** to check staged files
2. Executes **ESLint** on staged JavaScript files
3. Runs **Prettier** on staged Markdown files (if configured)
4. **Blocks the commit** if any errors are found

## Setup

After cloning the repository, run:

```bash
npm install
```

This will:

- Install all dependencies
- Set up Husky hooks automatically

## Manual Setup

If the hooks are not installed automatically, run:

```bash
npm run prepare
```

## Bypassing Hooks (Not Recommended)

In exceptional cases, you can bypass the pre-commit hook:

```bash
git commit --no-verify
```

**Warning:** Only use this when absolutely necessary, as it skips quality checks.
