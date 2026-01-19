# Adding a New Model with Table

This guide explains how to add a new model with a CRUD table to the frontend, following the payments table pattern.

## Overview

Each model requires:

1. **Types file** (`src/lib/api/{model}.types.ts`) - TypeScript/Zod schemas
2. **API functions** (`src/lib/api/{model}.ts`) - CRUD operations
3. **Route component** (`src/routes/{model}.tsx`) - Table UI and interactions
4. **WebSocket integration** (optional) - Real-time updates

---

## Step 1: Define Types

Create `src/lib/api/{model}.types.ts`:

```ts
import { z } from 'zod'

// Schema for creating new records
export const ModelCreateSchema = z.object({
  field1: z.string().min(1),
  field2: z.number().positive(),
  field3: z.string().datetime().optional(),
})

// Schema for updating existing records (all fields optional)
export const ModelUpdateSchema = z.object({
  field1: z.string().min(1).optional(),
  field2: z.number().positive().optional(),
  field3: z.string().datetime().optional(),
})

// Schema for reading records from API (includes id)
export const ModelReadSchema = z.object({
  id: z.number(),
  field1: z.string(),
  field2: z.number(),
  field3: z.string().nullable().optional(),
})

// Export inferred TypeScript types
export type ModelCreate = z.infer<typeof ModelCreateSchema>
export type ModelUpdate = z.infer<typeof ModelUpdateSchema>
export type ModelRead = z.infer<typeof ModelReadSchema>
```

---

## Step 2: Create API Module

Create `src/lib/api/{model}.ts`:

```ts
import { ApiError } from './errors'
import type { ModelCreate, ModelRead, ModelUpdate } from './{model}.types'

const BASE_URL = 'http://localhost:8000'

// Centralized request function
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('access_token')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: 'Unknown error' }))
    throw new ApiError(
      error.detail || `HTTP error! status: ${response.status}`,
      response.status,
      error,
    )
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

// List with filters, sorting, and pagination
export async function listModels(
  skip: number = 0,
  limit: number = 100,
  filters?: {
    field1?: string
    field2?: number
    date_from?: string
    date_to?: string
  },
  sort?: {
    by?: 'field1' | 'field2' | 'date'
    order?: 'asc' | 'desc'
  },
): Promise<Array<ModelRead>> {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  })

  if (filters?.field1) {
    params.append('field1', filters.field1)
  }
  if (filters?.field2 !== undefined) {
    params.append('field2', filters.field2.toString())
  }
  if (filters?.date_from) {
    params.append('date_from', filters.date_from)
  }
  if (filters?.date_to) {
    params.append('date_to', filters.date_to)
  }
  if (sort?.by) {
    params.append('sort_by', sort.by)
    params.append('sort_order', sort.order || 'asc')
  }

  return request<Array<ModelRead>>(`/api/v1/models/?${params.toString()}`)
}

// Get single record by ID
export async function getModel(id: number): Promise<ModelRead> {
  return request<ModelRead>(`/api/v1/models/${id}`)
}

// Create new record
export async function createModel(data: ModelCreate): Promise<ModelRead> {
  return request<ModelRead>('/api/v1/models/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Update existing record
export async function updateModel(
  id: number,
  data: ModelUpdate,
): Promise<ModelRead> {
  return request<ModelRead>(`/api/v1/models/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// Delete record
export async function deleteModel(id: number): Promise<void> {
  await request<void>(`/api/v1/models/${id}`, {
    method: 'DELETE',
  })
}
```

---

## Step 3: Create Route Component

Create `src/routes/{model}.tsx`:

```ts
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDown, ChevronUp, ChevronsUpDown, Edit, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isApiError } from '../lib/api/errors'
import { createModel, deleteModel, listModels, updateModel } from '../lib/api/{model}'
import type { ModelCreate, ModelRead } from '../lib/api/{model}.types'

export const Route = createFileRoute('/{model}')({
  component: ModelName,
})

const columnHelper = createColumnHelper<ModelRead>()

