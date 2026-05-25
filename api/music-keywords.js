/*
  Smart keyword generator
  - Scans ALL tasks (any language) for mood detection
  - Re-evaluates every time it's called — no caching
  - Combines mood + time of day + session count for best result
*/

/* ── Mood keyword pools — search queries for YouTube ── */
const MOOD_MUSIC = {
  happy:     ['happy upbeat study beats lofi','positive energy focus music','feel good study playlist upbeat','cheerful background study music'],
  sad:       ['sad melancholic piano study','emotional ambient focus rain','rainy day sad background music study','soft sad lofi study'],
  stressed:  ['calm anxiety relief study music','stress relief ambient sounds focus','peaceful meditation music study','anti-stress lofi calm'],
  tired:     ['gentle soft tired study music','calm slow lo-fi tired','sleep study ambient soft','low energy calm focus music'],
  energetic: ['energetic upbeat study beats','high energy focus music workout','pump up study playlist fast','energizing morning focus beats'],
  motivated: ['motivational epic study music','powerful focus motivation cinematic','hustle study beats motivated','success mindset music focus'],
  creative:  ['creative flow jazz study','ambient creative writing music','jazz creative focus session','artsy lo-fi creative study'],
  focused:   ['binaural beats 40hz deep focus','deep work concentration no lyrics','flow state music study session','laser focus binaural study'],
  relaxed:   ['relaxing chill lo-fi study','calm peaceful afternoon study','easy relaxed background music','mellow study session music'],
  anxious:   ['anxiety relief calm piano','soothing nature sounds nervous','gentle calm anxious study','peaceful wind down anxiety music'],
  bored:     ['eclectic varied study music','interesting fun focus playlist','upbeat mixed genre study','diverse focus music playlist'],
  calm:     ['calm down music study','soothing anger relief music','peaceful nature sounds calm','zen meditation music focus'],
}

const TIME_MUSIC = {
  morning:   ['lofi hip hop morning study energizing','upbeat jazz coffee morning focus','energizing morning study beats','positive morning study music'],
  afternoon: ['chillhop focus afternoon work','lo-fi jazzhop afternoon productivity','afternoon chill study session','mellow afternoon focus music'],
  evening:   ['binaural beats deep focus evening','ambient evening study calm','lo-fi relax evening study session','calm evening concentration music'],
  night:     ['deep focus music late night study','ambient night study concentration','lo-fi late night study session','quiet night focus music'],
}

const SESSION_MUSIC = {
  fresh:    ['energizing fresh start study music','upbeat motivation first session','morning fresh focus beats','positive energy start study'],
  moderate: ['steady focus lo-fi study','consistent work background music','medium energy study beats','balanced focus music session'],
  tired:    ['gentle low energy tired study','soft recovery music study','calm tired focus ambient','easy tired study lo-fi'],
  deep:     ['deep work binaural beats gamma','ultra focus no distraction music','intense concentration study music','maximum focus binaural study'],
}

/* ── Multilingual mood detection ── */
const MOOD_PATTERNS = {
  happy:     /\b(happy|joyful|great|awesome|fun|excited|joy|heureux|heureuse|joyeux|content|contente|super|génial|fantastique|feliz|alegre|contento|froh|fröhlich|glücklich)\b/i,
  sad:       /\b(sad|unhappy|down|depressed|grief|cry|miss|triste|mélancolique|déprimé|déprimée|malheureux|malheureuse|traurig|unglücklich|triste|infeliz)\b/i,
  stressed:  /\b(stress|stressed|pressure|deadline|urgent|rush|panic|overwhelm|overload|stressé|stressée|pression|urgence|débordé|gestresst|überwältigt|estresado)\b/i,
  tired:     /\b(tired|exhausted|fatigue|sleepy|drained|weak|fatigué|fatiguée|épuisé|épuisée|crevé|crevée|müde|erschöpft|cansado|agotado)\b/i,
  energetic: /\b(energy|energetic|active|sport|gym|workout|power|pump|énergique|énergie|actif|active|sport|énergisch|energetisch|energético|activo)\b/i,
  motivated: /\b(motivated|goal|achieve|success|win|hustle|grind|motivé|motivée|objectif|réussir|succès|motiviert|erfolgreich|motivado|exitoso)\b/i,
  creative:  /\b(creative|design|art|write|create|build|invent|imagine|draw|créatif|créative|design|art|créer|construire|kreativ|schöpferisch|creativo)\b/i,
  focused:   /\b(focus|concentrate|study|exam|test|learn|review|memorize|focalisé|concentré|concentrée|étude|examen|fokussiert|lernen|enfocado|estudiar)\b/i,
  relaxed:   /\b(relax|chill|easy|slow|peace|calm|rest|détendu|détendue|calme|repos|relaxt|entspannt|relajado|tranquilo)\b/i,
  anxious:   /\b(anxious|nervous|worry|fear|doubt|scared|uncertain|anxieux|anxieuse|nerveux|nerveuse|inquiet|inquiète|ängstlich|nervös|ansioso|nervioso)\b/i,
  angry:     /\b(angry|mad|frustrated|irritated|rage|furious|énervé|énervée|fâché|fâchée|frustré|frustrée|wütend|frustriert|enojado|frustrado)\b/i,
  bored:     /\b(bored|boring|dull|uninterested|monotone|ennuyé|ennuyeux|ennuyeuse|gelangweilt|aburrido|monotono)\b/i,
}

