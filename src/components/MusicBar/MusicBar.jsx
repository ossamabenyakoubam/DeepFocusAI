import React, { useState, useRef } from 'react'
import styles from './MusicBar.module.css'

export default function MusicBar({ currentTasks = [], sessionsToday = 0, t = {} }) {
  const [tab,         setTab]         = useState('ai')
  const [query,       setQuery]       = useState('')
  const [spotifyUrl,  setSpotifyUrl]  = useState('')
  const [spotifyId,   setSpotifyId]   = useState(null)
  const [results,     setResults]     = useState([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [reason,      setReason]      = useState('')
  const [keywords,    setKeywords]    = useState('')
  const [detectedMood,setDetectedMood]= useState(null)
  const [activeTrack, setActiveTrack] = useState(null)
  const [playing,     setPlaying]     = useState(false)
  const [minimized,   setMinimized]   = useState(false)
  const iframeKey = useRef(0)

  async function searchYouTube(q) {
    setLoading(true); setError(null); setResults([])
    try {
      const res  = await fetch('/api/youtube-search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'YouTube search failed')
      setResults(data.tracks || [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function aiRecommend() {
    // Always reset everything first — guarantees fresh results
    setLoading(true)
    setError(null)
    setResults([])
    setKeywords('')
    setReason('')
    setDetectedMood(null)

    try {
      const hour      = new Date().getHours()
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night'

      // Pass ALL task texts (done + pending) for mood scanning
      const taskTexts = currentTasks.map(task => task.text)

      console.log('🎵 Scanning tasks for mood:', taskTexts)

      const kwRes = await fetch('/api/music-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeOfDay,
          sessionsToday: sessionsToday,
          pendingTasks:  currentTasks.filter(t => !t.done).length,
          doneTasks:     currentTasks.filter(t =>  t.done).length,
          taskTexts,     // ← fresh every click
        }),
      })
      const kw = await kwRes.json()
      if (!kwRes.ok) throw new Error(kw.error || 'Failed')

      console.log('🎵 Result:', kw)
      setKeywords(kw.keywords)
      setReason(kw.reason)
      setDetectedMood(kw.detectedMood || null)
      await searchYouTube(kw.keywords)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) searchYouTube(query.trim())
  }

  function loadSpotify() {
    const match = spotifyUrl.match(/spotify\.com\/(track|playlist|album|artist)\/([a-zA-Z0-9]+)/)
    if (!match) { setError('Invalid Spotify link.'); return }
    setError(null)
    setSpotifyId(`${match[1]}/${match[2]}`)
  }

  function playTrack(track) {
    if (activeTrack?.ytId === track.ytId) { setPlaying(p => !p); return }
    iframeKey.current++
    setActiveTrack(track)
    setPlaying(true)
  }

  const hour      = new Date().getHours()
  const timeLabel = hour < 12 ? (t.morning||'Morning') : hour < 17 ? (t.afternoon||'Afternoon') : hour < 21 ? (t.evening||'Evening') : (t.night||'Night')

  const MOOD_EMOJIS = { happy:'😊', sad:'😢', stressed:'😰', tired:'😴', energetic:'⚡', motivated:'🔥', creative:'🎨', focused:'🎯', relaxed:'😌', anxious:'😟', excited:'🎉', bored:'😑' }

  // ── MINIMIZED ──────────────────────────────────────────────
  if (minimized) {
    return (
      <div className={styles.wrapMin}>
        {activeTrack && playing && (
          <iframe key={iframeKey.current}
            src={`https://www.youtube-nocookie.com/embed/${activeTrack.ytId}?autoplay=1&loop=1&playlist=${activeTrack.ytId}&controls=0&modestbranding=1&rel=0`}
            className={styles.ytHidden} allow="autoplay; encrypted-media" title="yt-player"/>
        )}
        <div className={styles.miniBar}>
          <div className={styles.miniLeft}>
            <MusicIcon />
            <span className={styles.miniTitle}>{t.focusMusic || 'Focus Music'}</span>
            {activeTrack && playing && <span className={styles.miniDot} />}
            {activeTrack
              ? <span className={styles.miniTrackName}>{activeTrack.name}</span>
              : <span className={styles.miniIdle}>not playing</span>
            }
          </div>
          <div className={styles.miniRight}>
            {activeTrack && (
              <button className={styles.miniPlayBtn} onClick={() => setPlaying(p => !p)}>
                {playing ? '⏸' : '▶'}
              </button>
            )}
            <button className={styles.expandBtn} onClick={() => setMinimized(false)}>+</button>
          </div>
        </div>
      </div>
    )
  }

  // ── FULL VIEW ──────────────────────────────────────────────
  return (
    <div className={styles.wrap}>
      {activeTrack && playing && !spotifyId && (
        <iframe key={iframeKey.current}
          src={`https://www.youtube-nocookie.com/embed/${activeTrack.ytId}?autoplay=1&loop=1&playlist=${activeTrack.ytId}&controls=0&modestbranding=1&rel=0`}
          className={styles.ytHidden} allow="autoplay; encrypted-media" title="yt-player"/>
      )}

      {/* Header */}
      <div className={styles.barHeader}>
        <div className={styles.barHeaderLeft}>
          <MusicIcon />
          <span className={styles.barHeaderTitle}>{t.focusMusic || 'Focus Music'}</span>
        </div>
        <button className={styles.minimizeBtn} onClick={() => setMinimized(true)} title="Minimize">−</button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab==='ai'      ? styles.activeTab:''}`} onClick={()=>{ setTab('ai');      setResults([]); setError(null) }}>✨ AI</button>
        <button className={`${styles.tab} ${tab==='search'  ? styles.activeTab:''}`} onClick={()=>{ setTab('search');  setResults([]); setError(null) }}>🔍 {t.searchPlaceholder ? 'Search' : 'Search'}</button>
        <button className={`${styles.tab} ${tab==='spotify' ? styles.activeTab:''}`} onClick={()=>{ setTab('spotify'); setResults([]); setError(null) }}>🎵 Spotify</button>
      </div>

      {/* Tab content */}
      <div className={styles.tabContent}>
        {tab === 'ai' && (
          <div className={styles.tabBody}>
            <div className={styles.ctxRow}>
              <span className={styles.ctxChip}>🕐 {timeLabel}</span>
              <span className={styles.ctxChip}>🍅 {sessionsToday} {t.sessions||'sessions'}</span>
              <span className={styles.ctxChip}>📋 {currentTasks.filter(t=>!t.done).length} {t.tasks||'tasks'}</span>
            </div>
            <button className={styles.aiBtn} onClick={aiRecommend} disabled={loading}>
              {loading ? <><span className={styles.spin}>⟳</span> {t.searching||'Searching...'}</> : (t.findMusic||'✨ Find My Music')}
            </button>
            {detectedMood && (
              <div className={styles.moodBadge}>
                {MOOD_EMOJIS[detectedMood]} Mood detected: <strong>{detectedMood}</strong>
              </div>
            )}
            {reason && <div className={styles.reason}>"{reason}"</div>}
          </div>
        )}

        {tab === 'search' && (
          <div className={styles.tabBody}>
            <form className={styles.searchRow} onSubmit={handleSearch}>
              <input className={styles.searchInput} placeholder={t.searchPlaceholder||'Search music...'} value={query} onChange={e => setQuery(e.target.value)} />
              <button className={styles.searchBtn} type="submit" disabled={loading}>
                {loading ? <span className={styles.spin}>⟳</span> : '→'}
              </button>
            </form>
            <div className={styles.chips}>
              {['lofi study','binaural beats','jazz café','rain sounds','classical','arabic oud','happy music','sad piano','energetic beats'].map(s => (
                <button key={s} className={styles.chip} onClick={() => { setQuery(s); searchYouTube(s) }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {tab === 'spotify' && (
          <div className={styles.tabBody}>
            {!spotifyId ? (
              <div className={styles.spotifyInput}>
                <div className={styles.searchRow}>
                  <input className={styles.searchInput} placeholder={t.spotifyPlaceholder||'https://open.spotify.com/playlist/...'} value={spotifyUrl} onChange={e => setSpotifyUrl(e.target.value)} onKeyDown={e => e.key==='Enter' && loadSpotify()} />
                  <button className={styles.spotifyBtn} onClick={loadSpotify}>{t.restore||'Load'}</button>
                </div>
                <div className={styles.spotifyHint}>{t.spotifyHint||'Paste a Spotify link'}</div>
                <div className={styles.spotifyWarning}>
                  ⚠ Spotify limite la lecture à <strong>30 secondes</strong> par track sans compte Premium. Pour écouter en entier, utilise l'onglet <strong>🔍 Search</strong> (YouTube).
                </div>
              </div>
            ) : (
              <div className={styles.spotifyLoaded}>
                <span className={styles.spotifyLoadedText}>{t.spotifyLoaded||'✓ Spotify loaded'}</span>
                //<button className={styles.spotifyChange} onClick={() => { setSpotifyId(null); setSpotifyUrl('') }}>{t.change||'Change'}</button>
              </div>
            )}
          </div>
        )}

        {error && <div className={styles.error}>⚠ {error}</div>}

        {/* Results */}
        {results.length > 0 && tab !== 'spotify' && (
          <div className={styles.resultsList}>
            {keywords && <div className={styles.resultsLabel}>🔍 <em>"{keywords}"</em></div>}
            {results.map(track => {
              const isActive  = activeTrack?.ytId === track.ytId
              const isPlaying = isActive && playing
              return (
                <button key={track.ytId} className={`${styles.resultItem} ${isActive ? styles.resultActive : ''}`} onClick={() => playTrack(track)}>
                  <div className={styles.thumbWrap}>
                    {track.thumbnail ? <img src={track.thumbnail} alt="" className={styles.thumb} /> : <div className={styles.thumbFb}>🎵</div>}
                    <div className={styles.thumbOverlay}>{isPlaying ? '⏸' : '▶'}</div>
                  </div>
                  <div className={styles.trackMeta}>
                    <div className={styles.trackName}>{track.name}</div>
                    <div className={styles.trackArtist}>{track.artist}</div>
                  </div>
                  {isPlaying && <span className={styles.playingDot} />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom player */}
      {tab === 'spotify' && spotifyId ? (
        <div className={styles.spotifyBar}>
          <iframe src={`https://open.spotify.com/embed/${spotifyId}?utm_source=generator&theme=0`} className={styles.spotifyIframe} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Spotify"/>
        </div>
      ) : activeTrack ? (
        <div className={styles.playerBar}>
          <div className={styles.playerLeft}>
            {activeTrack.thumbnail ? <img src={activeTrack.thumbnail} alt="" className={styles.playerThumb} /> : <div className={styles.playerThumbFb}>🎵</div>}
            <div className={styles.playerInfo}>
              <div className={styles.playerName}>{activeTrack.name}</div>
              <div className={styles.playerArtist}>{activeTrack.artist}</div>
            </div>
          </div>
          <div className={styles.playerCenter}>
            <button className={styles.playerCtrl} onClick={() => { iframeKey.current++; setPlaying(true) }}>⟳</button>
            <button className={styles.playerPlayBtn} onClick={() => setPlaying(p => !p)}>{playing ? '⏸' : '▶'}</button>
            <button className={styles.playerCtrl} onClick={() => { setActiveTrack(null); setPlaying(false) }}>■</button>
          </div>
          <div className={styles.playerRight}>
            {playing ? <><span className={styles.playerDot}/><span className={styles.playerStatus}>Playing</span></> : <span className={styles.playerStatus} style={{opacity:0.4}}>Paused</span>}
            <span className={styles.playerYt}>▶ YouTube</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const MusicIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 2v9"/>
    <path d="M9 2l5-1v3l-5 1"/>
    <circle cx="7" cy="11" r="2.5"/>
  </svg>
)
