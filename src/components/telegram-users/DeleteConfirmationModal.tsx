interface DeleteConfirmationModalProps {
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

export function DeleteConfirmationModal({
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full">
        <h3 className="text-xl font-bold text-white mb-4">
          Delete Telegram User
        </h3>
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete this telegram user? This action cannot
          be undone.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
