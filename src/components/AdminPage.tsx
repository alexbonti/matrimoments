import React, { useState, useEffect } from 'react'
import { Trash2, Users, MessageSquare, Camera, Palette, Eye, EyeOff } from 'lucide-react'
import { supabase, GuestbookPost, PhotobookImage, Profile } from '../lib/supabase'

const ADMIN_PASSWORD = 'wedding2024' // Simple hardcoded password

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'guestbook' | 'photobook' | 'users'>('guestbook')
  
  // Data states
  const [guestbookPosts, setGuestbookPosts] = useState<GuestbookPost[]>([])
  const [photobookImages, setPhotobookImages] = useState<PhotobookImage[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalPhotos: 0,
    totalUsers: 0,
    textPosts: 0,
    imagePosts: 0,
    drawingPosts: 0
  })

  useEffect(() => {
    // Check if already authenticated
    const isAuth = localStorage.getItem('admin-authenticated') === 'true'
    if (isAuth) {
      setIsAuthenticated(true)
      fetchAllData()
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simple password check
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('admin-authenticated', 'true')
      await fetchAllData()
    } else {
      alert('Invalid password')
    }
    
    setLoading(false)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('admin-authenticated')
    setPassword('')
  }

  const fetchAllData = async () => {
    try {
      // Fetch guestbook posts
      const { data: posts } = await supabase
        .from('guestbook_posts')
        .select('*')
        .order('created_at', { ascending: false })

      // Fetch photobook images
      const { data: photos } = await supabase
        .from('photobook_images')
        .select('*')
        .order('created_at', { ascending: false })

      // Fetch profiles
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      setGuestbookPosts(posts || [])
      setPhotobookImages(photos || [])
      setProfiles(users || [])

      // Calculate stats
      const textPosts = posts?.filter(p => p.type === 'TEXT').length || 0
      const imagePosts = posts?.filter(p => p.type === 'IMAGE').length || 0
      const drawingPosts = posts?.filter(p => p.type === 'DRAWING').length || 0

      setStats({
        totalPosts: posts?.length || 0,
        totalPhotos: photos?.length || 0,
        totalUsers: users?.length || 0,
        textPosts,
        imagePosts,
        drawingPosts
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const deleteGuestbookPost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const { error } = await supabase
        .from('guestbook_posts')
        .delete()
        .eq('id', id)

      if (error) throw error

      setGuestbookPosts(prev => prev.filter(p => p.id !== id))
      setStats(prev => ({ ...prev, totalPosts: prev.totalPosts - 1 }))
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    }
  }

  const deletePhotobookImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    try {
      const { error } = await supabase
        .from('photobook_images')
        .delete()
        .eq('id', id)

      if (error) throw error

      setPhotobookImages(prev => prev.filter(p => p.id !== id))
      setStats(prev => ({ ...prev, totalPhotos: prev.totalPhotos - 1 }))
    } catch (error) {
      console.error('Error deleting photo:', error)
      alert('Failed to delete photo')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-neutral-200/50">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-serif text-2xl font-semibold text-neutral-900 mb-2">
                Admin Access
              </h1>
              <p className="text-neutral-600">
                Enter the admin password to continue
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-2xl border border-neutral-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-200"
                    placeholder="Enter admin password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-neutral-100 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!password.trim() || loading}
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3 px-6 rounded-2xl font-medium transition-all duration-200 hover:from-rose-600 hover:to-rose-700 focus:ring-4 focus:ring-rose-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Authenticating...
                  </div>
                ) : (
                  'Access Admin Panel'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-xl font-semibold text-neutral-900">
              Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalPosts}</p>
                <p className="text-sm text-neutral-600">Guestbook Posts</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalPhotos}</p>
                <p className="text-sm text-neutral-600">Photos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-neutral-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalUsers}</p>
                <p className="text-sm text-neutral-600">Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center">
                <Palette className="w-5 h-5 text-sage-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.drawingPosts}</p>
                <p className="text-sm text-neutral-600">Drawings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/50 overflow-hidden">
          <div className="border-b border-neutral-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('guestbook')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'guestbook'
                    ? 'bg-rose-50 text-rose-700 border-b-2 border-rose-500'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Guestbook Posts ({stats.totalPosts})
              </button>
              <button
                onClick={() => setActiveTab('photobook')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'photobook'
                    ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Photobook ({stats.totalPhotos})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-neutral-50 text-neutral-700 border-b-2 border-neutral-500'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Users ({stats.totalUsers})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'guestbook' && (
              <div className="space-y-4">
                {guestbookPosts.length === 0 ? (
                  <p className="text-neutral-500 text-center py-8">No guestbook posts yet</p>
                ) : (
                  guestbookPosts.map((post) => (
                    <div key={post.id} className="bg-neutral-50 rounded-xl p-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            post.type === 'TEXT' ? 'bg-rose-100 text-rose-700' :
                            post.type === 'IMAGE' ? 'bg-primary-100 text-primary-700' :
                            'bg-sage-100 text-sage-700'
                          }`}>
                            {post.type}
                          </span>
                          <span className="text-sm text-neutral-600">by {post.creator_name}</span>
                          <span className="text-xs text-neutral-400">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {post.type === 'TEXT' ? (
                          <p className="text-neutral-800 text-sm">{post.content}</p>
                        ) : (
                          <div className="w-20 h-20 rounded-lg overflow-hidden">
                            <img src={post.content} alt="Post content" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteGuestbookPost(post.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'photobook' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photobookImages.length === 0 ? (
                  <div className="col-span-full text-neutral-500 text-center py-8">No photos yet</div>
                ) : (
                  photobookImages.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-neutral-200">
                        <img
                          src={photo.image_url}
                          alt="Wedding photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <button
                          onClick={() => deletePhotobookImage(photo.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-neutral-600">From: {photo.uploader_name}</p>
                        <p className="text-xs text-neutral-400">
                          {new Date(photo.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-3">
                {profiles.length === 0 ? (
                  <p className="text-neutral-500 text-center py-8">No users yet</p>
                ) : (
                  profiles.map((profile) => (
                    <div key={profile.id} className="bg-neutral-50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900">{profile.name}</p>
                        <p className="text-sm text-neutral-600">ID: {profile.id}</p>
                        <p className="text-xs text-neutral-400">
                          Joined: {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-600">
                          Posts: {guestbookPosts.filter(p => p.creator_id === profile.id).length}
                        </p>
                        <p className="text-sm text-neutral-600">
                          Photos: {photobookImages.filter(p => p.uploader_id === profile.id).length}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}