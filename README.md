# DeepFocusAI — Espace de travail minimaliste

Application de productivité sans distraction construite avec **React + Vite**.  
Tout fonctionne localement. Zéro compte. Zéro configuration.

---

## Fonctionnalités

| Module | Description |
|---|---|
| ⏱ **Timer Pomodoro** | Modes Focus / Pause courte / Pause longue, anneau de progression, compteur de sessions |
| ✅ **Tâches** | Ajouter, compléter, supprimer — sauvegarde automatique |
| 📝 **Bloc-notes** | Éditeur riche (gras, italique, titres, listes) — sauvegarde automatique |
| 🎵 **Musique** | Recommandation IA + recherche YouTube + embed Spotify |
| 🖼 **Espaces** | 7 fonds d'écran + importation d'image personnalisée |
| 💾 **Sauvegarde** | Export et import des tâches et notes en JSON |
| ⌨️ **Raccourcis** | `ESPACE` = démarrer/pause · `← →` = changer de mode |

---

## Structure du projet

```
deepfocusai/
├── index.html
├── vite.config.js
├── api/
│   ├── music-keywords.js   # Génération des keywords musicaux
│   └── youtube-search.js   # Proxy API YouTube (clé cachée)
└── src/
    ├── main.jsx             # Point d'entrée
    ├── App.jsx              # Layout + gestion du fond d'écran
    ├── index.css            # Variables CSS globales
    ├── hooks/
    │   ├── useTimer.js      # Logique Pomodoro + raccourcis clavier
    │   └── useLocalStorage.js
    └── components/
        ├── Header/          # Horloge, logo, boutons actions
        ├── TaskPanel/       # Liste de tâches
        ├── TimerPanel/      # Timer SVG + citations
        ├── MusicBar/        # Lecteur musique (IA + YouTube + Spotify)
        ├── Scratchpad/      # Éditeur de notes
        └── Spaces/          # Grille de fonds + upload
```

---

## Stack technique

| Technologie | Rôle |
|---|---|
| React 18 | Composants UI |
| Vite 5 | Build + serveur de développement |
| CSS Modules | Styles isolés par composant |
| localStorage | Persistance des données en local |
| Web Audio API | Sons du timer |
| Vercel Functions | Proxy API serveur (clés cachées) |

---

## Comment fonctionne la recommandation musicale IA

```
1. L'utilisateur clique ✨ Find My Music
         ↓
2. L'app collecte le contexte
   (heure, sessions, tâches en attente, texte des tâches)
         ↓
3. /api/music-keywords analyse l'humeur + le contexte
   → génère des keywords YouTube ciblés
         ↓
4. /api/youtube-search appelle l'API YouTube
   → retourne 6 vraies vidéos
         ↓
5. L'utilisateur voit les résultats → clique ▶ pour jouer
```

---

*DeepFocusAI — Projet de Fin d'Études (PFE)*