import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token  = localStorage.getItem('token')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) } catch { }
    }
    setLoading(false)
  }, [])
const buildUser = (d) => ({
  id:         d.userId || d.id,
  userId:     d.userId || d.id,
  employeeId: d.employeeId || d.userId || d.id,  // ← fallback chain
  name:       d.name,
  email:      d.email,
  role:       d.role,
})
  const login = async (credentials) => {
    const res = await authAPI.login(credentials)
    console.log("🔐 Login response:", res.data)
    const d = res.data.data
    const userObj = buildUser(d)
    localStorage.setItem('token', d.token)
    localStorage.setItem('user', JSON.stringify(userObj))
    setUser(userObj)
    return userObj
  }

  const register = async (credentials) => {
    const res = await authAPI.register(credentials)
    console.log("📝 Register response:", res.data)
    const d = res.data.data
    if (d?.token) {
      const userObj = buildUser(d)
      localStorage.setItem('token', d.token)
      localStorage.setItem('user', JSON.stringify(userObj))
      setUser(userObj)
      return userObj
    }
    return { redirectToLogin: true }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isAdmin    = () => user?.role === 'ADMIN'
  const isEmployee = () => user?.role === 'EMPLOYEE'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isEmployee }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext