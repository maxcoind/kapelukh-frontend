import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { DataTablePagination } from './DataTablePagination'
import { DataTableToolbar } from './DataTableToolbar'
import type {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Updater,
  VisibilityState,
} from '@tanstack/react-table'
import type { DataTableProps } from './types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function DataTable<TData, TValue>({
  columns,
  data,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableMultiSort = false,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 40, 50],
  searchPlaceholder = 'Filter...',
  emptyState,
  toolbar,
  footer,
  onRowSelectionChange,
  onSortingChange,
  onColumnFiltersChange,
  onPaginationChange,
  onColumnVisibilityChange,
  onRowClick,
  initialSorting = [],
  initialColumnFilters = [],
  initialPagination,
  initialColumnVisibility = {},
  initialRowSelection = {},
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState(initialSorting)
  const [columnFilters, setColumnFilters] = React.useState(initialColumnFilters)
  const [columnVisibility, setColumnVisibility] = React.useState(
    initialColumnVisibility,
  )
  const [rowSelection, setRowSelection] = React.useState(initialRowSelection)
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
    ...initialPagination,
  })

  const table = useReactTable({
    data,
    columns,
    enableSorting,
    enableMultiSort,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: React.useCallback(
      (newSorting: Updater<SortingState>) => {
        const value =
          typeof newSorting === 'function' ? newSorting(sorting) : newSorting
        setSorting(value)
        onSortingChange?.(value)
      },
      [sorting, onSortingChange],
    ),
    onColumnFiltersChange: React.useCallback(
      (newFilters: Updater<ColumnFiltersState>) => {
        const value =
          typeof newFilters === 'function'
            ? newFilters(columnFilters)
            : newFilters
        setColumnFilters(value)
        onColumnFiltersChange?.(value)
      },
      [columnFilters, onColumnFiltersChange],
    ),
    onColumnVisibilityChange: React.useCallback(
      (newVisibility: Updater<VisibilityState>) => {
        const value =
          typeof newVisibility === 'function'
            ? newVisibility(columnVisibility)
            : newVisibility
        setColumnVisibility(value)
        onColumnVisibilityChange?.(value)
      },
      [columnVisibility, onColumnVisibilityChange],
    ),
    onRowSelectionChange: React.useCallback(
      (newSelection: Updater<RowSelectionState>) => {
        const value =
          typeof newSelection === 'function'
            ? newSelection(rowSelection)
            : newSelection
        setRowSelection(value)
        onRowSelectionChange?.(value)
      },
      [rowSelection, onRowSelectionChange],
    ),
    onPaginationChange: React.useCallback(
      (newPagination: Updater<PaginationState>) => {
        const value =
          typeof newPagination === 'function'
            ? newPagination(pagination)
            : newPagination
        setPagination(value)
        onPaginationChange?.(value)
      },
      [pagination, onPaginationChange],
    ),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    filterFns: { fuzzy: () => true },
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        toolbar={toolbar}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick?.(row.original)}
                  className={
                    onRowClick ? 'cursor-pointer hover:bg-gray-800/50' : ''
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyState || 'No results.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination && (
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      )}

      {footer && <div className="mt-4">{footer}</div>}
    </div>
  )
}
