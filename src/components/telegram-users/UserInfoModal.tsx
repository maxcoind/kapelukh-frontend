import { CheckCircle2, XCircle } from 'lucide-react'
import type { TelegramUserRead } from '@/lib/api/telegram-user.types'

interface UserInfoModalProps {
  user: TelegramUserRead
  onClose: () => void
}

export function UserInfoModal({ user, onClose }: UserInfoModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full relative">
        <h2 className="text-2xl font-bold text-white mb-4">
          Telegram User Information
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">ID</span>
            <span className="text-white font-mono">{user.id}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Telegram ID</span>
            <span className="text-white font-mono">{user.telegram_id}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Username</span>
            <span className="text-white">
              {user.username ? (
                `@${user.username}`
              ) : (
                <span className="text-gray-500">Not set</span>
              )}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">First Name</span>
            <span className="text-white">{user.first_name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Last Name</span>
            <span className="text-white">
              {user.last_name || <span className="text-gray-500">Not set</span>}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Language Code</span>
            <span className="text-white">
              {user.language_code || (
                <span className="text-gray-500">Not set</span>
              )}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Status</span>
            <div className="flex items-center gap-2">
              {user.is_active ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-white">Active</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-white">Inactive</span>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Bot</span>
            <div className="flex items-center gap-2">
              {user.is_bot ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  <span className="text-white">Yes</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-gray-500" />
                  <span className="text-white">No</span>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Created</span>
            <span className="text-white text-sm">
              {new Date(user.created_at).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Last Updated</span>
            <span className="text-white text-sm">
              {new Date(user.updated_at).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-400 text-sm">Last Interaction</span>
            <span className="text-white text-sm">
              {user.last_interaction_at ? (
                new Date(user.last_interaction_at).toLocaleString()
              ) : (
                <span className="text-gray-500">Never</span>
              )}
            </span>
          </div>
        </div>
        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
