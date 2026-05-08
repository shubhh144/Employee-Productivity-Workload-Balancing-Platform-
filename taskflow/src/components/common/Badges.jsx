import React from 'react'

export const StatusBadge = ({ status }) => {
  const map = {
    TODO:        'border-gray-300 text-gray-500',
    IN_PROGRESS: 'border-blue-300 text-blue-600 bg-blue-50',
    DONE:        'border-green-300 text-green-600 bg-green-50',
    COMPLETED:   'border-green-300 text-green-600 bg-green-50',
    REVIEW:      'border-yellow-300 text-yellow-600 bg-yellow-50',
    BLOCKED:     'border-red-300 text-red-600 bg-red-50',
  }
  const cls = map[status] || 'border-gray-200 text-gray-500'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border tracking-wide ${cls}`}>
      {status?.replace('_', ' ')}
    </span>
  )
}

export const PriorityBadge = ({ priority }) => {
  const map = {
    HIGH:   'bg-black text-white',
    MEDIUM: 'bg-gray-700 text-white',
    LOW:    'bg-gray-200 text-gray-700',
    URGENT: 'bg-red-600 text-white',
  }
  const cls = map[priority] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium uppercase tracking-widest ${cls}`}>
      {priority}
    </span>
  )
}

export default StatusBadge
