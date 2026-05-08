import React from 'react'

const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100">
    <div>
      <h1 className="font-display text-3xl font-medium text-black tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-1.5">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0 mt-1">{action}</div>}
  </div>
)

export default PageHeader
