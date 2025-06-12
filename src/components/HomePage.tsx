import React from 'react'
import { Camera, MessageCircleHeart, Heart, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

interface HomePageProps {
  guestName: string
}

export const HomePage: React.FC<HomePageProps> = ({ guestName }) => {
  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-white/95 to-neutral-50/95 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="relative">
                <Heart className="w-8 h-8 text-primary-500" />
                <Sparkles className="w-4 h-4 text-rose-500 absolute -top-1 -right-1" />
              </div>
            </div>
            <h1 className="font-serif text-2xl font-semibold text-neutral-900">
              MatriMoments
            </h1>
             <h2 className="font-serif text-2xl font-semibold text-primary-900">
              Gianluca & Serena
            </h2>
            <p className="text-neutral-600 mt-1">
              Bentornato, <span className="font-medium text-primary-600">{guestName}</span>!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <p className="text-neutral-600 text-lg leading-relaxed">
              Aiutateci a rendere questo giorno ancora piu' indimenticabile
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            <Link
              to="/photobook"
              className="block group"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-neutral-200/50 shadow-sm hover:shadow-lg transition-all duration-300 transform group-hover:scale-[1.02] group-active:scale-[0.98]">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center group-hover:from-primary-200 group-hover:to-primary-300 transition-colors duration-300">
                      <Camera className="w-7 h-7 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-neutral-900 mb-1">
                      Album Condiviso
                    </h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      Visiona e contribuisci foto di questo giorno
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to="/guestbook"
              className="block group"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-neutral-200/50 shadow-sm hover:shadow-lg transition-all duration-300 transform group-hover:scale-[1.02] group-active:scale-[0.98]">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl flex items-center justify-center group-hover:from-rose-200 group-hover:to-rose-300 transition-colors duration-300">
                      <MessageCircleHeart className="w-7 h-7 text-rose-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-neutral-900 mb-1">
                      Il muro del Giorno
                    </h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      Lascia un messaggio agli sposi
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Decorative Element */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 text-neutral-400">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-neutral-300" />
              <Heart className="w-4 h-4" />
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-neutral-300" />
            </div>
            <p className="text-xs text-neutral-500 mt-3">
              Ogni momento e' un Tesssssoro
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}