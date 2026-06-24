import React, { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import styles from './App.module.css'
import Header     from './components/Header/Header.jsx'
import TaskPanel  from './components/TaskPanel/TaskPanel.jsx'
import TimerPanel from './components/TimerPanel/TimerPanel.jsx'
import MusicBar   from './components/MusicBar/MusicBar.jsx'
import Scratchpad from './components/Scratchpad/Scratchpad.jsx'
import Spaces     from './components/Spaces/Spaces.jsx'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { useTimer } from './hooks/useTimer.js'

/* 
  COMPLETE TRANSLATIONS — every string 
     */
export const LANGS = {
  en: {
    /* App */
    appName: 'DeepFocusAI',
    appSub: 'Minimalist Focus Workspace',
    /* Header buttons */
    
    backup: 'Backup',
    restore: 'Restore',
    /* Language picker */
    languageLabel: 'EN',
    languageFlag: '',
    switchTo: 'Français',
    switchFlag: '',
    /* Task panel */
    focusTasks: 'Focus Tasks',
    addTask: 'Add a task...',
    autoSaved: '⟳ Auto-saved locally, daily backup recommended',
    deleteTask: 'Delete task',
    noTasks: 'No tasks yet. Add one below!',
    completed: 'completed',
    startPause: 'SPACE to start/pause',
    switchModes: '← / → switch modes',
    /* Timer */
    focus: 'FOCUS',
    shortBreak: 'SHORT BREAK',
    longBreak: 'LONG BREAK',
    today: 'TODAY',
    customizeDurations: 'Customize durations',
    closeDurations: 'Close settings',
    focusLabel: 'Focus',
    shortBreakLabel: 'Short Break',
    longBreakLabel: 'Long Break',
    minutes: 'min',
    /* Quotes */
    quotes: [
      "Don't stop when you're tired. Stop when you're done.",
      "Deep work is the superpower of the 21st century.",
      "Small progress is still progress.",
      "Begin anywhere.",
      "Done is better than perfect.",
      "Focus is the art of knowing what to ignore.",
      "The secret of getting ahead is getting started.",
      "Concentrate all your thoughts upon the work at hand.",
    ],
    /* Music */
    focusMusic: 'Focus Music',
    minimize: 'Minimize',
    expand: 'Expand',
    notPlaying: 'not playing',
    tabAI: '✨ AI',
    tabSearch: '🔍 Search',
    tabSpotify: '🎵 Spotify',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
    sessions: 'sessions',
    tasks: 'tasks',
    findMusic: '✨ Find My Music',
    searching: 'Searching...',
    moodDetected: 'Mood detected',
    searchPlaceholder: 'Search music, artist, playlist...',
    searchChips: ['lofi study','binaural beats','jazz café','rain sounds','classical','arabic oud','happy music','sad piano','energetic beats'],
    spotifyPlaceholder: 'https://open.spotify.com/playlist/...',
    spotifyHint: 'Paste a Spotify track · playlist · album · artist link',
    spotifyLoad: 'Load',
    spotifyLoaded: '✓ Spotify loaded',
    change: 'Change',
    resultsFor: 'Results for',
    selectTrack: 'Select a track to start playing',
    playing: 'Playing',
    paused: 'Paused',
    /* Scratchpad */
    scratchpad: 'Scratchpad',
    scratchpadBackup: 'Backup',
    brainDump: 'Brain dump your study notes here...',
    chars: 'chars',
    saved: '● saved',
    saving: '○ saving...',
    normal: 'Normal',
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    heading3: 'Heading 3',
    textColor: 'Text color',
    clearFormat: 'Clear formatting',
    /* Spaces */
    spaces: 'Spaces',
    addBackground: 'Add custom background',
  },
  fr: {
    /* App */
    appName: 'DeepFocusAI',
    appSub: 'Espace de travail minimaliste',
    /* Header buttons */
    
    backup: 'Sauvegarde',
    restore: 'Restaurer',
    /* Language picker */
    languageLabel: 'FR',
    languageFlag: '',
    switchTo: 'English',
    switchFlag: '',
    /* Task panel */
    focusTasks: 'Tâches Focus',
    addTask: 'Ajouter une tâche...',
    autoSaved: '⟳ Sauvegarde locale automatique',
    deleteTask: 'Supprimer la tâche',
    noTasks: 'Aucune tâche. Ajoutez-en une !',
    completed: 'terminée',
    startPause: 'ESPACE pour démarrer/pause',
    switchModes: '← / → changer de mode',
    /* Timer */
    focus: 'FOCUS',
    shortBreak: 'PAUSE COURTE',
    longBreak: 'PAUSE LONGUE',
    today: "AUJOURD'HUI",
    customizeDurations: 'Personnaliser les durées',
    closeDurations: 'Fermer les paramètres',
    focusLabel: 'Focus',
    shortBreakLabel: 'Pause courte',
    longBreakLabel: 'Pause longue',
    minutes: 'min',
    /* Quotes */
    quotes: [
      "N'arrêtez pas quand vous êtes fatigué. Arrêtez quand c'est fait.",
      "La concentration est la superforce du 21ème siècle.",
      "Un petit progrès reste un progrès.",
      "Commencez quelque part.",
      "Fait vaut mieux que parfait.",
      "Se concentrer, c'est savoir quoi ignorer.",
      "Le secret pour avancer, c'est de commencer.",
      "Concentrez toutes vos pensées sur le travail en cours.",
    ],
    /* Music */
    focusMusic: 'Musique Focus',
    minimize: 'Réduire',
    expand: 'Agrandir',
    notPlaying: 'rien en cours',
    tabAI: '✨ IA',
    tabSearch: '🔍 Chercher',
    tabSpotify: '🎵 Spotify',
    morning: 'Matin',
    afternoon: 'Après-midi',
    evening: 'Soir',
    night: 'Nuit',
    sessions: 'sessions',
    tasks: 'tâches',
    findMusic: '✨ Trouver ma musique',
    searching: 'Recherche...',
    moodDetected: 'Humeur détectée',
    searchPlaceholder: 'Rechercher musique, artiste, playlist...',
    searchChips: ['lofi étude','battements binauraux','jazz café','sons de pluie','classique','oud arabe','musique joyeuse','piano triste','beats énergiques'],
    spotifyPlaceholder: 'https://open.spotify.com/playlist/...',
    spotifyHint: 'Collez un lien Spotify · piste · playlist · album · artiste',
    spotifyLoad: 'Charger',
    spotifyLoaded: '✓ Spotify chargé',
    change: 'Changer',
    resultsFor: 'Résultats pour',
    selectTrack: 'Sélectionnez une piste pour commencer',
    playing: 'En cours',
    paused: 'En pause',
    /* Scratchpad */
    scratchpad: 'Bloc-notes',
    scratchpadBackup: 'Sauvegarde',
    brainDump: 'Notez vos idées, formules, réflexions...',
    chars: 'caractères',
    saved: '● sauvegardé',
    saving: '○ sauvegarde...',
    normal: 'Normal',
    heading1: 'Titre 1',
    heading2: 'Titre 2',
    heading3: 'Titre 3',
    textColor: 'Couleur du texte',
    clearFormat: 'Effacer le format',
    /* Spaces */
    spaces: 'Espaces',
    addBackground: 'Ajouter un fond personnalisé',
  },
}

const BG_PRESETS = [
  { id: 'plain',    label: 'Plain',     emoji: '◉', css: '#0a0805' },
  { id: 'library',  label: 'Library',   url: 'https://images.unsplash.com/photo-1588580000645-4562a6d2c839?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&q=100' },
  { id: 'city',     label: 'City',      url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=100' },
  { id: 'forest',   label: 'Forest',    url: 'https://images.unsplash.com/photo-1440581572325-0bea30075d9d?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&q=100' },
  { id: 'desktop', label: 'Desktop',   url: 'https://images.unsplash.com/photo-1616400619175-5beda3a17896?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&q=100' },
  { id: 'purple',   label: 'Purple',    url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1920&q=100' },
  { id: 'gradient', label: 'Gradient',  url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&qhttps://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D0&q=100' },
]

function buildBgStyle(preset) {
  const overlay = 'linear-gradient(180deg,rgba(0,0,0,0.38) 0%,rgba(0,0,0,0.12) 45%,rgba(0,0,0,0.55) 100%)'
  if (preset?.url) return { background: `${overlay}, url('${preset.url}') center/cover no-repeat` }
  return { background: preset?.css || '#100d0a' }
}

export default function App() {
  const [activeBgId,  setActiveBgId]  = useState('Gradient')
  const [customBgUrl, setCustomBgUrl] = useState(null)
  const [lang,        setLang]        = useState('en')

  const [tasks, setTasks] = useLocalStorage('df_tasks', [
    { id: 1, text: "Homework time",     done: false },
    { id: 2, text: "Learn something new", done: false },
  ])
  const timer = useTimer()

  React.useEffect(() => {
    function onCustomBg(e) { setCustomBgUrl(e.detail.url) }
    window.addEventListener('df:custombg', onCustomBg)
    return () => window.removeEventListener('df:custombg', onCustomBg)
  }, [])

  const activePreset = activeBgId === '__custom__'
    ? { id: '__custom__', url: customBgUrl }
    : BG_PRESETS.find(p => p.id === activeBgId) ?? BG_PRESETS[6]

  const t = LANGS[lang]

  return (
    <div className={styles.root}>
      <Analytics />
      <div className={styles.bg} style={buildBgStyle(activePreset)} />
      <div className={styles.layout}>
        <Header t={t} lang={lang} setLang={setLang} />
        <div className={styles.main}>
          <TaskPanel tasks={tasks} setTasks={setTasks} t={t} />
          <div className={styles.center}>
            <TimerPanel timer={timer} t={t} />
            <MusicBar currentTasks={tasks} sessionsToday={timer.sessions} t={t} />
          </div>
          <div className={styles.right}>
            <Scratchpad t={t} />
            <Spaces presets={BG_PRESETS} activeBgId={activeBgId} onSelect={setActiveBgId} t={t} />
          </div>
        </div>
      </div>
    </div>
  )
}