function ModelName() {
  const router = useRouter()
  const { logout, refreshToken } = useAuth()
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingModel, setEditingModel] = useState<ModelRead | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  // Filters state
  const [filters, setFilters] = useState({
    field1: '',
    field2: '',
    date_from: '',
    date_to: '',
  })

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(100)

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    by: 'field1' | 'field2' | 'date' | null
    order: 'asc' | 'desc'
  }>({
    by: null,
    order: 'asc',
  })

  // Fetch data with TanStack Query
  const {
    data: models = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['models', filters, sortConfig, pageIndex, pageSize],
    queryFn: async () => {
      try {
        return await listModels(
          pageIndex * pageSize,
          pageSize,
          {
            field1: filters.field1 || undefined,
            field2: filters.field2 ? parseInt(filters.field2) : undefined,
            date_from: filters.date_from
              ? new Date(filters.date_from).toISOString()
              : undefined,
            date_to: filters.date_to
              ? new Date(filters.date_to).toISOString()
              : undefined,
          },
          sortConfig.by
            ? {
                by: sortConfig.by,
                order: sortConfig.order,
              }
            : undefined,
        )
      } catch (err) {
        // Handle token refresh on 401
        if (isApiError(err) && err.status === 401) {
          const refreshed = await refreshToken()
          if (refreshed) {
            return await listModels(
              pageIndex * pageSize,
              pageSize,
              {
                field1: filters.field1 || undefined,
                field2: filters.field2 ? parseInt(filters.field2) : undefined,
                date_from: filters.date_from
                  ? new Date(filters.date_from).toISOString()
                  : undefined,
                date_to: filters.date_to
                  ? new Date(filters.date_to).toISOString()
                  : undefined,
              },
              sortConfig.by
                ? {
                    by: sortConfig.by,
                    order: sortConfig.order,
                  }
                : undefined,
            )
          } else {
            logout()
            router.navigate({ to: '/login' })
          }
        }
        throw err
      }
    },
  })

  // Mutations for CRUD operations
  const createMutation = useMutation({
    mutationFn: createModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] })
      setShowCreateModal(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ModelCreate }) =>
      updateModel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] })
      setEditingModel(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] })
      setEditingModel(null)
      setShowDeleteConfirmation(false)
    },
  })

  // Table columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => (
          <button
            type="button"
            onClick={() => setEditingModel(info.row.original)}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            {info.getValue()}
          </button>
        ),
      }),
      columnHelper.accessor('field1', {
        header: () => (
          <button
            type="button"
            onClick={() =>
              setSortConfig((prev) => ({
                by: 'field1',
                order:
                  prev.by === 'field1'
                    ? prev.order === 'asc'
                      ? 'desc'
                      : 'asc'
                    : 'asc',
              }))
            }
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 transition-colors select-none"
          >
            Field 1
            {sortConfig.by === 'field1' ? (
              sortConfig.order === 'asc' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
        ),
      }),
      // Add more columns as needed
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <button
            type="button"
            onClick={() => setEditingModel(info.row.original)}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Edit className="h-5 w-5" />
          </button>
        ),
      }),
    ],
    [sortConfig],
  )

  const table = useReactTable({
    data: models,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Error state
  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error loading models'
    if (isApiError(error) && error.status === 401) {
      logout()
      router.navigate({ to: '/login' })
      return null
    }
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-md">
          {errorMessage}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Filters */}
        <div className="mb-4 bg-gray-800 p-3 rounded-lg border border-gray-700">
          <div className="flex flex-wrap items-end gap-2">
            <input
              type="text"
              placeholder="Filter by field1"
              value={filters.field1}
              onChange={(e) =>
                setFilters({ ...filters, field1: e.target.value })
              }
              className="px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
            />
            {/* Add more filter inputs */}
            <button
              type="button"
              onClick={() => setFilters({ field1: '', field2: '', date_from: '', date_to: '' })}
              className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1.5 rounded-md"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-sm text-gray-200">
            <thead className="bg-gray-800 text-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-700">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-800">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {models.length === 0 && (
            <div className="p-8 text-center text-gray-400">No records found</div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPageIndex(0)
            }}
            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={pageIndex === 0}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm rounded-md"
            >
              Previous
            </button>
            <span className="text-sm text-gray-300">Page {pageIndex + 1}</span>
            <button
              type="button"
              onClick={() => setPageIndex((p) => p + 1)}
              disabled={models.length < pageSize}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm rounded-md"
            >
              Next
            </button>
          </div>
        </div>

        {/* Add button */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Model
          </button>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <ModelModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      )}

      {editingModel && (
        <ModelModal
          model={editingModel}
          onClose={() => setEditingModel(null)}
          onSubmit={(data) =>
            updateMutation.mutate({ id: editingModel.id, data })
          }
          onDelete={() => setShowDeleteConfirmation(true)}
          isLoading={updateMutation.isPending}
          isDeleting={deleteMutation.isPending}
        />
      )}

      {showDeleteConfirmation && editingModel && (
        <DeleteConfirmationModal
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={() => {
            deleteMutation.mutate(editingModel.id)
            setShowDeleteConfirmation(false)
          }}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  )
}

