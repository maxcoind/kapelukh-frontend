import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.navigate({ to: '/surveys' })
      } else {
        router.navigate({ to: '/login' })
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  )
}
