import React, { useEffect, useState } from 'react'
import { taskAPI, employeeAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/common/Layout'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import { StatusBadge, PriorityBadge } from '../../components/common/Badges'
import { Plus, UserPlus, Filter, CheckSquare, Github } from 'lucide-react'

const STATUSES   = ['ALL','TODO','IN_PROGRESS','REVIEW','DONE','BLOCKED']
const PRIORITIES = ['ALL','LOW','MEDIUM','HIGH','CRITICAL']

const emptyTask = {
  title:    '',
  deadline: '',
  priority: 'MEDIUM',
  status:   'TODO',
}

const Tasks = () => {
  const { user }  = useAuth()
  const [tasks, setTasks]         = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [form, setForm]           = useState(emptyTask)
  const [assignForm, setAssignForm] = useState({ taskId: '', employeeId: '' })
  const [filterStatus, setFilterStatus]     = useState('ALL')
  const [filterPriority, setFilterPriority] = useState('ALL')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [githubLoading, setGithubLoading] = useState(false)
  const [githubResult, setGithubResult]   = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [tasksRes, empRes] = await Promise.allSettled([
        taskAPI.getAllTasks(),
        employeeAPI.getAllEmployees(),
      ])
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.data?.data || [])
      if (empRes.status   === 'fulfilled') setEmployees(empRes.value.data?.data || [])
    } catch (err) {
      setError('Failed to load data.')
    } finally { setLoading(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await taskAPI.createTask(form)
      setSuccess('Task created successfully.')
      setShowCreate(false); setForm(emptyTask); loadData()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create task.')
    } finally { setSaving(false) }
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await taskAPI.assignTask(assignForm.taskId, assignForm.employeeId)
      setSuccess('Task assigned successfully.')
      setShowAssign(false); setAssignForm({ taskId: '', employeeId: '' }); loadData()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to assign task.')
    } finally { setSaving(false) }
  }

  const handleGithubCheck = async (taskId) => {
    setGithubLoading(true); setGithubResult(null)
    try {
      const res = await taskAPI.checkGithub(taskId)
      setGithubResult(res.data?.data || res.data)
    } catch (err) {
      setGithubResult({ error: err.response?.data?.message || 'GitHub check failed.' })
    } finally { setGithubLoading(false) }
  }

  const filtered = tasks.filter(t => {
    const s = filterStatus   === 'ALL' || t.status   === filterStatus
    const p = filterPriority === 'ALL' || t.priority === filterPriority
    return s && p
  })

  return (
    <Layout>
      <PageHeader title="Tasks" subtitle={`${tasks.length} total tasks`}
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAssign(true)} className="btn-secondary flex items-center gap-1.5">
              <UserPlus size={13} /> Assign
            </button>
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-1.5">
              <Plus size={13} /> Create Task
            </button>
          </div>
        }
      />

      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-xs text-green-700 flex justify-between">
          {success} <button onClick={() => setSuccess('')}>✕</button>
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-xs text-red-600 flex justify-between">
          {error} <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Filter size={12} /> Status
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 text-xs font-medium border transition-colors ${filterStatus === s ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="w-px h-4 bg-gray-200 hidden sm:block" />
        <div className="flex items-center gap-1.5 text-xs text-gray-400">Priority</div>
        <div className="flex flex-wrap gap-1.5">
          {PRIORITIES.map(p => (
            <button key={p} onClick={() => setFilterPriority(p)}
              className={`px-3 py-1 text-xs font-medium border transition-colors ${filterPriority === p ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {loading ? <Spinner label="Loading tasks" /> : filtered.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No tasks found"
          description="Create your first task or adjust the filters."
          action={
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-1.5">
              <Plus size={13} /> Create Task
            </button>
          }
        />
      ) : (
        <div className="bg-white border border-gray-200">
          <div className="hidden md:grid grid-cols-12 px-6 py-3 border-b border-gray-100 bg-gray-50">
            <span className="col-span-4 text-xs uppercase tracking-widest text-gray-400">Title</span>
            <span className="col-span-2 text-xs uppercase tracking-widest text-gray-400">Priority</span>
            <span className="col-span-2 text-xs uppercase tracking-widest text-gray-400">Status</span>
            <span className="col-span-2 text-xs uppercase tracking-widest text-gray-400">Deadline</span>
            <span className="col-span-2 text-xs uppercase tracking-widest text-gray-400">GitHub</span>
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map((task, i) => (
              <div key={task.id || i}
                className="grid grid-cols-1 md:grid-cols-12 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer gap-2 md:gap-0"
                onClick={() => { setSelectedTask(task); setGithubResult(null) }}>
                <div className="col-span-4">
                  <p className="text-sm font-medium text-black">{task.title}</p>
                </div>
                <div className="col-span-2 flex items-center">
                  {task.priority ? <PriorityBadge priority={task.priority} /> : <span className="text-sm text-gray-400">—</span>}
                </div>
                <div className="col-span-2 flex items-center">
                  {task.status ? <StatusBadge status={task.status} /> : <span className="text-sm text-gray-400">—</span>}
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-xs text-gray-500">{task.deadline || '—'}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  {task.githubUsername
                    ? <span className="text-xs text-green-600 flex items-center gap-1"><Github size={11} />{task.githubUsername}</span>
                    : <span className="text-xs text-gray-300">Not linked</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Task Modal — NO GitHub fields */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); setError('') }} title="Create Task">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input-field" placeholder="Task title" required
              value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priority</label>
              <select className="input-field" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input-field" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Deadline</label>
            <input type="date" className="input-field" value={form.deadline}
              onChange={e => setForm({...form, deadline: e.target.value})} />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
              Create Task
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Assign Task Modal */}
      <Modal isOpen={showAssign} onClose={() => { setShowAssign(false); setError('') }} title="Assign Task">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="label">Task</label>
            <select className="input-field" required value={assignForm.taskId}
              onChange={e => setAssignForm({...assignForm, taskId: e.target.value})}>
              <option value="">Select task…</option>
              {tasks.map((t, i) => (
                <option key={t.id || i} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Employee</label>
            <select className="input-field" required value={assignForm.employeeId}
              onChange={e => setAssignForm({...assignForm, employeeId: e.target.value})}>
              <option value="">Select employee…</option>
              {employees.map((emp, i) => (
                <option key={emp.employeeId || i} value={emp.employeeId}>{emp.name}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
              Assign Task
            </button>
            <button type="button" onClick={() => setShowAssign(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Modal isOpen={!!selectedTask} onClose={() => { setSelectedTask(null); setGithubResult(null) }} title="Task Details">
          <div className="space-y-4">
            <div>
              <p className="label">Title</p>
              <p className="text-sm font-medium text-black">{selectedTask.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="label">Status</p><StatusBadge status={selectedTask.status} /></div>
              <div><p className="label">Priority</p><PriorityBadge priority={selectedTask.priority} /></div>
              <div><p className="label">Deadline</p><p className="text-sm text-gray-600">{selectedTask.deadline || '—'}</p></div>
              <div><p className="label">Task ID</p><p className="text-sm font-mono text-gray-500">{selectedTask.id || '—'}</p></div>
            </div>

            {/* GitHub auto-update notice */}
            <div className="px-4 py-3 bg-gray-50 border border-gray-200 text-xs text-gray-500 flex items-center gap-2">
              <Github size={13} />
              Status is automatically updated via GitHub activity
            </div>

            {/* GitHub Info */}
            {(selectedTask.repoName || selectedTask.branchName || selectedTask.githubUsername) && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                  <Github size={11} /> GitHub Info
                </p>
                <div className="space-y-2">
                  {selectedTask.githubUsername && (
                    <div className="flex items-center gap-2">
                      <span className="label mb-0 w-24">Username</span>
                      <span className="text-sm text-gray-600 font-mono">{selectedTask.githubUsername}</span>
                    </div>
                  )}
                  {selectedTask.repoName && (
                    <div className="flex items-center gap-2">
                      <span className="label mb-0 w-24">Repo</span>
                      <span className="text-sm text-gray-600 font-mono">{selectedTask.repoName}</span>
                    </div>
                  )}
                  {selectedTask.branchName && (
                    <div className="flex items-center gap-2">
                      <span className="label mb-0 w-24">Branch</span>
                      <span className="text-sm text-gray-600 font-mono">{selectedTask.branchName}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleGithubCheck(selectedTask.id)}
                  disabled={githubLoading}
                  className="mt-4 btn-secondary flex items-center gap-2 text-xs disabled:opacity-60">
                  {githubLoading
                    ? <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"/>
                    : <Github size={13} />
                  }
                  {githubLoading ? 'Checking…' : 'Check GitHub Status'}
                </button>

                {githubResult && (
                  <div className={`mt-3 px-4 py-3 text-xs border ${githubResult.error ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                    {githubResult.error
                      ? githubResult.error
                      : <pre className="whitespace-pre-wrap font-mono text-xs">{JSON.stringify(githubResult, null, 2)}</pre>
                    }
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </Layout>
  )
}

export default Tasks
