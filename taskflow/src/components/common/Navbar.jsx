import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, Menu, X } from 'lucide-react'

const ManagerLinks = [
  { to: '/dashboard',   label: 'Dashboard'    },
  { to: '/tasks',       label: 'Tasks'        },
  { to: '/employees',   label: 'Employees'    },
  { to: '/productivity',label: 'Productivity' },
  { to: '/profile',     label: 'Profile'      },
]

const EmployeeLinks = [
  { to: '/my-dashboard', label: 'Dashboard' },
  { to: '/my-tasks',     label: 'My Tasks'  },
  { to: '/profile',      label: 'Profile'   },
]

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = isAdmin() ? ManagerLinks : EmployeeLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-black" />
            <span className="font-display font-medium text-base tracking-tight">TaskFlow</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive
                    ? 'text-sm font-medium text-black border-b-2 border-black px-4 py-4'
                    : 'text-sm font-medium text-gray-500 hover:text-black transition-colors px-4 py-4'
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-xs text-gray-400 tracking-wide">{user?.name}</span>
            <span className="text-xs border border-gray-200 px-2 py-0.5 text-gray-500 uppercase tracking-widest">
              {user?.role}
            </span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors">
              <LogOut size={13} />
              Logout
            </button>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
          <div className="px-6 py-4 flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? 'text-sm font-medium text-black py-2.5 border-b border-gray-100'
                    : 'text-sm text-gray-500 hover:text-black py-2.5 border-b border-gray-100 transition-colors'
                }
              >
                {link.label}
              </NavLink>
            ))}
            <button onClick={handleLogout} className="text-left text-sm text-gray-500 hover:text-black pt-2 mt-1">
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
