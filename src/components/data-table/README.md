# DataTable Components

A comprehensive set of TanStack Table components built with shadcn/ui, providing full-featured data tables with sorting, filtering, pagination, row selection, column visibility, and virtualization support.

## Components

### DataTable

Standard table component with full feature set for most use cases.

#### Features

- **Sorting**: Multi-column sorting support
- **Filtering**: Column-specific and global filtering
- **Pagination**: Built-in pagination with customizable page sizes
- **Row Selection**: Checkbox-based row selection with bulk operations
- **Column Visibility**: Toggle column visibility via dropdown menu
- **Responsive**: Mobile-friendly with horizontal scrolling

#### Usage

```tsx
import { DataTable } from '@/components/data-table'
import { createCheckboxColumn, createPercentageColumn } from '@/components/data-table/columns'

const columns = [
  createCheckboxColumn<Person>(),
  {
    accessorKey: 'name',
    header: 'Name',
  },
  createPercentageColumn<Person>('progress', 'Progress'),
]

<DataTable
  columns={columns}
  data={data}
  searchColumn="name"
  searchPlaceholder="Search..."
  enableSorting
  enableFiltering
  enablePagination
  enableRowSelection
  enableColumnVisibility
  pageSize={10}
  pageSizeOptions={[10, 20, 30, 40, 50]}
/>
```

### DataTableVirtual

Virtualized table component optimized for large datasets (10,000+ rows). Uses `@tanstack/react-virtual` for efficient rendering.

#### Features

- All DataTable features
- **Virtualization**: Windowed rendering for smooth performance
- **Configurable**: Customizable row height and overscan
- **Memory Efficient**: Only renders visible rows

#### Usage

```tsx
import { DataTableVirtual } from '@/components/data-table/DataTableVirtual'
;<DataTableVirtual
  columns={columns}
  data={largeData}
  virtualRowHeight={50}
  virtualOverscan={4}
  // ... same props as DataTable
/>
```

### DataTableToolbar

Toolbar component with search input and column visibility controls.

#### Props

| Prop                | Type      | Default     | Description              |
| ------------------- | --------- | ----------- | ------------------------ |
| `table`             | Table     | -           | TanStack table instance  |
| `searchPlaceholder` | string    | 'Filter...' | Search input placeholder |
| `searchColumn`      | string    | ''          | Column ID to search      |
| `toolbar`           | ReactNode | undefined   | Custom toolbar content   |

### DataTablePagination

Pagination controls with page navigation and row count display.

#### Props

| Prop              | Type     | Default              | Description             |
| ----------------- | -------- | -------------------- | ----------------------- |
| `table`           | Table    | -                    | TanStack table instance |
| `pageSizeOptions` | number[] | [10, 20, 30, 40, 50] | Available page sizes    |

## Column Helpers

Utility functions for creating common column types.

### createCheckboxColumn

Creates a checkbox column for row selection.

```tsx
const columns = [createCheckboxColumn<Person>(), ...otherColumns]
```

### createActionsColumn

Creates an actions column with dropdown menu for row actions.

```tsx
const columns = [
  ...otherColumns,
  createActionsColumn<Person>([
    {
      label: 'Edit',
      onClick: (row) => console.log('Edit', row),
    },
    {
      label: 'Delete',
      onClick: (row) => console.log('Delete', row),
    },
  ]),
]
```

### createStatusColumn

Creates a status column with colored badges.

```tsx
const statusMap = {
  active: { label: 'Active', variant: 'success' as const },
  pending: { label: 'Pending', variant: 'warning' as const },
  inactive: { label: 'Inactive', variant: 'error' as const },
}

const columns = [createStatusColumn<Person>(statusMap)]
```

### createCurrencyColumn

Creates a currency-formatted column.

```tsx
const columns = [createCurrencyColumn<Person>('amount', 'Amount', 'USD')]
```

### createPercentageColumn

