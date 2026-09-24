# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cookmark is a recipe book web application built with SolidJS/SolidStart. It features internationalization (English/Slovak), fuzzy search, advanced filtering, and mobile-responsive design. The app is deployed as a static site to GitHub Pages.

## Essential Commands

### Development
```bash
pnpm dev          # Start dev server (http://localhost:3000)
pnpm dev:sk       # Start dev server with Slovak locale
pnpm build        # Build for production (all locales)
```

### Testing & Quality
```bash
pnpm test         # Run all tests
pnpm test:ui      # Run tests with UI
pnpm test:watch   # Run tests in watch mode
pnpm lint         # Run Biome linter/formatter
pnpm lint:fix     # Auto-fix linting issues
pnpm typecheck    # Run TypeScript type checking
```

## Architecture

### Key Patterns

1. **Internationalization**: Uses custom i18n system with type-safe translations
   - Translations in `src/lib/i18n/translations/`
   - Locale detection and switching via `LocaleProvider`
   - Build-time locale separation for optimized bundles

2. **Search & Filtering**: 
   - Fuzzy search using Fuse.js with weighted fields
   - Multi-criteria filtering (difficulty, time, tags)
   - Reactive filtering with SolidJS signals

3. **Component Architecture**:
   - Functional components with TypeScript
   - CSS Modules for scoped styling
   - Comprehensive test coverage with Vitest

## Testing Approach

- Unit tests for utilities and business logic
- Component tests using SolidJS Testing Library
- Test files co-located with components (`.test.tsx`)

### Core Principles
- **Prioritize readability over performance** - Focus on clean, easy-to-understand code
- **Complete implementation** - NO todos, placeholders, or missing pieces
- **Be honest about limitations** - If uncertain or don't know something, say so explicitly

#### General Code Quality
- **NO Object-Oriented Programming**: Avoid classes, inheritance, and OOP patterns. Always prefer functions and composition over classes and inheritance
- **Functional programming principles**: Use pure functions, immutable data structures, and function composition
- **Types instead interfaces**: Whenever possible use types instead of interfaces
- **Early returns**: Use early returns to reduce nesting and improve readability
- **Descriptive naming**: Use clear, self-documenting variable and function names
- **Event handlers**: Prefix with "handle" (e.g., `handleClick`, `handleKeyDown`)
- **Function declarations**: Use `const` arrow functions with explicit return types when possible
  ```typescript
  const calculateTotal = (items: ReadonlyArray<Item>): number => {
    // implementation
  }
  ```
**IMPORTANT: After completing any coding task, you MUST run the following command to ensure code quality:**

```bash
pnpm biome:check:fix       # Fix formatting and linting issues automatically
pnpm typecheck
```

Only mark tasks as complete after these checks pass successfully.