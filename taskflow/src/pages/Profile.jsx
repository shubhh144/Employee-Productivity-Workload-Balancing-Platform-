import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/common/Layout'
import PageHeader from '../components/common/PageHeader'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Mail, Shield } from 'lucide-react'

const Profile = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [confirmed, setConfirmed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Layout>
      <PageHeader title="Profile" subtitle="Your account details" />

      <div className="max-w-xl animate-fade-in">
        {/* Avatar section */}
        <div className="bg-white border border-gray-200 p-8 mb-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-black flex items-center justify-center flex-shrink-0">
              <span className="text-white font-display text-2xl">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="font-display text-2xl font-medium text-black">{user?.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
              <span className="inline-flex items-center mt-2 px-2.5 py-0.5 text-xs font-medium border border-gray-200 text-gray-500 uppercase tracking-widest">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white border border-gray-200 divide-y divide-gray-50 mb-4">
          <div className="px-6 py-4 flex items-center gap-4">
            <User size={15} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-0.5">Full Name</p>
              <p className="text-sm font-medium text-black">{user?.name || '—'}</p>
            </div>
          </div>
          <div className="px-6 py-4 flex items-center gap-4">
            <Mail size={15} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-0.5">Email</p>
              <p className="text-sm font-medium text-black">{user?.email || '—'}</p>
            </div>
          </div>
          <div className="px-6 py-4 flex items-center gap-4">
            <Shield size={15} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-0.5">Role</p>
              <p className="text-sm font-medium text-black">{user?.role || '—'}</p>
            </div>
          </div>
          <div className="px-6 py-4 flex items-center gap-4">
            <div className="w-4 h-4 bg-black flex-shrink-0 text-white flex items-center justify-center">
              <span className="text-xs leading-none">#</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-0.5">User ID</p>
              <p className="text-sm font-mono text-gray-600">{user?.id || '—'}</p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-4">
            Signing out will clear your session and return you to the login page.
          </p>
          {!confirmed ? (
            <button
              onClick={() => setConfirmed(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <LogOut size={13} /> Sign Out
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Are you sure?</span>
              <button onClick={handleLogout} className="btn-primary flex items-center gap-1.5">
                <LogOut size={13} /> Yes, sign out
              </button>
              <button onClick={() => setConfirmed(false)} className="btn-ghost">Cancel</button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Profile