Creates a percentage-formatted column.

```tsx
const columns = [createPercentageColumn<Person>('progress', 'Progress')]
```

## DataTable Props

| Prop                       | Type                     | Default              | Description                      |
| -------------------------- | ------------------------ | -------------------- | -------------------------------- |
| `columns`                  | ColumnDef[]              | - (required)         | Column definitions               |
| `data`                     | T[]                      | - (required)         | Table data                       |
| `enableSorting`            | boolean                  | true                 | Enable sorting                   |
| `enableFiltering`          | boolean                  | true                 | Enable filtering                 |
| `enablePagination`         | boolean                  | true                 | Enable pagination                |
| `enableRowSelection`       | boolean                  | true                 | Enable row selection             |
| `enableColumnVisibility`   | boolean                  | true                 | Enable column visibility toggle  |
| `enableMultiSort`          | boolean                  | false                | Enable multi-column sorting      |
| `pageSize`                 | number                   | 10                   | Default page size                |
| `pageSizeOptions`          | number[]                 | [10, 20, 30, 40, 50] | Page size options                |
| `searchPlaceholder`        | string                   | 'Filter...'          | Search input placeholder         |
| `emptyState`               | ReactNode                | undefined            | Custom empty state               |
| `toolbar`                  | ReactNode                | undefined            | Custom toolbar content           |
| `footer`                   | ReactNode                | undefined            | Custom footer content            |
| `onRowSelectionChange`     | function                 | undefined            | Row selection change handler     |
| `onSortingChange`          | function                 | undefined            | Sorting change handler           |
| `onColumnFiltersChange`    | function                 | undefined            | Column filters change handler    |
| `onPaginationChange`       | function                 | undefined            | Pagination change handler        |
| `onColumnVisibilityChange` | function                 | undefined            | Column visibility change handler |
| `initialSorting`           | SortingState             | []                   | Initial sorting state            |
| `initialColumnFilters`     | ColumnFiltersState       | []                   | Initial column filters           |
| `initialPagination`        | Partial<PaginationState> | undefined            | Initial pagination state         |
| `initialColumnVisibility`  | VisibilityState          | {}                   | Initial column visibility        |
| `initialRowSelection`      | RowSelectionState        | {}                   | Initial row selection            |

## DataTableVirtual Props

All DataTable props plus:

| Prop               | Type   | Default | Description                               |
| ------------------ | ------ | ------- | ----------------------------------------- |
| `virtualRowHeight` | number | 50      | Height of each row in pixels              |
| `virtualOverscan`  | number | 4       | Number of rows to render outside viewport |

## Examples

See `/demo/table` for a full working example with:

- Standard and virtualized table modes
- All features enabled
- Custom column definitions
- Action buttons
- Status badges

## Performance Tips

1. **Use virtualization** for datasets with 10,000+ rows
2. **Disable features** you don't need (e.g., `enableRowSelection={false}`)
3. **Memoize columns** with `useMemo` to prevent re-creation
4. **Use pagination** instead of showing all rows at once
5. **Optimize render** with stable data references

## Advanced Usage

### Custom Filters

```tsx
const columns = [
  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
]
```

### Custom Sorters

```tsx
const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
    sortingFn: (rowA, rowB, id) => {
      return rowA.getValue(id).localeCompare(rowB.getValue(id))
    },
  },
]
```

### Custom Cell Renderers

```tsx
const columns = [
  {
    accessorKey: 'avatar',
    header: 'Avatar',
    cell: ({ row }) => (
      <Avatar src={row.original.avatar} name={row.original.name} />
    ),
  },
]
```

## Dependencies

- @tanstack/react-table
- @tanstack/react-virtual (for DataTableVirtual)
- @tanstack/match-sorter-utils (for fuzzy filtering)
- @radix-ui/react-\* (via shadcn/ui components)
- lucide-react (icons)
- class-variance-authority
- clsx
- tailwind-merge
