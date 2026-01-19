# TanStack Store Usage

## Create a Store

```ts
import { Store, Derived } from '@tanstack/store'

export const store = new Store({
  firstName: 'Jane',
  lastName: 'Smith',
})
```

## Create Derived State

```ts
export const fullName = new Derived({
  fn: () => `${store.state.firstName} ${store.state.lastName}`,
  deps: [store],
})

fullName.mount()
```

## Use in Components

```tsx
import { useStore } from '@tanstack/react-store'

// Read specific state
const firstName = useStore(store, (state) => state.firstName)

// Update state
store.setState((state) => ({ ...state, firstName: e.target.value }))

// Read derived state
const fName = useStore(fullName)
```

## Key Points

- `useStore(store, selector)` - subscribe to specific slice
- `store.setState(updater)` - update state (async batch updates)
- `Derived` - computed values that auto-update when deps change
- Call `.mount()` on derived stores to start tracking
