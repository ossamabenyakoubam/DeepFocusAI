import React, { useRef } from 'react'
import styles from './Spaces.module.css'

export default function Spaces({ presets, activeBgId, onSelect, t = {} }) {
  const fileRef = useRef(null)

  function handleCustomUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    // Inject a temporary custom preset and select it
    onSelect('__custom__')
    // Store url in sessionStorage for App to pick up
    sessionStorage.setItem('df_custom_bg', url)
    window.dispatchEvent(new CustomEvent('df:custombg', { detail: { url } }))
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>
          <GridIcon />
          {t.spaces || 'Spaces'}
        </div>
      </div>

      <div className={styles.grid}>
        {presets.map((p) => (
          <button
            key={p.id}
            className={`${styles.thumb} ${activeBgId === p.id ? styles.active : ''}`}
            onClick={() => onSelect(p.id)}
            title={p.label}
            aria-label={`Set background: ${p.label}`}
          >
            {p.url ? (
              <img src={p.url.replace('w=1920', 'w=160').replace('q=100', 'q=50')} alt={p.label} className={styles.thumbImg} />
            ) : (
              <div className={styles.thumbPlain} style={{ background: p.css || p.color }}>
                <span>{p.emoji}</span>
              </div>
            )}
          </button>
        ))}

        {/* Add custom */}
        <button
          className={styles.addBtn}
          onClick={() => fileRef.current?.click()}
          title={t.addBackground || 'Upload custom background'}
          aria-label={t.addBackground || 'Upload custom background'}
        >
          +
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleCustomUpload}
        />
      </div>
    </div>
  )
}

const GridIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="1" y="1" width="6" height="6" rx="1"/>
    <rect x="9" y="1" width="6" height="6" rx="1"/>
    <rect x="1" y="9" width="6" height="6" rx="1"/>
    <rect x="9" y="9" width="6" height="6" rx="1"/>
  </svg>
)
