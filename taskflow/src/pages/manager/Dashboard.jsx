import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { dashboardAPI, riskAPI, employeeAPI } from '../../services/api'
import Layout from '../../components/common/Layout'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import Spinner from '../../components/common/Spinner'
import { StatusBadge, PriorityBadge } from '../../components/common/Badges'
import { Users, CheckSquare, AlertTriangle, TrendingUp, Clock } from 'lucide-react'

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

const ManagerDashboard = () => {
  const { user }  = useAuth()
  const [dash, setDash]               = useState(null)
  const [risks, setRisks]             = useState([])
  const [employees, setEmployees]     = useState([])
  const [empProductivity, setEmpProd] = useState({}) // { [employeeId]: prodData }
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, riskRes, empRes] = await Promise.allSettled([
          dashboardAPI.getAdminDashboard(),
          riskAPI.getDeadlineRisk(),
          employeeAPI.getAllEmployees(),
        ])

        let empList = []
        if (dashRes.status === 'fulfilled') {
          const d = dashRes.value.data
          setDash(d)
          empList = d?.employees || []
          setEmployees(empList)
        }
        if (riskRes.status === 'fulfilled') {
          const r = riskRes.value.data
          setRisks(r?.tasks || r?.data || [])
        }
        if (empRes.status === 'fulfilled') {
          empList = empRes.value.data?.data || empList
          setEmployees(empList)
        }

        // Fetch productivity for each employee
        if (empList.length > 0) {
          const prodResults = await Promise.allSettled(
            empList.map(emp => employeeAPI.getEmployeeProductivity(emp.employeeId))
          )
          const prodMap = {}
          prodResults.forEach((res, idx) => {
            if (res.status === 'fulfilled') {
              const d = res.value.data?.data || res.value.data
              prodMap[empList[idx].employeeId] = d
            }
          })
          setEmpProd(prodMap)
        }
      } catch (err) {
        setError('Failed to load dashboard.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const summary = dash?.summary || {}

  return (
    <Layout>
      <PageHeader
        title="Dashboard"
        subtitle={`Good morning, ${user?.name?.split(' ')[0]}. Here's your team overview.`}
      />

      {loading ? <Spinner label="Loading dashboard" /> : error ? (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
      ) : (
        <div className="space-y-8 animate-fade-in">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Employees" value={summary.totalEmployees ?? 0}  icon={Users}          accent />
            <StatCard label="Total Tasks"      value={summary.totalTasks      ?? 0}  icon={CheckSquare}   sub="All time" />
            <StatCard label="In Progress"      value={summary.inProgressCount ?? 0}  icon={TrendingUp}    sub="Active" />
            <StatCard label="At Risk"          value={risks.length}                  icon={AlertTriangle} sub="Deadline risk" />
          </div>

          {/* Task status breakdown */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 p-5">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Todo</p>
              <p className="font-display text-2xl font-medium">{summary.todoCount ?? 0}</p>
            </div>
            <div className="bg-white border border-gray-200 p-5">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">In Progress</p>
              <p className="font-display text-2xl font-medium">{summary.inProgressCount ?? 0}</p>
            </div>
            <div className="bg-white border border-gray-200 p-5">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Done</p>
              <p className="font-display text-2xl font-medium">{summary.doneCount ?? 0}</p>
            </div>
            <div className="bg-white border border-gray-200 p-5">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Blocked</p>
              <p className="font-display text-2xl font-medium">{summary.blockedCount ?? 0}</p>
            </div>
          </div>

          {/* Team Workload + Productivity */}
          <div className="bg-white border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-display text-base font-medium">Team Workload & Productivity</h2>
              <a href="/employees" className="text-xs text-gray-400 hover:text-black transition-colors">View all →</a>
            </div>
            {employees.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-gray-400">No employees</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {employees.map((emp, i) => {
                  const prod    = empProductivity[emp.employeeId]
                  const prodPct = prod?.productivityPercentage ?? 0
                  const rating  = prod?.productivityRating ?? null
                  const max     = Math.max(...employees.map(e => e.taskCount || 0), 1)
                  const taskPct = Math.round(((emp.taskCount || 0) / max) * 100)

                  return (
                    <div key={emp.employeeId || i} className="px-6 py-4 flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-8 h-8 bg-black flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-medium">{emp.name?.charAt(0)?.toUpperCase()}</span>
                      </div>

                      {/* Name + dept */}
                      <div className="w-32 flex-shrink-0">
                        <p className="text-sm font-medium text-black truncate">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.department || 'General'}</p>
                      </div>

                      {/* Workload bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-400">Tasks</span>
                          <span className="text-xs text-gray-500">{emp.taskCount || 0}</span>
                        </div>
                        <div className="h-1 bg-gray-100">
                          <div className="h-1 bg-black transition-all duration-500"
                            style={{ width: `${taskPct || 3}%` }} />
                        </div>
                      </div>

                      {/* Productivity bar */}
                      <div className="w-28 flex-shrink-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-400">Productivity</span>
                          <span className="text-xs font-medium" style={{ color: ratingBarColor(rating) }}>{Math.round(prodPct)}%</span>
                        </div>
                        <div className="h-1 bg-gray-100">
                          <div className="h-1 transition-all duration-500"
                            style={{ width: `${prodPct || 3}%`, backgroundColor: ratingBarColor(rating) }} />
                        </div>
                      </div>

                      {/* Rating badge */}
                      {rating && (
                        <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 text-xs font-medium border ${ratingColor(rating)}`}>
                          {rating.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Risk tasks */}
          {risks.length > 0 && (
            <div className="bg-white border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-500" />
                <h2 className="font-display text-base font-medium">Deadline Risk Tasks</h2>
                <span className="ml-auto text-xs text-red-500 font-medium">{risks.length} tasks</span>
              </div>
              <div className="divide-y divide-gray-50">
                {risks.map((t, i) => (
                  <div key={t.id || t.taskId || i} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="text-xs text-red-400 mt-0.5 flex items-center gap-1">
                        <Clock size={10} /> {t.deadline || '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {t.priority && <PriorityBadge priority={t.priority} />}
                      {t.status   && <StatusBadge   status={t.status}    />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </Layout>
  )
}

export default ManagerDashboard
