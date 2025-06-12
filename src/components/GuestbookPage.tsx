import React, { useState, useRef } from 'react'
import { ArrowLeft, Plus, MessageSquare, Camera, X, Send, Palette, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { compressImage } from '../utils/imageCompression'
import { DrawingCanvas } from './DrawingCanvas'

interface GuestbookPageProps {
  profile: { id: string; name: string }
}

export const GuestbookPage: React.FC<GuestbookPageProps> = ({ profile }) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createMode, setCreateMode] = useState<'text' | 'image' | 'drawing' | null>(null)
  const [textMessage, setTextMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showThankYouMessage = () => {
    setShowThankYou(true)
    setTimeout(() => {
      setShowThankYou(false)
      setShowCreateModal(false)
      setCreateMode(null)
    }, 3000)
  }

  const handleTextSubmit = async () => {
    if (!textMessage.trim()) return

    try {
      const { error } = await supabase
        .from('guestbook_posts')
        .insert({
          creator_id: profile.id,
          creator_name: profile.name,
          type: 'TEXT',
          content: textMessage.trim(),
          position_x: 0,
          position_y: 0,
        })

      if (error) throw error

      setTextMessage('')
      showThankYouMessage()
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)

    try {
      // Compress the image
      const compressedFile = await compressImage(file)

      // Upload to Supabase Storage
      const fileExt = compressedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `guestbook/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('wedding-photos')
        .upload(filePath, compressedFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('wedding-photos')
        .getPublicUrl(filePath)

      // Create post
      const { error: dbError } = await supabase
        .from('guestbook_posts')
        .insert({
          creator_id: profile.id,
          creator_name: profile.name,
          type: 'IMAGE',
          content: publicUrl,
          position_x: 0,
          position_y: 0,
        })

      if (dbError) throw dbError

      showThankYouMessage()
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrawingSave = async (dataUrl: string) => {
    setUploading(true)

    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      // Create file from blob
      const file = new File([blob], `drawing-${Date.now()}.png`, { type: 'image/png' })

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.png`
      const filePath = `guestbook/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('wedding-photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('wedding-photos')
        .getPublicUrl(filePath)

      // Create post
      const { error: dbError } = await supabase
        .from('guestbook_posts')
        .insert({
          creator_id: profile.id,
          creator_name: profile.name,
          type: 'DRAWING',
          content: publicUrl,
          position_x: 0,
          position_y: 0,
        })

      if (dbError) throw dbError

      showThankYouMessage()
    } catch (error) {
      console.error('Error saving drawing:', error)
      alert('Failed to save drawing. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </Link>
            <h1 className="font-serif text-xl font-semibold text-neutral-900 ml-3">
              Il muro del Giorno
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <MessageSquare className="w-16 h-16 text-rose-500 animate-float" />
              <Heart className="w-6 h-6 text-primary-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          
          <h2 className="font-serif text-2xl font-semibold text-neutral-900 mb-4">
            Lascia un messaggio
          </h2>
          
          <p className="text-neutral-600 text-lg leading-relaxed">
            Condividi i tuoi pensieri, una foto o un disegno per rendere questo giorno ancora più speciale
          </p>
        </div>

        {/* Action Cards */}
        <div className="space-y-4">
          <button
            onClick={() => {
              setShowCreateModal(true)
              setCreateMode('text')
            }}
            className="w-full group"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-neutral-200/50 shadow-sm hover:shadow-lg transition-all duration-300 transform group-hover:scale-[1.02] group-active:scale-[0.98]">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl flex items-center justify-center group-hover:from-rose-200 group-hover:to-rose-300 transition-colors duration-300">
                    <MessageSquare className="w-7 h-7 text-rose-600" />
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-1">
                    Scrivi un Messaggio
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Condividi i tuoi pensieri e auguri
                  </p>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setShowCreateModal(true)
              setCreateMode('image')
            }}
            className="w-full group"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-neutral-200/50 shadow-sm hover:shadow-lg transition-all duration-300 transform group-hover:scale-[1.02] group-active:scale-[0.98]">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center group-hover:from-primary-200 group-hover:to-primary-300 transition-colors duration-300">
                    <Camera className="w-7 h-7 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-1">
                    Aggiungi una Foto
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Cattura un momento speciale
                  </p>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setShowCreateModal(true)
              setCreateMode('drawing')
            }}
            className="w-full group"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-neutral-200/50 shadow-sm hover:shadow-lg transition-all duration-300 transform group-hover:scale-[1.02] group-active:scale-[0.98]">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-sage-100 to-sage-200 rounded-2xl flex items-center justify-center group-hover:from-sage-200 group-hover:to-sage-300 transition-colors duration-300">
                    <Palette className="w-7 h-7 text-sage-600" />
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-1">
                    Crea un Disegno
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Esprimi la tua creatività
                  </p>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Decorative Element */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-neutral-400">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-neutral-300" />
            <Heart className="w-4 h-4" />
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-neutral-300" />
          </div>
          <p className="text-xs text-neutral-500 mt-3">
            Ogni contributo è un tesoro
          </p>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && !showThankYou && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          {createMode === 'text' ? (
            <div className="bg-white rounded-t-3xl w-full p-6 animate-slide-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-neutral-900">Il tuo Messaggio</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setCreateMode(null)
                    setTextMessage('')
                  }}
                  className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>
              
              <div className="space-y-4">
                <textarea
                  value={textMessage}
                  onChange={(e) => setTextMessage(e.target.value)}
                  placeholder="Condividi i tuoi pensieri più belli..."
                  className="w-full h-32 px-4 py-3 rounded-2xl border border-neutral-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-200 resize-none"
                  maxLength={300}
                  autoFocus
                />
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">
                    {textMessage.length}/300
                  </span>
                  <button
                    onClick={handleTextSubmit}
                    disabled={!textMessage.trim()}
                    className="px-6 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Condividi</span>
                  </button>
                </div>
              </div>
            </div>
          ) : createMode === 'image' ? (
            <div className="bg-white rounded-t-3xl w-full p-6 animate-slide-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-neutral-900">Aggiungi Foto</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setCreateMode(null)
                  }}
                  className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute('capture', 'environment')
                      fileInputRef.current.click()
                    }
                  }}
                  disabled={uploading}
                  className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-primary-50 text-primary-700 rounded-2xl hover:bg-primary-100 transition-colors disabled:opacity-50"
                >
                  <Camera className="w-5 h-5" />
                  <span className="font-medium">
                    {uploading ? 'Caricamento...' : 'Scatta Foto'}
                  </span>
                </button>
                
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture')
                      fileInputRef.current.click()
                    }
                  }}
                  disabled={uploading}
                  className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-neutral-100 text-neutral-700 rounded-2xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  <Camera className="w-5 h-5" />
                  <span className="font-medium">
                    {uploading ? 'Caricamento...' : 'Scegli dalla Galleria'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <DrawingCanvas
              onSave={handleDrawingSave}
              onCancel={() => {
                setShowCreateModal(false)
                setCreateMode(null)
              }}
            />
          )}
        </div>
      )}

      {/* Thank You Message */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-scale-in">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Heart className="w-16 h-16 text-rose-500 animate-float" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
            </div>
            
            <h3 className="font-serif text-2xl font-semibold text-neutral-900 mb-4">
              Grazie!
            </h3>
            
            <p className="text-neutral-600 text-lg leading-relaxed mb-2">
              Il tuo contributo è stato aggiunto al muro
            </p>
            
            <p className="text-primary-600 font-medium">
              — Gianluca e Serena
            </p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleImageUpload(file)
          }
        }}
        className="hidden"
      />
    </div>
  )
}