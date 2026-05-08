import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400 tracking-widest uppercase">Loading</span>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  if (role === 'ADMIN' && !(user.role === 'ADMIN' || user.role === 'MANAGER')) {
    return <Navigate to="/my-dashboard" replace />
  }
  if (role === 'EMPLOYEE' && (user.role === 'ADMIN' || user.role === 'MANAGER')) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
