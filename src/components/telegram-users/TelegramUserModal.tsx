import { useState } from 'react'
import type {
  TelegramUserCreate,
  TelegramUserRead,
} from '@/lib/api/telegram-user.types'

interface TelegramUserModalProps {
  user?: TelegramUserRead
  onClose: () => void
  onSubmit: (data: TelegramUserCreate) => void
  onDelete?: () => void
  isLoading: boolean
  isDeleting?: boolean
}

export function TelegramUserModal({
  user,
  onClose,
  onSubmit,
  onDelete,
  isLoading,
  isDeleting,
}: TelegramUserModalProps) {
  const [telegramId, setTelegramId] = useState(
    user?.telegram_id.toString() || '',
  )
  const [username, setUsername] = useState(user?.username || '')
  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [languageCode, setLanguageCode] = useState(user?.language_code || '')
  const [isActive, setIsActive] = useState(
    user?.is_active !== undefined ? user.is_active : true,
  )
  const [isBot, setIsBot] = useState(
    user?.is_bot !== undefined ? user.is_bot : false,
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      telegram_id: parseInt(telegramId),
      username: username || undefined,
      first_name: firstName,
      last_name: lastName || undefined,
      language_code: languageCode || undefined,
      is_active: isActive,
      is_bot: isBot,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full relative">
        {user && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="absolute top-4 right-4 text-red-400 hover:text-red-300 transition-colors"
            disabled={isDeleting}
            aria-label="Delete user"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <title>Delete user</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        )}
        <h2 className="text-2xl font-bold text-white mb-4">
          {user ? 'Edit Telegram User' : 'Add Telegram User'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="telegram_id"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Telegram ID
            </label>
            <input
              type="number"
              id="telegram_id"
              min="1"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              disabled={!!user}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              required
            />
          </div>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              maxLength={32}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              maxLength={64}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="last_name"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              maxLength={64}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="language_code"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Language Code
            </label>
            <input
              type="text"
              id="language_code"
              maxLength={10}
              value={languageCode}
              onChange={(e) => setLanguageCode(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                Active
              </label>
            </div>
            <div className="flex-1">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={isBot}
                  onChange={(e) => setIsBot(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                Bot
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : user ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
