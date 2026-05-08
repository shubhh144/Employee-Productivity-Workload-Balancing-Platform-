import React, { useEffect, useState } from 'react'
import { dashboardAPI, employeeAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/common/Layout'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import Spinner from '../../components/common/Spinner'
import { StatusBadge, PriorityBadge } from '../../components/common/Badges'
import { CheckSquare, Clock, TrendingUp, AlertCircle } from 'lucide-react'

// Rating → color mapping
const ratingColor = (rating) => {
  const map = {
    EXCELLENT:     'bg-green-100 text-green-700 border-green-300',
    GOOD:          'bg-blue-100 text-blue-700 border-blue-300',
    AVERAGE:       'bg-yellow-100 text-yellow-700 border-yellow-300',
    BELOW_AVERAGE: 'bg-orange-100 text-orange-700 border-orange-300',
    POOR:          'bg-red-100 text-red-700 border-red-300',
  }
  return map[rating] || 'bg-gray-100 text-gray-600 border-gray-300'
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

// Circular progress SVG component
const CircularProgress = ({ percentage, rating }) => {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  const color = ratingBarColor(rating)

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg width="144" height="144" className="-rotate-90">
        {/* Background circle */}
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#f0f0f0" strokeWidth="10" />
        {/* Progress circle */}
        <circle
          cx="72" cy="72" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-medium text-black">{percentage}%</span>
        <span className="text-xs text-gray-400 mt-0.5">productivity</span>
      </div>
    </div>
  )
}

const MyDashboard = () => {
  const { user }  = useAuth()
  const [dash, setDash]           = useState(null)
  const [productivity, setProductivity] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    if (!user?.employeeId) return
    const load = async () => {
      try {
        const [dashRes, prodRes] = await Promise.allSettled([
          dashboardAPI.getDashboard(user.employeeId),
          employeeAPI.getEmployeeProductivity(user.employeeId),
        ])
        if (dashRes.status === 'fulfilled') setDash(dashRes.value.data?.data || dashRes.value.data)
        if (prodRes.status === 'fulfilled') setProductivity(prodRes.value.data?.data || prodRes.value.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard.')
      } finally { setLoading(false) }
    }
    load()
  }, [user])

  const tasks      = dash?.tasks || dash?.assignedTasks || dash?.myTasks || []
  const completed  = tasks.filter(t => t.status === 'DONE').length
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const overdue    = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'DONE').length
  const progressPct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0

  // Productivity data from API
  const prodPct    = productivity?.productivityPercentage ?? 0
  const prodRating = productivity?.productivityRating ?? null
  const totalTasks = productivity?.totalTasks ?? tasks.length
  const compTasks  = productivity?.completedTasks ?? completed
  const pendTasks  = productivity?.pendingTasks ?? (tasks.length - completed)

  return (
    <Layout>
      <PageHeader
        title="My Dashboard"
        subtitle={`Welcome back, ${user?.name?.split(' ')[0]}. Here's your overview.`}
      />

      {loading ? <Spinner label="Loading dashboard" /> : error ? (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
      ) : (
        <div className="space-y-8 animate-fade-in">

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Tasks"  value={totalTasks}   icon={CheckSquare} accent />
            <StatCard label="In Progress"  value={inProgress}   icon={Clock}       sub="Active now" />
            <StatCard label="Completed"    value={compTasks}    icon={TrendingUp}  sub="Done" />
            <StatCard label="Overdue"      value={overdue}      icon={AlertCircle} sub={overdue > 0 ? 'Action needed' : 'All on track'} />
          </div>

          {/* Productivity Card */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="font-display text-base font-medium mb-6">Productivity</h2>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Circular progress */}
              <CircularProgress percentage={Math.round(prodPct)} rating={prodRating} />

              {/* Details */}
              <div className="flex-1 space-y-4 w-full">
                {/* Rating badge */}
                {prodRating && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 uppercase tracking-widest">Rating</span>
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium border ${ratingColor(prodRating)}`}>
                      {prodRating.replace('_', ' ')}
                    </span>
                  </div>
                )}

                {/* Task breakdown */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 border border-gray-100 p-3">
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Total</p>
                    <p className="font-display text-xl font-medium text-black">{totalTasks}</p>
                  </div>
                  <div className="bg-green-50 border border-green-100 p-3">
                    <p className="text-xs uppercase tracking-widest text-green-500 mb-1">Completed</p>
                    <p className="font-display text-xl font-medium text-green-700">{compTasks}</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-100 p-3">
                    <p className="text-xs uppercase tracking-widest text-orange-500 mb-1">Pending</p>
                    <p className="font-display text-xl font-medium text-orange-700">{pendTasks}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-gray-500">Completion rate</span>
                    <span className="text-xs font-medium text-black">{Math.round(prodPct)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100">
                    <div
                      className="h-2 transition-all duration-700"
                      style={{ width: `${prodPct}%`, backgroundColor: ratingBarColor(prodRating) }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overall progress */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base font-medium">Task Progress</h2>
              <span className="font-display text-3xl font-medium">{progressPct}%</span>
            </div>
            <div className="h-2 bg-gray-100">
              <div className="h-2 bg-black transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">{compTasks} of {totalTasks} tasks completed</p>
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming deadlines */}
            <div className="bg-white border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-display text-base font-medium">Upcoming Deadlines</h2>
                <a href="/my-tasks" className="text-xs text-gray-400 hover:text-black transition-colors">View all →</a>
              </div>
              {tasks.filter(t => t.deadline).length === 0 ? (
                <p className="px-6 py-8 text-sm text-gray-400 text-center">No deadlines set</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {tasks.filter(t => t.deadline)
                    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                    .slice(0, 5)
                    .map((task, i) => {
                      const isLate = new Date(task.deadline) < new Date() && task.status !== 'DONE'
                      return (
                        <div key={task.id || i} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50">
                          <div>
                            <p className="text-sm font-medium text-black">{task.title}</p>
                            <p className={`text-xs mt-0.5 flex items-center gap-1 ${isLate ? 'text-red-500' : 'text-gray-400'}`}>
                              <Clock size={10} />{task.deadline}{isLate ? ' — overdue' : ''}
                            </p>
                          </div>
                          <StatusBadge status={task.status} />
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* My tasks preview */}
            <div className="bg-white border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-display text-base font-medium">My Tasks</h2>
                <a href="/my-tasks" className="text-xs text-gray-400 hover:text-black transition-colors">View all →</a>
              </div>
              {tasks.length === 0 ? (
                <p className="px-6 py-8 text-sm text-gray-400 text-center">No tasks Complete yet</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {tasks.slice(0, 5).map((task, i) => (
                    <div key={task.id || i} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50">
                      <p className="text-sm font-medium text-black truncate mr-3">{task.title}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {task.priority && <PriorityBadge priority={task.priority} />}
                        {task.status   && <StatusBadge   status={task.status}    />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </Layout>
  )
}

export default MyDashboard
