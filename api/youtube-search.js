/*
  Vercel Serverless Function — /api/youtube-search
  ─────────────────────────────────────────────────
  Receives: POST { query: string }
  Returns:  { tracks: Track[] }

  The YouTube API key lives in Vercel environment variables (YOUTUBE_API_KEY).
  It is NEVER exposed to the browser.

  Deploy steps:
    1. Push this project to GitHub
    2. Import on vercel.com → auto-detected as Vite project
    3. Add environment variable: YOUTUBE_API_KEY = your key
    4. Done — this function is available at /api/youtube-search
*/

export default async function handler(req, res) {
  /* ── CORS headers ── */
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  /* ── Validate input ── */
  const { query } = req.body || {}
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'query is required' })
  }

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'YouTube API key not configured on server' })
  }

  /*  Call YouTube Data API */
  try {
    const params = new URLSearchParams({
      part:          'snippet',
      q:             query.trim(),
      type:          'video',
      videoCategoryId: '10',      // Music category
      maxResults:    '6',
      order:         'relevance',
      safeSearch:    'strict',
      key:           apiKey,
    })

    const ytRes  = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`)
    const ytData = await ytRes.json()

    if (!ytRes.ok) {
      console.error('YouTube API error:', ytData)
      return res.status(502).json({ error: ytData?.error?.message || 'YouTube API error' })
    }

    /* ── Shape the response ── */
    const tracks = (ytData.items || [])
      .filter((item) => item.id?.videoId)
      .map((item) => ({
        ytId:        item.id.videoId,
        name:        item.snippet.title,
        artist:      item.snippet.channelTitle,
        thumbnail:   item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        description: item.snippet.description?.slice(0, 80) || '',
      }))

    return res.status(200).json({ tracks })

  } catch (err) {
    console.error('youtube-search error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
