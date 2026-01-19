import { ApiError } from './errors'
import type { RefreshTokenRequest, Token, UserResponse } from './auth.types'

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

export async function login(
  username: string,
  password: string,
): Promise<Token> {
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)

  const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || 'Login failed')
  }

  const data = await response.json()
  localStorage.setItem('access_token', data.access_token)
  localStorage.setItem('refresh_token', data.refresh_token)

  return data
}

export async function refreshToken(req: RefreshTokenRequest): Promise<Token> {
  const data = await request<Token>('/api/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify(req),
  })

  localStorage.setItem('access_token', data.access_token)
  localStorage.setItem('refresh_token', data.refresh_token)

  return data
}

export async function getCurrentUser(): Promise<UserResponse> {
  return request<UserResponse>('/api/v1/auth/me')
}

export function logout(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token')
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token')
}

export function isAuthenticated(): boolean {
  return !!getAccessToken()
}
