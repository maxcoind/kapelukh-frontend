# AGENTS.md

This file provides guidance for agentic coding tools working in this repository.

## Project Overview

React frontend built with Vite, TypeScript, TanStack Router, TanStack Query, and Shadcn UI. Uses Tailwind CSS for styling.

## Build/Lint/Test Commands

```bash
# Development
pnpm dev                    # Start dev server on port 3000
pnpm build                  # Build for production + tsc typecheck
pnpm preview                # Preview production build

# Testing
pnpm test                   # Run all tests with Vitest
pnpm test <pattern>         # Run tests matching pattern (e.g., pnpm test Button)

# Linting & Formatting
pnpm lint                   # Run ESLint
pnpm format                 # Run Prettier (dry run)
pnpm check                  # Run prettier --write . && eslint --fix
```

## Code Style Guidelines

### Formatting

- No semicolons (semi: false)
- Single quotes (singleQuote: true)
- Trailing commas (trailingComma: 'all')
- Run `pnpm check` before committing to auto-format

### Imports

```tsx
// External libraries first
import React from 'react'
import { useQuery } from '@tanstack/react-query'

// Internal imports using @/ alias
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
```

### TypeScript

- Strict mode enabled
- Use proper types for all props
- Define types in separate .types.ts files when complex
- Use Type guards: `isApiError(error)` instead of `instanceof ApiError` when needed

### Component Structure

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/path')({
  component: ComponentName,
})

function ComponentName() {
  // Component implementation
  return <div>...</div>
}
```

### Naming Conventions

- Components: PascalCase (e.g., `UserProfile`, `PaymentModal`)
- Functions/variables: camelCase (e.g., `fetchUser`, `isLoading`)
- Hooks: camelCase with 'use' prefix (e.g., `useAuth`, `useWebSocket`)
- Constants: UPPER_SNAKE_CASE (e.g., `BASE_URL`)
- Types: PascalCase (e.g., `UserResponse`, `PaymentCreate`)
- Interfaces: PascalCase with 'Context' suffix for contexts (e.g., `AuthContextType`)

### Error Handling

```tsx
// Use custom ApiError class
import { isApiError } from '@/lib/api/errors'

try {
  await someApiCall()
} catch (err) {
  if (isApiError(err) && err.status === 401) {
    // Handle 401
  } else {
    setError(err instanceof Error ? err.message : 'Unknown error')
  }
}
```

### API Layer

```tsx
// Centralized request function in each API module
const BASE_URL = 'http://localhost:8000'

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  // Handles auth headers, error throwing, JSON parsing
}
```

### Data Fetching (TanStack Query)

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['payments', filters],
  queryFn: () => listPayments(filters),
})

const mutation = useMutation({
  mutationFn: createPayment,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['payments'] })
  },
})
```

### Styling

- Use Tailwind CSS classes
- Use `cn()` utility for className merging (from `@/lib/utils`)
- Prefer Tailwind over inline styles
- Use responsive prefixes (md:, lg:) for responsive design

### Forms

- Controlled components with useState
- Use async/await for form submission
- Show loading states and error messages
- Prevent default form submission

```tsx
const [value, setValue] = useState('')

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setIsLoading(true)
  try {
    await submitData(value)
  } finally {
    setIsLoading(false)
  }
}
```

### Contexts

```tsx
// Create context with proper typing
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Export custom hook with error checking
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### Shadcn Components

Add components using the latest shadcn version:

```bash
pnpm dlx shadcn@latest add button
```

UI components are in `src/components/ui/` - use these when available instead of building from scratch.

### File Organization

```
src/
├── components/          # Reusable components
│   ├── ui/             # Shadcn UI components
│   └── data-table/     # Feature-specific components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utilities and helpers
│   ├── api/           # API modules and types
│   └── utils.ts       # cn() utility
├── routes/             # File-based routes
└── styles.css          # Global styles
```

### Type Files

- API types: `src/lib/api/{module}.types.ts`
- Import and use types from these files
- Don't duplicate type definitions

### WebSocket

- Use WebSocketContext for real-time updates
- Subscribe to events with `onPaymentEvent(callback)` pattern
- Return unsubscribe function from useEffect

## Testing

This project uses Vitest. Currently no test files exist - add tests as you develop:

- Test files: `*.test.ts` or `*.test.tsx`
- Run single test: `pnpm test ComponentName`
- Use @testing-library/react for component testing
