import { ApiError } from './errors'
import type {
  TelegramUserCreate,
  TelegramUserRead,
  TelegramUserUpdate,
} from './telegram-user.types'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000'

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

export async function listTelegramUsers(
  skip: number = 0,
  limit: number = 100,
  filters?: {
    telegram_id?: number
    username?: string
    is_active?: boolean
    is_bot?: boolean
    created_from?: string
    created_to?: string
    updated_from?: string
    updated_to?: string
  },
  sort?: {
    by?:
      | 'telegram_id'
      | 'username'
      | 'created_at'
      | 'updated_at'
      | 'last_interaction_at'
    order?: 'asc' | 'desc'
  },
): Promise<Array<TelegramUserRead>> {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  })

  if (filters?.telegram_id !== undefined) {
    params.append('telegram_id', filters.telegram_id.toString())
  }
  if (filters?.username) {
    params.append('username', filters.username)
  }
  if (filters?.is_active !== undefined) {
    params.append('is_active', filters.is_active.toString())
  }
  if (filters?.is_bot !== undefined) {
    params.append('is_bot', filters.is_bot.toString())
  }
  if (filters?.created_from) {
    params.append('created_from', filters.created_from)
  }
  if (filters?.created_to) {
    params.append('created_to', filters.created_to)
  }
  if (filters?.updated_from) {
    params.append('updated_from', filters.updated_from)
  }
  if (filters?.updated_to) {
    params.append('updated_to', filters.updated_to)
  }
  if (sort?.by) {
    params.append('sort_by', sort.by)
    params.append('sort_order', sort.order || 'desc')
  }

  return request<Array<TelegramUserRead>>(
    `/api/v1/telegram-users/?${params.toString()}`,
  )
}

export async function getTelegramUser(
  telegramId: number,
): Promise<TelegramUserRead> {
  return request<TelegramUserRead>(`/api/v1/telegram-users/${telegramId}`)
}

export async function createTelegramUser(
  data: TelegramUserCreate,
): Promise<TelegramUserRead> {
  return request<TelegramUserRead>('/api/v1/telegram-users/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateTelegramUser(
  telegramId: number,
  data: TelegramUserUpdate,
): Promise<TelegramUserRead> {
  return request<TelegramUserRead>(`/api/v1/telegram-users/${telegramId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteTelegramUser(telegramId: number): Promise<void> {
  await request<void>(`/api/v1/telegram-users/${telegramId}`, {
    method: 'DELETE',
  })
}

export async function updateLastInteraction(
  telegramId: number,
): Promise<TelegramUserRead> {
  return request<TelegramUserRead>(
    `/api/v1/telegram-users/${telegramId}/last-interaction`,
    {
      method: 'PATCH',
    },
  )
}
