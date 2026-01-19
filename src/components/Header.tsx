import { Link, useLocation, useRouter } from '@tanstack/react-router'

import { useState } from 'react'
import { FileText, Home, Menu, Network, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useWebSocket } from '../contexts/WebSocketContext'

function getPageName(pathname: string): string {
  const routeMap: Record<string, string> = {
    '/': 'Home',
    '/telegram-users': 'Telegram Users',
    '/surveys': 'Surveys',
    '/login': 'Login',
  }
  return routeMap[pathname] || pathname
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { isConnected } = useWebSocket()

  function handleLogin() {
    router.navigate({ to: '/login' })
  }

  function handleLogout() {
    logout()
    router.navigate({ to: '/login' })
  }

  return (
    <>
      <header className="p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-4 text-xl font-semibold">
            {getPageName(location.pathname)}
          </h1>
        </div>

        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-xs text-gray-400 hidden sm:inline">
                  {isConnected ? 'Real-time updates' : 'Disconnected'}
                </span>
              </div>
              <span className="text-gray-300">Welcome, {user.username}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          ) : location.pathname !== '/login' ? (
            <button
              type="button"
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
            >
              Login
            </button>
          ) : null}
        </div>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Navigation</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </Link>

          {/* Demo Links Start */}

          <Link
            to="/telegram-users"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Network size={20} />
            <span className="font-medium">Telegram Users</span>
          </Link>

          <Link
            to="/surveys"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <FileText size={20} />
            <span className="font-medium">Surveys</span>
          </Link>

          {/* Demo Links End */}
        </nav>
      </aside>
    </>
  )
}
