import type {
  Column,
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'

export interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>
  data: Array<TData>
  enableSorting?: boolean
  enableFiltering?: boolean
  enablePagination?: boolean
  enableRowSelection?: boolean
  enableColumnVisibility?: boolean
  enableVirtualization?: boolean
  enableMultiSort?: boolean
  pageSize?: number
  pageSizeOptions?: Array<number>
  virtualRowHeight?: number
  virtualOverscan?: number
  searchPlaceholder?: string
  emptyState?: React.ReactNode
  toolbar?: React.ReactNode
  footer?: React.ReactNode
  onRowSelectionChange?: (rowSelection: RowSelectionState) => void
  onSortingChange?: (sorting: SortingState) => void
  onColumnFiltersChange?: (columnFilters: ColumnFiltersState) => void
  onPaginationChange?: (pagination: PaginationState) => void
  onColumnVisibilityChange?: (columnVisibility: VisibilityState) => void
  onRowClick?: (row: TData) => void
  initialSorting?: SortingState
  initialColumnFilters?: ColumnFiltersState
  initialPagination?: Partial<PaginationState>
  initialColumnVisibility?: VisibilityState
  initialRowSelection?: RowSelectionState
}

export interface DataTableToolbarProps<TData, TValue> {
  table: {
    getAllColumns: () => Array<Column<TData, TValue>>
    getFilteredSelectedRowModel: () => {
      rows: Array<{ id: string; original: TData }>
    }
    getFilteredRowModel: () => {
      rows: Array<{ id: string }>
    }
    getColumn: (id: string) => Column<TData, TValue> | undefined
    toggleAllPageRowsSelected: (value: boolean) => void
    getIsAllPageRowsSelected: () => boolean
    getIsSomePageRowsSelected: () => boolean
  }
  searchPlaceholder?: string
  searchColumn?: string
  toolbar?: React.ReactNode
}

export interface DataTablePaginationProps {
  table: {
    getPageCount: () => number
    getCanNextPage: () => boolean
    getCanPreviousPage: () => boolean
    nextPage: () => void
    previousPage: () => void
    setPageIndex: (index: number) => void
    getFilteredRowModel: () => {
      rows: Array<{ id: string }>
    }
    getFilteredSelectedRowModel: () => {
      rows: Array<{ id: string }>
    }
    getState: () => {
      pagination: {
        pageIndex: number
        pageSize: number
      }
    }
    setPageSize: (size: number) => void
  }
  pageSizeOptions?: Array<number>
}

export interface DataTableVirtualProps<TData, TValue> extends Omit<
  DataTableProps<TData, TValue>,
  'enableVirtualization'
> {
  virtualRowHeight?: number
  virtualOverscan?: number
}
