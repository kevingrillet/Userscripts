# Contributing Guidelines

## Language Requirements

**All code and documentation files must be written in English.**

This includes:

- All JavaScript files (`.js`)
- All Markdown files (`.md`)
- Code comments
- Commit messages
- Documentation

## Code Standards

### Markdown Files

All Markdown files must comply with **markdownlint** rules.

- Use proper heading hierarchy
- Ensure consistent formatting
- Include blank lines where required
- Follow standard Markdown syntax

### JavaScript Files in `user.js/`

All userscripts in the `user.js/` directory must:

- Follow **ESLint** rules as much as possible
- Remain compatible with **Tampermonkey**
- Follow the header structure defined in [user.js/INSTRUCTIONS.md](user.js/INSTRUCTIONS.md)
- Be synchronized with the main `README.md`

The ESLint configuration is defined in [eslint.config.js](eslint.config.js) and is optimized for Tampermonkey compatibility.

#### ESLint Compliance

Run ESLint before committing:

```bash
npm run lint
```

or

```bash
npx eslint .
```

### Files in `lab/`

The `lab/` directory contains prototypes and experimental code. While more flexibility is allowed:

- **Strive to follow** the same coding standards
- Include a `README.md` explaining the purpose of the script/project
- Code should still be readable and maintainable
- Use English for all code and documentation

## Pre-Commit Hook

This repository uses a pre-commit hook to ensure code quality. Before each commit:

- **ESLint** runs automatically on staged JavaScript files
- Commits will be **blocked** if ESLint errors are found
- Fix all errors before committing

### Bypassing the Hook (Not Recommended)

In exceptional cases, you can bypass the pre-commit hook:

```bash
git commit --no-verify
```

**Note:** Only use this when absolutely necessary, as it bypasses quality checks.

## Workflow

1. Make your changes
2. Run linting tools:

    ```bash
    npm run lint
    ```

3. Fix any errors
4. Commit your changes
5. The pre-commit hook will run automatically
6. If successful, your commit will proceed

## Tools Installation

Make sure you have the required dependencies installed:

```bash
npm install
```

This will install:

- ESLint
- All necessary ESLint plugins and configurations

## Best Practices

1. **Write clean code**: Follow JavaScript best practices
2. **Comment your code**: Explain complex logic
3. **Test your scripts**: Ensure they work in Tampermonkey before committing
4. **Update documentation**: Keep README files up to date
5. **Use semantic versioning**: Increment version numbers appropriately
6. **Commit atomically**: Make small, focused commits

## Questions?

If you have questions about these guidelines, please open an issue on GitHub.
