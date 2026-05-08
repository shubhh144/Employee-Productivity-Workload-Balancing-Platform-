import React from 'react'

const StatCard = ({ label, value, sub, accent = false, icon: Icon }) => (
  <div className={`p-6 border transition-all duration-200 hover:shadow-sm ${accent ? 'bg-black text-white border-black' : 'bg-white border-gray-200 hover:border-gray-400'}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className={`text-xs uppercase tracking-widest font-medium mb-2 ${accent ? 'text-gray-400' : 'text-gray-500'}`}>
          {label}
        </p>
        <p className={`font-display text-3xl font-medium ${accent ? 'text-white' : 'text-black'}`}>
          {value}
        </p>
        {sub && (
          <p className={`text-xs mt-1.5 ${accent ? 'text-gray-400' : 'text-gray-500'}`}>{sub}</p>
        )}
      </div>
      {Icon && (
        <div className={`p-2.5 ${accent ? 'bg-white/10' : 'bg-gray-100'}`}>
          <Icon size={16} className={accent ? 'text-gray-300' : 'text-gray-500'} />
        </div>
      )}
    </div>
  </div>
)

export default StatCard
