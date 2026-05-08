import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'

// Auth pages
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'

// Manager pages
import ManagerDashboard from './pages/manager/Dashboard'
import Tasks            from './pages/manager/Tasks'
import Employees        from './pages/manager/Employees'
import Productivity     from './pages/manager/Productivity'

// Employee pages
import MyDashboard from './pages/employee/MyDashboard'
import MyTasks     from './pages/employee/MyTasks'

// Shared
import Profile  from './pages/Profile'
import NotFound from './pages/NotFound'

const RootRedirect = () => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'ADMIN') return <Navigate to="/dashboard" replace />
  return <Navigate to="/my-dashboard" replace />
}

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Root */}
        <Route path="/" element={<RootRedirect />} />

        {/* Manager routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute role="ADMIN"><ManagerDashboard /></ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute role="ADMIN"><Tasks /></ProtectedRoute>
        } />
        <Route path="/employees" element={
          <ProtectedRoute role="ADMIN"><Employees /></ProtectedRoute>
        } />
        <Route path="/productivity" element={
          <ProtectedRoute role="ADMIN"><Productivity /></ProtectedRoute>
        } />

        {/* Employee routes */}
        <Route path="/my-dashboard" element={
          <ProtectedRoute role="EMPLOYEE"><MyDashboard /></ProtectedRoute>
        } />
        <Route path="/my-tasks" element={
          <ProtectedRoute role="EMPLOYEE"><MyTasks /></ProtectedRoute>
        } />

        {/* Shared */}
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)

export default App
