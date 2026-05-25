import React, { useState, useRef } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import styles from './TaskPanel.module.css'

export default function TaskPanel({ tasks: tasksProp, setTasks: setTasksProp, t = {} }) {
  const [tasksInternal, setTasksInternal] = useLocalStorage('df_tasks', [
    { id: 1, text: 'Homework time',     done: false },
    { id: 2, text: 'Learn something new', done: false },
  ])
  const tasks    = tasksProp    ?? tasksInternal
  const setTasks = setTasksProp ?? setTasksInternal
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  function addTask() {
    const text = input.trim()
    if (!text) return
    setTasks(prev => [...prev, { id: Date.now(), text, done: false }])
    setInput('')
    inputRef.current?.focus()
  }
  function toggleTask(id) { setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t)) }
  function deleteTask(id) { setTasks(prev => prev.filter(t => t.id !== id)) }

  const pending = tasks.filter(t => !t.done)
  const done    = tasks.filter(t =>  t.done)

  function exportTasks() {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'tasks-backup.json'; a.click()
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}><ListIcon /> {t.focusTasks || 'Focus Tasks'}</div>
        <button className={styles.actionBtn} onClick={exportTasks}><DownloadIcon /> {t.backup || 'Backup'}</button>
      </div>
      <div className={styles.hint}>{t.autoSaved || '⟳ Auto-saved locally'}</div>

      <div className={styles.listWrap}>
        {pending.map(task => <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} t={t} />)}
        {done.length > 0 && pending.length > 0 && <div className={styles.separator} />}
        {done.map(task => <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} t={t} />)}
        {tasks.length === 0 && <div className={styles.empty}>{t.noTasks || 'No tasks yet.'}</div>}
      </div>

      <div className={styles.addRow}>
        <input
          ref={inputRef}
          className={styles.addInput}
          placeholder={t.addTask || 'Add a task...'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
        />
        <button className={styles.addBtn} onClick={addTask}>+</button>
      </div>

      <div className={styles.shortcuts}>
        <span className={styles.shortcut}><kbd className={styles.kbd}>SPACE</kbd> {t.startPause || 'start/pause'}</span>
        <span className={styles.shortcut}><kbd className={styles.kbd}>← / →</kbd> {t.switchModes || 'modes'}</span>
      </div>
    </div>
  )
}

function TaskItem({ task, onToggle, onDelete, t = {} }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className={`${styles.taskItem} ${task.done ? styles.done : ''}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button className={`${styles.check} ${task.done ? styles.checkDone : ''}`} onClick={() => onToggle(task.id)} aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}>
        {task.done && '✓'}
      </button>
      <span className={styles.taskText}>{task.text}</span>
      {hovered && <button className={styles.deleteBtn} onClick={() => onDelete(task.id)} aria-label={t.deleteTask || 'Delete'}>×</button>}
    </div>
  )
}

const ListIcon     = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="3" y1="4" x2="13" y2="4"/><line x1="3" y1="8" x2="13" y2="8"/><line x1="3" y1="12" x2="8" y2="12"/></svg>
const DownloadIcon = () => <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 10v3h10v-3M8 2v8M5 7l3 3 3-3"/></svg>
