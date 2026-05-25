# DeepFocusAI — Espace de travail minimaliste

> Application de productivité sans distraction construite avec **React + Vite**.  
> Tout fonctionne localement. Zéro compte. Zéro configuration.

🔗 **Lien live** : [deepfocusai.vercel.app](https://deepfocusai.vercel.app)

---

## Fonctionnalités

   
 ⏱ **Timer Pomodoro**      | Modes Focus / Pause courte / Pause longue, anneau de progression SVG animé, compteur de sessions 
 ✅ **Tâches**             | Ajouter, compléter, supprimer — sauvegarde automatique 
 📝 **Bloc-notes**         | Éditeur riche (gras, italique, titres, listes, citations) — sauvegarde automatique 
 🎵 **Musique**            | Recommandation IA + recherche YouTube + embed Spotify 
 🖼 **Espaces**             | 7 fonds d'écran preset + importation d'image personnalisée 
 💾 **Sauvegarde**         | Export et import des tâches et notes en JSON 
 ⌨️ **Raccourcis clavier** | `ESPACE` = démarrer/pause · `← →` = changer de mode 
 🌍 **Multilingue**        | Support français et anglais 

---

## Architecture du projet

```
deepfocusai/
├── index.html
├── vite.config.js
├── vercel.json
├── api/
│   ├── music-keywords.js   # Détection d'humeur + génération keywords YouTube
│   └── youtube-search.js   # Proxy API YouTube (clé cachée côté serveur)
└── src/
    ├── main.jsx             # Point d'entrée React
    ├── App.jsx              # Layout racine + gestion fond d'écran
    ├── index.css            # Variables CSS globales
    ├── hooks/
    │   ├── useTimer.js      # Logique Pomodoro + raccourcis clavier
    │   └── useLocalStorage.js
    └── components/
        ├── Header/          # Horloge live, logo, boutons backup/restore
        ├── TaskPanel/       # Liste de tâches
        ├── TimerPanel/      # Timer SVG animé + citations
        ├── MusicBar/        # Lecteur musique (IA + YouTube + Spotify)
        ├── Scratchpad/      # Éditeur de notes riche
        └── Spaces/          # Grille de fonds + upload image
```

---

## Stack technique

| Technologie        | Rôle                                                   | 
-------------------------------------------------------------------------------
| React 18           | Composants UI et gestion d'état                        |
| Vite 5             | Build tool et serveur de développement                 |
| CSS Modules        | Styles isolés et encapsulés par composant              |
| localStorage       | Persistance des données entièrement en local           |
| Web Audio API      | Sons du timer générés par le code, aucun fichier audio |
| Vercel Functions   | Fonctions serverless — proxy API sécurisé              |
| YouTube Data API v3| Recherche et récupération des tracks musicaux          |

---

## Points techniques notables

**Timer précis en arrière-plan** — Le timer utilise l'heure réelle au lieu de compter les ticks. Quand l'utilisateur change d'onglet, le navigateur ralentit les intervalles. Cette approche calcule les secondes restantes depuis l'heure exacte de fin, garantissant une précision totale même en arrière-plan.

**Clé API cachée côté serveur** — La clé YouTube n'est jamais exposée au navigateur. Elle vit dans les variables d'environnement Vercel et est utilisée uniquement dans la fonction serverless, invisible pour l'utilisateur.

**Détection d'humeur multilingue** — Le système analyse le texte des tâches avec des expressions régulières couvrant 4 langues (anglais, français, espagnol, allemand) pour détecter l'humeur et recommander la musique adaptée parmi 12 humeurs possibles.

**Architecture glassmorphism** — Design en verre dépoli cohérent sur tous les composants via des fonds semi-transparents et l'effet de flou, avec support de fonds personnalisés uploadés par l'utilisateur.

---

## Comment fonctionne la recommandation musicale IA

```
1. L'utilisateur clique ✨ Find My Music
         ↓
2. L'app collecte le contexte
   (heure de la journée, sessions complétées, tâches en attente, texte des tâches)
         ↓
3. /api/music-keywords analyse l'humeur + le contexte
   → génère des keywords YouTube ciblés
         ↓
4. /api/youtube-search appelle l'API YouTube Data v3
   → retourne 6 vidéos pertinentes
         ↓
5. L'utilisateur voit les résultats → clique ▶ pour jouer
```

---

## Concepts React démontrés

- Composants fonctionnels avec hooks — useState, useEffect, useRef, useCallback
- Hooks personnalisés pour la séparation de la logique métier — useTimer, useLocalStorage
- CSS Modules pour l'encapsulation des styles sans conflits entre composants
- Refs pour accéder directement au DOM — éditeur contentEditable, iframes YouTube
- Communication inter-composants via props, callbacks et événements personnalisés
- Rendu conditionnel et listes dynamiques

---

*DeepFocusAI — Projet de Fin d'Études (PFE)*