import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import './style.css'

function loadTasks() {
  try {
    const raw = localStorage.getItem('tasks')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks))
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks())
  const [newTitle, setNewTitle] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const remainingCount = useMemo(() => tasks.filter(t => !t.completed).length, [tasks])

  function handleAdd(e) {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    const task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: Date.now(),
    }
    setTasks(prev => [task, ...prev])
    setNewTitle('')
  }

  function toggleTask(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  function startEditing(task) {
    setEditingId(task.id)
    setEditingTitle(task.title)
  }

  function saveEdit(id) {
    const title = editingTitle.trim()
    if (!title) {
      deleteTask(id)
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, title } : t))
    }
    setEditingId(null)
    setEditingTitle('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingTitle('')
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function clearCompleted() {
    setTasks(prev => prev.filter(t => !t.completed))
  }

  const filteredTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter(t => !t.completed)
    if (filter === 'completed') return tasks.filter(t => t.completed)
    return tasks
  }, [tasks, filter])

  return (
    <div className="app">
      <h1>To‑Do Checklist</h1>

      <form className="new-task" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Add a task..."
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <div className="controls">
        <div className="filters">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>Active</button>
          <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>Completed</button>
        </div>
        <div className="meta">
          <span>{remainingCount} left</span>
          <button className="link" onClick={clearCompleted} disabled={tasks.length === remainingCount}>Clear completed</button>
        </div>
      </div>

      <ul className="task-list">
        {filteredTasks.length === 0 && (
          <li className="empty">No tasks</li>
        )}
        {filteredTasks.map(task => (
          <li key={task.id} className={task.completed ? 'task completed' : 'task'}>
            <label className="task-item">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
              />

              {editingId === task.id ? (
                <input
                  className="edit-input"
                  value={editingTitle}
                  onChange={e => setEditingTitle(e.target.value)}
                  onBlur={() => saveEdit(task.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEdit(task.id)
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  autoFocus
                />
              ) : (
                <span className="title" onDoubleClick={() => startEditing(task)}>{task.title}</span>
              )}
            </label>
            <button className="delete" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`}>×</button>
          </li>
        ))}
      </ul>
    </div>
  )
}


