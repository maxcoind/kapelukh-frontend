import { useState } from 'react'
import type { SurveyCreate, SurveyRead } from '@/lib/api/surveys.types'

interface SurveyModalProps {
  survey?: SurveyRead
  onClose: () => void
  onSubmit: (data: SurveyCreate) => void
  onDelete?: () => void
  isLoading: boolean
  isDeleting?: boolean
}

export function SurveyModal({
  survey,
  onClose,
  onSubmit,
  onDelete,
  isLoading,
  isDeleting,
}: SurveyModalProps) {
  const [userId, setUserId] = useState(survey?.user_id.toString() || '')
  const [firstName, setFirstName] = useState(survey?.full_name.first_name ?? '')
  const [lastName, setLastName] = useState(survey?.full_name.last_name ?? '')
  const [birthDate, setBirthDate] = useState(survey?.birth_date || '')
  const [superPowers, setSuperPowers] = useState(
    survey?.super_powers ? survey.super_powers.join(', ') : '',
  )
  const [traitsToImprove, setTraitsToImprove] = useState(
    survey?.traits_to_improve ? survey.traits_to_improve.join(', ') : '',
  )
  const [toBuy, setToBuy] = useState(
    survey?.to_buy ? survey.to_buy.join(', ') : '',
  )
  const [toSell, setToSell] = useState(
    survey?.to_sell ? survey.to_sell.join(', ') : '',
  )
  const [service, setService] = useState(survey?.service || '')
  const [materialGoal, setMaterialGoal] = useState(survey?.material_goal || '')
  const [socialGoal, setSocialGoal] = useState(survey?.social_goal || '')
  const [spiritualGoal, setSpiritualGoal] = useState(
    survey?.spiritual_goal || '',
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const full_name =
      firstName || lastName
        ? {
            ...(firstName && { first_name: firstName }),
            ...(lastName && { last_name: lastName }),
          }
        : null

    onSubmit({
      user_id: parseInt(userId),
      full_name,
      super_powers: superPowers
        ? superPowers
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : null,
      birth_date: birthDate,
      traits_to_improve: traitsToImprove
        ? traitsToImprove
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : null,
      to_buy: toBuy
        ? toBuy
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : null,
      to_sell: toSell
        ? toSell
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : null,
      service: service || null,
      material_goal: materialGoal || null,
      social_goal: socialGoal || null,
      spiritual_goal: spiritualGoal || null,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
        {survey && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="absolute top-4 right-4 text-red-400 hover:text-red-300 transition-colors"
            disabled={isDeleting}
            aria-label="Delete survey"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <title>Delete survey</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        )}
        <h2 className="text-2xl font-bold text-white mb-4">
          {survey ? 'Edit Survey' : 'Add Survey'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="user_id"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                User ID
              </label>
              <input
                type="number"
                id="user_id"
                min="1"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={!!survey}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                required
              />
            </div>
            <div>
              <label
                htmlFor="birth_date"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Birth Date
              </label>
              <input
                type="date"
                id="birth_date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="super_powers"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Super Powers (comma-separated)
            </label>
            <input
              type="text"
              id="super_powers"
              value={superPowers}
              onChange={(e) => setSuperPowers(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., coding, leadership, problem solving"
            />
          </div>
          <div>
            <label
              htmlFor="traits_to_improve"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Traits to Improve (comma-separated)
            </label>
            <input
              type="text"
              id="traits_to_improve"
              value={traitsToImprove}
              onChange={(e) => setTraitsToImprove(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., patience, public speaking"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="to_buy"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                To Buy (comma-separated)
              </label>
              <input
                type="text"
                id="to_buy"
                value={toBuy}
                onChange={(e) => setToBuy(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., laptop, books"
              />
            </div>
            <div>
              <label
                htmlFor="to_sell"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                To Sell (comma-separated)
              </label>
              <input
                type="text"
                id="to_sell"
                value={toSell}
                onChange={(e) => setToSell(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., old phone, clothes"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="service"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Service
            </label>
            <input
              type="text"
              id="service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Consulting, Design"
            />
          </div>
          <div>
            <label
              htmlFor="material_goal"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Material Goal
            </label>
            <input
              type="text"
              id="material_goal"
              value={materialGoal}
              onChange={(e) => setMaterialGoal(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Buy a house"
            />
          </div>
          <div>
            <label
              htmlFor="social_goal"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Social Goal
            </label>
            <input
              type="text"
              id="social_goal"
              value={socialGoal}
              onChange={(e) => setSocialGoal(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Build a community"
            />
          </div>
          <div>
            <label
              htmlFor="spiritual_goal"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Spiritual Goal
            </label>
            <input
              type="text"
              id="spiritual_goal"
              value={spiritualGoal}
              onChange={(e) => setSpiritualGoal(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Find inner peace"
            />
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
              {isLoading ? 'Saving...' : survey ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
