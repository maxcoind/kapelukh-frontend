# Table Usage

This project uses TanStack Table with two approaches:

## 1. Pre-built DataTable Components

### Basic Setup

```tsx
import { DataTable } from '@/components/data-table/DataTable'
import { DataTableVirtual } from '@/components/data-table/DataTableVirtual'

// Define your data type
interface Person {
  id: string
  firstName: string
  lastName: string
  age: number
}

// Define columns
const columns: ColumnDef<Person>[] = [
  {
    accessorKey: 'firstName',
    header: 'First Name',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
  },
]
```

### Usage

```tsx
<DataTable
  columns={columns}
  data={people}
  enableSorting={true}
  enableFiltering={true}
  enablePagination={true}
  enableRowSelection={true}
  enableColumnVisibility={true}
  searchPlaceholder="Search..."
  pageSize={10}
  pageSizeOptions={[10, 20, 30, 40, 50]}
  toolbar={<Button>Custom Action</Button>}
  footer={<div>Custom footer</div>}
  onRowSelectionChange={(selection) => console.log(selection)}
/>
```

### Virtualized Table (Large Datasets)

```tsx
<DataTableVirtual
  columns={columns}
  data={largeDataset}
  virtualRowHeight={50}
  // ... same props as DataTable
/>
```

## 2. Custom TanStack Table

### Basic Table

```tsx
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<Payment>()

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('amount', {
    header: 'Amount',
    cell: (info) => `$${info.getValue().toFixed(2)}`,
  }),
]

function MyTable() {
  const table = useReactTable({
    data: payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
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
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

## Column Helpers

Use pre-built column helpers for common patterns:

```tsx
import {
  createCheckboxColumn,
  createCurrencyColumn,
  createPercentageColumn,
  createStatusColumn,
  createActionsColumn,
} from '@/components/data-table/columns'

const columns = [
  createCheckboxColumn<Person>(),
  {
    accessorKey: 'name',
    header: 'Name',
  },
  createCurrencyColumn<Person>('amount', 'Amount', 'USD'),
  createPercentageColumn<Person>('progress', 'Progress'),
  createStatusColumn<Person>({
    active: { label: 'Active', variant: 'success' },
    inactive: { label: 'Inactive', variant: 'warning' },
  }),
  createActionsColumn<Person>([
    { label: 'Edit', onClick: (row) => console.log('Edit', row) },
    { label: 'Delete', onClick: (row) => console.log('Delete', row) },
  ]),
]
```

## Sorting

### With DataTable Components

```tsx
{
  accessorKey: 'name',
  header: ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      Name <ArrowUpDown />
    </Button>
  ),
}
```

### Custom Sorting State

```tsx
const [sortConfig, setSortConfig] = useState({
  by: 'amount' | 'date' | null,
  order: 'asc' | 'desc',
})

// API integration
const { data } = useQuery({
  queryKey: ['payments', sortConfig],
  queryFn: () =>
    listPayments(0, 100, undefined, sortConfig.by ? sortConfig : undefined),
})
```

## Filtering

### Column Filters

```tsx
{
  accessorKey: 'status',
  header: 'Status',
  filterFn: 'includesString', // Built-in filter functions
}
```

### Custom Filter UI

```tsx
const [filters, setFilters] = useState({
  customer_id: '',
  date_from: '',
})

<input
  value={filters.customer_id}
  onChange={(e) => setFilters({ ...filters, customer_id: e.target.value })}
/>
```

## Pagination

### Client-side (DataTable Components)

```tsx
<DataTable
  pageSize={10}
  pageSizeOptions={[10, 20, 50]}
  enablePagination={true}
/>
```

### Server-side (Custom)

```tsx
const [pageIndex, setPageIndex] = useState(0)
const [pageSize, setPageSize] = useState(100)

const { data } = useQuery({
  queryKey: ['payments', pageIndex, pageSize],
  queryFn: () => listPayments(pageIndex * pageSize, pageSize),
})
```

## Computed Columns

```tsx
{
  accessorFn: (row) => `${row.firstName} ${row.lastName}`,
  id: 'fullName',
  header: 'Full Name',
}
```

## Formatting Cells

```tsx
{
  accessorKey: 'date',
  header: 'Date',
  cell: (info) => new Date(info.getValue()).toLocaleString(),
}
```

## Actions Column

```tsx
columnHelper.display({
  id: 'actions',
  cell: (info) => (
    <div className="flex gap-2">
      <Button onClick={() => handleEdit(info.row.original)}>Edit</Button>
      <Button onClick={() => handleDelete(info.row.original)}>Delete</Button>
    </div>
  ),
})
```

## Integration with TanStack Query

```tsx
const { data: payments, isLoading } = useQuery({
  queryKey: ['payments', filters, sortConfig, pageIndex, pageSize],
  queryFn: () =>
    listPayments(
      pageIndex * pageSize,
      pageSize,
      filters,
      sortConfig.by ? sortConfig : undefined,
    ),
})

const createMutation = useMutation({
  mutationFn: createPayment,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['payments'] })
  },
})
```

## Key Points

- Use `DataTable` for most cases, `DataTableVirtual` for large datasets (>1000 rows)
- Use column helpers for common patterns (checkbox, currency, status, actions)
- TanStack Table is headless - you render the UI
- Server-side filtering/sorting/pagination requires API integration
- Use `flexRender` for header and cell rendering
- All table features are optional and composable
