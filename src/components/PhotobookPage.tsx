import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Plus, Camera, Upload, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase, PhotobookImage } from '../lib/supabase'
import { compressImage, createThumbnail } from '../utils/imageCompression'

interface PhotobookPageProps {
  profile: { id: string; name: string }
}

export const PhotobookPage: React.FC<PhotobookPageProps> = ({ profile }) => {
  const [photos, setPhotos] = useState<PhotobookImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotobookImage | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photobook_images')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPhotos(data || [])
    } catch (error) {
      console.error('Error fetching photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (file: File) => {
    setUploading(true)
    setShowUploadModal(false)

    try {
      // Create both compressed image and thumbnail
      const [compressedFile, thumbnailFile] = await Promise.all([
        compressImage(file),
        createThumbnail(file)
      ])

      // Upload main image
      const fileExt = compressedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `photobook/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('wedding-photos')
        .upload(filePath, compressedFile)

      if (uploadError) throw uploadError

      // Upload thumbnail
      const thumbFileName = `thumb_${fileName}`
      const thumbFilePath = `photobook/thumbnails/${thumbFileName}`

      const { error: thumbUploadError } = await supabase.storage
        .from('wedding-photos')
        .upload(thumbFilePath, thumbnailFile)

      if (thumbUploadError) throw thumbUploadError

      // Get public URLs
      const { data: { publicUrl } } = supabase.storage
        .from('wedding-photos')
        .getPublicUrl(filePath)

      const { data: { publicUrl: thumbnailUrl } } = supabase.storage
        .from('wedding-photos')
        .getPublicUrl(thumbFilePath)

      // Save to database
      const { data, error: dbError } = await supabase
        .from('photobook_images')
        .insert({
          image_url: publicUrl,
          thumbnail_url: thumbnailUrl,
          uploader_id: profile.id,
          uploader_name: profile.name,
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Add to local state
      setPhotos(prev => [data, ...prev])
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment')
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture')
      fileInputRef.current.click()
    }
  }

  const handleImageLoad = (photoId: string) => {
    setImageLoading(prev => ({ ...prev, [photoId]: false }))
  }

  const handleImageLoadStart = (photoId: string) => {
    setImageLoading(prev => ({ ...prev, [photoId]: true }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="animate-pulse">
          <Camera className="w-8 h-8 text-primary-500 animate-float" />
        </div>
      </div>
    )
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
              Album Condiviso
            </h1>
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="max-w-md mx-auto px-4 py-6">
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600 text-lg mb-2">Nessuna foto ancora</p>
            <p className="text-neutral-500 text-sm">
              Sii il primo a condividere un momento speciale!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-200 relative">
                  {imageLoading[photo.id] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
                    </div>
                  )}
                  <img
                    src={photo.thumbnail_url || photo.image_url}
                    alt="Wedding moment"
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                      imageLoading[photo.id] ? 'opacity-0' : 'opacity-100'
                    }`}
                    onLoadStart={() => handleImageLoadStart(photo.id)}
                    onLoad={() => handleImageLoad(photo.id)}
                    onError={() => handleImageLoad(photo.id)}
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-2xl p-3">
                  <p className="text-white text-xs font-medium">
                    Da: {photo.uploader_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowUploadModal(true)}
        disabled={uploading}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center transform hover:scale-110 active:scale-95 disabled:opacity-50"
      >
        {uploading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </button>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-3xl w-full p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg text-neutral-900">Aggiungi Foto</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleCameraCapture}
                className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-primary-50 text-primary-700 rounded-2xl hover:bg-primary-100 transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span className="font-medium">Scatta Foto</span>
              </button>
              
              <button
                onClick={handleFileUpload}
                className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-neutral-100 text-neutral-700 rounded-2xl hover:bg-neutral-200 transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">Scegli dalla Galleria</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="max-w-sm w-full relative">
            <div className="relative">
              <img
                src={selectedPhoto.image_url}
                alt="Wedding moment"
                className="w-full rounded-2xl"
                loading="lazy"
              />
              {/* Loading indicator for full-size image */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl opacity-0 transition-opacity duration-300" id={`loading-${selectedPhoto.id}`}>
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-white font-medium">
                Da: {selectedPhoto.uploader_name}
              </p>
              <p className="text-white/70 text-sm mt-1">
                {new Date(selectedPhoto.created_at).toLocaleDateString('it-IT')}
              </p>
            </div>
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
            handleFileSelect(file)
          }
        }}
        className="hidden"
      />
    </div>
  )
}