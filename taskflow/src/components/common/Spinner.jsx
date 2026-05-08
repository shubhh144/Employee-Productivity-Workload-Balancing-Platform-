import React from 'react'

const Spinner = ({ size = 'md', label = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${sizes[size]} border-2 border-gray-200 border-t-black rounded-full animate-spin`} />
      {label && <span className="text-xs text-gray-400 uppercase tracking-widest">{label}</span>}
    </div>
  )
}

export default Spinner
