import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [profile, setProfile] = useState<{ id: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user has a name stored locally
    const storedName = localStorage.getItem('wedding-guest-name')
    const storedId = localStorage.getItem('wedding-guest-id')

    if (storedName && storedId) {
      setProfile({ id: storedId, name: storedName })
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (name: string) => {
    try {
      // Generate a unique ID for this guest
      const userId = `guest_${Date.now()}_${Math.random().toString(36).substring(2)}`

      // Create or update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: name.trim(),
        })

      if (profileError) throw profileError

      // Store locally
      localStorage.setItem('wedding-guest-name', name.trim())
      localStorage.setItem('wedding-guest-id', userId)

      setProfile({ id: userId, name: name.trim() })
    } catch (error) {
      console.error('Error during login:', error)
      throw error
    }
  }

  return { profile, loading, login }
}