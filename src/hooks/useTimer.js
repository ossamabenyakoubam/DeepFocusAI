import { useState, useEffect, useRef, useCallback } from 'react'

export const DEFAULT_DURATIONS = { focus: 25, short: 5, long: 15 }
export const MODE_IDS    = ['focus', 'short', 'long']
export const MODE_LABELS = { focus: 'FOCUS', short: 'SHORT BREAK', long: 'LONG BREAK' }

/* ── Web Audio helpers ── */
function getAudioCtx() {
  if (!window._dfAudioCtx)
    window._dfAudioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return window._dfAudioCtx
}

export function playStart() {
  try {
    const ctx = getAudioCtx()
    ;[0, 0.18, 0.36].forEach((delay) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      const t = ctx.currentTime + delay
      osc.type = 'sine'
      osc.frequency.setValueAtTime(660, t)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.22, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)
      osc.start(t); osc.stop(t + 0.15)
    })
  } catch {}
}

export function playFinish() {
  try {
    const ctx = getAudioCtx()
    ;[523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      const t = ctx.currentTime + i * 0.25
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.25, t + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.0)
      osc.start(t); osc.stop(t + 1.05)
    })
  } catch {}
}

/* ── Hook ── */
export function useTimer() {
  const [durations, setDurations] = useState(() => {
    try { const s = localStorage.getItem('df_durations'); return s ? JSON.parse(s) : { ...DEFAULT_DURATIONS } }
    catch { return { ...DEFAULT_DURATIONS } }
  })

  const [modeIdx,  setModeIdx]  = useState(0)
  const [seconds,  setSeconds]  = useState(durations.focus * 60)
  const [running,  setRunning]  = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef(null)
  const endTimeRef  = useRef(null)
  const sessionsRef = useRef(0)  // ref pour accéder au count dans le setInterval
  const modeId = MODE_IDS[modeIdx]
  const totalSeconds = durations[modeId] * 60

  // Sync sessionsRef avec sessions state
  useEffect(() => { sessionsRef.current = sessions }, [sessions])

  // Reset quand on change de mode ou de durée
  useEffect(() => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setSeconds(durations[modeId] * 60)
    endTimeRef.current = null
  }, [modeIdx, durations])

  // Le moteur du timer
  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return }

    endTimeRef.current = Date.now() + seconds * 1000

    intervalRef.current = setInterval(() => {
      const remaining = Math.round((endTimeRef.current - Date.now()) / 1000)

      if (remaining <= 0) {
        clearInterval(intervalRef.current)
        endTimeRef.current = null
        playFinish()
        setRunning(false)

        if (modeId === 'focus') {
          // Incrémente et calcule le prochain mode
          const newCount = sessionsRef.current + 1
          setSessions(newCount)
          // Toutes les 4 sessions focus → Long Break, sinon → Short Break
          setModeIdx(newCount % 4 === 0 ? 2 : 1)
        } else {
          // Après n'importe quelle pause → retour au Focus
          setModeIdx(0)
        }
        return
      }
      setSeconds(remaining)
    }, 500)

    return () => clearInterval(intervalRef.current)
  }, [running, modeIdx, durations])

  // Raccourcis clavier
  useEffect(() => {
    function onKey(e) {
      if (e.target !== document.body) return
      if (e.code === 'Space')      { e.preventDefault(); doToggle() }
      if (e.code === 'ArrowLeft')  setModeIdx(i => (i - 1 + MODE_IDS.length) % MODE_IDS.length)
      if (e.code === 'ArrowRight') setModeIdx(i => (i + 1) % MODE_IDS.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function doToggle() {
    setRunning(r => {
      if (!r) playStart()
      return !r
    })
  }

  const toggle   = useCallback(doToggle, [])
  const reset    = useCallback(() => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setSeconds(durations[modeId] * 60)
    endTimeRef.current = null
  }, [modeId, durations])
  const prevMode = useCallback(() => setModeIdx(i => (i - 1 + MODE_IDS.length) % MODE_IDS.length), [])
  const nextMode = useCallback(() => setModeIdx(i => (i + 1) % MODE_IDS.length), [])

  function updateDuration(key, val) {
    const mins = Math.max(1, Math.min(120, Number(val) || 1))
    const next = { ...durations, [key]: mins }
    setDurations(next)
    localStorage.setItem('df_durations', JSON.stringify(next))
  }

  return {
    seconds, running, sessions,
    progress: seconds / totalSeconds,
    mode: { id: modeId, label: MODE_LABELS[modeId] },
    durations, toggle, reset, prevMode, nextMode, updateDuration,
  }
}