// Modal component for create/edit
function ModelModal({
  model,
  onClose,
  onSubmit,
  onDelete,
  isLoading,
  isDeleting,
}: {
  model?: ModelRead
  onClose: () => void
  onSubmit: (data: ModelCreate) => void
  onDelete?: () => void
  isLoading: boolean
  isDeleting?: boolean
}) {
  const [field1, setField1] = useState(model?.field1 || '')
  const [field2, setField2] = useState(model?.field2?.toString() || '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      field1,
      field2: field2 ? parseFloat(field2) : 0,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full relative">
        {model && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="absolute top-4 right-4 text-red-400 hover:text-red-300"
            disabled={isDeleting}
          >
            Delete
          </button>
        )}
        <h2 className="text-2xl font-bold text-white mb-4">
          {model ? 'Edit Model' : 'Add Model'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="field1" className="block text-sm text-gray-300 mb-2">
              Field 1
            </label>
            <input
              type="text"
              id="field1"
              value={field1}
              onChange={(e) => setField1(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="field2" className="block text-sm text-gray-300 mb-2">
              Field 2
            </label>
            <input
              type="number"
              id="field2"
              value={field2}
              onChange={(e) => setField2(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : model ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Delete confirmation modal
function DeleteConfirmationModal({
  onClose,
  onConfirm,
  isDeleting,
}: {
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full">
        <h3 className="text-xl font-bold text-white mb-4">Delete Model</h3>
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete this record? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## Step 4: Add WebSocket Integration (Optional)

If your model supports real-time updates, add the topic and event handling:

### In `src/contexts/WebSocketContext.tsx`:

Add the model-specific event handler:

```ts
interface WebSocketContextType {
  // ... existing properties
  onModelEvent?: (
    callback: (event: {
      type: EventType
      data: ModelRead
      timestamp: string
    }) => void,
  ) => () => void
}

// In WebSocketProvider component:
const onModelEvent = useCallback(
  (
    callback: (event: {
      type: EventType
      data: ModelRead
      timestamp: string
    }) => void,
  ) => {
    if (!client) {
      return () => {}
    }

    const handleMessage = (message: ServerMessage) => {
      if (message.type === 'event' && message.topic === 'model') {
        callback({
          type: message.event_type,
          data: message.data,
          timestamp: message.timestamp,
        })
      }
    }

    return client.onMessage(handleMessage)
  },
  [client],
)

// Add to context value
const value = useMemo(
  () => ({
    // ... existing values
    onModelEvent,
  }),
  [
    status,
    subscribe,
    unsubscribe,
    unsubscribeTopic,
    onPaymentEvent,
    onModelEvent,
  ],
)
```

### In route component:

Add WebSocket subscription:

```ts
import { useWebSocket } from '../contexts/WebSocketContext'

function ModelName() {
  // ... existing code
  const { isConnected, onModelEvent } = useWebSocket()

  useEffect(() => {
    const unsubscribe = onModelEvent?.((event) => {
      console.log('Model event:', event)
      queryClient.invalidateQueries({ queryKey: ['models'] })
    })

    return unsubscribe
  }, [onModelEvent, queryClient])

  // ... rest of component
}
```

---

## Step 5: Add Navigation Link

Update your navigation menu to include the new route:

```tsx
// In your layout or navigation component
<a href="/models" className="text-gray-300 hover:text-white">
  Models
</a>
```

---

## Key Patterns

### 1. **Token Refresh on 401**

Wrap API calls in try/catch and attempt token refresh on 401 errors.

### 2. **Query Invalidation**

Always invalidate queries after mutations to refresh data.

### 3. **Modal State Management**

Use separate state for create/edit modals and delete confirmation.

### 4. **Sorting**

Implement sorting with visual indicators (chevrons) and toggle functionality.

### 5. **Pagination**

Maintain page index and page size state, reset to page 0 on filter changes.

### 6. **Type Safety**

Use Zod schemas for runtime validation and TypeScript type inference.

---

## Alternative: Use DataTable Component

For standard tables, consider using the reusable `DataTable` component from `@/components/data-table`:

```tsx
import { DataTable } from '@/components/data-table'
import { createCurrencyColumn } from '@/components/data-table/columns'

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  createCurrencyColumn<PaymentRead>('amount', 'Amount', 'USD'),
]

<DataTable
  columns={columns}
  data={payments}
  enableSorting
  enablePagination
  pageSize={100}
/>
```

See `src/components/data-table/README.md` for more details.

---

## Testing

Add tests for your API module and route:

```bash
# Create test files
touch src/lib/api/{model}.test.ts
touch src/routes/{model}.test.tsx

# Run tests
pnpm test {model}
```

---

## Checklist

- [ ] Create types file with Zod schemas
- [ ] Create API module with request function
- [ ] Create route component with TanStack Table
- [ ] Implement CRUD operations with mutations
- [ ] Add filters, sorting, and pagination
- [ ] Handle loading and error states
- [ ] Add create/edit modals
- [ ] Add delete confirmation modal
- [ ] Integrate WebSocket (if applicable)
- [ ] Add navigation link
- [ ] Run `pnpm check` to format and lint
- [ ] Test in browser
