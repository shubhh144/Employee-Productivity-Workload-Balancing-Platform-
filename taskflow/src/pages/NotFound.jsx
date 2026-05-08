import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NotFound = () => {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  const goHome = () => {
    if (!user) navigate('/login')
    else if (isAdmin()) navigate('/dashboard')
    else navigate('/my-dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm page-enter">
        <p className="font-display text-8xl font-medium text-black mb-4">404</p>
        <p className="text-gray-500 text-sm mb-8">This page doesn't exist or you don't have access.</p>
        <button onClick={goHome} className="btn-primary px-8">
          Back to Home
        </button>
      </div>
    </div>
  )
}

export default NotFound
