import React, { useRef, useEffect, useState, useCallback } from 'react'
import styles from './Scratchpad.module.css'

const FORMATS = [
  { cmd: 'bold',          icon: 'B',  cls: 'bold',      title: 'Bold (Ctrl+B)'      },
  { cmd: 'italic',        icon: 'I',  cls: 'italic',    title: 'Italic (Ctrl+I)'    },
  { cmd: 'underline',     icon: 'U',  cls: 'underline', title: 'Underline (Ctrl+U)' },
  { cmd: 'strikeThrough', icon: 'S',  cls: 'strike',    title: 'Strikethrough'      },
  { cmd: 'blockquote',    icon: '"',  cls: 'quote',     title: 'Quote', block: true },
]

const LIST_FORMATS = [
  { cmd: 'insertUnorderedList', 
    icon:  
      (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="3" cy="5"  r="1" fill="currentColor" stroke="none"/>
        <circle cx="3" cy="11" r="1" fill="currentColor" stroke="none"/>
        <circle cx="3" cy="8"  r="1" fill="currentColor" stroke="none"/>
        <line x1="6" y1="5"  x2="14" y2="5"/>
        <line x1="6" y1="8"  x2="14" y2="8"/>
        <line x1="6" y1="11" x2="14" y2="11"/>
      </svg>
    ),
    title: 'Bullet list'   },
  { cmd: 'insertOrderedList',   
    icon:  
    (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <text x="1" y="6"  fontSize="5" fill="currentColor" stroke="none" fontFamily="monospace">1.</text>
        <text x="1" y="9.5" fontSize="5" fill="currentColor" stroke="none" fontFamily="monospace">2.</text>
        <text x="1" y="13" fontSize="5" fill="currentColor" stroke="none" fontFamily="monospace">3.</text>
        <line x1="7" y1="5"  x2="14" y2="5"/>
        <line x1="7" y1="8"  x2="14" y2="8"/>
        <line x1="7" y1="11" x2="14" y2="11"/>
      </svg>
    ),
     title: 'Numbered list' },
]

const TEXT_COLORS = [
  { color: '#2a2318', label: 'Default' },
  { color: '#c0392b', label: 'Red'     },
  { color: '#e67e22', label: 'Orange'  },
  { color: '#f1c40f', label: 'Yellow'  },
  { color: '#27ae60', label: 'Green'   },
  { color: '#2980b9', label: 'Blue'    },
  { color: '#8e44ad', label: 'Purple'  },
  { color: '#7f8c8d', label: 'Gray'    },
]

export default function Scratchpad({ t = {} }) {
  const editorRef  = useRef(null)
  const saveTimer  = useRef(null)
  const [saveStatus, setSaveStatus] = useState('saved')
  const [charCount,  setCharCount]  = useState(0)
  const [blockType,  setBlockType]  = useState('p')

  // Load saved content
  useEffect(() => {
    const saved = localStorage.getItem('df_notes')
    if (saved && editorRef.current) {
      editorRef.current.innerHTML = saved
      setCharCount(editorRef.current.textContent.length)
    }
  }, [])

  function exec(cmd, value = null) {
    if (cmd === 'blockquote') {
      document.execCommand('formatBlock', false, 'blockquote')
    } else {
      document.execCommand(cmd, false, value)
    }
    editorRef.current?.focus()
  }

  function handleBlockChange(e) {
    setBlockType(e.target.value)
    document.execCommand('formatBlock', false, e.target.value)
    editorRef.current?.focus()
  }

  function clearFormat() {
    document.execCommand('removeFormat', false, null)
    document.execCommand('formatBlock', false, 'p')
    setBlockType('p')
    editorRef.current?.focus()
  }

  const handleInput = useCallback(() => {
    if (!editorRef.current) return
    const txt = editorRef.current.textContent || ''
    setCharCount(txt.length)
    setSaveStatus('saving')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      localStorage.setItem('df_notes', editorRef.current.innerHTML)
      setSaveStatus('saved')
    }, 700)
  }, [])

  function exportNotes() {
    const content = editorRef.current?.innerHTML || ''
    const blob = new Blob([content], { type: 'text/html' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `notes-${Date.now()}.html`
    a.click()
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>
          <NoteIcon />
          {t.scratchpad || 'Scratchpad'}
        </div>
        <button className={styles.actionBtn} onClick={exportNotes}>
          <DownloadIcon /> {t.scratchpadBackup || 'Backup'}
        </button>
      </div>

      <div className={styles.toolbar}>
        <select className={styles.blockSelect} value={blockType} onChange={handleBlockChange}>
          <option value="p">{t.normal   || 'Normal'}</option>
          <option value="h1">{t.heading1 || 'Heading 1'}</option>
          <option value="h2">{t.heading2 || 'Heading 2'}</option>
          <option value="h3">{t.heading3 || 'Heading 3'}</option>
        </select>

        <div className={styles.divider} />

        {FORMATS.map((f) => (
          <button key={f.cmd} className={`${styles.tbBtn} ${styles[f.cls] || ''}`} title={f.title} onMouseDown={(e) => { e.preventDefault(); exec(f.cmd) }}>
            {f.icon}
          </button>
        ))}

        <div className={styles.divider} />

        {LIST_FORMATS.map((f) => (
          <button key={f.cmd} className={styles.tbBtn} title={f.title} onMouseDown={(e) => { e.preventDefault(); exec(f.cmd) }}>
            {f.icon}
          </button>
        ))}

        <div className={styles.divider} />

        {/* Text color picker */}
        <div className={styles.colorPicker} title={t.textColor || 'Text color'}>
          <div className={styles.colorIcon}>A</div>
          <div className={styles.colorSwatches}>
            {TEXT_COLORS.map(({ color, label }) => (
              <button key={color} className={styles.colorSwatch} style={{ background: color }} title={label}
                onMouseDown={(e) => { e.preventDefault(); document.execCommand('foreColor', false, color); editorRef.current?.focus() }}
              />
            ))}
          </div>
        </div>

        <div className={styles.divider} />

        <button className={styles.tbBtn} title={t.clearFormat || 'Clear formatting'} onMouseDown={(e) => { e.preventDefault(); clearFormat() }}>
          T<sub style={{ fontSize: '8px' }}>x</sub>
        </button>
      </div>

      <div className={styles.editorWrap}>
        <div
          ref={editorRef}
          className={styles.editor}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          data-placeholder={t.brainDump || 'Brain dump your study notes here...'}
        />
      </div>

      <div className={styles.footer}>
        <span>{charCount} {t.chars || 'chars'}</span>
        <span className={saveStatus === 'saved' ? styles.saved : styles.saving}>
          {saveStatus === 'saved' ? (t.saved || '● saved') : (t.saving || '○ saving...')}
        </span>
      </div>
    </div>
  )
}

/* Icons */
const NoteIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="2" width="12" height="12" rx="2"/>
    <line x1="5" y1="6"  x2="11" y2="6"/>
    <line x1="5" y1="9"  x2="9"  y2="9"/>
  </svg>
)
const DownloadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 10v3h10v-3M8 2v8M5 7l3 3 3-3"/>
  </svg>
)
