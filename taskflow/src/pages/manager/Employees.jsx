import React, { useEffect, useState } from 'react'
import { employeeAPI } from '../../services/api'
import Layout from '../../components/common/Layout'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import { StatusBadge } from '../../components/common/Badges'
import { Users, ChevronDown, ChevronUp } from 'lucide-react'

const Employees = () => {
  const [employees, setEmployees] = useState([])
  const [expanded, setExpanded]   = useState(null)
  const [empTasks, setEmpTasks]   = useState({})
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        // GET /employee/all
        const res = await employeeAPI.getAllEmployees()
        setEmployees(res.data?.data || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load employees.')
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const toggleExpand = async (emp) => {
    const id = emp.employeeId
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (empTasks[id]) return
    try {
      // GET /employee/{id}/tasks
      const res = await employeeAPI.getEmployeeTasks(id)
      setEmpTasks(prev => ({ ...prev, [id]: res.data?.data || res.data || [] }))
    } catch {
      setEmpTasks(prev => ({ ...prev, [id]: [] }))
    }
  }

  return (
    <Layout>
      <PageHeader title="Employees" subtitle={`${employees.length} team members`} />

      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-xs text-red-600">{error}</div>}

      {loading ? <Spinner label="Loading employees" /> : employees.length === 0 ? (
        <EmptyState icon={Users} title="No employees yet"
          description="Employees will appear here after they register." />
      ) : (
        <div className="space-y-3 animate-fade-in">
          {employees.map((emp) => {
            const id     = emp.employeeId
            const isOpen = expanded === id
            const tasks  = empTasks[id] || []
            const pct    = Math.min(Math.round(((emp.taskCount || 0) / (emp.capacity || 40)) * 100), 100)

            return (
              <div key={id} className="bg-white border border-gray-200 hover:border-gray-400 transition-all duration-200">
                <div className="px-6 py-4 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleExpand(emp)}>
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-black flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">{emp.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">{emp.name}</p>
                      <p className="text-xs text-gray-400">{emp.department || 'General'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block w-32">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-400">Capacity</span>
                        <span className="text-xs text-gray-500">{emp.taskCount || 0}/{emp.capacity || 40}</span>
                      </div>
                      <div className="h-1 bg-gray-100">
                        <div className={`h-1 transition-all duration-500 ${pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-yellow-400' : 'bg-black'}`}
                          style={{ width: `${pct || 5}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{emp.taskCount || 0} tasks</span>
                    {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-gray-100 animate-fade-in">
                    {tasks.length === 0 ? (
                      <p className="px-6 py-4 text-sm text-gray-400">No tasks assigned.</p>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {tasks.map((task, j) => (
                          <div key={task.id || task.taskId || j} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                            <p className="text-sm text-black">{task.title}</p>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400">{task.deadline || '—'}</span>
                              {task.status && <StatusBadge status={task.status} />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}

export default Employees