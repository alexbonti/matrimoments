import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { OnboardingPage } from './components/OnboardingPage'
import { HomePage } from './components/HomePage'
import { PhotobookPage } from './components/PhotobookPage'
import { GuestbookPage } from './components/GuestbookPage'
import { AdminPage } from './components/AdminPage'

function App() {
  const { profile, loading, login } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-primary-500 rounded-full animate-float" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return <OnboardingPage onComplete={login} />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage guestName={profile.name} />} />
        <Route path="/photobook" element={<PhotobookPage profile={profile} />} />
        <Route path="/guestbook" element={<GuestbookPage profile={profile} />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App