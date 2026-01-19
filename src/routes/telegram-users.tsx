import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { ArrowUpDown, CheckCircle2, XCircle } from 'lucide-react'

import { useAuth } from '../contexts/AuthContext'
import { useWebSocket } from '../contexts/WebSocketContext'
import { isApiError } from '../lib/api/errors'
import {
  createTelegramUser,
  deleteTelegramUser,
  listTelegramUsers,
  updateTelegramUser,
} from '../lib/api/telegram-user'
import type {
  TelegramUserCreate,
  TelegramUserRead,
} from '../lib/api/telegram-user.types'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table/DataTable'
import { DeleteConfirmationModal } from '@/components/telegram-users/DeleteConfirmationModal'
import { TelegramUserModal } from '@/components/telegram-users/TelegramUserModal'
import { UserInfoModal } from '@/components/telegram-users/UserInfoModal'

export const Route = createFileRoute('/telegram-users')({
  component: TelegramUsers,
})

function TelegramUsers() {
  const router = useRouter()
  const { logout, refreshToken } = useAuth()
  const { onTelegramUserEvent } = useWebSocket()
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<TelegramUserRead | null>(null)
  const [viewingUser, setViewingUser] = useState<TelegramUserRead | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [filters, setFilters] = useState({
    telegram_id: '',
    username: '',
    is_active: '',
    is_bot: '',
    created_from: '',
    created_to: '',
    updated_from: '',
    updated_to: '',
  })
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(100)

  useEffect(() => {
    const unsubscribe = onTelegramUserEvent((event) => {
      void event
      queryClient.invalidateQueries({ queryKey: ['telegramUsers'] })
    })

    return unsubscribe
  }, [onTelegramUserEvent, queryClient])

  const [sortConfig, setSortConfig] = useState<{
    by:
      | 'telegram_id'
      | 'username'
      | 'created_at'
      | 'updated_at'
      | 'last_interaction_at'
      | null
    order: 'asc' | 'desc'
  }>({
    by: null,
    order: 'asc',
  })

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['telegramUsers', filters, sortConfig, pageIndex, pageSize],
    queryFn: async () => {
      try {
        return await listTelegramUsers(
          pageIndex * pageSize,
          pageSize,
          {
            telegram_id: filters.telegram_id
              ? parseInt(filters.telegram_id)
              : undefined,
            username: filters.username || undefined,
            is_active:
              filters.is_active === ''
                ? undefined
                : filters.is_active === 'true',
            is_bot:
              filters.is_bot === '' ? undefined : filters.is_bot === 'true',
            created_from: filters.created_from
              ? new Date(filters.created_from).toISOString()
              : undefined,
            created_to: filters.created_to
              ? new Date(filters.created_to).toISOString()
              : undefined,
            updated_from: filters.updated_from
              ? new Date(filters.updated_from).toISOString()
              : undefined,
            updated_to: filters.updated_to
              ? new Date(filters.updated_to).toISOString()
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
        if (isApiError(err) && err.status === 401) {
          const refreshed = await refreshToken()
          if (refreshed) {
            return await listTelegramUsers(
              pageIndex * pageSize,
              pageSize,
              {
                telegram_id: filters.telegram_id
                  ? parseInt(filters.telegram_id)
                  : undefined,
                username: filters.username || undefined,
                is_active:
                  filters.is_active === ''
                    ? undefined
                    : filters.is_active === 'true',
                is_bot:
                  filters.is_bot === '' ? undefined : filters.is_bot === 'true',
                created_from: filters.created_from
                  ? new Date(filters.created_from).toISOString()
                  : undefined,
                created_to: filters.created_to
                  ? new Date(filters.created_to).toISOString()
                  : undefined,
                updated_from: filters.updated_from
                  ? new Date(filters.updated_from).toISOString()
                  : undefined,
                updated_to: filters.updated_to
                  ? new Date(filters.updated_to).toISOString()
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

  const createMutation = useMutation({
    mutationFn: createTelegramUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegramUsers'] })
      setShowCreateModal(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TelegramUserCreate }) =>
      updateTelegramUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegramUsers'] })
      setEditingUser(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTelegramUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegramUsers'] })
      setEditingUser(null)
      setShowDeleteConfirmation(false)
    },
  })

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: (info: any) => (
          <span className="text-slate-200 font-mono">{info.getValue()}</span>
        ),
      },
      {
        accessorKey: 'telegram_id',
        header: () => (
          <Button
            variant="ghost"
            onClick={() => {
              const isAsc =
                sortConfig.by === 'telegram_id' && sortConfig.order === 'asc'
              setSortConfig({
                by: 'telegram_id',
                order: isAsc ? 'desc' : 'asc',
              })
            }}
            className="px-0"
          >
            Telegram ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: (info: any) => (
          <span className="text-slate-200 font-mono">{info.getValue()}</span>
        ),
      },
      {
        accessorKey: 'username',
        header: () => (
          <Button
            variant="ghost"
            onClick={() => {
              const isAsc =
                sortConfig.by === 'username' && sortConfig.order === 'asc'
              setSortConfig({
                by: 'username',
                order: isAsc ? 'desc' : 'asc',
              })
            }}
            className="px-0"
          >
            Username
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: (info: any) => (
          <span className="text-slate-200">
            {info.getValue() || <span className="text-gray-500">-</span>}
          </span>
        ),
      },
      {
        accessorKey: 'first_name',
        header: 'First Name',
        cell: (info: any) => (
          <span className="text-slate-200">{info.getValue()}</span>
        ),
      },
      {
        accessorKey: 'last_name',
        header: 'Last Name',
        cell: (info: any) => (
          <span className="text-slate-200">
            {info.getValue() || <span className="text-gray-500">-</span>}
          </span>
        ),
      },
      {
        accessorKey: 'language_code',
        header: 'Language',
        cell: (info: any) => (
          <span className="text-slate-200">
            {info.getValue() || <span className="text-gray-500">-</span>}
          </span>
        ),
      },
      {
        accessorKey: 'is_active',
        header: () => (
          <Button
            variant="ghost"
            onClick={() => {
              const isAsc =
                sortConfig.by === 'created_at' && sortConfig.order === 'asc'
              setSortConfig({
                by: 'created_at',
                order: isAsc ? 'desc' : 'asc',
              })
            }}
            className="px-0"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: (info: any) =>
          info.getValue() ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          ),
      },
      {
        accessorKey: 'is_bot',
        header: 'Bot',
        cell: (info: any) =>
          info.getValue() ? (
            <CheckCircle2 className="h-5 w-5 text-blue-500" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-500" />
          ),
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: (info: any) => (
          <span className="text-slate-200">
            {new Date(info.getValue()).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'last_interaction_at',
        header: 'Last Interaction',
        cell: (info: any) => (
          <span className="text-slate-200">
            {info.getValue() ? (
              new Date(info.getValue()).toLocaleString()
            ) : (
              <span className="text-gray-500">Never</span>
            )}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-center">Actions</div>,
        cell: (info: any) => (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3"
              onClick={(e) => {
                e.stopPropagation()
                setEditingUser(info.row.original)
              }}
              aria-label="Edit user"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <title>Edit user</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </Button>
          </div>
        ),
      },
    ],
    [sortConfig],
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error loading telegram users'
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
        <div className="mb-4 bg-gray-800 p-3 rounded-lg border border-gray-700">
          <div className="flex flex-wrap items-end gap-2">
            <input
              type="number"
              placeholder="Telegram ID"
              value={filters.telegram_id}
              onChange={(e) =>
                setFilters({ ...filters, telegram_id: e.target.value })
              }
              className="px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white text-sm w-40"
            />
            <input
              type="text"
              placeholder="Username"
              value={filters.username}
              onChange={(e) =>
                setFilters({ ...filters, username: e.target.value })
              }
              className="px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white text-sm w-40"
            />
            <select
              value={filters.is_active}
              onChange={(e) =>
                setFilters({ ...filters, is_active: e.target.value })
              }
              className="px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <select
              value={filters.is_bot}
              onChange={(e) =>
                setFilters({ ...filters, is_bot: e.target.value })
              }
              className="px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
            >
              <option value="">All Types</option>
              <option value="true">Bots</option>
              <option value="false">Users</option>
            </select>
            <input
              type="datetime-local"
              placeholder="Created From"
              value={filters.created_from}
              onChange={(e) =>
                setFilters({ ...filters, created_from: e.target.value })
              }
              className="px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
            />
            <input
              type="datetime-local"
              placeholder="Created To"
              value={filters.created_to}
              onChange={(e) =>
                setFilters({ ...filters, created_to: e.target.value })
              }
              className="px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
            />
            <Button
              onClick={() =>
                setFilters({
                  telegram_id: '',
                  username: '',
                  is_active: '',
                  is_bot: '',
                  created_from: '',
                  created_to: '',
                  updated_from: '',
                  updated_to: '',
                })
              }
              variant="outline"
            >
              Clear
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={users}
          enableSorting={false}
          enableFiltering={false}
          enablePagination
          pageSize={pageSize}
          pageSizeOptions={[20, 50, 100]}
          emptyState="No telegram users found. Click 'Add Telegram User' to create one."
          onRowClick={(row) => setViewingUser(row)}
          onPaginationChange={(pagination) => {
            setPageIndex(pagination.pageIndex)
            if (pagination.pageSize !== pageSize) {
              setPageSize(pagination.pageSize)
            }
          }}
        />

        {showCreateModal && (
          <TelegramUserModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={(data) => createMutation.mutate(data)}
            isLoading={createMutation.isPending}
          />
        )}

        {editingUser && (
          <TelegramUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSubmit={(data) =>
              updateMutation.mutate({ id: editingUser.telegram_id, data })
            }
            onDelete={() => setShowDeleteConfirmation(true)}
            isLoading={updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        )}

        {showDeleteConfirmation && editingUser && (
          <DeleteConfirmationModal
            onClose={() => setShowDeleteConfirmation(false)}
            onConfirm={() => {
              deleteMutation.mutate(editingUser.telegram_id)
              setShowDeleteConfirmation(false)
            }}
            isDeleting={deleteMutation.isPending}
          />
        )}

        {viewingUser && (
          <UserInfoModal
            user={viewingUser}
            onClose={() => setViewingUser(null)}
          />
        )}
      </div>
    </div>
  )
}
