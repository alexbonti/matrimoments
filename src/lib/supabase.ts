import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

// Database types
export interface Profile {
  id: string
  name: string
  created_at: string
}

export interface PhotobookImage {
  id: string
  image_url: string
  thumbnail_url: string
  uploader_id: string
  uploader_name: string
  created_at: string
}

export interface GuestbookPost {
  id: string
  creator_id: string
  creator_name: string
  type: 'TEXT' | 'IMAGE'
  content: string
  position_x: number
  position_y: number
  created_at: string
}