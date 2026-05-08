import React from 'react'

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    {Icon && (
      <div className="w-12 h-12 border border-gray-200 flex items-center justify-center mb-4">
        <Icon size={20} className="text-gray-300" />
      </div>
    )}
    <p className="font-display text-lg font-medium text-black mb-1">{title}</p>
    {description && <p className="text-sm text-gray-500 max-w-xs">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
)

export default EmptyState
