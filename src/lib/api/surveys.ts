import { ApiError } from './errors'
import type { SurveyCreate, SurveyRead, SurveyUpdate } from './surveys.types'

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

export async function listSurveys(
  skip: number = 0,
  limit: number = 100,
  filters?: {
    user_id?: number
  },
  sort?: {
    by?: 'user_id' | 'created_at' | 'birth_date'
    order?: 'asc' | 'desc'
  },
): Promise<Array<SurveyRead>> {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  })

  if (filters?.user_id !== undefined) {
    params.append('user_id', filters.user_id.toString())
  }
  if (sort?.by) {
    params.append('sort_by', sort.by)
    params.append('sort_order', sort.order || 'asc')
  }

  return request<Array<SurveyRead>>(`/api/v1/surveys/?${params.toString()}`)
}

export async function getSurvey(id: number): Promise<SurveyRead> {
  return request<SurveyRead>(`/api/v1/surveys/${id}`)
}

export async function getSurveyByUserId(userId: number): Promise<SurveyRead> {
  return request<SurveyRead>(`/api/v1/surveys/by-user/${userId}`)
}

export async function createSurvey(data: SurveyCreate): Promise<SurveyRead> {
  return request<SurveyRead>('/api/v1/surveys/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateSurvey(
  id: number,
  data: SurveyUpdate,
): Promise<SurveyRead> {
  return request<SurveyRead>(`/api/v1/surveys/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteSurvey(id: number): Promise<void> {
  await request<void>(`/api/v1/surveys/${id}`, {
    method: 'DELETE',
  })
}
