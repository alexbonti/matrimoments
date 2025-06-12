import React, { useState } from 'react'
import { Heart, Sparkles } from 'lucide-react'

interface OnboardingPageProps {
  onComplete: (name: string) => void
  loading?: boolean
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete, loading }) => {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onComplete(name.trim())
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="animate-pulse">
          <Heart className="w-8 h-8 text-primary-500 animate-float" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Heart className="w-16 h-16 text-primary-500 animate-float" />
              <Sparkles className="w-6 h-6 text-rose-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          
          <h1 className="font-serif text-3xl font-semibold text-neutral-900 mb-4 leading-tight">
            Benvenuti al nostro
            <br />
            <span className="text-primary-500">Matrimonio!</span>
          </h1>
          
          <p className="text-neutral-600 text-lg leading-relaxed">
            Aiutateci a rendere questo giorno ancora piu' indimenticabile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
              Il tuo noome
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-lg bg-white/80 backdrop-blur-sm"
              placeholder="Your beautiful name..."
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 px-6 rounded-2xl font-medium text-lg transition-all duration-200 hover:from-primary-600 hover:to-primary-700 focus:ring-4 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Joining...
              </div>
            ) : (
              'Join the Celebration'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-500">
            Per mantenere tutte le tue memorie ✨
          </p>
        </div>
      </div>
    </div>
  )
}