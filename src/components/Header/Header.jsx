import React, { useState, useRef, useEffect } from 'react'
import styles from './Header.module.css'

const DAYS_EN   = ['SUN','MON','TUE','WED','THU','FRI','SAT']
const DAYS_FR   = ['DIM','LUN','MAR','MER','JEU','VEN','SAM']
const MONTHS_EN = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const MONTHS_FR = ['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC']

function pad(n) { return String(n).padStart(2, '0') }

export default function Header({ t, lang, setLang }) {
  const [now,      setNow]      = React.useState(new Date())
  const [showLang, setShowLang] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowLang(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const DAYS   = lang === 'fr' ? DAYS_FR   : DAYS_EN
  const MONTHS = lang === 'fr' ? MONTHS_FR : MONTHS_EN
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  const dateStr = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`

//Télécharge les statistiques en JSON 
  function exportStats() {
    const blob = new Blob([JSON.stringify({ date: new Date().toISOString(), tasks: JSON.parse(localStorage.getItem('df_tasks') || '[]') }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `deepfocus-stats-${Date.now()}.json`; a.click()
  }
  function backup() {
    const blob = new Blob([JSON.stringify({ tasks: localStorage.getItem('df_tasks'), notes: localStorage.getItem('df_notes'), backed_up: new Date().toISOString() }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `deepfocus-backup-${Date.now()}.json`; a.click()
  }
  function restore() {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json'
    input.onchange = e => {
      const reader = new FileReader()
      reader.onload = ev => {
        try {
          const d = JSON.parse(ev.target.result)
          if (d.tasks) localStorage.setItem('df_tasks', d.tasks)
          if (d.notes) localStorage.setItem('df_notes', d.notes)
          window.location.reload()
        } catch { alert('Invalid backup file.') }
      }
      reader.readAsText(e.target.files[0])
    }; input.click()
  }

  const otherLang = lang === 'en' ? 'fr' : 'en'

  return (
    <header className={styles.header}>
      {/* Logo — left */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>🎯</div>
        <div>
          <div className={styles.logoName}>{t.appName}</div>
          <div className={styles.logoSub}>{t.appSub}</div>
        </div>
      </div>

      {/* Right side — buttons + big clock + lang */}
      <div className={styles.actions}>
        {/* clock */}
        <div className={styles.clockBlock}>
          <div className={styles.clockTime}>{timeStr}</div>
          <div className={styles.clockDate}>{dateStr}</div>
        </div>

        <div className={styles.sep} />

        
        <button className={styles.btn} onClick={backup}><DownloadIcon /> {t.backup}</button>
        <button className={styles.btn} onClick={restore}><UploadIcon /> {t.restore}</button>


        {/* Languages */}
        <div className={styles.langWrap} ref={dropRef}>
          <button
            className={`${styles.langToggle} ${showLang ? styles.langToggleOpen : ''}`}
            onClick={() => setShowLang(s => !s)}
            title={t.languageLabel}
          >
            <span className={styles.langCode}>{t.languageLabel}</span>
            <span className={styles.langArrow}>{showLang ? '▲' : '▼'}</span>
          </button>

          {showLang && (
            <div className={styles.langDropdown}>
              {/* Current lang — highlighted */}
              <div className={styles.langCurrent}>
                <span className={styles.langOptionText}>{t.languageLabel === 'EN' ? 'English' : 'Français'}</span>
                <span className={styles.langCheck}>✓</span>
              </div>
              {/* Other lang */}
              <button
                className={styles.langOption}
                onClick={() => { setLang(otherLang); setShowLang(false) }}
              >
                <span className={styles.langOptionText}>{t.switchTo}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

const ShareIcon    = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1"/></svg>
const DownloadIcon = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 10v3h10v-3M8 2v8M5 7l3 3 3-3"/></svg>
const UploadIcon   = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6v-3h10v3M8 14V6M5 9l3-3 3 3"/></svg>
