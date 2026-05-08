import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

const Register = () => {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]         = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // ✅ Extract error message from any backend response shape
  const extractError = (err) => {
    console.error("Register error full object:", err.response)
    const data = err.response?.data
    if (!data) return 'Network error. Is backend running?'

    // Try all common fields
    return data.message
        || data.error
        || data.data?.message
        || (typeof data === 'string' ? data : null)
        || `Error ${err.response?.status}: Registration failed.`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const result = await register(form)
      if (result?.redirectToLogin) {
        setSuccess('Account created! Redirecting to login…')
        setTimeout(() => navigate('/login'), 1500)
        return
      }
      if (result?.role === 'ADMIN') navigate('/dashboard')
      else navigate('/my-dashboard')
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white" />
          <span className="font-display font-medium text-white text-base tracking-tight">TaskFlow</span>
        </div>
        <div>
          <p className="font-display text-4xl font-medium text-white leading-tight mb-4">
            Join your team.<br />
            <span className="text-gray-500">Start delivering.</span>
          </p>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            Create your account and get instant access.
          </p>
        </div>
        <div className="flex gap-6 text-xs text-gray-600 tracking-widest uppercase">
          <span>Assign</span><span>·</span><span>Track</span><span>·</span><span>Deliver</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20">
        <div className="max-w-sm w-full mx-auto">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-4 h-4 bg-black" />
            <span className="font-display font-medium text-base">TaskFlow</span>
          </div>

          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Get started</p>
          <h1 className="font-display text-3xl font-medium text-black mb-8">Create account</h1>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-xs text-red-600">
              ⚠ {error}
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 text-xs text-green-700">
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <input type="text" name="name" value={form.name}
                onChange={handleChange} placeholder="Jane Smith"
                required className="input-field" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@company.com"
                required className="input-field" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="Min. 6 characters" required minLength={6}
                  className="input-field pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Role</label>
              <select name="role" value={form.role} onChange={handleChange}
                className="input-field cursor-pointer">
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Manager / Admin</option>
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-black font-medium hover:underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register