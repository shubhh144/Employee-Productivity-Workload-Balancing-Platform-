import React, { useEffect, useState } from 'react'
import { employeeAPI } from '../../services/api'
import Layout from '../../components/common/Layout'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import { TrendingUp, ChevronUp, ChevronDown } from 'lucide-react'

const ratingColor = (rating) => {
  const map = {
    EXCELLENT:     'bg-green-100 text-green-700 border-green-200',
    GOOD:          'bg-blue-100 text-blue-700 border-blue-200',
    AVERAGE:       'bg-yellow-100 text-yellow-700 border-yellow-200',
    BELOW_AVERAGE: 'bg-orange-100 text-orange-700 border-orange-200',
    POOR:          'bg-red-100 text-red-700 border-red-200',
  }
  return map[rating] || 'bg-gray-100 text-gray-500 border-gray-200'
}

const ratingBarColor = (rating) => {
  const map = {
    EXCELLENT:     '#16a34a',
    GOOD:          '#2563eb',
    AVERAGE:       '#ca8a04',
    BELOW_AVERAGE: '#ea580c',
    POOR:          '#dc2626',
  }
  return map[rating] || '#000000'
}

const RATING_ORDER = ['EXCELLENT','GOOD','AVERAGE','BELOW_AVERAGE','POOR']

const Productivity = () => {
  const [employees, setEmployees]   = useState([])
  const [prodData, setProdData]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [sortDir, setSortDir]       = useState('desc') // desc = highest first

  useEffect(() => {
    const load = async () => {
      try {
        // 1. Get all employees
        const empRes = await employeeAPI.getAllEmployees()
        const emps   = empRes.data?.data || []
        setEmployees(emps)

        // 2. Get productivity for each employee
        const prodResults = await Promise.allSettled(
          emps.map(emp => employeeAPI.getEmployeeProductivity(emp.employeeId))
        )

        // 3. Merge employee + productivity data
        const merged = emps.map((emp, idx) => {
          const res  = prodResults[idx]
          const prod = res.status === 'fulfilled' ? (res.value.data?.data || res.value.data) : null
          return {
            employeeId:            emp.employeeId,
            name:                  emp.name,
            department:            emp.department || 'General',
            totalTasks:            prod?.totalTasks            ?? emp.taskCount ?? 0,
            completedTasks:        prod?.completedTasks        ?? 0,
            pendingTasks:          prod?.pendingTasks          ?? 0,
            productivityPercentage:prod?.productivityPercentage ?? 0,
            productivityRating:    prod?.productivityRating    ?? null,
          }
        })

        setProdData(merged)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load productivity data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const sorted = [...prodData].sort((a, b) => {
    if (sortDir === 'desc') return b.productivityPercentage - a.productivityPercentage
    return a.productivityPercentage - b.productivityPercentage
  })

  const toggleSort = () => setSortDir(prev => prev === 'desc' ? 'asc' : 'desc')

  // Summary stats
  const avgProd     = prodData.length ? Math.round(prodData.reduce((s, e) => s + e.productivityPercentage, 0) / prodData.length) : 0
  const excellent   = prodData.filter(e => e.productivityRating === 'EXCELLENT').length
  const poor        = prodData.filter(e => e.productivityRating === 'POOR' || e.productivityRating === 'BELOW_AVERAGE').length

  return (
    <Layout>
      <PageHeader
        title="Productivity"
        subtitle="Team productivity overview — sorted by performance"
      />

      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-xs text-red-600">{error}</div>}

      {loading ? <Spinner label="Loading productivity data" /> : prodData.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No data available" description="Productivity data will appear once employees have tasks." />
      ) : (
        <div className="space-y-6 animate-fade-in">

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 p-5">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Team Average</p>
              <p className="font-display text-3xl font-medium text-black">{avgProd}%</p>
            </div>
            <div className="bg-white border border-green-200 p-5">
              <p className="text-xs uppercase tracking-widest text-green-500 mb-2">Excellent</p>
              <p className="font-display text-3xl font-medium text-green-700">{excellent}</p>
              <p className="text-xs text-gray-400 mt-1">employees</p>
            </div>
            <div className="bg-white border border-red-200 p-5">
              <p className="text-xs uppercase tracking-widest text-red-400 mb-2">Needs Attention</p>
              <p className="font-display text-3xl font-medium text-red-600">{poor}</p>
              <p className="text-xs text-gray-400 mt-1">employees</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200">
            {/* Table header */}
            <div className="grid grid-cols-12 px-6 py-3 border-b border-gray-100 bg-gray-50">
              <span className="col-span-3 text-xs uppercase tracking-widest text-gray-400">Employee</span>
              <span className="col-span-2 text-xs uppercase tracking-widest text-gray-400">Department</span>
              <span className="col-span-1 text-xs uppercase tracking-widest text-gray-400 text-center">Total</span>
              <span className="col-span-1 text-xs uppercase tracking-widest text-gray-400 text-center">Done</span>
              <span className="col-span-1 text-xs uppercase tracking-widest text-gray-400 text-center">Pending</span>
              <span
                className="col-span-2 text-xs uppercase tracking-widest text-gray-400 flex items-center gap-1 cursor-pointer hover:text-black transition-colors select-none"
                onClick={toggleSort}
              >
                Productivity
                {sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              </span>
              <span className="col-span-2 text-xs uppercase tracking-widest text-gray-400">Rating</span>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-gray-50">
              {sorted.map((emp, i) => (
                <div key={emp.employeeId || i} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                  {/* Employee */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-7 h-7 bg-black flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">{emp.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium text-black truncate">{emp.name}</span>
                  </div>

                  {/* Department */}
                  <div className="col-span-2">
                    <span className="text-sm text-gray-500">{emp.department}</span>
                  </div>

                  {/* Total tasks */}
                  <div className="col-span-1 text-center">
                    <span className="text-sm text-gray-700">{emp.totalTasks}</span>
                  </div>

                  {/* Completed */}
                  <div className="col-span-1 text-center">
                    <span className="text-sm text-green-600 font-medium">{emp.completedTasks}</span>
                  </div>

                  {/* Pending */}
                  <div className="col-span-1 text-center">
                    <span className="text-sm text-orange-500">{emp.pendingTasks}</span>
                  </div>

                  {/* Productivity % + bar */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100">
                        <div
                          className="h-1.5 transition-all duration-500"
                          style={{
                            width: `${emp.productivityPercentage}%`,
                            backgroundColor: ratingBarColor(emp.productivityRating)
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-medium w-9 text-right flex-shrink-0"
                        style={{ color: ratingBarColor(emp.productivityRating) }}
                      >
                        {Math.round(emp.productivityPercentage)}%
                      </span>
                    </div>
                  </div>

                  {/* Rating badge */}
                  <div className="col-span-2">
                    {emp.productivityRating ? (
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${ratingColor(emp.productivityRating)}`}>
                        {emp.productivityRating.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </Layout>
  )
}

export default Productivity
