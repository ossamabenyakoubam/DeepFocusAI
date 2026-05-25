import React, { useState } from 'react'
import { useTimer } from '../../hooks/useTimer.js'
import styles from './TimerPanel.module.css'

const CIRC = 2 * Math.PI * 88

const MODES_META = [
  { key: 'focus', color: 'rgba(255,255,255,0.88)' },
  { key: 'short', color: '#5a9e7a' },
  { key: 'long',  color: '#7c6fcd' },
]

function pad(n) { return String(n).padStart(2, '0') }

export default function TimerPanel({ timer: timerProp, t = {} }) {
  const timerInternal = useTimer()
  const { seconds, running, sessions, progress, mode, durations, toggle, reset, prevMode, nextMode, updateDuration } = timerProp ?? timerInternal

  const [quoteIdx,     setQuoteIdx]     = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  const minutes   = Math.floor(seconds / 60)
  const secs      = seconds % 60
  const offset    = CIRC * (1 - progress)
  const strokeClr = MODES_META.find(m => m.key === mode.id)?.color || 'rgba(255,255,255,0.88)'

  const modeLabels = {
    focus: t.focus || 'FOCUS',
    short: t.shortBreak || 'SHORT BREAK',
    long:  t.longBreak  || 'LONG BREAK',
  }

  const quotes = t.quotes || [
    "Don't stop when you're tired. Stop when you're done.",
    "Deep work is the superpower of the 21st century.",
    "Small progress is still progress.",
  ]

  const settingsModes = [
    { key: 'focus', label: t.focusLabel      || 'Focus',       color: 'rgba(255,255,255,0.88)' },
    { key: 'short', label: t.shortBreakLabel || 'Short Break', color: '#5a9e7a' },
    { key: 'long',  label: t.longBreakLabel  || 'Long Break',  color: '#7c6fcd' },
  ]

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        {/* Mode nav */}
        <div className={styles.modeNav}>
          <button className={styles.arrow} onClick={prevMode}>‹</button>
          <span className={styles.modeLabel}>{modeLabels[mode.id]}</span>
          <button className={styles.arrow} onClick={nextMode}>›</button>
        </div>

        {/* Ring */}
        <div className={styles.ringWrap}>
          <svg className={styles.svg} width="200" height="200" viewBox="0 0 200 200">
            <circle className={styles.ringTrack} cx="100" cy="100" r="88"/>
            <circle className={styles.ringFill} cx="100" cy="100" r="88" strokeDasharray={CIRC} strokeDashoffset={offset} style={{ stroke: strokeClr }}/>
          </svg>
          {running && <div className={styles.pulseRing} style={{ borderColor: strokeClr }}/>}
          <div className={styles.inner}>
            <div className={styles.time}>{pad(minutes)}:{pad(secs)}</div>
            <div className={styles.timeSub}>{modeLabels[mode.id]}</div>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <button className={styles.smBtn} onClick={reset} title="Reset">↺</button>
          <button className={styles.playBtn} onClick={toggle}>{running ? '⏸' : '▶'}</button>
          <div className={styles.sessionBlock}>
            <div className={styles.sessionNum}>{sessions}</div>
            <div className={styles.sessionLbl}>{t.today || 'TODAY'}</div>
          </div>
        </div>

        {/* Settings toggle */}
        <button className={`${styles.settingsToggle} ${showSettings ? styles.settingsOpen : ''}`} onClick={() => setShowSettings(s => !s)}>
          <span>⚙</span>
          <span>{showSettings ? (t.closeDurations || 'Close') : (t.customizeDurations || 'Customize durations')}</span>
          <span className={styles.chevron}>{showSettings ? '▲' : '▼'}</span>
        </button>

        {/* Settings panel */}
        {showSettings && (
          <div className={styles.settingsPanel}>
            {settingsModes.map(({ key, label, color }) => (
              <div className={styles.settingsRow} key={key}>
                <div className={styles.settingsLeft}>
                  <div className={styles.settingsDot} style={{ background: color }}/>
                  <span className={styles.settingsLabel}>{label}</span>
                </div>
                <div className={styles.settingsRight}>
                  <button className={styles.adjBtn} onClick={() => updateDuration(key, durations[key] - 1)}>−</button>
                  <div className={styles.durationDisplay}>
                    <input className={styles.durationInput} type="number" min="1" max="99" value={durations[key]} onChange={e => updateDuration(key, e.target.value)}/>
                    <span className={styles.minLabel}>{t.minutes || 'min'}</span>
                  </div>
                  <button className={styles.adjBtn} onClick={() => updateDuration(key, durations[key] + 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quote */}
      <button className={styles.quote} onClick={() => setQuoteIdx(i => (i + 1) % quotes.length)}>
        <span className={styles.quoteText}>'{quotes[quoteIdx]}'</span>
      </button>
    </div>
  )
}
