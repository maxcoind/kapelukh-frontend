import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { ApiError } from '../lib/api/errors'
import * as auth from '../lib/api/auth'
import type { UserResponse } from '../lib/api/auth.types'

interface AuthContextType {
  user: UserResponse | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    if (auth.isAuthenticated()) {
      try {
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
      } catch {
        auth.logout()
        setUser(null)
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  async function login(username: string, password: string) {
    await auth.login(username, password)
    const currentUser = await auth.getCurrentUser()
    setUser(currentUser)
  }

  function logout() {
    auth.logout()
    setUser(null)
  }

  async function refreshToken(): Promise<boolean> {
    const refreshTokenValue = auth.getRefreshToken()
    if (!refreshTokenValue) {
      logout()
      return false
    }

    try {
      await auth.refreshToken({ refresh_token: refreshTokenValue })
      const currentUser = await auth.getCurrentUser()
      setUser(currentUser)
      return true
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout()
      }
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        refreshToken,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
