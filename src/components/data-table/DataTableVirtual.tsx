import * as React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
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
import type { DataTableVirtualProps } from './types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function DataTableVirtual<TData, TValue>({
  columns,
  data,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableMultiSort = false,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 40, 50],
  virtualRowHeight = 50,
  virtualOverscan = 4,
  searchPlaceholder = 'Filter...',
  emptyState,
  toolbar,
  footer,
  onRowSelectionChange,
  onSortingChange,
  onColumnFiltersChange,
  onPaginationChange,
  onColumnVisibilityChange,
  initialSorting = [],
  initialColumnFilters = [],
  initialPagination,
  initialColumnVisibility = {},
  initialRowSelection = {},
}: DataTableVirtualProps<TData, TValue>) {
  const tableContainerRef = React.useRef<HTMLDivElement>(null)

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

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => virtualRowHeight,
    overscan: virtualOverscan,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        toolbar={toolbar}
      />

      <div
        ref={tableContainerRef}
        className="relative h-[500px] overflow-auto rounded-md border"
      >
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
            <TableRow
              style={{
                height: `${totalSize}px`,
              }}
            >
              <TableCell colSpan={columns.length} className="p-0">
                <div
                  style={{
                    position: 'relative',
                  }}
                >
                  {virtualRows.map((virtualRow) => {
                    const row = rows[virtualRow.index]
                    return (
                      <div
                        key={row.id}
                        data-index={virtualRow.index}
                        ref={(el) => rowVirtualizer.measureElement(el)}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <TableRow
                          data-state={row.getIsSelected() && 'selected'}
                          className="hover:bg-muted/50"
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
                      </div>
                    )
                  })}
                </div>
              </TableCell>
            </TableRow>
            {rows.length === 0 && (
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
