import type { SurveyRead } from '@/lib/api/surveys.types'

interface SurveyInfoModalProps {
  survey: SurveyRead
  onClose: () => void
}

export function SurveyInfoModal({ survey, onClose }: SurveyInfoModalProps) {
  const formatArray = (arr: Array<string>) => {
    if (arr.length === 0) {
      return <span className="text-gray-500">None</span>
    }
    return <span className="text-white">{arr.join(', ')}</span>
  }

  const formatNullable = (value: string | null) => {
    if (!value) {
      return <span className="text-gray-500">Not set</span>
    }
    return <span className="text-white">{value}</span>
  }

  const formatName = (fullName: Record<string, string>) => {
    const name = [fullName.first_name, fullName.last_name]
      .filter(Boolean)
      .join(' ')
    return name || <span className="text-gray-500">-</span>
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">
          Survey Information
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">ID</span>
            <span className="text-white font-mono">{survey.id}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">User ID</span>
            <span className="text-white font-mono">{survey.user_id}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Name</span>
            <div className="text-right">{formatName(survey.full_name)}</div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Birth Date</span>
            <span className="text-white">{survey.birth_date}</span>
          </div>
          <div className="flex justify-between items-start py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Super Powers</span>
            <div className="text-right max-w-[60%]">
              {formatArray(survey.super_powers)}
            </div>
          </div>
          <div className="flex justify-between items-start py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Traits to Improve</span>
            <div className="text-right max-w-[60%]">
              {formatArray(survey.traits_to_improve)}
            </div>
          </div>
          <div className="flex justify-between items-start py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">To Buy</span>
            <div className="text-right max-w-[60%]">
              {formatArray(survey.to_buy)}
            </div>
          </div>
          <div className="flex justify-between items-start py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">To Sell</span>
            <div className="text-right max-w-[60%]">
              {formatArray(survey.to_sell)}
            </div>
          </div>
          <div className="flex justify-between items-start py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Service</span>
            <div className="text-right max-w-[60%]">
              {formatNullable(survey.service)}
            </div>
          </div>
          <div className="flex justify-between items-start py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Material Goal</span>
            <div className="text-right max-w-[60%]">
              {formatNullable(survey.material_goal)}
            </div>
          </div>
          <div className="flex justify-between items-start py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Social Goal</span>
            <div className="text-right max-w-[60%]">
              {formatNullable(survey.social_goal)}
            </div>
          </div>
          <div className="flex justify-between items-start py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Spiritual Goal</span>
            <div className="text-right max-w-[60%]">
              {formatNullable(survey.spiritual_goal)}
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Created</span>
            <span className="text-white text-sm">
              {new Date(survey.created_at).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-400 text-sm">Updated</span>
            <span className="text-white text-sm">
              {new Date(survey.updated_at).toLocaleString()}
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
