import React from 'react'
import Navbar from './Navbar'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-14">
        <div className="max-w-7xl mx-auto px-6 py-8 page-enter">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