function detectMood(taskTexts) {
  if (!taskTexts || taskTexts.length === 0) return null
  const combined = taskTexts.join(' ').toLowerCase()
  for (const [mood, pattern] of Object.entries(MOOD_PATTERNS)) {
    if (pattern.test(combined)) return mood
  }
  return null
}

function getTimeOfDay(hour) {
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  if (hour < 21) return 'evening'
  return 'night'
}

function getSessionState(sessions, pendingTasks) {
  if (sessions === 0)                          return 'fresh'
  if (sessions >= 4)                           return 'tired'
  if (sessions >= 2 && pendingTasks > 3)       return 'deep'
  return 'moderate'
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)] }

/*Les headers CORS et la gestion des méthodes HTTP */
export default async function handler(req, res) {
  
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' })

  const {
    timeOfDay,
    sessionsToday  = 0,
    pendingTasks   = 0,
    doneTasks      = 0,
    taskTexts      = [],    // array of task strings — main mood source
  } = req.body || {}

  const hour         = new Date().getHours()
  const tod          = getTimeOfDay(hour)
  const sessions     = Number(sessionsToday) || 0
  const pending      = Number(pendingTasks)  || 0
  const sessionState = getSessionState(sessions, pending)

  /* ── 1. Detect mood from tasks (highest priority) ── */
  const detectedMood = detectMood(taskTexts)

  let keywords, reason

  if (detectedMood) {
    /* Mood detected → use mood-based music */
    keywords = pickRandom(MOOD_MUSIC[detectedMood])

    const moodReasons = {
      happy:     `Your tasks suggest a happy mood — upbeat music to match your energy!`,
      sad:       `Detected some emotional weight in your tasks — gentle music to support you.`,
      stressed:  `You seem stressed — calming music to help you breathe and focus.`,
      tired:     `You seem tired — soft music to gently keep you going.`,
      energetic: `High energy detected — pumping beats to match!`,
      motivated: `You're motivated — epic music to fuel your momentum!`,
      creative:  `Creative work ahead — music to spark your imagination.`,
      focused:   `Study mode on — deep focus music for maximum concentration.`,
      relaxed:   `Relaxed session — chill music to keep the good vibes.`,
      anxious:   `Feeling anxious — soothing sounds to calm your mind.`,
      angry:     `Let the music calm you — peaceful sounds to reset your focus.`,
      bored:     `Let's spice things up — varied music to re-engage your mind!`,
    }
    reason = moodReasons[detectedMood]

  } else {
    /* No mood → combine time of day + session state */
    const timeMusic    = TIME_MUSIC[tod]    || TIME_MUSIC.afternoon
    const sessionMusic = SESSION_MUSIC[sessionState] || SESSION_MUSIC.moderate

    /* Alternate between time-based and session-based */
    const pool    = Math.random() > 0.5 ? timeMusic : sessionMusic
    keywords      = pickRandom(pool)

    const timeReasons = {
      morning:   `Good morning! Energizing music for a fresh start.`,
      afternoon: `Afternoon focus session — steady beats to keep you going.`,
      evening:   `Evening study — calm music to maintain concentration.`,
      night:     `Late night focus — quiet music to keep you in the zone.`,
    }
    const sessionReasons = {
      fresh:    `First session of the day — let's start with energy!`,
      moderate: `${sessions} session${sessions>1?'s':''} done — keeping the momentum going.`,
      tired:    `After ${sessions} sessions, gentle music to help you finish strong.`,
      deep:     `${pending} tasks pending — deep work music for maximum concentration.`,
    }
    reason = Math.random() > 0.5
      ? (timeReasons[tod] || timeReasons.afternoon)
      : (sessionReasons[sessionState] || sessionReasons.moderate)
  }

  console.log(`[keywords] mood=${detectedMood} tod=${tod} sessions=${sessions} pending=${pending}`)
  console.log(`[keywords] → "${keywords}"`)

  return res.status(200).json({ keywords, reason, detectedMood })
}
