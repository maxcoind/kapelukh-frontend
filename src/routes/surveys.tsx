import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { ArrowUpDown } from 'lucide-react'

import { useAuth } from '../contexts/AuthContext'
import { useWebSocket } from '../contexts/WebSocketContext'
import { isApiError } from '../lib/api/errors'
import {
  createSurvey,
  deleteSurvey,
  listSurveys,
  updateSurvey,
} from '../lib/api/surveys'
import type { SurveyCreate, SurveyRead } from '../lib/api/surveys.types'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table/DataTable'
import { DeleteConfirmationModal } from '@/components/surveys/DeleteConfirmationModal'
import { SurveyModal } from '@/components/surveys/SurveyModal'
import { SurveyInfoModal } from '@/components/surveys/SurveyInfoModal'

export const Route = createFileRoute('/surveys')({
  component: Surveys,
})

function Surveys() {
  const router = useRouter()
  const { logout, refreshToken } = useAuth()
  const { onSurveyEvent } = useWebSocket()
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSurvey, setEditingSurvey] = useState<SurveyRead | null>(null)
  const [viewingSurvey, setViewingSurvey] = useState<SurveyRead | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [filters, setFilters] = useState({
    user_id: '',
  })
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(100)

  useEffect(() => {
    const unsubscribe = onSurveyEvent((event) => {
      void event
      queryClient.invalidateQueries({ queryKey: ['surveys'] })
    })

    return unsubscribe
  }, [onSurveyEvent, queryClient])

  const [sortConfig, setSortConfig] = useState<{
    by: 'user_id' | 'created_at' | 'birth_date' | null
    order: 'asc' | 'desc'
  }>({
    by: null,
    order: 'asc',
  })

  const {
    data: surveys = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['surveys', filters, sortConfig, pageIndex, pageSize],
    queryFn: async () => {
      try {
        return await listSurveys(
          pageIndex * pageSize,
          pageSize,
          {
            user_id: filters.user_id ? parseInt(filters.user_id) : undefined,
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
            return await listSurveys(
              pageIndex * pageSize,
              pageSize,
              {
                user_id: filters.user_id
                  ? parseInt(filters.user_id)
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
    mutationFn: createSurvey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] })
      setShowCreateModal(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SurveyCreate }) =>
      updateSurvey(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] })
      setEditingSurvey(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSurvey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] })
      setEditingSurvey(null)
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
        accessorKey: 'user_id',
        header: () => (
          <Button
            variant="ghost"
            onClick={() => {
              const isAsc =
                sortConfig.by === 'user_id' && sortConfig.order === 'asc'
              setSortConfig({
                by: 'user_id',
                order: isAsc ? 'desc' : 'asc',
              })
            }}
            className="px-0"
          >
            User ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: (info: any) => (
          <span className="text-slate-200 font-mono">{info.getValue()}</span>
        ),
      },
      {
        accessorKey: 'full_name',
        header: 'Name',
        cell: (info: any) => {
          const fullName = info.getValue()
          if (!fullName) {
            return <span className="text-gray-500">-</span>
          }
          return (
            <span className="text-slate-200">
              {[fullName.first_name, fullName.last_name]
                .filter(Boolean)
                .join(' ') || '-'}
            </span>
          )
        },
      },
      {
        accessorKey: 'birth_date',
        header: () => (
          <Button
            variant="ghost"
            onClick={() => {
              const isAsc =
                sortConfig.by === 'birth_date' && sortConfig.order === 'asc'
              setSortConfig({
                by: 'birth_date',
                order: isAsc ? 'desc' : 'asc',
              })
            }}
            className="px-0"
          >
            Birth Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: (info: any) => (
          <span className="text-slate-200">{info.getValue()}</span>
        ),
      },
      {
        accessorKey: 'super_powers',
        header: 'Super Powers',
        cell: (info: any) => {
          const powers = info.getValue()
          if (!powers || powers.length === 0) {
            return <span className="text-gray-500">-</span>
          }
          return <span className="text-slate-200">{powers.join(', ')}</span>
        },
      },
      {
        accessorKey: 'service',
        header: 'Service',
        cell: (info: any) => (
          <span className="text-slate-200">
            {info.getValue() || <span className="text-gray-500">-</span>}
          </span>
        ),
      },
      {
        accessorKey: 'created_at',
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
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: (info: any) => (
          <span className="text-slate-200">
            {new Date(info.getValue()).toLocaleString()}
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
                setEditingSurvey(info.row.original)
              }}
              aria-label="Edit survey"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <title>Edit survey</title>
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
      error instanceof Error ? error.message : 'Error loading surveys'
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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Surveys</h1>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Survey
          </Button>
        </div>

        <div className="mb-4 bg-gray-800 p-3 rounded-lg border border-gray-700">
          <div className="flex flex-wrap items-end gap-2">
            <input
              type="number"
              placeholder="User ID"
              value={filters.user_id}
              onChange={(e) =>
                setFilters({ ...filters, user_id: e.target.value })
              }
              className="px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white text-sm w-40"
            />
            <Button
              onClick={() => setFilters({ user_id: '' })}
              variant="outline"
            >
              Clear
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={surveys}
          enableSorting={false}
          enableFiltering={false}
          enablePagination
          pageSize={pageSize}
          pageSizeOptions={[20, 50, 100]}
          emptyState="No surveys found. Click 'Add Survey' to create one."
          onRowClick={(row) => setViewingSurvey(row)}
          onPaginationChange={(pagination) => {
            setPageIndex(pagination.pageIndex)
            if (pagination.pageSize !== pageSize) {
              setPageSize(pagination.pageSize)
            }
          }}
        />

        {showCreateModal && (
          <SurveyModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={(data) => createMutation.mutate(data)}
            isLoading={createMutation.isPending}
          />
        )}

        {editingSurvey && (
          <SurveyModal
            survey={editingSurvey}
            onClose={() => setEditingSurvey(null)}
            onSubmit={(data) =>
              updateMutation.mutate({ id: editingSurvey.id, data })
            }
            onDelete={() => setShowDeleteConfirmation(true)}
            isLoading={updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        )}

        {showDeleteConfirmation && editingSurvey && (
          <DeleteConfirmationModal
            onClose={() => setShowDeleteConfirmation(false)}
            onConfirm={() => {
              deleteMutation.mutate(editingSurvey.id)
              setShowDeleteConfirmation(false)
            }}
            isDeleting={deleteMutation.isPending}
          />
        )}

        {viewingSurvey && (
          <SurveyInfoModal
            survey={viewingSurvey}
            onClose={() => setViewingSurvey(null)}
          />
        )}
      </div>
    </div>
  )
}
