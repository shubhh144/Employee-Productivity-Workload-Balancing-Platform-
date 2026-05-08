import React, { useEffect, useState } from 'react'
import { employeeAPI, taskAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/common/Layout'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import Modal from '../../components/common/Modal'
import { StatusBadge, PriorityBadge } from '../../components/common/Badges'
import { CheckSquare, Clock, Github, CheckCircle, AlertCircle } from 'lucide-react'

const STATUSES = ['ALL', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED']

const emptyGithub = { githubUsername: '', repoName: '', branchName: '' }

const MyTasks = () => {
  const { user }  = useAuth()
  const [tasks, setTasks]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [filter, setFilter]       = useState('ALL')

  // GitHub modal state
  const [showGithub, setShowGithub]     = useState(false)
  const [githubTask, setGithubTask]     = useState(null)
  const [githubForm, setGithubForm]     = useState(emptyGithub)
  const [githubSaving, setGithubSaving] = useState(false)
  const [githubError, setGithubError]   = useState('')

  useEffect(() => { if (user?.employeeId) load() }, [user])

  const load = async () => {
    setLoading(true)
    try {
      const res = await employeeAPI.getEmployeeTasks(user.employeeId)
      setTasks(res.data?.data || res.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your tasks.')
    } finally { setLoading(false) }
  }

  const openGithubModal = (task) => {
    setGithubTask(task)
    setGithubForm({
      githubUsername: task.githubUsername || '',
      repoName:       task.repoName       || '',
      branchName:     task.branchName     || '',
    })
    setGithubError('')
    setShowGithub(true)
  }

  const handleGithubSubmit = async (e) => {
    e.preventDefault()
    setGithubSaving(true)
    setGithubError('')
    try {
      await taskAPI.updateGithubDetails(githubTask.id, githubForm)
      setSuccess('GitHub details saved successfully.')
      setShowGithub(false)
      setGithubTask(null)
      setGithubForm(emptyGithub)
      load()
    } catch (err) {
      setGithubError(
        err.response?.data?.message ||
        err.response?.data?.error   ||
        'Failed to save GitHub details.'
      )
    } finally { setGithubSaving(false) }
  }

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter)

  return (
    <Layout>
      <PageHeader title="My Tasks" subtitle={`${tasks.length} tasks assigned to you`} />

      {/* Info banner */}
      <div className="mb-6 px-4 py-3 bg-gray-50 border border-gray-200 text-xs text-gray-600">
        <div className="flex items-start gap-2">
          <Github size={13} className="flex-shrink-0 mt-0.5 text-gray-500" />
          <div>
            <span className="font-medium text-black">Auto Status Update:</span>
            {' '}Your task status will be automatically updated based on your GitHub activity.{' '}
            <span className="text-gray-500">Commit = In Progress &nbsp;|&nbsp; PR = Review &nbsp;|&nbsp; Merged = Done</span>
          </div>
        </div>
      </div>

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

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6 pb-5 border-b border-gray-100">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 text-xs font-medium border transition-colors ${filter === s ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? <Spinner label="Loading tasks" /> : filtered.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No tasks"
          description={filter === 'ALL' ? 'No tasks assigned yet.' : `No tasks with status "${filter.replace('_', ' ')}".`} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
          {filtered.map((task, i) => {
            const isLate     = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'DONE'
            const hasGithub  = !!(task.githubUsername)

            return (
              <div key={task.id || i}
                className="bg-white border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all duration-200">

                {/* Card body */}
                <div className="p-5">
                  {/* Title + priority */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-sm font-medium text-black leading-snug">{task.title}</h3>
                    {task.priority && <PriorityBadge priority={task.priority} />}
                  </div>

                  {/* Status + deadline */}
                  <div className="flex items-center justify-between mb-4">
                    {task.status ? <StatusBadge status={task.status} /> : <span />}
                    {task.deadline && (
                      <span className={`text-xs flex items-center gap-1 ${isLate ? 'text-red-500' : 'text-gray-400'}`}>
                        <Clock size={10} />{task.deadline}
                      </span>
                    )}
                  </div>

                  {/* GitHub section */}
                  {hasGithub ? (
                    // GitHub details already added → show green info
                    <div className="border border-green-200 bg-green-50 p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <CheckCircle size={13} className="text-green-600 flex-shrink-0" />
                        <span className="text-xs font-medium text-green-700">GitHub Connected</span>
                      </div>
                      <div className="space-y-1 text-xs text-green-700 font-mono">
                        <p>👤 {task.githubUsername}</p>
                        <p>📁 {task.repoName}</p>
                        <p>🌿 {task.branchName}</p>
                      </div>
                      <button
                        onClick={() => openGithubModal(task)}
                        className="mt-2 text-xs text-green-600 hover:text-green-800 underline underline-offset-2 transition-colors">
                        Edit details
                      </button>
                    </div>
                  ) : (
                    // No GitHub details → show orange warning + button
                    <div className="border border-orange-200 bg-orange-50 p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <AlertCircle size={13} className="text-orange-500 flex-shrink-0" />
                        <span className="text-xs font-medium text-orange-700">GitHub not connected</span>
                      </div>
                      <p className="text-xs text-orange-600 mb-3">
                        Add your GitHub details so your task status updates automatically.
                      </p>
                      <button
                        onClick={() => openGithubModal(task)}
                        className="w-full px-3 py-2 text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors flex items-center justify-center gap-1.5">
                        <Github size={12} />
                        Add GitHub Details
                      </button>
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="px-5 py-2.5 border-t border-gray-50 bg-gray-50 flex items-center gap-1.5">
                  <Github size={10} className="text-gray-400" />
                  <span className="text-xs text-gray-400">Auto-updated via GitHub</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* GitHub Details Modal */}
      <Modal
        isOpen={showGithub}
        onClose={() => { setShowGithub(false); setGithubError('') }}
        title="Add GitHub Details"
      >
        <form onSubmit={handleGithubSubmit} className="space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Link your GitHub account to this task. Your status will update automatically based on your commits and pull requests.
          </p>

          <div>
            <label className="label">GitHub Username <span className="text-red-400">*</span></label>
            <input
              type="text"
              className="input-field"
              placeholder="your-github-username"
              required
              value={githubForm.githubUsername}
              onChange={e => setGithubForm({...githubForm, githubUsername: e.target.value})}
            />
          </div>

          <div>
            <label className="label">Repository Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              className="input-field"
              placeholder="username/repo-name"
              required
              value={githubForm.repoName}
              onChange={e => setGithubForm({...githubForm, repoName: e.target.value})}
            />
          </div>

          <div>
            <label className="label">Branch Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              className="input-field"
              placeholder="feature-branch-name"
              required
              value={githubForm.branchName}
              onChange={e => setGithubForm({...githubForm, branchName: e.target.value})}
            />
          </div>

          {githubError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-xs text-red-600">
              {githubError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={githubSaving}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
              {githubSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Save GitHub Details
            </button>
            <button
              type="button"
              onClick={() => { setShowGithub(false); setGithubError('') }}
              className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

    </Layout>
  )
}

export default MyTasks
