import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function createCheckboxColumn<T>(): ColumnDef<T, unknown> {
  return {
    id: 'select',
    header: ({ table }) => {
      return (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      )
    },
    cell: ({ row }) => {
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      )
    },
    enableSorting: false,
    enableHiding: false,
  }
}

export interface ActionsColumnProps<TData> {
  row: {
    original: TData
  }
  actions: Array<{
    label: string
    onClick: (data: TData) => void
  }>
}

export function createActionsColumn<TData>(
  actions: ActionsColumnProps<TData>['actions'],
  label = 'Actions',
): ColumnDef<TData, unknown> {
  return {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {actions.map((action) => (
              <DropdownMenuItem
                key={action.label}
                onClick={() => action.onClick(row.original)}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }
}

export interface SortableHeaderProps {
  children: React.ReactNode
  column: {
    getToggleSortingHandler: () => (() => void) | undefined
    getIsSorted: () => boolean | 'asc' | 'desc'
  }
}

export function createSortableHeader({
  children,
  column,
}: SortableHeaderProps): React.ReactNode {
  const handler = column.getToggleSortingHandler
  return (
    <Button variant="ghost" onClick={handler} className="px-0">
      {children}
      <ArrowUpDown />
    </Button>
  )
}

export type StatusVariant = 'default' | 'success' | 'warning' | 'error'

export interface StatusBadgeProps {
  status: string
  variant?: StatusVariant
}

export function createStatusColumn<T extends { status: string }>(
  statusMap: Record<string, { label: string; variant: StatusVariant }>,
): ColumnDef<T, unknown> {
  return {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = String(row.getValue('status'))
      const config = statusMap[status] ?? { label: status, variant: 'default' }

      return (
        <div className="capitalize">
          <StatusBadge status={config.label} variant={config.variant} />
        </div>
      )
    },
  }
}

function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const variantStyles = {
    default: '',
    success: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
    error: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {status}
    </span>
  )
}

export function createCurrencyColumn<T extends Record<string, unknown>>(
  accessorKey: string,
  header: string,
  currency = 'USD',
): ColumnDef<T, unknown> {
  return {
    accessorKey,
    header: () => <div className="text-right text-gray-200">{header}</div>,
    cell: ({ row }) => {
      const amount = Number(row.getValue(accessorKey))

      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(amount)

      return (
        <div className="text-right font-medium text-emerald-400">
          {formatted}
        </div>
      )
    },
  }
}

export function createPercentageColumn<T extends Record<string, unknown>>(
  accessorKey: string,
  header: string,
): ColumnDef<T, unknown> {
  return {
    accessorKey,
    header: () => <div className="text-right text-gray-200">{header}</div>,
    cell: ({ row }) => {
      const value = Number(row.getValue(accessorKey))

      return (
        <div className="text-right font-medium text-white">
          {value.toFixed(1)}%
        </div>
      )
    },
  }
}
